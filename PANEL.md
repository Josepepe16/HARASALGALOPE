# El panel de administración

El sitio tiene un panel propio donde se edita todo sin tocar código: cinta,
novedades, remate, padrillos, palmarés, galería, servicios y los datos de
contacto.

```
https://josepepe16.github.io/HARASALGALOPE/admin/
```

Es gratis, no hay servidor que pagar ni mantener, y cada cambio que se guarda
republica el sitio solo en menos de un minuto.

---

## Cómo funciona, en dos líneas

El contenido no está dentro del código: vive en la carpeta **`content/`**, en
ocho archivos. El panel edita esos archivos y el sitio los lee. Por eso alcanza
con un panel: no hace falta una base de datos.

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

El sitio se publica desde **GitHub Pages**, gratis y sin límites de despliegue.
El repositorio es `Josepepe16/HARASALGALOPE`.

---

## Cómo entrar

El panel usa **Sveltia CMS**, que se autentica contra GitHub. Hay dos formas:

### Con una clave de acceso (la que anda hoy, sin configurar nada)

1. Entrá a [github.com/settings/tokens](https://github.com/settings/tokens) →
   **Generate new token → Fine-grained token**.
2. En **Repository access** elegí *Only select repositories* → `HARASALGALOPE`.
3. En **Permissions → Repository permissions**, poné **Contents: Read and write**.
4. Generá la clave y copiala. **GitHub te la muestra una sola vez.**
5. En el panel, apretá **Sign In Using Access Token** y pegala.

La clave queda guardada en ese navegador: se pega una vez por dispositivo, no
cada vez que se entra.

Cuando la generes, fijate la fecha de vencimiento. Si ponés un año, dentro de
un año hay que repetir estos pasos.

### Con el botón "Sign In with GitHub"

Ese botón necesita un intermediario de login. Hoy no está montado. Si algún día
molesta pegar la clave, se puede levantar uno gratis en Cloudflare Workers y el
botón empieza a funcionar sin cambiar nada más del sitio.

---

## Cómo se usa

Entrás al panel, iniciás sesión y ves una lista a la izquierda:

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

Se suben desde el mismo panel, **también desde el celular** — Sveltia funciona
bien en pantalla chica. No hace falta recortarlas ni prepararlas: el sitio las
acomoda solo. En los padrillos el caballo se muestra entero y lo que sobra a
los costados se rellena con la misma foto desenfocada, así nunca queda cortado.

### Para ordenar

Las listas se arrastran. En la galería, la primera foto es la que se muestra
al doble de tamaño; en Novedades conviene dejar la más nueva arriba.

---

## Para que edite otra persona

Quien vaya a editar necesita:

1. Una cuenta de GitHub (gratis).
2. Ser colaborador del repositorio: en GitHub, **Settings → Collaborators →
   Add people**, con permiso **Write**.
3. Generar su propia clave de acceso siguiendo los pasos de arriba.

---

## Cosas que conviene saber

**Si algo sale mal, no se pierde nada.** Cada cambio queda guardado en GitHub
con su fecha y autor. Siempre se puede volver a una versión anterior.

**El panel no puede romper el sitio con un error de tipeo.** Antes, una coma de
más en el archivo de datos dejaba la página en blanco. Ahora el panel usa
formularios, así que eso ya no puede pasar.

**Si la cinta se deja vacía, desaparece** del sitio en vez de mostrarse en
blanco. Lo mismo con las secciones que quedan sin ítems.

**El panel no aparece en Google:** lleva una etiqueta que se lo impide.

**El repositorio es público.** Es lo normal para un sitio estático y no expone
nada que no esté ya en la web, pero conviene tenerlo presente por el tema de
los derechos de las fotos.

---

## Si preferís no usar el panel

El sitio funciona igual sin él. Los archivos de `content/` se pueden editar a
mano y subir a GitHub, y Pages republica solo. El panel solo agrega comodidad.

---

## Un dominio propio

La dirección `josepepe16.github.io/HARASALGALOPE` es gratis pero arrastra el
nombre del repositorio. Para que quede `harasalgalope.com` hay que comprar el
dominio (en Uruguay, `.com.uy` se gestiona en <https://nic.com.uy>) y apuntarlo
a GitHub Pages desde **Settings → Pages → Custom domain**. El certificado de
seguridad lo pone GitHub solo, gratis.

Las rutas del sitio son relativas justamente por esto: el día que se conecte un
dominio propio, no hay que tocar nada.
