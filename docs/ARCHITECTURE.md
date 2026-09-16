# Arquitectura — Babaloo Coffee Club

Documento de diseño técnico. Se escribió **antes** de generar código, a partir del análisis del PDF (`WEB.pdf`, 3 pantallas de 1920×3840) y del sitio WordPress actual (`babaloocoffeeclub.com`).

---

## 1. Análisis del PDF

| Pantalla | Secciones (de arriba a abajo) |
|---|---|
| **Home** | Header madera + logo · cortina · Hero fotográfico rotativo ("fotos que cambien") · Franja de iconos deslizante ("elementos que se deslicen") · Nav (LOCATIONS / MENU / ORDER ONLINE / ABOUT / CONTACT US) · Texto intro en Lato Italic · 3 marcos dorados = locales (dirección, horarios, `map`, "COMING SOON", nombre en script sobre la foto: *rea farms*, *lake norman*) · Footer hormigón con Instagram |
| **Menu** | Header + cortina · Intro en script ("homemade creations" + texto) · Split: panel de foto (cambia al hacer clic en el producto, fondos alternados hormigón / salvia) + acordeón de menú (Categoría `+`, Subcategoría Hot/Iced `+/-`, ítem en Lato Bold Italic, descripción Poppins Light Italic) |
| **About** | Header + cortina · Título ABOUT · 3 marcos dorados · Texto · Franja marrón con perros + "COFFEE & MATCHA CLUB" · Split foto de equipo + formulario JOIN OUR TEAM · Formulario CONTACT US sobre hormigón · Logo completo con perros · Nav footer (LOCATIONS / MENU / ORDER ONLINE / ABOUT / SOCIAL) |

### Design tokens extraídos del PDF (valores reales, no aproximados)

| Token | Valor | Origen |
|---|---|---|
| `--color-ink` (texto) | `#3c1a1e` | Todos los textos |
| `--color-cream` (fondo) | `#f1ede7` / `#f2eee7` | Fondo de página, texto sobre madera |
| `--color-bark` (marrón franja/botones) | `#503226` | Franja de iconos, botones "sent" |
| `--color-wood` | textura `wood.jpg` (media `#5b4a3d`) | Header |
| `--color-concrete` | textura `concrete.jpg` (media `#a39c91`) | Footer, contacto, panel menú |
| `--color-sage` | `#d0cebf` | Panel alterno de foto en menú |
| Display / logo | Logo vectorial (SVG extraído del PDF) | Header, footer |
| Script | **Jimmy Script** (licencia del cliente, `public/fonts/jimmy-script.woff2`; respaldo Mrs Saint Delafield) | Nombres de locales, intro del menú, labels y botones de formularios |
| Cuerpo | **Lato** Italic 46px / Bold Italic 60px / Regular | Textos, títulos de menú |
| UI | **Poppins** Italic 46px (nav), Bold 46px (títulos de formulario, botones), Light Italic 46px (descripciones) | Nav, formularios, descripciones |

Escala del PDF: 1920px de ancho ⇒ 46px ≈ `1.5rem` en desktop; se usa `clamp()` fluido.

### Assets rescatados del PDF
- Vectores (SVG con `currentColor`): logo "Babaloo", lockup completo con perros, perro poodle, perro basenji, "COFFEE & MATCHA CLUB", 9 iconos de la franja.
- Raster: marco dorado con alpha, taza tiramisú con alpha, texturas madera/hormigón, cortina, foto hero de los perros, 3 renders del local (recortados del screenshot), foto del equipo.

### Contenido rescatado de WordPress
- URLs indexadas: `/`, `/drinks/`, `/food/`, `/hours/`, `/gallery/`, `/join-our-team/`, `/contact-us/`.
- Menú completo con precios (Coffee, Non-coffee, Sandwich, Morning bites, Sweets, Syrups, Alternative milk).
- Dirección: 1425 Winnifred St, Suite 117, Charlotte, NC. Horario: Lun–Vie 7AM–4PM, Sáb–Dom 8AM–4PM. Email `info@babaloocoffeeclub.com`. Instagram `@babaloocoffeeclub`. Pedidos: Toast.
- 60+ fotografías de producto/local de la biblioteca de medios (se migraron las de la galería y una por producto).
- Formulario "Join us": First/Last name, email, phone, city, state, position, experience, resume.

