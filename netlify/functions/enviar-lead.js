// =============================================
//  Netlify Function — Proxy hacia Airtable
//  Ruta pública: /.netlify/functions/enviar-lead
//
//  Ubicación en el repo: netlify/functions/enviar-lead.js
//
//  Recibe el lead desde el formulario (mismo dominio, sin CORS)
//  y lo reenvía al webhook de Airtable desde el servidor de Netlify,
//  donde las reglas de CORS del navegador no aplican.
// =============================================

const WEBHOOK_URL = 'https://hooks.airtable.com/workflows/v1/genericWebhook/appMgH9BjJRnZwegL/wflXveQhPF4VLqOSr/wtrKna5tY7Ihe4Gjj';

exports.handler = async function (event) {
  // Solo aceptamos POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método no permitido' };
  }

  try {
    // Los datos llegan como string JSON en el body
    const datos = JSON.parse(event.body || '{}');

    const payload = {
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

    // Reenvío al webhook de Airtable (server-to-server, sin CORS)
    const respuesta = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!respuesta.ok) {
      return {
        statusCode: respuesta.status,
        body: 'Airtable respondió con error: ' + respuesta.status
      };
    }

    return { statusCode: 200, body: 'Lead enviado correctamente' };

  } catch (error) {
    return { statusCode: 500, body: 'Error interno: ' + error.message };
  }
};
