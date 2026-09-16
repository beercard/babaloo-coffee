# Migración a Hostinger — paso a paso

Resultado final:

| Parte | Dónde | Dirección |
|---|---|---|
| Web | Hostinger, archivos que sube GitHub por FTP | `babaloocoffeeclub.com` |
| Vista previa (borradores) | Hostinger, subdominio, también por FTP | `preview.babaloocoffeeclub.com` |
| CMS | Hostinger, app Node.js conectada a GitHub | `cms.babaloocoffeeclub.com` |
| Base de datos | Turso (la actual, no se mueve) | — |
| Fotos y currículums | Cloudflare R2 | — |
| Email de formularios | Microsoft 365 (se configura más adelante) | — |

Cómo se actualiza la web: la editora publica en el CMS → el CMS avisa a GitHub → GitHub compila la web y la sube a Hostinger (2 a 3 minutos). Al guardar un borrador solo se reconstruye la vista previa.

> Las fotos de la web se optimizan al compilar y se sirven desde Hostinger. R2 solo lo usan el CMS y el build, por eso alcanza con la URL pública `r2.dev` de Cloudflare.

Durante la migración el sitio actual (WordPress) sigue online hasta la **Fase 5**.

---

## Fase 1 — Preparar las cuentas (se puede hacer ya)

### 1.1 Cloudflare R2
1. Crear cuenta en cloudflare.com (gratis) → **R2 Object Storage** → activar el plan gratuito (pide tarjeta, no cobra hasta 10 GB).
2. **Create bucket** → nombre `babaloo-media` → ubicación automática.
3. En el bucket → **Settings → Public Development URL** → **Enable**. Anotar la URL (`https://pub-xxxx.r2.dev`) → será `S3_PUBLIC_URL`.
4. R2 → **Manage API Tokens** → **Create API Token**:
   - Permisos: **Object Read & Write**
   - Bucket: solo `babaloo-media`
   - Anotar **Access Key ID**, **Secret Access Key** y el **endpoint** (`https://<account-id>.r2.cloudflarestorage.com`). El secreto se muestra una sola vez.

### 1.2 GitHub
1. github.com → avatar → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**:
   - Nombre `babaloo-cms-deploy`, vencimiento 1 año
   - Repository access: solo `beercard/babaloo-coffee`
   - Permissions → Repository → **Contents: Read and write**
   - Anotar el token → será `DEPLOY_HOOK_TOKEN`.
2. Generar una clave aleatoria para la vista previa (cualquier texto largo, p. ej. con un generador de contraseñas de 48 caracteres) → será `PREVIEW_SECRET` y `PAYLOAD_PREVIEW_SECRET`.

### 1.3 Hostinger (hPanel del sitio de Babaloo)
1. **Backups** → generar y descargar un respaldo completo del WordPress (archivos y base de datos).
2. **Domains → Subdomains** → crear `cms` y `preview`.
3. **Security → SSL** → confirmar SSL en `babaloocoffeeclub.com`, `cms.` y `preview.`.
4. **Files → FTP Accounts** → crear una cuenta cuya carpeta incluya `public_html` y la carpeta del subdominio `preview`. Anotar:
   - servidor (`FTP_SERVER`), usuario y contraseña
   - la ruta de `public_html` y la de `preview` **tal como aparecen al entrar con esa cuenta** (p. ej. `/public_html/` y `/domains/preview.babaloocoffeeclub.com/public_html/`).

---

## Fase 2 — Mover las fotos a R2 (hecho el 16/09/2026: las 54 fotos en uso están en R2)

Pasarle al desarrollador los 4 datos de R2 (endpoint, access key, secret, URL pública). Él:
1. Hace un respaldo de la base con la configuración actual.
2. Ejecuta `src/scripts/migrate-media.ts` con R2 configurado: copia las fotos a R2 conservando sus IDs (páginas y productos siguen enlazados).
3. Verifica que todas las fotos respondan desde `S3_PUBLIC_URL`.

Las fotos quedan también en Vercel Blob, así que el CMS actual sigue funcionando mientras tanto.

