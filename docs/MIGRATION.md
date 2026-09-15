# Migración desde WordPress

Fuente: `https://babaloocoffeeclub.com` (WordPress + Elementor + Yoast) analizado el 14-09-2026. Nada del sitio antiguo (plugins, temas, base de datos) se reutiliza; sólo el **contenido**.

## Qué se migró

| Contenido | Origen WP | Destino |
|---|---|---|
| Menú completo con precios (Coffee, Non-coffee, Sandwich, Morning bites, Sweets, Syrups, Alternative milk) | `/drinks/`, `/food/` | `apps/web/src/content/seed/menu.json` → colección **Products / Categories** |
| Dirección `1425 Winnifred St, Suite 117, Charlotte, NC` y horario (L–V 7–4, S–D 8–4) | `/hours/`, footer | **Locations** (South End) y **Site settings** |
| Email `info@babaloocoffeeclub.com`, Instagram, enlace de pedidos Toast | footer, `/contact-us/` | **Site settings** |
| 16 fotos de la galería + 1 foto por producto (biblioteca de medios de WP) | `/gallery/`, `/wp-content/uploads/2025/03/` | `apps/web/src/assets/photos` → **Images / Galleries** |
| Formulario "Join us" (nombre, apellido, email, teléfono, puesto, experiencia) | `/join-our-team/` | Formulario `careers` (+ mensaje y enlace a CV opcionales) |
| Títulos de página (Yoast) | `<title>` | Reescritos con descripciones reales (Yoast no tenía meta descriptions) |

Textos, logo, iconos, marcos y estructura visual provienen del **PDF**, no del WordPress.

## URLs

| WP (indexada) | Nueva | Acción |
|---|---|---|
| `/` | `/` | igual |
| `/drinks/` | `/menu` | 301 |
| `/food/` | `/menu#food-and-sweets` | 301 |
| `/hours/` | `/#locations` | 301 (sección de locales en la portada, como pide el diseño) |
| `/gallery/` | `/` | 301 (la galería es una sección opcional de la portada) |
| `/join-our-team/` | `/about#join-our-team` | 301 (el formulario vive en About) |
| `/contact-us/` | `/contact` | 301 |
| — | `/about` | nueva (pantalla 3 del PDF) |

## Datos que el cliente debe revisar antes de publicar

Marcados porque no existían en el WordPress o parecen erróneos:

- Menú e importes replicados de la carta online de Toast (septiembre 2026), incluidos los ítems de temporada y la categoría *Merch*. Revisar que siga vigente al lanzar.
- Teléfono (704) 817-7261 tomado de Toast.
- Locales 2 y 3 se muestran como *Coming soon* sin nombre (indicación del cliente). Añadir nombre, dirección y horario cuando abran; el campo *Hand-written name* dibuja el nombre sobre la foto como en el PDF.
- Teléfono: no había en el WP. Añadirlo en *Site settings* para que aparezca en Google.
- Coordenadas del local (JSON-LD): aproximadas al 1425 Winnifred St; ajustar en *Locations → Coordinates*.

## Fuentes tipográficas

El PDF usa **Jimmy Script** (comercial). El cliente aportó la licencia: el archivo fuente está en `apps/web/src/assets/fonts/JimmyScript-Rg.otf` y se sirve convertido a WOFF2 desde `apps/web/public/fonts/jimmy-script.woff2` (el layout detecta cualquier `jimmy-script*.woff2|woff|otf|ttf` en esa carpeta y añade el `@font-face` y el preload). Si se quita el archivo, el sitio vuelve automáticamente a **Mrs Saint Delafield** (Google Fonts, OFL), que sigue como respaldo en `--font-script`.
