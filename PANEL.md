# El panel de administración

El sitio tiene un panel propio en **`tudominio.com/admin`** donde se edita todo
sin tocar código: cinta, novedades, remate, padrillos, palmarés, galería,
servicios y los datos de contacto.

Es gratis, no hay servidor que pagar ni mantener, y cada cambio que se guarda
republica el sitio solo en menos de un minuto.

---

## Cómo funciona, en dos líneas

El contenido dejó de estar dentro del código: ahora vive en la carpeta
**`content/`**, en ocho archivos. El panel edita esos archivos y el sitio los
lee. Por eso alcanza con un panel: no hace falta una base de datos.

```
content/sitio.json      datos del haras, contactos, redes, mapa, fotos fijas
content/remate.json     el próximo remate y sus condiciones
content/cinta.json      los mensajes de la franja verde
content/padrillos.json  las fichas de padrillos
content/caballos.json   el palmarés
content/galeria.json    las fotos y cuántas se ven al entrar
content/novedades.json  las tarjetas de Novedades
content/servicios.json  los cuatro servicios
```

---

## Puesta en marcha (una sola vez)

Son cuatro pasos. La parte de GitHub la hacés vos; el dueño después solo
recibe una invitación por mail.

### 1. Subir el sitio a GitHub

GitHub es donde va a vivir el código. Es gratis.

1. Creá una cuenta en [github.com](https://github.com) si no tenés.
2. Creá un repositorio nuevo, privado, llamado `haras-al-galope`.
3. Subí el contenido de esta carpeta. Desde la terminal, parado acá:

```bash
git init -b main && git add . && git commit -m "Sitio de Haras Al Galope"
```

Después seguí las instrucciones que muestra GitHub para conectar y subir.

### 2. Conectar Netlify al repositorio

**Importante:** no sirve arrastrar la carpeta como veníamos haciendo. El panel
necesita que Netlify esté conectado al repositorio para poder guardar cambios.

1. En Netlify: **Add new site → Import an existing project → GitHub**.
2. Elegí el repositorio `haras-al-galope`.
3. Dejá vacíos "Build command" y "Publish directory". Es un sitio sin compilar.
4. Deploy.

### 3. Prender el acceso al panel

En el panel de Netlify, dentro del sitio:

1. **Identity → Enable Identity**
2. **Identity → Registration → Invite only**
   (así solo entra quien vos invites, no cualquiera que encuentre la dirección)
3. **Identity → Services → Git Gateway → Enable**

### 4. Invitar al dueño

**Identity → Invite users** y ponés su mail. Le llega una invitación, elige su
contraseña y ya puede entrar a `tudominio.com/admin` desde la computadora o el
celular.

---

## Cómo se usa

Entrás a `/admin`, iniciás sesión y ves una lista a la izquierda:

| Pantalla | Para qué |
|---|---|
| **Cinta de novedades** | Los mensajes que pasan abajo |
| **Novedades** | Las tarjetas de la sección Novedades |
| **Galería de fotos** | Subir, borrar y ordenar fotos |
| **Remate** | Fecha, hora, condiciones, invitados |
| **Padrillos** | Fichas, pedigríes y fotos |
| **Palmarés** | Los caballos con campaña |
| **Servicios** | Los cuatro bloques de servicios |
| **Datos del haras** | Teléfonos, redes, mapa, logo |

Se edita, se aprieta **Publish** y en menos de un minuto está en el sitio.

### Las fotos

Se suben desde el mismo panel, incluso desde el celular. **No hace falta
recortarlas ni prepararlas**: el sitio las acomoda solo. En los padrillos el
caballo se muestra entero y lo que sobra a los costados se rellena con la
misma foto desenfocada, así nunca queda cortado.

### Para ordenar

Las listas se arrastran. En la galería, la primera foto es la que se muestra
al doble de tamaño; en Novedades conviene dejar la más nueva arriba.

---

## Cosas que conviene saber

**Si algo sale mal, no se pierde nada.** Cada cambio queda guardado en GitHub
con su fecha y autor. Siempre se puede volver a una versión anterior.

**El panel no se puede romper el sitio con un error de tipeo.** Antes, una
coma de más en el archivo de datos dejaba la página en blanco. Ahora el panel
usa formularios, así que eso ya no puede pasar.

**Si la cinta se deja vacía, desaparece** del sitio en vez de mostrarse en
blanco. Lo mismo con las secciones que quedan sin ítems.

**El panel no aparece en Google:** lleva una etiqueta que se lo impide.

---

## Si preferís no montar el panel

El sitio funciona igual sin nada de esto. Los archivos de `content/` se pueden
editar a mano con el Bloc de notas y volver a subir la carpeta a Netlify, tal
como veníamos haciendo. El panel solo agrega comodidad.
