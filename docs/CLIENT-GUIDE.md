# Guía rápida para administrar la web de Babaloo

Entra en **https://cms.babaloocoffeeclub.com/admin** con tu usuario y contraseña.
Todo lo que guardes se publica solo en la web en un par de minutos (no hace falta avisar a nadie).

El menú de la izquierda tiene estos grupos:

```
HOME
 ├── Home page        → orden de las secciones, fotos del hero, texto de bienvenida
 ├── Locations        → marcos dorados: dirección, horarios, mapa, "coming soon"
 └── Testimonials     → frases de clientes (opcional)
MENU
 ├── Products         → cada bebida o plato: nombre, descripción, precio, foto, etiquetas
 ├── Categories       → Coffee, Matcha & more, Food and sweets… y sus secciones Hot / Iced
 └── Menu page        → texto de arriba del menú
MEDIA
 ├── Images           → todas las fotos
 └── Galleries        → la galería de la web y las 3 fotos enmarcadas de "About"
PAGES
 ├── About page · Contact page · Join our team page · Gallery page
SETTINGS
 ├── Site settings    → nombre, email, teléfono, dirección, redes, enlaces del menú
 ├── SEO defaults     → título y descripción por defecto para Google
 ├── Inbox            → mensajes recibidos por los formularios
 └── Users            → cuentas de acceso
```

---

## Las tareas más habituales

### Cambiar el precio del Latte
1. **Menu → Products** → busca "Latte" → ábrelo.
2. Cambia el número en **Price (USD)** (por ejemplo `6` → `6.5`).
3. **Save**. Listo: la web mostrará `$6.50`.

> Para un texto en lugar de número (por ejemplo `+$0.75` o `market price`) usa **Price text**.

### Cambiar la foto de un producto
1. **Menu → Products** → abre el producto.
2. En **Product photo** pulsa *Choose* para elegir una foto ya subida, o *Upload* para subir una nueva.
3. Escribe una **Description (ALT)** breve de la foto (obligatorio, ayuda a Google y a personas ciegas).
4. **Save**. Al hacer clic en ese producto en la web aparecerá su foto.

### Añadir un producto nuevo
**Menu → Products → Create new**. Rellena nombre, categoría (por ejemplo *Coffee → Iced*), precio, foto y guarda.
- **Order**: número para ordenar dentro de su sección (1 sale primero).
- **Labels**: etiquetas como *New* o *Popular* que se ven junto al nombre.
- **Featured**: lo destaca en la portada (si esa sección está activa).
- Desmarca **Available** para ocultarlo temporalmente sin borrarlo.

### Crear una categoría o una sección Hot / Iced
**Menu → Categories → Create new**. Si es una sección dentro de otra (por ejemplo *Hot* dentro de *Coffee*), elige la categoría madre en **Parent category**. La **Category photo** se muestra al abrir la categoría en la web.

### Cambiar el horario o la dirección
**Home → Locations** → abre el local → edita **Opening hours** (líneas tal como se leen) y, si cambia el horario, también **Opening hours for Google**. Guarda.

Para un local nuevo: *Create new*, sube la foto que irá dentro del marco, escribe el nombre manuscrito (por ejemplo `rea farms`) y elige **Coming soon** hasta que abra.

### Cambiar la foto grande de la portada (hero)
**Home → Home page** → sección **Hero photos** → cambia, añade o arrastra fotos para reordenarlas. Se alternan solas cada 5 segundos (ajustable en *Seconds per photo*) y el visitante puede pasar con las flechas, los puntos o deslizando en el móvil.

### Cambiar el texto de "About"
**Pages → About page** → **Text**. Cada salto de línea se respeta tal cual. Lo mismo para el texto de bienvenida de la portada en **Home page → Intro text**.

### Galería
**Media → Galleries → Gallery**: añade, quita o arrastra fotos para reordenarlas.
**About — framed photos** son las tres fotos dentro de marcos dorados de la página About.

### Redes sociales, email, teléfono, enlace de pedidos
**Settings → Site settings** → pestañas *Contact* y *Social media*. El botón **Order online** usa el enlace de *Order online link*.

### Leer los mensajes de los formularios
**Settings → Inbox**. Cada mensaje tiene un estado (New / Replied / Archived).

### Ocultar o reordenar secciones de la portada
**Home → Home page**: arrastra las secciones para cambiar su orden; desmarca **Show this section** para ocultar una sin borrarla. Puedes añadir secciones nuevas (galería, productos destacados, testimonios, texto, llamada a la acción) con **Add section**.

---

## Consejos sobre fotos
- Sube JPG o PNG de buena calidad (1500–2500 px de ancho). La web las convierte sola a formatos ligeros; no hace falta reducirlas.
- Para productos funcionan mejor las fotos verticales con fondo limpio.
- Rellena siempre la descripción (ALT).

## Usuarios
- **Admin**: todo, incluida la gestión de usuarios.
- **Editor**: edita contenido, no puede crear usuarios ni borrar locales.
Crea uno por persona en **Settings → Users**.

## Si algo no se ve actualizado
Espera 2–3 minutos y recarga con Ctrl+F5. Si sigue igual, avisa al desarrollador: puede que el "rebuild" no esté configurado (`DEPLOY_HOOK_URL`).
