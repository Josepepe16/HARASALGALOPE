# Haras Al Galope — sitio web

Sitio estático (HTML + CSS + JavaScript, sin dependencias ni compilación) con
un panel de administración propio para que el dueño edite todo sin tocar código.
Publicado gratis en GitHub Pages.

```
haras-al-galope/
├── index.html              La página. Casi nunca hay que tocarla.
├── PANEL.md                Cómo entrar y usar el panel. ← EMPEZÁ POR ACÁ
├── README.md               Esto.
├── content/                ← TODO EL CONTENIDO ESTÁ ACÁ (9 archivos)
├── admin/                  El panel de administración.
└── assets/
    ├── css/style.css       Diseño y colores.
    ├── js/main.js          Cómo se dibuja. No hace falta tocarlo.
    ├── js/contenido.js     Trae los archivos de content/ y arranca el sitio.
    └── img/                Fotos (ver assets/img/LEEME.txt).
```

---

## 1. Cómo actualizar el contenido

**Lo normal es hacerlo desde el panel**, en
<https://josepepe16.github.io/HARASALGALOPE/admin/>. Ver [PANEL.md](PANEL.md)
para saber cómo entrar.

Si preferís editar a mano, todo está en **`content/`**, en nueve archivos:

| Archivo | Qué tiene |
|---|---|
| `sitio.json` | Datos del haras, teléfonos, redes, mapa, fotos fijas |
| `remate.json` | El próximo remate y sus condiciones |
| `cinta.json` | Los mensajes de la franja verde de abajo |
| `padrillos.json` | Las fichas de los padrillos |
| `caballos.json` | El palmarés |
| `galeria.json` | Las fotos y cuántas se ven al entrar |
| `novedades.json` | Las tarjetas de Novedades |
| `reproduccion.json` | El centro reproductivo |
| `servicios.json` | Los cuatro servicios |

Son archivos JSON: respetá las **comillas**, las **comas** y las **llaves**.
Si algo se rompe, la página queda en blanco. Por eso conviene el panel: usa
formularios y ese error no puede pasar.

### Agregar un caballo al palmarés

En `content/caballos.json`, copiá un bloque entero y pegalo dentro de `items`:

```json
{
  "nombre": "Galope Nuevo",
  "categoria": "carrera",
  "sexo": "Macho",
  "anio": 2023,
  "padre": "Invictus Beduino",
  "madre": "Ypiocá Vista",
  "titulo": "Ganador Polla 2026",
  "logros": [
    { "texto": "Ganó su debut en Maroñas" },
    { "texto": "Récord de la distancia" }
  ]
}
```

`categoria` puede ser `carrera`, `tambores` o `madres`.

### Agregar una novedad

En `content/novedades.json`, poné el bloque nuevo **arriba de todo** (van
ordenadas de más nueva a más vieja):

```json
{
  "fecha": "2026-09-15",
  "etiqueta": "Carrera",
  "titulo": "Título de la noticia",
  "texto": "Dos o tres líneas contando qué pasó.",
  "link": "",
  "linkTexto": ""
}
```

### Cambiar el remate

En `content/remate.json`, lo importante es `fechaISO`, que maneja la cuenta
regresiva de la portada. Formato: `"2026-08-14T19:00:00-03:00"`
(año-mes-díaThora, y `-03:00` es la hora de Uruguay).

Cuando pasa la fecha, la cuenta regresiva se cambia sola por
"El remate ya comenzó".

---

## 2. Las fotos

**Los padrillos no necesitan preparación.** Cualquier foto sirve: se muestra
el caballo entero y lo que sobra a los costados se rellena con la misma foto
desenfocada. Nunca queda cortado.

**La galería y la foto de "El Haras" sí recortan**, porque llenan su marco.
Si alguna queda mal centrada no hace falta volver a recortarla en un editor:
alcanza con el campo **Encuadre**, que son dos porcentajes.

```
50% 50%   → el centro (por defecto)
70% 50%   → corre el encuadre a la derecha
50% 25%   → corre el encuadre hacia arriba
```

Regla práctica: si le corta la cabeza al caballo, bajá el segundo número.

Desde el panel es el campo "Encuadre". A mano, es `pos` en `galeria.json` y
`fotoHarasPos` en `sitio.json`.

