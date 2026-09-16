# Guía del panel de Babaloo (CMS)

Panel: **https://cms.babaloocoffeeclub.com/admin** (mientras tanto, https://babaloo-cms.vercel.app/admin).
Idioma del panel: **My account / Mi cuenta** → Language → English o Español. Los nombres de botones van en inglés y, entre paréntesis, en español.

---

## 1. Lógica general

### Qué se edita desde el panel y qué sigue en código

| Desde el panel (sin código) | Queda en código (a propósito) |
|---|---|
| Textos, fotos, precios, productos, categorías, etiquetas y locales | Los dibujos a mano (perros, iconos originales, logo dibujado, marco dorado) |
| Orden de las secciones, ocultarlas, duplicarlas y agregar nuevas | La maquetación de cada tipo de sección (cómo se acomoda en celular y escritorio) |
| Páginas nuevas (eventos, catering…) con las mismas secciones de la portada | Las 4 páginas base (Home, Menu, About, Contact) no se pueden borrar ni renombrar su URL |
| Colores, tipografías (de la lista), tamaños, espacios, alineación de títulos | Tipografías nuevas que no estén en la lista y cambios de diseño finos |
| Header: altura, logo, madera, cortina, fijo al hacer scroll | Las redirecciones de las URLs viejas de WordPress |
| Footer: fondo, logo, perros, links, dirección, email, redes, copyright, línea extra | SEO técnico, analítica y dominio (lo ve el desarrollador) |
| Formularios: campos, obligatorios, desplegables, destinatarios y mensajes | La contraseña del correo que envía los formularios (SMTP) |

### Cómo se publica
Cada página, producto o ajuste tiene dos botones arriba:

- **Save Draft (Guardar borrador)**: guarda tus cambios sin publicarlos. La web no cambia.
- **Publish changes (Publicar cambios)**: publica. La web se actualiza sola en **1 a 3 minutos** (se reconstruye entera, por eso es tan rápida para los visitantes).

Arriba se ve el **Status (Estado)**: *Published* (publicado), *Draft* (borrador) o *Changed* (publicado, pero con cambios sin publicar).

### Vista previa antes de publicar
Si está activado el sitio de vista previa, aparece el botón **Preview (Vista previa)** al lado de *Publish*. Abre una copia privada de la web que **incluye los borradores** (tiene una etiqueta roja "Preview" abajo a la derecha y Google no la indexa).

1. Haz tus cambios y pulsa **Save Draft**.
2. Espera 1 a 2 minutos y pulsa **Preview**.
3. Si está bien, vuelve al panel y pulsa **Publish changes**.

### Volver atrás si me equivoco
Toda página, producto, categoría, etiqueta y ajuste guarda su historial.

1. Abre el documento → pestaña **Versions (Versiones)**.
2. Elige la versión anterior (se ve la fecha y quién la guardó). Puedes compararla con la actual.
3. Pulsa **Restore (Restaurar)**. Si lo restauras como publicado, la web vuelve a esa versión en 1 a 3 minutos.

Además:
- Para **ocultar** algo sin perderlo: desmarca *Available (Disponible)* en productos, *Visible on the website* en categorías o *Show this section (Mostrar esta sección)* en secciones.
- Los borrados **no** tienen papelera: antes de borrar, mejor ocultar.

### Escritorio y celular
Hay **una sola versión del contenido**. La web acomoda sola cada sección para escritorio, tablet y celular, así que **no se puede romper una versión editando la otra**. Lo único específico del celular son las fotos opcionales *Phone version (Versión móvil)* del hero y de algunos bloques, para usar un recorte vertical en el teléfono.

El panel también funciona desde el celular.

---

## 2. Ajustes generales del sitio

### Settings → Design (Ajustes → Diseño)
Todo lo que cambia el aspecto de **todas** las páginas a la vez. Un campo vacío = diseño original, así que siempre se puede volver.

- **Colours (Colores)**: texto y líneas, fondo de página, franja de iconos y botones oscuros, texto sobre fondos oscuros, paneles suaves, color bajo la textura de mármol, color del header (también pinta la barra del celular) y borde de foco. Botón **↺ default** para volver al original.
- **Fonts & sizes (Tipografías y tamaños)**: tipografía del texto, de títulos/menú/botones y la manuscrita; tamaño en % del texto, títulos, manuscrita, lista del menú y enlaces (100 = original; conviene moverse de a 5 o 10).
- **Layout & spacing (Diseño y espacios)**: espacio entre secciones %, márgenes laterales %, ancho máximo del texto, alineación de los títulos de página y animaciones al hacer scroll.
- **Header**: ver sección 3.
- **Footer & textures (Footer y texturas)**: ver sección 3. Aquí también se reemplaza la **textura de mármol** que usan el footer, Contacto y el panel de fotos del menú.

