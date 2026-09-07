// =============================================
//  Netlify Function — Proxy hacia Airtable + 3C-Laravel
//  Ruta pública: /.netlify/functions/enviar-lead
//
//  Ubicación en el repo: netlify/functions/enviar-lead.js
//
//  Recibe el lead desde el formulario (mismo dominio, sin CORS)
//  y lo reenvía al webhook de Airtable Y al endpoint de leads de
//  3C-Laravel, ambos desde el servidor de Netlify (server-to-server,
//  las reglas de CORS del navegador no aplican).
//
//  Envío en paralelo durante la transición: mientras se valida que el
//  endpoint de Laravel funciona bien en producción, el lead sigue yendo
//  también a Airtable como red de contención. Una vez confirmado, se saca
//  el bloque de Airtable y solo queda LARAVEL_LEADS_URL.
// =============================================

const WEBHOOK_URL = 'https://hooks.airtable.com/workflows/v1/genericWebhook/appt6NNClnuOZujF0/wflXveQhPF4VLqOSr/wtrKna5tY7Ihe4Gjj';

// Configurados como variables de entorno en Netlify (Site settings → Environment
// variables), nunca hardcodeados acá: LARAVEL_LEADS_URL (ej. https://3c.ejemplo.com/api/leads)
// y LARAVEL_LEADS_TOKEN (mismo valor que LANDING_WEBHOOK_TOKEN en el .env de 3C-Laravel).
const LARAVEL_LEADS_URL = process.env.LARAVEL_LEADS_URL;
const LARAVEL_LEADS_TOKEN = process.env.LARAVEL_LEADS_TOKEN;

exports.handler = async function (event) {
  // Solo aceptamos POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método no permitido' };
  }

  try {
    // Los datos llegan como string JSON en el body
    const datos = JSON.parse(event.body || '{}');

    const payloadAirtable = {
      nombre: datos.nombre,
      telefono: datos.telefono,
      zona: datos.zona,
      metros: datos.metros,
      tipoProyecto: datos.tipoProyecto,
      tieneProyectoArquitectonico: datos.tieneProyectoArquitectonico,
      tieneTerrenoPropio: datos.tieneTerrenoPropio,
      tieneFinanciamientoEnCurso: datos.tieneFinanciamientoEnCurso,
      notas: datos.notas || ''
    };

    const payloadLaravel = {
      nombre: datos.nombre,
      telefono: datos.telefono,
      email: datos.email,
      zona: datos.zona,
      metros: datos.metros,
      tipoProyecto: datos.tipoProyecto,
      plazo: datos.plazo,
      tieneProyectoArquitectonico: datos.tieneProyectoArquitectonico,
      tieneTerrenoPropio: datos.tieneTerrenoPropio,
      tieneFinanciamientoEnCurso: datos.tieneFinanciamientoEnCurso,
      notas: datos.notas || ''
    };

    // Ambos envíos corren en paralelo e independientes: si uno falla no
    // bloquea ni afecta al otro (Promise.allSettled, no Promise.all).
    const envios = await Promise.allSettled([
      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadAirtable)
      }),
      LARAVEL_LEADS_URL
        ? fetch(LARAVEL_LEADS_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Landing-Token': LARAVEL_LEADS_TOKEN || ''
            },
            body: JSON.stringify(payloadLaravel)
          })
        : Promise.resolve(null)
    ]);

    const [resultadoAirtable, resultadoLaravel] = envios;

    const erroresAirtable = resultadoAirtable.status === 'rejected'
      || (resultadoAirtable.value && !resultadoAirtable.value.ok);
    const erroresLaravel = LARAVEL_LEADS_URL && (
      resultadoLaravel.status === 'rejected'
      || (resultadoLaravel.value && !resultadoLaravel.value.ok)
    );

    if (erroresAirtable || erroresLaravel) {
      console.error('Error enviando lead', {
        airtable: resultadoAirtable.status === 'rejected' ? resultadoAirtable.reason?.message : resultadoAirtable.value?.status,
        laravel: resultadoLaravel.status === 'rejected' ? resultadoLaravel.reason?.message : resultadoLaravel.value?.status
      });

      // Si al menos uno de los dos destinos recibió el lead, no lo
      // reportamos como error total (no bloquea el flujo de WhatsApp).
      if (erroresAirtable && erroresLaravel) {
        return { statusCode: 502, body: 'No se pudo enviar el lead a ningún destino' };
      }
    }

    return { statusCode: 200, body: 'Lead enviado correctamente' };

  } catch (error) {
    return { statusCode: 500, body: 'Error interno: ' + error.message };
  }
};