---

## 3. Qué falta completar

- [ ] **Identificar los padrillos en las fotos.** Del archivo de Instagram
      solo pude ubicar con certeza a Favorito Verde. A Invictus Beduino,
      Calcol 36, Fuego Fling Fame, Jess Bikini JNN y Breeze Winner no los
      puedo reconocer: decime qué foto es cada uno y las cargo.
- [ ] Email propio del haras
- [ ] Facebook (Instagram ya está cargado)
- [ ] Fichas de los padrillos Fuego Fling Fame, Jess Bikini JNN y Breeze Winner
- [ ] La historia real del haras en la sección "El Haras" (`index.html`)
- [ ] Una foto mejor de Jess Bikini JNN — la que hay es de 547×365, se ve blanda
- [ ] **Confirmar los derechos de las fotos.** Varias tienen la marca de agua
      del fotógrafo (Facundo Gauna). Si van a quedar publicadas, conviene
      acordarlo con él o acreditarlo en el pie.

### Ya está cargado, sacado del Instagram y del catálogo del haras

- Logo oficial (versión blanca sobre transparente, en `assets/img/logo.png`)
- El lema: "Criamos para llegar primero"
- La paleta: azul marino #11256C, tomado del logo
- El verde de la cinta: #03571f, tomado del afiche de Favorito Verde
- La tipografía de los títulos, que es la del logo
- Ubicación: Libertad, San José · Instagram: @harasalgalope
- Fotos de portada, de El Haras, de los padrillos y de la galería
- Campeones 2026: Galope Callejero, Galope Gran Cañón, Galope Gran Estafa,
  Galope Suspiro 36
- La Polla va por su 6ª edición con U$S 10.000 en premios (no 7.500)

### Coordenadas del mapa

Ya están puestas: **-34.6085, -56.5179**, con zoom 13.

Salieron del enlace de Google Maps que pasó el cliente. Ojo con una cosa:
Google lo resuelve como *"Libertad, 80100 Departamento de San José"*, o sea
**el pueblo, no el establecimiento**. Si el haras queda en la campaña y se
quiere el punto exacto, hay que soltar el pin ahí y volver a copiar los
números — se cambian desde el panel, en "Datos del haras".

---

## 4. Dónde está publicado

El sitio vive en **GitHub Pages**, gratis y sin límites de despliegue:

```
https://josepepe16.github.io/HARASALGALOPE/
```

Se publica solo: cada cambio que llega al repositorio `Josepepe16/HARASALGALOPE`
en la rama `main` republica el sitio en menos de un minuto. No hay que subir
nada a mano.

Para un dominio propio (`harasalgalope.com`) hay que comprarlo — en Uruguay el
`.com.uy` se gestiona en <https://nic.com.uy> — y apuntarlo desde
**Settings → Pages → Custom domain**. El certificado lo pone GitHub, gratis.

**Las rutas del sitio son relativas a propósito.** Así funciona igual dentro de
un subdirectorio que en la raíz de un dominio propio, sin tocar una línea.

## 5. Probarlo en tu computadora

**Doble clic en `index.html` ya no alcanza**: el sitio ahora lee los archivos
de `content/`, y el navegador bloquea esa lectura cuando la página se abre
como archivo suelto. Abrí una terminal en esta carpeta y corré:

```bash
python -m http.server 8777
```

Después entrá a `http://localhost:8777`.

Para mandar por WhatsApp está la **vista previa**: un solo archivo con todo
adentro (fotos y tipografías incluidas) que sí se abre con doble clic.

---

## 6. De dónde salieron los datos

El contenido de arranque **no es inventado**: se tomó del catálogo oficial
del remate de Haras Al Galope y de la ficha del 7° Remate Anual publicada por
el escritorio Juan Francisco Chiruchi.

De ahí salen los padrillos, el palmarés (Galope Cuarteto, Galope Nolediosa,
Galope Juanra, los hijos de Calcol 36 en tambores), las condiciones de venta,
los teléfonos de contacto y la fecha del remate.

**Igual conviene que lo revise alguien del haras antes de publicar**, sobre
todo los teléfonos y los resultados deportivos, porque el catálogo que usé
como fuente es de una edición anterior y algún dato puede haber cambiado.
