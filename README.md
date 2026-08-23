# LINK · prototipo de contacto directo

Este prototipo elimina `mailto:` y el enlace genérico de WhatsApp.

## Formulario
- En local (`file://`) simula envío para probar la experiencia.
- En Vercel envía `POST /api/contact`.
- El endpoint puede guardar el lead en Supabase y enviar notificación por Resend.
- El visitante nunca ve ni abre Gmail.

Variables de entorno para producción:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL` (ej. `LINK <hola@tudominio.cl>` cuando el dominio exista/verifique)
- `CONTACT_TO_EMAIL` (inbox interna)

Ejecutar `supabase-contact.sql` si se desea capturar leads en Supabase.

## WhatsApp
En `index.html`, buscar:
`whatsappNumber: ''`

y reemplazar por el número comercial chileno en formato internacional, sin + ni espacios, por ejemplo `56912345678`.

Mientras esté vacío, el botón no abandona la website ni abre la pantalla genérica de WhatsApp.