> La alineación de textos de cada sección (izquierda, centro, derecha) se elige dentro de la sección.

### Imágenes: tamaño, recorte, posición y formato
- **Biblioteca**: *Images (Imágenes)*, en carpetas por página. Sube la foto en su carpeta y escribe la **descripción (ALT)**, que es obligatoria (ayuda a Google y a personas ciegas).
- **Recorte y posición**: al abrir una imagen, *Edit image* permite **recortar** y marcar el **punto focal** (el punto que nunca se corta). La web respeta ese punto en todos los tamaños de pantalla.
- **Tamaño en la web**: lo decide cada sección (por ejemplo, el marco dorado siempre tiene la misma proporción). No hace falta redimensionar a mano.
- **Formato ideal para subir**:

| Uso | Formato | Tamaño | Peso |
|---|---|---|---|
| Fotos (hero, marcos, productos, secciones) | JPG o WebP | 2000 a 2400 px del lado largo | menos de 1,5 MB |
| Foto vertical para celular (hero) | JPG o WebP | 1200 × 1800 px aprox. | menos de 1 MB |
| Logos, iconos, cortina | PNG o SVG con fondo transparente | logo 800 px, iconos 300 × 200 px, cortina 2400 px de ancho | menos de 500 KB |
| Texturas (madera, mármol) | JPG | 720 a 1200 px, que se repita sin cortes | menos de 400 KB |
| Imagen para compartir en redes | JPG | 1200 × 630 px | menos de 500 KB |

La web convierte todo sola a AVIF/WebP en varios tamaños; subir fotos más grandes no mejora nada y hace más lenta la publicación.

---

## 3. Header, páginas y footer

### Header (Settings → Design → Header)
- **Header height (Altura)**: chico, mediano (original) o grande. Afecta también a la cortina.
- **Logo size % (Tamaño del logo)**.
- **Stays visible when scrolling (Queda fijo al hacer scroll)**.
- **Logo**: opcional, reemplaza el logo dibujado (PNG/SVG claro con fondo transparente).
- **Wood texture (Madera)**: foto continua de unos 1000 px de ancho.
- **Show the curtain (Mostrar la cortina)** y **Curtain (Cortina)**: PNG ancho con el borde inferior transparente.
- **Logo inside the open menu (Logo del menú abierto)**.

### Links de navegación (Settings → Site settings → Navigation)
- **Main menu (Menú principal)**: los links del menú desplegable y de la fila de links de la portada.
- **Footer links (Links del footer)**.
- Cada link tiene texto, URL y *New tab (Pestaña nueva)*. Arrastra para reordenar, **⋯ → Remove** para quitar, **Add Link** para agregar.
- URLs válidas: una página (`/menu`, `/about`, `/catering`), una sección (`/#locations`) o una dirección completa (`https://…`).

### Agregar, quitar o reordenar páginas
1. **Pages → New pages (Páginas → Páginas nuevas) → Create new**.
2. Escribe el título; la URL se completa sola (por ejemplo *Catering* → `/catering`).
3. Elige si se muestra el título, el fondo (crema o mármol) y una intro opcional.
4. Agrega secciones con **Add Section** (las mismas de la portada).
5. **Publish changes**. La página queda en `babaloocoffeeclub.com/catering`.
6. Para que aparezca en el menú, agrégala en *Navigation* (paso anterior). El orden del menú es el orden de esos links.

Para quitar una página: sácala primero del menú y del footer, y después bórrala o pásala a borrador (**⋯ → Unpublish**).

### Footer
- **Settings → Site settings → Footer**: titular del copyright ("© año nombre"), mostrar u ocultar dirección y email, y una línea extra.
- **Settings → Site settings → Contact**: la dirección, el teléfono y el email que se muestran.
- **Settings → Site settings → Social media**: redes (iconos del footer, menú y Contacto).
- **Settings → Design → Footer & textures**: fondo (textura de mármol o color liso), color del texto, logo del footer y mostrar los perros.

