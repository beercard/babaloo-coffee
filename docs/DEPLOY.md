# Deploy

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

Necesita Node 22 y disco persistente (SQLite + `media/`). Opciones:

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
3. Al guardar cualquier contenido, Payload espera 60 s (agrupa ediciones) y dispara el workflow. En ~2 minutos el sitio está publicado.

Con Vercel/Netlify basta con poner su *Deploy Hook URL* en `DEPLOY_HOOK_URL` (sin token ni body).

---

## 4. Redirects 301 desde WordPress

| Antigua | Nueva |
|---|---|
| `/drinks/` | `/menu` |
| `/food/` | `/menu#food-and-sweets` |
| `/hours/` | `/#locations` |
| `/contact-us/` | `/contact` |
| `/gallery/` | `/gallery` (misma URL, sin barra final) |
| `/join-our-team/` | `/join-our-team` |
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
