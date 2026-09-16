# Todo en Hostinger

| Parte | Cómo se publica | Dirección |
|---|---|---|
| Web | GitHub Actions compila y sube por FTP a `public_html` | `babaloocoffeeclub.com` |
| Vista previa (borradores) | El mismo workflow, con borradores, a la carpeta del subdominio | `preview.babaloocoffeeclub.com` |
| CMS | App Node.js de Hostinger conectada a GitHub | `cms.babaloocoffeeclub.com` |
| Base de datos | Turso (externo, sin cambios) | — |
| Fotos | Disco del hosting o Cloudflare R2 | — |

Flujo: la editora publica → el CMS avisa a GitHub (`cms-publish`) → GitHub compila y sube la web (2–3 min). Al guardar un borrador el CMS manda `cms-draft` y solo se reconstruye la vista previa.

El email de `babaloocoffeeclub.com` está en **Microsoft 365** (los registros MX apuntan a Outlook): el SMTP de los formularios es el de Microsoft.

---

## 1. Antes de empezar
1. hPanel → **Backups**: respaldo completo del WordPress actual (archivos + base de datos).
2. hPanel → **Domains → Subdomains**: crear `cms` y `preview`.
3. hPanel → **Files → FTP Accounts**: crear una cuenta con acceso a la carpeta de la web. Anotar servidor, usuario y contraseña, y la ruta de la carpeta de `preview` tal como la ve esa cuenta.
4. SSL activo en el dominio y en los dos subdominios.

## 2. CMS como app Node.js
hPanel → **Websites → Add → Node.js app → Conectate con GitHub** → repositorio `beercard/babaloo-coffee`, rama `main`.

| Ajuste | Valor |
|---|---|
| Dominio | `cms.babaloocoffeeclub.com` |
| Framework | Next.js (u "Other" si pide comandos propios) |
| Versión de Node | 22.x |
| Directorio raíz | la raíz del repositorio |
| Instalación | `npm ci --include=dev` (el build necesita TypeScript) |
| Build | `npm run build:cms` |
| Inicio | `npm run start:cms` |
| Auto-deploy | activado (cada push a `main`) |

Si el asistente obliga a elegir una subcarpeta, usar `apps/cms` con instalación `npm ci --include=dev --prefix ../..` y los mismos build/start (`npm run build` / `npm run start`).

### Variables de entorno del CMS

| Variable | Valor |
|---|---|
| `PAYLOAD_SECRET` | el mismo que usa hoy el CMS (si cambia, se cierran las sesiones) |
| `PAYLOAD_PUBLIC_SERVER_URL` | `https://cms.babaloocoffeeclub.com` |
| `DATABASE_URL` / `DATABASE_AUTH_TOKEN` | los de Turso (sin cambios) |
| `DB_PUSH` | `0` |
| `SITE_URL` | `https://babaloocoffeeclub.com,https://www.babaloocoffeeclub.com` |
| `PREVIEW_URL` | `https://preview.babaloocoffeeclub.com` |
| `PREVIEW_SECRET` | cadena aleatoria (la misma que `PAYLOAD_PREVIEW_SECRET` en GitHub) |
| `DEPLOY_HOOK_URL` | `https://api.github.com/repos/beercard/babaloo-coffee/dispatches` |
| `DEPLOY_HOOK_TOKEN` | token *fine-grained* de GitHub con **Contents: Read and write** sobre el repo |
| `DEPLOY_HOOK_BODY` | `{"event_type":"cms-publish"}` |
| `PREVIEW_DEPLOY_HOOK_URL` | `https://api.github.com/repos/beercard/babaloo-coffee/dispatches` |
| `PREVIEW_DEPLOY_HOOK_BODY` | `{"event_type":"cms-draft"}` |
| `FORM_NOTIFY_EMAIL` | `info@babaloocoffeeclub.com` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | `smtp.office365.com` / `587` / `false` |
| `SMTP_USER` / `SMTP_PASS` | buzón `info@` (con **SMTP autenticado** habilitado en Microsoft 365) |
| `EMAIL_FROM` / `EMAIL_FROM_NAME` | `info@babaloocoffeeclub.com` / `Babaloo Coffee Club` |
| Fotos en **disco** | `MEDIA_DIR=/home/<usuario>/babaloo-data/media`, `RESUMES_DIR=/home/<usuario>/babaloo-data/resumes` (fuera de la carpeta de la app) |
| Fotos en **R2** | `S3_BUCKET`, `S3_ENDPOINT` (`https://<cuenta>.r2.cloudflarestorage.com`), `S3_REGION=auto`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL` (dominio público del bucket) |

No cargar `BLOB_READ_WRITE_TOKEN` ni las variables `BLOBB_*` de Vercel, ni `NODE_ENV` (Next la pone solo; con `NODE_ENV=production` la instalación omite dependencias que el build necesita).

## 3. GitHub (Settings → Secrets and variables → Actions)
- **Secrets**: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `PAYLOAD_URL=https://cms.babaloocoffeeclub.com`, `PAYLOAD_PREVIEW_SECRET`.
- **Variables**: `SITE_URL=https://babaloocoffeeclub.com`, `FTP_SERVER_DIR=/public_html/`, `PREVIEW_SITE_URL=https://preview.babaloocoffeeclub.com`, `FTP_PREVIEW_DIR=<carpeta del subdominio preview>`, y si FTPS falla `FTP_PROTOCOL=ftp`.

## 4. Mover las fotos
Con el CMS nuevo ya configurado (disco o R2) y el respaldo hecho con la configuración anterior:
```bash
cd apps/cms
export NODE_OPTIONS="--no-deprecation --import=tsx/esm" DB_PUSH=0 DEPLOY_HOOK_URL=
node src/scripts/migrate-media.ts backup.json
```
En disco, el script tiene que correr **en el servidor** (terminal SSH de Hostinger) o subir después la carpeta `MEDIA_DIR` generada.

## 5. Lanzamiento
1. Probar el CMS en `cms.babaloocoffeeclub.com/admin` (login, guardar, publicar, fotos).
2. GitHub → Actions → **Build & deploy website** → *Run workflow* (both). La primera vez reemplaza el WordPress en `public_html`.
3. Revisar la web, las redirecciones (`/drinks`, `/contact-us`, `/join-our-team`), los formularios (**Settings → Forms → Status & test**) y el botón **Preview**.
4. Publicar un cambio en el CMS y confirmar que aparece en 3 minutos.
5. Apagar los proyectos de Vercel (`babaloo-coffee`, `babaloo-cms`, `babaloo-preview`) y, si las fotos ya no están en Blob, el store de Blob.
6. Google Search Console: verificar el dominio y enviar `https://babaloocoffeeclub.com/sitemap-index.xml`.
