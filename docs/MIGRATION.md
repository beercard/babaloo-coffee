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
| `/gallery/` | `/gallery` | 301 (sólo se quita la barra final) |
| `/join-our-team/` | `/join-our-team` | 301 (barra final) |
| `/contact-us/` | `/contact` | 301 |
| — | `/about` | nueva (pantalla 3 del PDF) |

## Datos que el cliente debe revisar antes de publicar

Marcados porque no existían en el WordPress o parecen erróneos:

- **Italiano — $5** en el WP (un sándwich con capicola y prosciutto al lado de un Cubano de $14). Probablemente $15. Se migró tal cual.
- **Latte Tiramisu ($7.50)**, **Matcha Tiramisu ($8)** y **Pavé ($7)** aparecen en el PDF pero no en el WP: los precios son provisionales.
- **Pan de bono** tenía como descripción "Matcha (ceremonial grade)" en el WP (error de copia); se dejó sin descripción.
- Locales 2 y 3 se muestran como *Coming soon* sin nombre (indicación del cliente). Añadir nombre, dirección y horario cuando abran; el campo *Hand-written name* dibuja el nombre sobre la foto como en el PDF.
- Teléfono: no había en el WP. Añadirlo en *Site settings* para que aparezca en Google.
- Coordenadas del local (JSON-LD): aproximadas al 1425 Winnifred St; ajustar en *Locations → Coordinates*.

## Fuentes tipográficas

El PDF usa **Jimmy Script Light** (comercial). Se sustituyó por **Mrs Saint Delafield** (Google Fonts, licencia OFL), de trazo fino similar. Si el cliente posee licencia web de Jimmy Script, basta con añadir el `.woff2` y una regla `@font-face` en `apps/web/src/styles/global.css`; `--font-script` ya la lista como primera opción.