---

## 4. Home (Pages → Home page)

La portada es una lista de **secciones** en el orden de la web. Cada fila muestra número, tipo y un resumen del contenido.

- **Reordenar**: arrastra desde los puntitos de la izquierda.
- **Ocultar**: abre la sección y desmarca *Show this section*.
- **Duplicar**: menú **⋯** de la fila → **Duplicate**. Útil para copiar una sección con su diseño y cambiarle el contenido.
- **Agregar**: **Add Section** al final → elegir el tipo → arrastrarla a su lugar.

Tipos de sección disponibles (sirven en cualquier página):

| Sección | Para qué |
|---|---|
| Hero photos | Carrusel de fotos grandes: fotos, versión móvil, segundos por foto y altura (alta, media, baja) |
| Icons band | Franja de iconos en movimiento: velocidad e **iconos propios** (si se deja vacío, usa los dibujados) |
| Links row | Fila de links (usa los links de Navigation) |
| Welcome text | Texto centrado con saltos de línea, alineación y botón opcional |
| Locations | Marcos dorados con los locales (ver sección 5) |
| Dogs band | Franja "coffee & matcha club" con perros: velocidad |
| Featured products | Productos marcados como destacados |
| Photo gallery | Galería de fotos |
| Testimonials | Frases de clientes |
| Call to action | Título, texto, botón e imagen, con fondo y alineación |
| Text block | Texto con formato simple e imagen a un lado |
| Gold frames | Marcos dorados con fotos o **carruseles** (ver sección 7) |
| Form | Formulario de Contacto o de Empleo, con foto opcional |
| Space / divider | Espacio extra con línea opcional |

**Cambiar el hero**: sección *Hero photos* → cambia, agrega o arrastra fotos (carpeta *Home · Hero*). Opcional: *Phone version* con recorte vertical.
**Cambiar los textos**: sección *Welcome text*; cada salto de línea se respeta.
**Franja de ilustraciones**: *Icons band* → *Custom icons* para subir tus propios dibujos, y *Seconds per loop* para la velocidad.

---

## 5. Locations (Pages → Home page → sección Locations)

- **Agregar un local**: *Add Location* dentro de la sección.
- **Datos**: nombre, nombre manuscrito sobre la foto, estado (*Open* abierto, *Coming soon* próximamente, *Hidden* oculto), foto del marco, dirección, teléfono, email.
- **Horario**: *Opening hours* (tal como se lee en la web). Abre *Hours for Google, map & coordinates* para el horario de Google (formato 24 h), el link de Google Maps, las coordenadas y el link de pedidos.
- **Orden**: arrastra los locales. El primero es el principal para Google.
- **Acomodo automático**: 1 local por fila en celular, 2 en tablet y hasta 3 en escritorio. Con 4 locales se muestran 2 + 2; con 5, 3 + 2 centrados. No hay que tocar nada.
- Si un local cambia de horario, actualiza también la página **Contact** si ahí se muestra.

---

## 6. Menu

### Página del menú (Pages → Menu page)
- **Intro**: título manuscrito (**Enter = salto de línea**), texto (línea en blanco = párrafo nuevo) y alineación.
- **Menu options**: mostrar precios, mostrar el **selector de local** y el texto del botón "All locations".
- **Extra sections**: secciones debajo del menú.

### Categorías (Menu → Categories)
- **Crear**: *Create new* → nombre. Para una subsección (Hot, Iced…), elige *Parent category (Categoría madre)*.
- **Nombre con salto de línea**: *Name as shown on the menu*, Enter donde quieras cortar.
- **Orden**: campo *Order (Orden)* en la columna derecha; los números más bajos salen primero.
- **Agregar "Food"**: crea la categoría *Food* sin madre, dale un orden y agrégale productos. Una categoría sin productos no se muestra. La lista se vuelve a centrar sola.
- **Ocultar**: desmarca *Visible on the website*.

### Productos (Menu → Products)
- **Agregar**: *Create new* → nombre, categoría, descripción, precio, foto.
- **Precio**: *Price (USD)* con números (5.5 = $5.50). *Price text* reemplaza el número (por ejemplo "+$0.75"). *Sizes / variants* para varios tamaños o sabores con precio.
- **Reordenar**: campo *Order* (o columna *Order* de la lista).
- **Mover de categoría**: cambia *Category*. Para varios a la vez: márcalos en la lista → **Edit** → *Category* → guardar.
- **Ocultar sin borrar**: desmarca *Available (Disponible)*.
- **Etiquetas y locales**: *Labels & locations* en la columna derecha.

