# Babaloo Coffee Club — website

Sitio estático ultrarrápido (Astro) + CMS headless (Payload) que reemplaza al WordPress de `babaloocoffeeclub.com`, implementando el diseño del PDF `WEB.pdf`.

| Carpeta | Qué es | Stack |
|---|---|---|
| `apps/web` | Frontend. Se compila a HTML/CSS estático en `apps/web/dist` | Astro 7 · TypeScript strict · CSS moderno |
| `apps/cms` | Panel de administración y API de contenido | Payload CMS 3 · Next.js 16 · SQLite |
| `docs/` | Arquitectura, deploy, variables, guía del cliente | — |

## Requisitos

- Node.js 22 (`.nvmrc`) y npm 10.
- Para el CMS en producción: un servidor Node/Docker (Hostinger VPS, Railway, Render, Fly…). El hosting compartido de Hostinger sólo sirve el frontend estático.

## Ejecutar en local

```bash
npm install
```

Frontend con el contenido de ejemplo (`apps/web/src/content/seed`, sin CMS):

```bash
npm run dev
```

→ http://localhost:4321

CMS (primera vez crea la base SQLite, un usuario admin y sube las fotos):

```bash
cp apps/cms/.env.example apps/cms/.env   # editar PAYLOAD_SECRET
npm run seed:cms
npm run dev:cms
```

→ http://localhost:3000/admin (usuario: `admin@babaloocoffeeclub.com` / `ChangeMe-123!` — cambiar al entrar).

Frontend leyendo del CMS local:

```bash
cp apps/web/.env.example apps/web/.env    # PAYLOAD_URL=http://localhost:3000  PUBLIC_CMS_URL=http://localhost:3000
npm run dev
```

## Comandos

| Comando | Descripción |
|---|---|
| `npm run dev` / `npm run build` / `npm run preview` | Frontend |
| `npm run dev:cms` / `npm run build:cms` | CMS |
| `npm run check` | `astro check` + `tsc` del CMS |
| `npm run seed:cms` | Carga el contenido inicial en el CMS (idempotente; `SEED_FORCE=1` para rehacer) |

## Documentación

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — análisis del PDF, decisiones, modelo de contenido.
- [docs/DEPLOY.md](docs/DEPLOY.md) — GitHub → build → Hostinger; CMS en VPS/Docker; redirects 301.
- [docs/ENV.md](docs/ENV.md) — todas las variables de entorno.
- [docs/CLIENT-GUIDE.md](docs/CLIENT-GUIDE.md) — cómo el cliente edita precios, fotos, horarios y textos.
- [docs/MIGRATION.md](docs/MIGRATION.md) — qué se migró del WordPress y qué revisar.

## Estructura del frontend

```
apps/web/src
├── assets/        brand (SVG del PDF), photos, textures
├── components/    layout · sections · menu · forms · seo · ui
├── content/seed/  contenido inicial (mismo formato que la API de Payload)
├── layouts/       Base.astro (fuentes, SEO, JSON-LD, analytics, header, footer)
├── lib/cms/       getContent(): Payload o seed → tipos normalizados
├── pages/         / · /menu · /about · /gallery · /contact · /join-our-team · 404 · robots.txt
├── scripts/       5 scripts vanilla (< 3 KB en total): nav, hero, menú, reveal, forms
├── styles/        tokens.css (valores medidos en el PDF) · global.css
└── utils/         format (precios), schema (JSON-LD)
```