---

## 2. Decisiones de arquitectura

```
GitHub ──push/webhook──▶ GitHub Actions (build Astro) ──FTP/SFTP──▶ Hostinger (HTML estático)
                                   ▲
                                   │ fetch en build-time (REST)
                          Payload CMS (Node, SQLite, Docker) ── afterChange ──▶ dispara rebuild
```

| Capa | Elección | Por qué |
|---|---|---|
| Frontend | **Astro 7** estático (`output: 'static'`), TypeScript strict | HTML pre-renderizado, 0 JS por defecto, `astro:assets` para AVIF/WebP responsive |
| Estilos | CSS moderno con custom properties (sin Tailwind) | Diseño bespoke; tokens en `styles/tokens.css`; menos KB que un framework |
| JS cliente | 4 scripts vanilla < 2 KB c/u (hero crossfade, menú móvil, swap de imagen del menú, reveal, forms) | Sin hydration, sin frameworks |
| CMS | **Payload CMS 3** (Next.js) + SQLite, en `apps/cms` | Preferencia del brief; admin sencillo; roles; REST/GraphQL; hooks para rebuild |
| Contenido | El frontend consume `lib/cms` → Payload si `PAYLOAD_URL` existe; si no, **seed local** (`content/seed/*.json` con la misma forma) | Permite build/preview sin CMS y sirve para poblar el CMS |
| Imágenes | Payload sube a `media/`; Astro las descarga en build y las transforma (AVIF/WebP, `srcset`, lazy, `fetchpriority` en hero) | El sitio final no depende del CMS en runtime |
| Formularios | POST a `PAYLOAD_URL/api/forms/submit` (validación server-side, honeypot, rate-limit, email opcional) + validación HTML5/JS en cliente | Hosting estático no ejecuta código |
| SEO | `SEO.astro` + JSON-LD `CafeOrCoffeeShop` por local + `@astrojs/sitemap` + `robots.txt` + redirects 301 (`.htaccess`, `_redirects`, `vercel.json`) | Migración sin pérdida de posicionamiento |
| Analytics | `Analytics.astro` lee `PUBLIC_GA4_ID`, `PUBLIC_GTM_ID`, `PUBLIC_META_PIXEL_ID`, `PUBLIC_GADS_ID`; no emite nada si están vacías | Sin scripts de terceros por defecto |

---

## 3. Mapa del sitio y redirects

| Nueva URL | Contenido | Antigua URL (301) |
|---|---|---|
| `/` | Home (hero, iconos, nav, intro, **locales** — el enlace *Locations* hace scroll a `/#locations`) | `/`, `/hours/` |
| `/menu` | Menú completo con foto interactiva | `/drinks/`, `/food/` |
| `/about` | About + Join our team + Contact (pantalla 3 del PDF) | — |
| `/gallery` | Galería administrable | `/gallery/` (se mantiene) |
| `/contact` | Formulario de contacto + datos | `/contact-us/` |
| `/join-our-team` | Formulario de empleo | `/join-our-team/` (se mantiene) |

---

## 4. Modelo de contenido (Payload)

Todo el contenido editable tiene **historial** (pestaña Versions, con Restore) y **borradores**: *Save draft* no toca el sitio; *Publish changes* dispara el rebuild. Un segundo build del sitio (`PAYLOAD_DRAFTS=1`) sirve de vista previa con los borradores. Las secciones de página se guardan como JSON (`blocksAsJSON`), una columna por página.

