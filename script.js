// =============================================
//  3C CONSTRUCCIONES — Formulario → WhatsApp
//  Número a reemplazar: 54XXXXXXXXXX
// =============================================

const WHATSAPP_NUMBER = '54XXXXXXXXXX'; // ← Reemplazar con el número real (sin +, sin espacios)

document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const nombre        = document.getElementById('nombre').value.trim();
  const telefono      = document.getElementById('telefono').value.trim();
  const email         = document.getElementById('email').value.trim();
  const localidad     = document.getElementById('localidad').value.trim();
  const metros        = document.getElementById('metros').value.trim();
  const terreno       = document.getElementById('terreno').value;
  const plazo         = document.getElementById('plazo').value;
  const interes       = document.getElementById('interes').value.trim();

  // Validación mínima
  if (!nombre || !telefono || !email) {
    alert('Por favor completá tu nombre, teléfono y email antes de continuar.');
    return;
  }

  // Construcción del mensaje
  let mensaje = `Hola, soy *${nombre}*.\n\n`;
  mensaje += `- Telefono: ${telefono}\n`;
  mensaje += `- Email: ${email}\n`;

  if (localidad) mensaje += `- Localidad / barrio: ${localidad}\n`;
  if (metros)    mensaje += `- Metros cuadrados aproximados: ${metros}\n`;
  if (terreno)   mensaje += `- Terreno propio: ${terreno}\n`;
  if (plazo)     mensaje += `- Plazo estimado de inicio: ${plazo}\n`;
  if (interes)   mensaje += `\n- Tipo de vivienda de interes: ${interes}\n`;

  mensaje += `\nEstoy interesado/a en recibir más información y un presupuesto de 3C Construcciones.`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;

  window.open(url, '_blank');
});