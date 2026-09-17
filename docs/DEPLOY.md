# Deploy

> Plan elegido para producción: todo en Hostinger (web, vista previa y CMS) con fotos en Cloudflare R2. Paso a paso en [HOSTINGER.md](HOSTINGER.md).

```
                 ┌──────────────────────────┐
  git push ─────▶│ GitHub Actions           │──FTPS──▶ Hostinger /public_html  (sitio estático)
                 │ npm ci · astro build     │
  CMS "Save" ───▶│ (repository_dispatch)    │
                 └──────────▲───────────────┘
                            │ fetch REST en build
                 ┌──────────┴───────────────┐
                 │ Payload CMS (Docker/Node)│  cms.babaloocoffeeclub.com
                 └──────────────────────────┘
```

Frontend y CMS están desacoplados: el sitio publicado es 100 % estático y sigue funcionando aunque el CMS esté apagado. El CMS sólo se necesita para **editar** y para recibir formularios.

---

## 1. Frontend en Hostinger (hosting compartido)

### Opción A — GitHub Actions + FTP (recomendada, deploy automático)

1. Sube el repo a GitHub (rama `main`).
2. En hPanel → *Files → FTP Accounts* crea o copia un usuario FTP.
3. En GitHub → *Settings → Secrets and variables → Actions* añade:
   - Secrets: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `PAYLOAD_URL` (URL pública del CMS; déjalo vacío para publicar con el contenido seed).
   - Variables: `SITE_URL=https://babaloocoffeeclub.com`, `FTP_SERVER_DIR=/public_html/`.
4. Cada `git push` a `main` (o cada guardado en el CMS, ver §3) ejecuta `.github/workflows/deploy-web.yml`: build → sube `apps/web/dist` (incluye `.htaccess` con redirects, caché y compresión).

Primera vez: vacía `/public_html` del WordPress **después** de tener una copia de seguridad (hPanel → Backups).

### Opción B — Subir archivos a mano

```bash
npm run build          # genera apps/web/dist
```

Sube el contenido de `apps/web/dist` (incluido el archivo oculto `.htaccess`) a `/public_html` con el File Manager o FTP.

### Opción C — Hostinger "Git deploy"

El deploy Git de hPanel sólo clona, no ejecuta `npm run build`. Si quieres usarlo, publica la carpeta `dist` en una rama `deploy` desde Actions (añade un paso `peaceiris/actions-gh-pages` con `publish_branch: deploy`) y apunta hPanel a esa rama.

### Otros hosts

- **Vercel**: importar el repo con *Root Directory* en la raíz (por defecto). El `vercel.json` de la raíz define `buildCommand`, `outputDirectory: apps/web/dist`, redirects y caché; no hace falta configurar nada más. (Si prefieres *Root Directory* = `apps/web`, usa el `apps/web/vercel.json`.)
- **Netlify / Cloudflare Pages**: build `npm run build`, publish `dist`, base `apps/web`. `public/_redirects` ya trae los 301.

---

## 2. CMS (Payload)

Necesita Node 22 y, salvo en Vercel (Turso + Blob), disco persistente (SQLite + `media/`). Opciones:

### Hostinger VPS (Docker)

```bash
git clone <repo> && cd <repo>/apps/cms
cp .env.example .env         # PAYLOAD_SECRET, PAYLOAD_PUBLIC_SERVER_URL, SITE_URL, DEPLOY_HOOK_*
docker compose up -d --build
```

Pon un proxy HTTPS delante (Caddy, 2 líneas):

```
cms.babaloocoffeeclub.com {
  reverse_proxy localhost:3000
}
```

Volúmenes `cms-data` (base de datos) y `cms-media` (fotos): inclúyelos en las copias de seguridad.

### Vercel (demo para el cliente, o producción en plan Pro)

Vercel no tiene disco persistente, así que la base de datos va a **Turso** (SQLite remoto) y las fotos a **Vercel Blob**. El código ya lo soporta: basta con las variables de entorno.

