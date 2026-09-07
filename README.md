# 3c-landing

## Variables de entorno (Netlify → Site settings → Environment variables)

La Netlify Function `enviar-lead` reenvía cada lead del formulario a Airtable
(webhook fijo en el código, transición) y a 3C-Laravel. Para que el envío a
3C-Laravel funcione hace falta configurar:

- `LARAVEL_LEADS_URL`: URL del endpoint, ej. `https://3c.ejemplo.com/api/leads`.
- `LARAVEL_LEADS_TOKEN`: mismo valor que `LANDING_WEBHOOK_TOKEN` en el `.env`
  de 3C-Laravel.

Si `LARAVEL_LEADS_URL` no está configurada, la function sigue mandando el
lead a Airtable igual (no rompe nada), simplemente no llega a Laravel.