---

## Fase 3 — CMS en Hostinger

hPanel → **Websites → Add website → Node.js app → Importá el repositorio de Git → Conectate con GitHub**.

| Ajuste | Valor |
|---|---|
| Repositorio / rama | `beercard/babaloo-coffee` / `main` |
| Dominio | **`cms.babaloocoffeeclub.com`** (no el dominio principal) |
| Framework | Next.js (u "Other" si permite comandos propios) |
| Node | 22.x |
| Directorio raíz | raíz del repositorio |
| Instalación | `npm ci --include=dev` |
| Build | `npm run build:cms` |
| Inicio | `npm run start:cms` |
| Deploy automático | activado |

Si el asistente obliga a elegir una subcarpeta: `apps/cms`, instalación `npm ci --include=dev --prefix ../..`, build `npm run build`, inicio `npm run start`.

### Variables de entorno (cargar antes del primer deploy)

| Variable | Valor |
|---|---|
| `PAYLOAD_SECRET` | texto aleatorio largo (si cambia respecto de Vercel, solo se cierran las sesiones) |
| `PAYLOAD_PUBLIC_SERVER_URL` | `https://cms.babaloocoffeeclub.com` |
| `DATABASE_URL` | la de Turso (`libsql://…`) |
| `DATABASE_AUTH_TOKEN` | el token de Turso |
| `DB_PUSH` | `0` |
| `SITE_URL` | `https://babaloocoffeeclub.com,https://www.babaloocoffeeclub.com` |
| `PREVIEW_URL` | `https://preview.babaloocoffeeclub.com` |
| `PREVIEW_SECRET` | la clave de 1.2 |
| `S3_BUCKET` | `babaloo-media` |
| `S3_ENDPOINT` | `https://3652feac485027919b7623ab5d12a7f5.r2.cloudflarestorage.com` (sin `/babaloo-media` al final) |
| `S3_REGION` | `auto` |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | los de 1.1 |
| `S3_PUBLIC_URL` | `https://pub-b7138a4eb83846c38fb9a8271b27cc7a.r2.dev` |
| `FORM_NOTIFY_EMAIL` | `info@babaloocoffeeclub.com` |

**No** cargar todavía `DEPLOY_HOOK_*` ni `PREVIEW_DEPLOY_HOOK_*` (se agregan en la Fase 5, para que nada publique sobre el WordPress antes de tiempo). **No** cargar `NODE_ENV` ni las variables de Vercel Blob (`BLOB_*`, `BLOBB_*`).

### Comprobar
1. Esperar a que termine el build (si falla por memoria, pasar el log al desarrollador).
2. Abrir `https://cms.babaloocoffeeclub.com/admin` y entrar con el usuario de siempre.
3. Abrir un producto: su foto tiene que verse. Abrir **Settings → Forms → Status & test**.
4. No editar contenido todavía en ningún CMS (Vercel y Hostinger comparten la base).

---

## Fase 4 — GitHub y prueba en el subdominio de vista previa

GitHub → repo → **Settings → Secrets and variables → Actions**.

**Secrets**

| Nombre | Valor |
|---|---|
| `FTP_SERVER` | servidor FTP de 1.3 |
| `FTP_USERNAME` / `FTP_PASSWORD` | cuenta FTP de 1.3 |
| `PAYLOAD_URL` | `https://cms.babaloocoffeeclub.com` |
| `PAYLOAD_PREVIEW_SECRET` | la clave de 1.2 |

**Variables**

| Nombre | Valor |
|---|---|
| `SITE_URL` | `https://babaloocoffeeclub.com` |
| `PREVIEW_SITE_URL` | `https://preview.babaloocoffeeclub.com` |
| `FTP_PREVIEW_DIR` | carpeta de `preview` de 1.3 |
| `FTP_SERVER_DIR` | ruta de `public_html` de 1.3 (normalmente `/public_html/`) |
| `DEPLOY_LIVE` | **no crearla todavía**: sin ella GitHub nunca sube nada a `public_html` |
| `FTP_PROTOCOL` | solo si FTPS falla: `ftp` |