1. **Turso** (plan gratuito): crea una base y un token.
   ```bash
   turso db create babaloo-cms
   turso db show babaloo-cms --url        # libsql://babaloo-cms-<org>.turso.io
   turso db tokens create babaloo-cms     # DATABASE_AUTH_TOKEN
   ```
2. **Vercel → Storage → Create → Blob**: crea el store `babaloo-media` y copia `BLOB_READ_WRITE_TOKEN`.
3. **Vercel → Add New Project** desde el repo. *Root Directory* = `apps/cms` (deja activado "Include files outside the root directory"). Variables de entorno:

   | Variable | Valor |
   |---|---|
   | `PAYLOAD_SECRET` | `openssl rand -hex 32` |
   | `DATABASE_URL` | `libsql://babaloo-cms-<org>.turso.io` |
   | `DATABASE_AUTH_TOKEN` | token de Turso |
   | `BLOB_READ_WRITE_TOKEN` | token del store Blob |
   | `PAYLOAD_PUBLIC_SERVER_URL` | `https://babaloo-cms.vercel.app` (la URL que te asigne Vercel) |
   | `SITE_URL` | `https://<sitio>.vercel.app,https://babaloocoffeeclub.com` |
   | `DEPLOY_HOOK_URL` | Deploy Hook del proyecto **web** (Settings → Git → Deploy Hooks); sin token |
   | `SEED_EDITOR_EMAIL` / `SEED_EDITOR_PASSWORD` | cuenta editor del cliente (solo la usa el seed) |
   | `FORM_NOTIFY_EMAIL` + `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | buzón `info@babaloocoffeeclub.com` y el SMTP de Hostinger (`smtp.hostinger.com`, 465) para recibir los formularios por email |

   `apps/cms/vercel.json` ya fija el `installCommand`/`buildCommand` del monorepo.
4. **Carga inicial desde tu máquina** (crea las tablas en Turso, sube las fotos a Blob y carga menú, páginas y usuarios):
   ```bash
   cd apps/cms
   DATABASE_URL=libsql://… DATABASE_AUTH_TOKEN=… BLOB_READ_WRITE_TOKEN=… DB_PUSH=1    SEED_ADMIN_EMAIL=… SEED_ADMIN_PASSWORD=… SEED_EDITOR_EMAIL=… SEED_EDITOR_PASSWORD=… npm run seed
   ```
   (o pon esas variables en `apps/cms/.env` y ejecuta `npm run seed`). Se puede repetir: solo añade lo que falta.
5. Deploy. Entra en `https://babaloo-cms.vercel.app/admin`.
6. En el proyecto **web** de Vercel añade `PAYLOAD_URL` y `PUBLIC_CMS_URL` = URL del CMS y vuelve a desplegar: el sitio pasa a construirse con el contenido del CMS y cada guardado dispara un rebuild.

Notas:
- El plan Hobby de Vercel es solo para uso no comercial: sirve para la demo; para producción usa Pro o el VPS.
- Cambios de esquema en producción (campos nuevos): ver *Actualizar el esquema* más abajo.

#### Sitio de vista previa (borradores)

Permite ver los borradores antes de publicarlos (botón **Preview** del panel).

1. Vercel → **Add New Project** con el mismo repo, nombre `babaloo-preview`, con la misma *Root Directory* que el proyecto web `babaloo-coffee` (la raíz del repo, que usa el `vercel.json` de la raíz).
2. Variables del proyecto preview: `PAYLOAD_URL` y `PUBLIC_CMS_URL` = URL del CMS, `SITE_URL` = URL del preview, `PAYLOAD_DRAFTS=1`, `PAYLOAD_PREVIEW_SECRET=<cadena aleatoria>`.
3. Settings → Git → **Deploy Hooks** del proyecto preview → crear uno (rama `main`).
4. En el proyecto **CMS**: `PREVIEW_URL=https://babaloo-preview.vercel.app`, `PREVIEW_DEPLOY_HOOK_URL=<hook del paso 3>`, `PREVIEW_SECRET=<la misma cadena>`, y agrega la URL del preview a `SITE_URL`. Redeploy del CMS.
5. Opcional: Settings → Deployment Protection del preview, para que solo lo vea quien tenga acceso.