### Etiquetas y locales (Menu → Labels)
- **Crear una etiqueta**: *Create new* → texto, tipo, color del distintivo y del texto, orden.
  - Tipo **Badge (Distintivo)**: Signature, New, Popular, Seasonal…
  - Tipo **Location (Local)**: Rea Farms, South End, Lake Norman…
- **Productos solo en un local**: agrégale al producto la etiqueta de ese local. Un producto **sin** etiqueta de local se vende en todos.
- En la web, el selector de local (arriba del menú) muestra solo lo que se vende en el local elegido. Aparece cuando hay al menos dos locales en uso.
- *Show as a badge*: desmárcalo si quieres usar la etiqueta solo para filtrar, sin mostrar el distintivo.

---

## 7. About (Pages → About page)

- **1 · Title & framed photos**: título y **marcos dorados**. Agrega los marcos que quieras con *Add Frame* y arrástralos para ordenarlos. *Frames per row on desktop* (2, 3 o 4). Las filas incompletas se centran.
- **Carrusel dentro de un marco**: en un marco, *More photos* → agrega más fotos. Ese marco pasa a ser un carrusel que se desliza con el dedo, con flechas en escritorio y puntitos debajo. *Carousels move on their own* lo hace avanzar solo.
- **Texto sobre la foto**: *Hand-written text over the photo*.
- **2 · Text**: texto, alineación y mostrar u ocultar la franja de perros.
- **3 · Join our team**: mostrar u ocultar, foto del equipo, título e intro. Los campos del formulario están en *Settings → Forms*.
- **4 · Extra sections**: más secciones (por ejemplo otra fila de marcos) antes del formulario de contacto.
- **5 · Contact**: mostrar u ocultar el formulario de contacto al final.

---

## 8. Formularios (Settings → Forms)

- **Send form messages to (Enviar a)**: el email que recibe los formularios. Varios: separados por coma. Cada formulario puede tener su propio destinatario en su pestaña.
- Pestañas **Contact us** y **Join our team**:
  - **Fields (Campos)**: cada fila es un campo. Arrastra para reordenar, **⋯ → Remove** para quitar, **Add Field** para agregar.
  - En cada campo: *Label* (texto que se ve), *Type* (texto corto, email, teléfono, texto largo, desplegable, número, fecha, enlace, subir archivo), *Width* (mitad o completo) y *Required (Obligatorio)*.
  - **Desplegables**: tipo *Dropdown* → *Dropdown options* para agregar, quitar o reordenar opciones (por ejemplo los puestos de trabajo).
  - *Internal key* se completa sola. **No la cambies** en campos que ya recibieron mensajes.
  - Un campo *File upload* se muestra como el botón manuscrito "upload résumé" (PDF o Word, hasta 5 MB).
  - **Send button text**, **Email subject** y **Message after sending** (mensaje de confirmación).
- Pestaña **Status & test (Estado y prueba)**: muestra si el envío de emails está configurado, a dónde llega cada formulario y los mensajes recientes. **Send a test email** manda un correo de prueba.

**Verificar que funcionan**:
1. *Publish changes* y espera 2 minutos.
2. Envía el formulario desde la web con datos de prueba.
3. Debe aparecer el mensaje de confirmación y el mensaje en **Messages (Mensajes)**.
4. Si el envío de emails está configurado, también llega al correo (revisa spam la primera vez).
5. Borra el mensaje de prueba.

Los mensajes quedan en **Messages** con estado *New / Replied / Archived*; los currículums, en **Messages → Résumés**. Ambos se pueden borrar.

---

## 9. Usuarios
- **Super admin**: todo, incluidos SEO y Usuarios.
- **Editor**: páginas, menú, fotos, mensajes, Diseño, Ajustes del sitio y Formularios.
Se crean en **Settings → Users** (super admin).

## 10. Si algo no se ve actualizado
1. ¿Pulsaste **Publish changes**? Un borrador no cambia la web.
2. Espera 3 minutos y recarga con Ctrl+F5 (en el celular, cierra y abre la pestaña).
3. Si sigue igual, avisa al desarrollador con la hora del cambio.
