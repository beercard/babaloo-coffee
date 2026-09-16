# Variables de entorno

Ningún secreto se incluye en el repositorio. Los archivos `.env` están ignorados por git; se documentan en `.env.example` de cada app.

## Frontend — `apps/web/.env`

| Variable | Obligatoria | Descripción |
|---|---|---|
| `SITE_URL` | sí (prod) | URL canónica, p. ej. `https://babaloocoffeeclub.com`. Sitemap, canonical, JSON-LD. |
| `PAYLOAD_URL` | no | URL del CMS. **Vacía = build con el contenido de `src/content/seed`.** |
| `PAYLOAD_API_KEY` | no | Reservada; las API keys están desactivadas en el CMS (la lectura pública basta para el build). |
| `PUBLIC_CMS_URL` | no | URL pública del CMS que usa el navegador para enviar formularios (normalmente igual a `PAYLOAD_URL`). |
| `PUBLIC_FORM_ENDPOINT` | no | Sustituye el endpoint de formularios por otro servicio (Formspree, n8n, Zapier…). |
| `PUBLIC_FORM_RELAY` | no | Sin CMS ni endpoint propio, los formularios se envían por email al contacto del sitio mediante FormSubmit (la primera vez llega un email de activación a ese buzón). `off` lo desactiva. |
| `PAYLOAD_DRAFTS` | sólo preview | `1` = build del **sitio de vista previa**: lee los borradores del CMS y se marca `noindex`. |
| `PAYLOAD_PREVIEW_SECRET` | sólo preview | Igual a `PREVIEW_SECRET` del CMS; permite al build de vista previa leer borradores. |
| `PUBLIC_GTM_ID` | no | Google Tag Manager `GTM-XXXX`. Si está vacío no se carga nada. |
| `PUBLIC_GA4_ID` | no | Google Analytics 4 `G-XXXX`. |
| `PUBLIC_GADS_ID` | no | Google Ads `AW-XXXX` (conversiones). |
| `PUBLIC_META_PIXEL_ID` | no | Meta Pixel. |

Las variables `PUBLIC_*` se incrustan en el HTML; nunca pongas secretos en ellas.

## CMS — `apps/cms/.env`

| Variable | Obligatoria | Descripción |
|---|---|---|
| `PAYLOAD_SECRET` | sí | Cadena aleatoria larga (`openssl rand -hex 32`). Firma sesiones. |
| `DATABASE_URL` | sí | SQLite: `file:./babaloo.db` (en Docker `file:/app/apps/cms/data/babaloo.db`). |
| `DATABASE_AUTH_TOKEN` | con Turso | Token de la base Turso (`turso db tokens create <db>`). |
| `DB_PUSH` | no | `1` fuerza la sincronización interactiva del esquema (por defecto solo en dev). Recomendado `0` en local: los cambios de esquema se aplican con `src/scripts/migrate-cms.ts`. |
| `BLOB_READ_WRITE_TOKEN` | en Vercel | Token del store de Vercel Blob; con él las fotos se suben a Blob en vez de `apps/cms/media`. |
| `PAYLOAD_PUBLIC_SERVER_URL` | sí (prod) | URL pública del CMS, p. ej. `https://cms.babaloocoffeeclub.com`. |
| `SITE_URL` | sí (prod) | Orígenes permitidos (CORS/CSRF) separados por coma: `https://babaloocoffeeclub.com,http://localhost:4321`. |
| `DEPLOY_HOOK_URL` | recomendado | Webhook que reconstruye el sitio al guardar contenido. GitHub: `https://api.github.com/repos/<owner>/<repo>/dispatches`. |
| `DEPLOY_HOOK_TOKEN` | con GitHub | Fine-grained PAT con permiso *Contents: write* sobre el repo. |
| `DEPLOY_HOOK_BODY` | con GitHub | `{"event_type":"cms-publish"}` |
| `DEPLOY_DEBOUNCE_MS` | no | Espera antes de disparar (agrupa ediciones). Default 60000. Solo se dispara al **publicar** (los borradores no tocan el sitio). |
| `PREVIEW_URL` | con vista previa | URL del sitio de vista previa (p. ej. `https://babaloo-preview.vercel.app`). Activa el botón *Preview* del panel y se admite como origen de formularios. |
| `PREVIEW_DEPLOY_HOOK_URL` | con vista previa | Deploy Hook del proyecto de vista previa; se llama en cada guardado (borradores incluidos). |
| `PREVIEW_DEBOUNCE_MS` | no | Espera del rebuild de vista previa. Default 20000. |
| `PREVIEW_SECRET` | con vista previa | Cadena aleatoria; el build de vista previa la envía para leer borradores. Sin ella, los borradores solo los ven usuarios logueados. |
| `FORM_NOTIFY_EMAIL` | recomendado | Buzón por defecto de los formularios (`info@babaloocoffeeclub.com`). Los editores pueden cambiarlo en *Settings → Forms*, que tiene prioridad. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` | con notificaciones | SMTP para enviar los avisos (Hostinger: `smtp.hostinger.com`, 465, usuario y clave del buzón). Sin `SMTP_HOST` no se envía email; el mensaje queda solo en el CMS. |
| `EMAIL_FROM` / `EMAIL_FROM_NAME` | no | Remitente de los avisos. |
| `FORM_WEBHOOK_URL` | no | Webhook para CRM / WhatsApp / newsletter con cada envío. |
| `FORM_RATE_LIMIT` | no | Envíos aceptados por IP cada 10 min (los errores de validación no cuentan). Default 10. |
| `ADMIN_ALLOWED_IPS` | no | Lista de IPs (coma) que pueden abrir `/admin`; vacío = todas. |
| `RESUMES_DIR` | no | Carpeta de los currículums (default `media/resumes`, dentro del volumen de media). |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | sólo seed | Primer usuario admin. |
| `SEED_EDITOR_EMAIL` / `SEED_EDITOR_PASSWORD` / `SEED_EDITOR_NAME` | sólo seed | Cuenta editor del cliente: se crea o se le actualiza la contraseña en cada seed. `SEED_EDITOR_REPLACES=<email viejo>` renombra una cuenta existente. |

## GitHub Actions (Settings → Secrets and variables → Actions)

Secrets: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `PAYLOAD_URL`, `PAYLOAD_API_KEY` (opcional).
Variables: `SITE_URL`, `FTP_SERVER_DIR` (`/public_html/`), `FTP_PROTOCOL` (`ftps`), `PUBLIC_GTM_ID`, `PUBLIC_GA4_ID`, `PUBLIC_GADS_ID`, `PUBLIC_META_PIXEL_ID`, `PUBLIC_FORM_ENDPOINT`.