El sitio en vivo solo se reconstruye al **publicar**; el preview se reconstruye con cada guardado.

#### Actualizar el esquema (campos nuevos) en Turso

`push` interactivo de Payload no sirve en producción. Usa los scripts:

```bash
cd apps/cms
export NODE_OPTIONS="--no-deprecation --import=tsx/esm" DB_PUSH=0 DEPLOY_HOOK_URL=
# con DATABASE_URL / DATABASE_AUTH_TOKEN de Turso en el entorno:
node src/scripts/export.ts backup.json               # respaldo completo en JSON
node src/scripts/migrate-cms.ts backup.json --dry    # muestra qué tablas sobran
node src/scripts/migrate-cms.ts backup.json          # aplica (una transacción) y convierte los datos
```

Orden recomendado: push del código, esperar a que el CMS nuevo esté *Ready*, correr la migración y publicar cualquier cambio (o redeploy del sitio) para reconstruir la web. Turso guarda además puntos de restauración (`turso db create --from-db … --timestamp …`).

### Railway / Render / Fly.io

Dockerfile en `apps/cms/Dockerfile` (contexto = raíz del repo). Monta un volumen en `/app/apps/cms/data` y `/app/apps/cms/media`. Variables como en `.env.example`.

### Primer arranque

```bash
docker compose exec cms sh -c "cd /app/apps/cms && node --import=tsx/esm src/seed/run.ts"
# o en local: npm run seed:cms
```

Crea el admin, sube las fotos y carga el menú/locales/textos. Entra a `/admin`, cambia la contraseña y crea los usuarios *Editor* del cliente.

---

## 3. Rebuild automático al guardar en el CMS

1. GitHub → *Settings → Developer settings → Fine-grained tokens*: token con acceso al repo y permiso **Contents: Read and write**.
2. En `apps/cms/.env`:
   ```
   DEPLOY_HOOK_URL=https://api.github.com/repos/<owner>/<repo>/dispatches
   DEPLOY_HOOK_TOKEN=github_pat_…
   DEPLOY_HOOK_BODY={"event_type":"cms-publish"}
   ```
3. Al **publicar** contenido, Payload espera 60 s (agrupa ediciones) y dispara el workflow. En ~2 minutos el sitio está publicado. Guardar un borrador no dispara nada (salvo el hook de vista previa).

Con Vercel/Netlify basta con poner su *Deploy Hook URL* en `DEPLOY_HOOK_URL` (sin token ni body).

---

## 4. Redirects 301 desde WordPress

| Antigua | Nueva |
|---|---|
| `/drinks/` | `/menu` |
| `/food/` | `/menu#bites-and-sweets` |
| `/hours/` | `/#locations` |
| `/contact-us/` | `/contact` |
| `/gallery/` | `/` |
| `/join-our-team/` | `/about#join-our-team` |
| `/wp-admin`, `/wp-content/…`, `/feed` | `/` |

Definidos en `apps/web/public/.htaccess` (Hostinger), `public/_redirects` (Netlify/Cloudflare), `vercel.json` y `astro.config.mjs`.

Después del lanzamiento:
- Google Search Console → enviar `https://babaloocoffeeclub.com/sitemap-index.xml`.
- Comprobar con `curl -I https://babaloocoffeeclub.com/drinks/` que responde `301`.

---

## 5. Checklist de lanzamiento

- [ ] `SITE_URL` correcto en Actions y en el CMS (`SITE_URL` = CORS de formularios).
- [ ] `PAYLOAD_PUBLIC_SERVER_URL` = dominio HTTPS del CMS.
- [ ] Contenido revisado en el CMS (precios marcados en `docs/MIGRATION.md`).
- [ ] Analytics: variables `PUBLIC_*` en GitHub → re-run del workflow.
- [ ] Formularios: `FORM_NOTIFY_EMAIL` + adaptador de email, o `FORM_WEBHOOK_URL`.
- [ ] Lighthouse en producción (mobile): Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