**Globals** (un solo documento cada uno)
- `homepage` — `sections` (blocks ordenables, activables y duplicables) + `seo`.
- `menu-page` — intro (título con saltos de línea, texto, alineación), precios on/off, selector de local, secciones extra, seo.
- `about-page` — título, marcos ilimitados (foto + `more` = carrusel, texto manuscrito, columnas, autoplay), texto + alineación, franja de perros on/off, Join our team, secciones extra, contacto on/off, seo.
- `contact-page` — textos, columna de datos, secciones extra, seo.
- `site-settings` — negocio, contacto, redes, navegación (menú y footer), textos del footer. Editable por editores.
- `design` — colores, tipografías (de una lista), escalas de tamaño y espacio, ancho del texto, alineación de títulos, animaciones, header (altura, logo, madera, cortina, fijo) y footer (fondo, color, logo, perros, textura de mármol). Se traduce a variables CSS en `lib/design.ts`.
- `forms` — destinatarios y, por formulario (contact / careers): campos (etiqueta, tipo, ancho, obligatorio, opciones), texto del botón, asunto y mensaje de confirmación. El endpoint `/api/forms/submit` valida contra esta configuración.
- `seo-defaults` — title template, default description/OG image, twitter handle, robots (solo super admin).

**Bloques de sección** (sirven en cualquier página): hero, iconStrip (con iconos propios), navRow, intro, locations, clubStrip, featuredMenu, gallery, testimonials, cta, richText, frames (marcos/carruseles), form, spacer.

**Collections**
- `pages` — páginas nuevas en `/<slug>` con las mismas secciones (slugs reservados: menu, about, contact…).
- `media` — upload con `alt` obligatorio, recorte y punto focal; carpetas por página.
- `menu-categories` — name, displayName (saltos de línea), slug, description, image, parent (Hot/Iced), order, active.
- `menu-items` — name, slug, description, price + `priceLabel`, variants[], image, category, labels[] (relación a `menu-labels`), featured, available, order. (`tags` queda oculto como respaldo del modelo anterior.)
- `menu-labels` — name, kind (`badge` | `location`), colores, showBadge, order. Las de tipo `location` alimentan el selector de local del menú.
- `form-submissions` — form, data JSON, labels (etiquetas al momento del envío), résumé, status.
- `resumes` — archivos adjuntos (privados).
- `users` — role: `admin` | `editor`.

**Acceso**: lectura pública solo de lo publicado; los borradores los leen usuarios logueados y el build de vista previa (`x-preview-secret`).

---

## 5. Estructura del repositorio

```
babaloo-coffee-club/
├─ apps/
│  ├─ web/                 # Astro
│  │  ├─ src/
│  │  │  ├─ assets/{brand,photos,textures}
│  │  │  ├─ components/{ui,layout,sections,menu,seo,forms}
│  │  │  ├─ content/seed/  # JSON con la misma forma que la API de Payload
│  │  │  ├─ layouts/
│  │  │  ├─ lib/cms/       # fetch + normalización + tipos
│  │  │  ├─ pages/
│  │  │  ├─ scripts/       # JS cliente mínimo
│  │  │  ├─ styles/
│  │  │  └─ utils/
│  │  └─ public/           # robots, .htaccess, _redirects, favicons
│  └─ cms/                 # Payload 3 (Next.js)
│     ├─ src/{collections,globals,blocks,fields,access,hooks,endpoints,seed}
│     └─ Dockerfile, docker-compose.yml
├─ docs/                   # ARQUITECTURA, DEPLOY, CLIENT-GUIDE, ENV
├─ .github/workflows/      # build + deploy
└─ package.json            # npm workspaces
```

---

## 6. Performance budget

- Medido en el build: CSS ≈ 23 KB sin comprimir, JS ≈ 2.5 KB; fuentes: 8 woff2 subset latin (`font-display: swap`), 2 preloads.
- Hero: `<Picture>` AVIF/WebP, `fetchpriority="high"`, `width/height` explícitos (sin CLS).
- Todo lo demás `loading="lazy" decoding="async"`.
- Animaciones sólo `opacity`/`transform`; `prefers-reduced-motion` desactiva marquee, crossfade y reveal.
