// =============================================
//  3C CONSTRUCCIONES — Formulario
//  Envía lead a Airtable (webhook) + abre WhatsApp
// =============================================

const WHATSAPP_NUMBER = '543516871791'; // Número real (sin +, sin espacios)
const WEBHOOK_URL = 'https://hooks.airtable.com/workflows/v1/genericWebhook/appMgH9BjJRnZwegL/wflXveQhPF4VLqOSr/wtrKna5tY7Ihe4Gjj';

// --- Envío a Airtable (no bloquea el flujo) ---
function crearLeadEnAirtable(datos) {
  const payload = {
    nombre: datos.nombre,
    telefono: datos.telefono,
    zona: datos.zona,
    metros: datos.metros,
    tipoProyecto: datos.tipoProyecto,                       // "Casa nueva" | "Ampliación" | "Reforma"
    tieneProyectoArquitectonico: datos.tieneProyecto,       // true / false
    tieneTerrenoPropio: datos.tieneTerreno,                 // true / false
    tieneFinanciamientoEnCurso: datos.tieneFinanciamiento,  // true / false
    notas: datos.notas || ''
  };

  fetch(WEBHOOK_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(function (error) {
    console.error('Error enviando lead a Airtable:', error);
    // El flujo de WhatsApp sigue igual aunque esto falle
  });
}

// --- Submit del formulario ---
document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();

  // Recolección de datos
  const datos = {
    nombre:              document.getElementById('nombre').value.trim(),
    telefono:            document.getElementById('telefono').value.trim(),
    email:               document.getElementById('email').value.trim(),
    zona:                document.getElementById('zona').value.trim(),
    metros:              document.getElementById('metros').value.trim(),
    tipoProyecto:        document.getElementById('tipoProyecto').value,
    plazo:               document.getElementById('plazo').value,
    tieneTerreno:        document.getElementById('tieneTerreno').checked,
    tieneProyecto:       document.getElementById('tieneProyecto').checked,
    tieneFinanciamiento: document.getElementById('tieneFinanciamiento').checked,
    notas:               document.getElementById('notas').value.trim()
  };

  // Validación mínima
  if (!datos.nombre || !datos.telefono || !datos.email) {
    alert('Por favor completá tu nombre, teléfono y email antes de continuar.');
    return;
  }

  // PASO 1 — Enviar lead a Airtable (dispara y sigue, no espera respuesta)
  crearLeadEnAirtable(datos);

  // PASO 2 — Armar mensaje de WhatsApp
  let mensaje = `Hola, soy *${datos.nombre}*.\n\n`;
  mensaje += `- Telefono: ${datos.telefono}\n`;
  mensaje += `- Email: ${datos.email}\n`;

  if (datos.zona)         mensaje += `- Zona / localidad: ${datos.zona}\n`;
  if (datos.metros)       mensaje += `- Metros cuadrados aproximados: ${datos.metros}\n`;
  if (datos.tipoProyecto) mensaje += `- Tipo de proyecto: ${datos.tipoProyecto}\n`;
  if (datos.plazo)        mensaje += `- Plazo estimado de inicio: ${datos.plazo}\n`;

  mensaje += `- Terreno propio: ${datos.tieneTerreno ? 'Si' : 'No'}\n`;
  mensaje += `- Proyecto arquitectonico: ${datos.tieneProyecto ? 'Si' : 'No'}\n`;
  mensaje += `- Financiamiento en curso: ${datos.tieneFinanciamiento ? 'Si' : 'No'}\n`;

  if (datos.notas) mensaje += `\n- Notas: ${datos.notas}\n`;

  mensaje += `\nEstoy interesado/a en recibir más información y un presupuesto de 3C Construcciones.`;

  // PASO 3 — Abrir WhatsApp en pestaña nueva
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
});