Prueba:
1. **Actions → Build & deploy website → Run workflow → target: `preview`**.
2. Abrir `https://preview.babaloocoffeeclub.com`: debe verse la web completa con la etiqueta roja "Preview".
3. Revisar menú, about, contacto, fotos y enviar un formulario de prueba (tiene que aparecer en **Messages** del CMS).

---

## Fase 5 — Lanzamiento

1. **Vaciar `public_html`**: en el Administrador de archivos, mover todo el contenido del WordPress a una carpeta de respaldo fuera de `public_html` (p. ej. `wordpress-old`). Si quedan archivos como `index.php`, el servidor puede seguir mostrando WordPress.
2. GitHub → Variables → crear `DEPLOY_LIVE` = `true` (habilita la subida a `public_html`).
3. **Actions → Run workflow → target: `both`**. Al terminar, `https://babaloocoffeeclub.com` muestra la web nueva.
4. En la app Node.js del CMS agregar las variables y redeployar:

   | Variable | Valor |
   |---|---|
   | `DEPLOY_HOOK_URL` | `https://api.github.com/repos/beercard/babaloo-coffee/dispatches` |
   | `DEPLOY_HOOK_TOKEN` | token de 1.2 |
   | `DEPLOY_HOOK_BODY` | `{"event_type":"cms-publish"}` |
   | `PREVIEW_DEPLOY_HOOK_URL` | `https://api.github.com/repos/beercard/babaloo-coffee/dispatches` |
   | `PREVIEW_DEPLOY_HOOK_BODY` | `{"event_type":"cms-draft"}` |

5. Comprobar el ciclo completo:
   - Guardar un borrador → en 2–3 min se ve en `preview.` y **no** en la web.
   - Publicar → en 2–3 min se ve en la web. En GitHub → Actions aparecen las ejecuciones.
6. Revisar:
   - `http://` y `www.` redirigen a `https://babaloocoffeeclub.com`
   - `/drinks`, `/food`, `/hours`, `/contact-us`, `/gallery`, `/join-our-team` redirigen a sus páginas nuevas
   - formularios de Contact y Join our team (con currículum) llegan a **Messages**
   - la web en el celular

---

## Fase 6 — Después del lanzamiento
1. **Vercel**: borrar o pausar `babaloo-coffee`, `babaloo-cms` y `babaloo-preview` (la copia en `vercel.app` compite en Google). Borrar el store de Blob cuando se confirme que todas las fotos están en R2.
2. **Google Search Console**: agregar el dominio, verificarlo con un registro DNS en Hostinger y enviar `https://babaloocoffeeclub.com/sitemap-index.xml`.
3. **Google Business Profile**: confirmar que el enlace apunta a la web.
4. Cambiar la contraseña del super admin del CMS.
5. Unas semanas después, borrar la carpeta `wordpress-old`.

## Fase 7 — Email de los formularios (cuando haya acceso a Microsoft 365)
Hoy los mensajes se guardan en **Messages**; falta que además lleguen por correo.
1. Microsoft 365 admin center → **Users → info@ → Mail → Manage email apps** → activar **Authenticated SMTP**.
2. En la app Node.js del CMS agregar:

   | Variable | Valor |
   |---|---|
   | `SMTP_HOST` | `smtp.office365.com` |
   | `SMTP_PORT` | `587` |
   | `SMTP_SECURE` | `false` |
   | `SMTP_USER` / `SMTP_PASS` | `info@babaloocoffeeclub.com` y su contraseña |
   | `EMAIL_FROM` / `EMAIL_FROM_NAME` | `info@babaloocoffeeclub.com` / `Babaloo Coffee Club` |

3. Redeployar y usar **Settings → Forms → Status & test → Send a test email**.

Si la organización tiene MFA obligatorio o "security defaults", Microsoft puede bloquear el SMTP con contraseña. En ese caso la alternativa es un servicio de envío (Brevo o Resend, con registros DNS en Hostinger) o una casilla de Hostinger solo para enviar.
