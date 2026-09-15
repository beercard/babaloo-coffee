# Guía rápida para administrar la web de Babaloo

Entra en **https://cms.babaloocoffeeclub.com/admin** con tu usuario y contraseña.
Todo lo que guardes se publica solo en la web en un par de minutos (no hace falta avisar a nadie).

Idioma del panel: **Mi cuenta e idioma** (abajo en la barra lateral) → English / Español. Ahí mismo está **Cerrar sesión**.

## Cómo está organizado

Cada **página** de la web es una entrada del panel y dentro están **sus secciones, en el mismo orden que en la web**:

```
PÁGINAS
 ├── Página de inicio      → Fotos del hero · Franja de iconos · Fila de enlaces · Texto de bienvenida · Locales y horarios · (secciones opcionales)
 ├── Página Menú           → texto de arriba del menú
 ├── Página About          → 1 Título y fotos enmarcadas · 2 Texto · 3 Únete al equipo (foto + formulario) · 4 Contacto
 └── Página Contacto       → título y texto
MENÚ
 ├── Productos             → cada bebida o plato: nombre, descripción, precio, foto, etiquetas
 └── Categorías            → Coffee, Matcha & non-coffee, Bites… y sus secciones Hot / Iced
FOTOS
 └── Imágenes              → biblioteca en carpetas: Home · Hero, Home · Locations, Menu · Products, About · Team, Gallery, Brand
MENSAJES
 └── Mensajes              → lo que llega por los formularios
AJUSTES (solo super admin)
 ├── Ajustes del sitio · SEO por defecto · Usuarios
```

Las cajas **SEO** de cada página y todo el grupo *Ajustes* solo las ve el super admin. Las URLs antiguas `/gallery` y `/join-our-team` redirigen a la portada y a About.

---

## Las tareas más habituales

### Cambiar el precio del Latte
1. **Menú → Productos** → busca "Latte" → ábrelo.
2. Cambia el número en **Precio (USD)** (por ejemplo `6` → `6.5`).
3. **Guardar**. La web mostrará `$6.50`.

> Para un texto en lugar de número (por ejemplo `+$0.75` o `market price`) usa **Precio en texto**.

### Cambiar la foto de un producto
1. **Menú → Productos** → abre el producto.
2. En **Foto del producto** pulsa *Elegir* (carpeta *Menu · Products*) o *Subir* una nueva.
3. Escribe una **Descripción (ALT)** breve (obligatorio; ayuda a Google y a personas ciegas).
4. **Guardar**. Al hacer clic en ese producto en la web aparecerá su foto.

### Añadir un producto nuevo
**Menú → Productos → Crear**. Rellena nombre, categoría/sección (por ejemplo *Coffee → Iced*), precio, foto y guarda.
- **Orden**: número para ordenar dentro de su sección (1 sale primero).
- **Etiquetas**: *New*, *Popular*, *Seasonal*, *Signature*, *All locations*… se ven junto al nombre.
- **Destacado**: lo muestra en la portada si esa sección está activa.
- Desmarca **Disponible** para ocultarlo temporalmente sin borrarlo.

### Crear una categoría o una sección Hot / Iced
**Menú → Categorías → Crear**. Si es una sección dentro de otra (por ejemplo *Hot* dentro de *Coffee*), elige la categoría madre en **Categoría madre**. En la web, Hot / Iced / Salty / Sweet se distinguen con icono y color.

### Cambiar el horario o la dirección
**Páginas → Página de inicio** → sección **Locales** → abre el local → **Horario (tal como se muestra en la web)**. Si cambia el horario, actualiza también *Horario para Google* dentro de "Horario para Google, mapa y coordenadas". Guardar.

Para un local nuevo: en la misma sección, **Añadir local**, sube la foto que irá dentro del marco (carpeta *Home · Locations*) y marca **Próximamente** hasta que abra.

### Cambiar las fotos grandes de la portada (carrusel)
**Páginas → Página de inicio** → sección **Fotos del hero** → cambia, añade o arrastra fotos (carpeta *Home · Hero*). Se alternan solas cada 5 segundos (ajustable) y el visitante puede pasar con las flechas, los puntos o deslizando.

### Cambiar el texto de bienvenida / el texto de About
- Portada: **Página de inicio** → sección **Texto de bienvenida**.
- About: **Página About** → pestaña **2 · Texto**.
Cada salto de línea se respeta tal cual.

### Fotos enmarcadas de About
**Página About** → pestaña **1 · Título y fotos enmarcadas** → tres fotos (carpeta *Home · Locations* o *About · Team*).

### Galería de fotos (sección opcional de la portada)
**Página de inicio** → sección **Galería de fotos**: marca *Mostrar esta sección*, añade fotos (carpeta *Gallery*), quita o arrastra para reordenar. Si la sección está oculta, la web no muestra galería.

### Leer los mensajes de los formularios
**Mensajes**. Cada mensaje tiene un estado (New / Replied / Archived). Las solicitudes de *Join our team* traen el currículum adjunto (campo **Currículum**, también en **Mensajes → Currículums**); además llegan por email al buzón configurado.

### Ocultar o reordenar secciones de la portada
**Página de inicio**: arrastra las secciones para cambiar su orden; desmarca **Mostrar esta sección** para ocultar una sin borrarla. Puedes añadir secciones nuevas (galería, productos destacados, testimonios, texto, llamada a la acción) con **Añadir sección**.

---

## Consejos sobre fotos
- Sube JPG o PNG de buena calidad (1500–2500 px de ancho). La web las convierte sola a formatos ligeros.
- Súbelas en la carpeta de su página para encontrarlas después.
- Para productos funcionan mejor las fotos verticales con fondo limpio.
- Rellena siempre la descripción (ALT).

## Usuarios
- **Super admin**: todo, incluidos Ajustes, SEO y Usuarios.
- **Editor**: páginas, menú, fotos y mensajes.
Se crean en **Ajustes → Usuarios** (super admin).

## Si algo no se ve actualizado
Espera 2–3 minutos y recarga con Ctrl+F5. Si sigue igual, avisa al desarrollador: puede que el "rebuild" no esté configurado (`DEPLOY_HOOK_URL`).
