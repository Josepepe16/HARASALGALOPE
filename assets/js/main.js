/* ==========================================================================
   HARAS AL GALOPE — render

   Dibuja el catálogo con el contenido que carga contenido.js. No hace falta
   tocar este archivo para actualizar textos ni fotos: eso se hace desde el
   panel (/admin) o editando los archivos de content/.

   DOS REGLAS QUE ATRAVIESAN TODO EL ARCHIVO:

   1. Celda sin dato = celda VACÍA. Nunca un guion, nunca "—", nunca
      "a confirmar". Es la convención del programa del hipódromo, y además
      convierte el agujero de datos en información honesta: 3 de los 6
      padrillos no tienen índice registrado y eso se ve.

   2. Cada sección se construye DISTINTO. No hay un componente de tarjeta ni
      un encabezado reutilizable. Si aparece la tentación de factorizar dos
      secciones en una función común, es justamente lo que hay que evitar:
      la repetición estructural es lo que hace que un sitio se lea como
      plantilla.
   ========================================================================== */
window.iniciarSitio = function () {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (m) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  const hay = (v) => v != null && String(v).trim() !== '';

  /* Cada mensaje de WhatsApp termina con un código entre corchetes que dice
     de dónde salió. Es la única atribución gratis que ningún bloqueador puede
     romper: viaja adentro del propio mensaje. */
  const ACENTOS = new RegExp('[\\u0300-\\u036f]', 'g');
  const codigo = (t) => '[WEB-' + String(t || 'SITIO')
    .toUpperCase().normalize('NFD').replace(ACENTOS, '')
    .replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 28) + ']';

  const wa = (msg, origen, intl) => {
    const n = intl || (SITE.contactos[0] || {}).intl;
    return 'https://wa.me/' + n + '?text=' + encodeURIComponent(msg + '\n\n' + codigo(origen));
  };


  /* ═══ 1 · TAPA ═══════════════════════════════════════════════════════ */
  (function tapa() {
    $('#membreteSitio').textContent = SITE.ubicacion || '';
    $('#tapaLema').textContent = SITE.lema || '';

    const f = $('#tapaFoto');
    if (SITE.fotoPortada) { f.src = SITE.fotoPortada; f.alt = 'Caballos del Haras Al Galope'; }
    else f.remove();

    if (SITE.logo) $$('.membrete__logo').forEach((i) => { i.src = SITE.logo; });

    // Una sola cadena de condiciones, como el pie de la tapa de un catálogo.
    const R = REMATE || {};
    const partes = [R.titulo, R.modalidad, R.fechaTexto, R.hora, R.lugar].filter(hay);
    $('#tapaCondiciones').innerHTML = partes.map((p, i) =>
      i === 0 ? '<b>' + esc(p) + '</b>' : esc(p)).join(' · ');
  })();


  /* ═══ 2 · ÍNDICE ═════════════════════════════════════════════════════
     Es toda la navegación del sitio: no hay barra fija ni hamburguesa.
     Y es el ÚNICO lugar donde viven los números de recuento — que es donde
     un catálogo los pone. */
  (function indice() {
    const R = REMATE || {}, P = REPRO || {};
    const filas = [
      ['Padrillos',      '#padrillos',     PADRILLOS.length],
      ['El haras',       '#haras',         null],
      ['Palmarés',       '#caballos',      CABALLOS.length],
      ['Reproducción',   '#reproduccion',  (P.procedimientos || []).length],
      ['Servicios',      '#servicios',     SERVICIOS.length],
      ['El remate',      '#remate',        (R.condiciones || []).length],
      ['Novedades',      '#novedades',     NOVEDADES.length],
      ['Galería',        '#galeria',       GALERIA.length],
      ['Contacto',       '#contacto',      null],
    ].filter((f) => f[2] === null || f[2] > 0);

    $('#indiceLista').innerHTML = filas.map(([n, href, c]) => `
      <li><a href="${href}">
        <span>${esc(n)}</span><span class="cond"></span>
        ${c === null ? '' : `<span class="indice__n">${c}</span>`}
      </a></li>`).join('');
  })();


  /* ═══ 3 · LOGROS ═════════════════════════════════════════════════════
     Un párrafo justificado. Los números viven adentro de la oración, no en
     una franja de cifras grandes con rótulo chiquito. */
  (function logros() {
    const R = REMATE || {}, P = REPRO || {};
    const nRemate = (R.titulo || '').match(/\d+/);
    const campeones = CABALLOS.filter((c) => hay(c.titulo)).slice(0, 2);

    let t = `<b>${esc(SITE.nombre)}.</b> ${esc(SITE.ubicacion)}. `;
    if (nRemate) t += `${esc(nRemate[0])} remates anuales`;
    if (SITE.desde) t += ` desde ${esc(SITE.desde)}`;
    t += `, ${PADRILLOS.length} padrillos en servicio`;
    if (hay(P.cifra)) t += ` y ${esc(P.cifra)} ${esc(P.cifraTexto || 'yeguas por temporada')} en el centro reproductivo`;
    t += '. ';
    campeones.forEach((c) => { t += `<b>${esc(c.nombre)}</b>, ${esc(c.titulo)}. `; });

    $('#logrosTexto').innerHTML = t.trim();
  })();


  /* ═══ 4 · LA VARA ════════════════════════════════════════════════════
     La tabla de índice de velocidad convertida en vara de medir, con el
     hierro del haras quemado sobre el índice de los padrillos.

     Los piques se dibujan como <span> reales, uno por punto de índice: con
     un gradiente repetido quedaría más corto de escribir, pero el gradiente
     es justamente uno de los tics que hay que evitar, y además así cada
     pique es un elemento inspeccionable.

     No se anima nada. Está impreso. */
  (function laVara() {
    const MIN = 80, MAX = 120;
    const num = (s) => { const m = String(s || '').match(/(\d+(?:[.,]\d+)?)/); return m ? parseFloat(m[1].replace(',', '.')) : null; };

    const con = PADRILLOS.map((p) => ({ nombre: p.nombre, iv: num(p.indice) })).filter((p) => p.iv);
    const sin = PADRILLOS.filter((p) => !num(p.indice)).map((p) => p.nombre);
    const caja = $('#varaCaja');

    if (!con.length) { $('#vara').hidden = true; return; }

    const pos = (iv) => ((iv - MIN) / (MAX - MIN)) * 100;
    let h = '<div class="vara__base"></div><div class="vara__patron"></div>';

    for (let iv = MIN; iv <= MAX; iv++) {
      const largo = iv % 5 === 0;
      h += `<span class="vara__pique${largo ? ' vara__pique--largo' : ''}" style="left:${pos(iv)}%"></span>`;
      if (iv % 10 === 0) h += `<span class="vara__rot" style="left:${pos(iv)}%">${iv}</span>`;
    }

    // Las bandas de mérito de la tabla original.
    [['AA', 80, 89], ['AAA', 90, 99], ['AAAT', 100, 120]].forEach(([et, a, b]) => {
      h += `<span class="vara__banda" style="left:${pos(a)}%;width:${pos(b) - pos(a)}%"><span>${et}</span></span>`;
    });

    // Los padrillos que comparten índice se apilan sobre el mismo punto: que
    // los tres den 104 no es un defecto del gráfico, es el dato.
    const grupos = {};
    con.forEach((p) => { (grupos[p.iv] = grupos[p.iv] || []).push(p.nombre); });

    Object.keys(grupos).forEach((iv) => {
      const x = pos(parseFloat(iv));
      h += `<span class="vara__cifra" style="left:${x}%">
              <b>${esc(iv)}</b><span>AAAT</span>
            </span>
            <span class="vara__hierros" style="left:${x}%">
              ${grupos[iv].map((n) => `
                <a class="vara__hierro" href="#padrillos">
                  <svg aria-hidden="true"><use href="#h-haras"/></svg>
                  <span>${esc(n)}</span>
                </a>`).join('')}
            </span>`;
    });

    caja.innerHTML = h;

    $('#varaSin').textContent = sin.length
      ? 'Sin índice registrado: ' + sin.join(' · ')
      : '';

    /* La línea de cierre.

       ACÁ NO SE INVENTAN NÚMEROS. La tentación es traducir el índice a
       segundos y metros ("índice 104 = tantas centésimas = un cuerpo"), pero
       la equivalencia depende de la tabla oficial de la asociación y de la
       distancia, y no la tenemos a mano. Un número de rendimiento inventado
       en el sitio de un haras que vende genética es un problema serio, no un
       detalle de redacción.

       Lo que se dice acá sale sólo de los datos del panel: cuántos padrillos
       hay, qué índice tienen y qué categoría les corresponde. Si el haras
       pasa la tabla oficial, se agrega la línea de equivalencia. */
    const mejor = Math.max(...con.map((p) => p.iv));
    const cat = mejor >= 100 ? 'AAAT' : mejor >= 90 ? 'AAA' : 'AA';
    const cuantos = con.filter((p) => p.iv === mejor).length;
    $('#varaVende').innerHTML =
      `${cuantos === 1 ? 'Un padrillo del haras alcanza' : `${cuantos} padrillos del haras alcanzan`} ` +
      `índice <b>${mejor}</b>, categoría <b>${cat}</b>. ` +
      `El patrón de la escala es 100.` +
      `<small>Índice de velocidad sobre la escala de 80 a 120.</small>`;
  })();


  /* ═══ 5 · PADRILLOS ══════════════════════════════════════════════════
     Filas regladas con conductor. Al tocar se abre la página de lote.
     Los tres sin índice dejan la celda vacía. */
  (function padrillos() {
    $('#padrillosLista').innerHTML = PADRILLOS.map((p) => {
      // El pedigrí va en prosa de stud book: los datos para un árbol de tres
      // generaciones no existen (sólo un padrillo trae abuela).
      const sangre = [];
      if (hay(p.padre)) sangre.push(`<b>Padre:</b> ${esc(p.padre)}`);
      if (hay(p.madre)) sangre.push(`<b>Madre:</b> ${esc(p.madre)}`);
      (p.ficha || []).forEach(([d, v]) => {
        if (/abuel|linea|línea/i.test(d) && hay(v)) sangre.push(`<b>${esc(d)}:</b> ${esc(v)}`);
      });

      const resto = (p.ficha || []).filter(([d, v]) => hay(v) && !/abuel|linea|línea/i.test(d));

      return `
      <details class="lote">
        <summary>
          <span class="lote__n">${esc(p.nombre)}</span>
          ${hay(p.titular) ? `<span class="lote__t">${esc(p.titular)}</span>` : ''}
          <span class="cond"></span>
          ${hay(p.indice) ? `<span class="lote__i">${esc(p.indice)}</span>` : ''}
        </summary>

        <div class="lote__hoja">
          ${p.foto ? `<figure class="lote__foto" style="margin:0">
            <img src="${esc(p.foto)}" alt="${esc(p.nombre)}" loading="lazy" decoding="async" width="1200" height="900">
          </figure>` : '<div></div>'}

          <div>
            <h3>${esc(p.nombre)}</h3>
            ${hay(p.resumen) ? `<p class="lote__resumen">${esc(p.resumen)}</p>` : ''}
            ${sangre.length ? `<p class="sangre">${sangre.join(' — ')}</p>` : ''}

            ${resto.length ? `<dl class="ficha">${resto.map(([d, v]) => `
              <div><dt>${esc(d)}:</dt><span class="cond"></span><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}

            ${(p.hijos || []).length ? `<ul class="hijos">${p.hijos.map((x) =>
              `<li>${esc(x)}</li>`).join('')}</ul>` : ''}

            <a class="wapp" href="${wa('Hola, quiero consultar por el servicio de ' + p.nombre + '.', 'PAD-' + p.nombre)}"
               target="_blank" rel="noopener">
              <span>Consultar el servicio</span><span>WhatsApp →</span>
            </a>
          </div>
        </div>
      </details>`;
    }).join('');
  })();


  /* ═══ 6 · EL HARAS ═══════════════════════════════════════════════════ */
  (function elHaras() {
    const f = $('#harasFoto');
    if (SITE.fotoHaras) {
      f.src = SITE.fotoHaras;
      f.alt = 'El establecimiento del Haras Al Galope';
      if (SITE.fotoHarasPos) f.style.setProperty('--pos', SITE.fotoHarasPos);
    } else { f.closest('figure').remove(); }

    const p = SITE.contactos[0] || {};
    $('#harasTexto').innerHTML = `
      <p>Haras Al Galope cría y selecciona Cuarto de Milla de carrera en
         ${esc(SITE.ubicacion || '')}${SITE.desde ? `, desde ${esc(SITE.desde)}` : ''}.
         ${p.nombre ? `Al frente, <span class="vers">${esc(p.nombre)}</span>.` : ''}</p>
      <p>La cría apunta a la velocidad en distancia corta y a los tambores.
         Los productos del haras corren en Maroñas y se venden en el remate
         anual del establecimiento.</p>`;
  })();


  /* ═══ 7 · PALMARÉS ═══════════════════════════════════════════════════
     Carta Clásica: tabla de verdad, sin filetes internos ni zebra.
     Diez de dieciséis caballos no tienen año y siete no tienen madre: esas
     celdas quedan en blanco, y está bien que se vea. */
  (function palmares() {
    const cuerpo = $('#cartaCuerpo');
    const cats = [['todos', 'Todos'], ['carrera', 'Carrera'], ['tambores', 'Tambores'], ['madres', 'Madres']];

    const pintar = (cat) => {
      const lista = cat === 'todos' ? CABALLOS : CABALLOS.filter((c) => c.cat === cat);
      let ultimoAnio = null;
      cuerpo.innerHTML = lista.map((c) => {
        // Supresión de repetición: el año se escribe una vez por grupo.
        const anio = hay(c.anio) && c.anio !== ultimoAnio ? c.anio : '';
        if (hay(c.anio)) ultimoAnio = c.anio;
        const padres = [c.padre, c.madre].filter(hay).join(' × ');
        return `<tr data-cat="${esc(c.cat)}">
          <td>${esc(c.nombre)}</td>
          <td>${esc(c.sexo || '')}</td>
          <td class="num">${esc(anio)}</td>
          <td class="padres">${esc(padres)}</td>
          <td class="logro">${esc(c.titulo || '')}</td>
        </tr>`;
      }).join('');
    };

    $('#filtros').innerHTML = cats.map(([v, n]) => {
      const n2 = v === 'todos' ? CABALLOS.length : CABALLOS.filter((c) => c.cat === v).length;
      return n2 ? `<button type="button" data-cat="${v}" aria-pressed="${v === 'todos'}">${n} ${n2}</button>` : '';
    }).filter(Boolean).join(' · ');

    $('#filtros').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      $$('#filtros button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      pintar(b.dataset.cat);
    });

    pintar('todos');
  })();


  /* ═══ 8 · REPRODUCCIÓN ═══════════════════════════════════════════════ */
  (function reproduccion() {
    const sec = $('#reproduccion');
    const R = typeof REPRO === 'object' && REPRO ? REPRO : null;
    if (!sec || !R || R.activa === false || !(R.procedimientos || []).length) return;

    $('#reproRol').textContent = R.rol || '';
    $('#reproVet').textContent = R.responsable || '';

    // El campo eyebrow existe en el JSON y NO se renderiza a propósito: si se
    // renderizara, la volanta en mayúscula volvería a entrar por el panel.
    $('#reproIntro').innerHTML = esc(R.intro || '')
      + (hay(R.cifra) ? ` <b>${esc(R.cifra)} ${esc(R.cifraTexto || '')}</b>.` : '');

    if (R.fotoResponsable) {
      const rt = $('#reproRetrato');
      rt.innerHTML = `<img src="${esc(R.fotoResponsable)}" alt="${esc(R.responsable || '')}"
        loading="lazy" decoding="async" width="400" height="400"
        ${R.fotoResponsablePos ? `style="--pos:${esc(R.fotoResponsablePos)}"` : ''}>`;
      rt.hidden = false;
      rt.querySelector('img').addEventListener('error', () => { rt.hidden = true; }, { once: true });
    }

    $('#reproProcedimientos').innerHTML = (R.procedimientos || []).map((p) =>
      `<li><span>${esc(p)}</span><span class="cond"></span></li>`).join('');

    $('#reproRecursos').innerHTML = (R.recursos || []).map((r) =>
      `<div><dt>${esc(r.titulo)}</dt><dd>${esc(r.texto)}</dd></div>`).join('');

    const fotos = (R.fotos || []).filter((f) => f && f.foto);
    if (fotos.length) {
      const caja = $('#reproFotos');
      caja.innerHTML = fotos.map((f, i) => `
        <figure>
          <img src="${esc(f.foto)}" alt="${esc(f.alt || '')}" loading="lazy" decoding="async"
               width="1100" height="800" ${f.pos ? `style="--pos:${esc(f.pos)}"` : ''}>
          <figcaption>${i + 1} · ${esc(f.pie || f.alt || '')}</figcaption>
        </figure>`).join('');
      caja.hidden = false;
      // Borrar una foto de la biblioteca del panel no la saca de la ficha:
      // si el archivo ya no existe, se esconde sola en vez del cuadro roto.
      $$('figure', caja).forEach((fig) => {
        fig.querySelector('img').addEventListener('error', () => {
          fig.hidden = true;
          if (!$$('figure:not([hidden])', caja).length) caja.hidden = true;
        }, { once: true });
      });
    }

    const k = R.contacto || {};
    const intl = k.intl || (SITE.contactos[0] || {}).intl;
    if (intl) {
      $('#reproCta').innerHTML = `<a class="wapp" href="${wa(
        k.mensaje || 'Hola, quería consultar por el centro reproductivo.', 'REPRODUCCION', intl)}"
        target="_blank" rel="noopener">
        <span>${esc(k.textoBoton || 'Consultar por el centro')}</span><span>WhatsApp →</span></a>`;
    }

    sec.hidden = false;
  })();


  /* ═══ 9 · SERVICIOS ══════════════════════════════════════════════════
     Cuatro renglones. El texto del primero mide 165 caracteres y tiene seis
     detalles: en una celda cuadrada de grilla no entraba. */
  (function servicios() {
    const HIERRO = { stallion: 'h-padrillo', gavel: 'h-martillo', trophy: 'h-copa', clipboard: 'h-planilla' };
    $('#serviciosLista').innerHTML = SERVICIOS.map((s) => `
      <article class="serv">
        <div class="serv__t">
          <svg aria-hidden="true"><use href="#${HIERRO[s.icono] || 'h-planilla'}"/></svg>
          <h3>${esc(s.titulo)}</h3>
          <span class="cond"></span>
        </div>
        ${hay(s.texto) ? `<p>${esc(s.texto)}</p>` : ''}
        ${(s.detalles || []).length ? `<p class="serv__d">${s.detalles.map(esc).join(' · ')}</p>` : ''}
      </article>`).join('');
  })();


  /* ═══ 10 · EL REMATE ═════════════════════════════════════════════════ */
  (function remate() {
    const R = REMATE || {};
    const n = (R.titulo || '').match(/\d+/);
    $('#remateN').innerHTML = n ? `<b>${esc(n[0])}°</b>Remate` : `<b>—</b>Remate`;
    $('#remateHora').innerHTML = R.hora ? `<b>${esc(R.hora)}</b>Hora` : '';
    $('#remateTitulo').textContent = (R.subtitulo || R.titulo || '').toUpperCase();

    const d = new Date(R.fechaISO);
    if (!isNaN(d)) $('#remateDia').textContent = d.getDate();

    $('#remateCondiciones').innerHTML = (R.condiciones || []).map((c, i) =>
      `<tr><td>${i + 1}</td><td>${esc(c)}</td></tr>`).join('');

    if ((R.invitados || []).length)
      $('#remateInvitados').innerHTML = '<b>Invitados:</b> ' + R.invitados.map(esc).join(' · ');
    if ((R.transmite || []).length)
      $('#remateTransmite').innerHTML = '<b>Transmite:</b> ' + R.transmite.map(esc).join(' · ');

    const ir = $('#remateIr');
    if (hay(R.link)) { ir.href = R.link; ir.textContent = 'Ver el remate →'; }
    else ir.remove();

    // La cuenta regresiva repinta una vez por minuto, no por segundo: es una
    // fecha a semanas de distancia y los segundos sólo gastan batería.
    const cuenta = $('#remateCuenta');
    const tic = () => {
      const falta = d - Date.now();
      if (isNaN(d)) { cuenta.textContent = ''; return; }
      if (falta <= 0) { cuenta.innerHTML = '<b>El remate ya comenzó</b>'; return; }
      const dias = Math.floor(falta / 86400000);
      const hs = Math.floor((falta % 86400000) / 3600000);
      cuenta.innerHTML = dias > 0
        ? `faltan <b>${dias}</b> ${dias === 1 ? 'día' : 'días'}`
        : `faltan <b>${hs}</b> ${hs === 1 ? 'hora' : 'horas'}`;
    };
    tic();
    setInterval(tic, 60000);
  })();


  /* ═══ 11 · NOVEDADES ═════════════════════════════════════════════════
     El array del panel NO viene ordenado, así que se ordena acá. */
  (function novedades() {
    const hoy = Date.now();
    const lista = NOVEDADES.slice().sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
    const pasadas = lista.filter((n) => new Date(n.fecha) <= hoy);
    const ultima = pasadas.length ? pasadas[0] : null;

    const mes = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];
    let ultimoAnio = null;

    $('#novedadesLista').innerHTML = lista.map((n) => {
      const d = new Date(n.fecha + 'T12:00:00');
      const futura = d > hoy;
      let fecha = '';
      if (!isNaN(d)) {
        const a = d.getFullYear();
        fecha = `${d.getDate()} ${mes[d.getMonth()]}` + (a !== ultimoAnio ? ` ${a}` : '');
        ultimoAnio = a;
      }
      return `<article class="nov${n === ultima ? ' nov--ultima' : ''}">
        <div class="nov__col"><p class="nov__f">${futura ? 'Próximo · ' : ''}${esc(fecha)}</p></div>
        <div class="nov__cuerpo">
          <h3>${esc(n.titulo)}</h3>
          <p>${esc(n.texto)}</p>
          ${hay(n.link) ? `<p><a href="${esc(n.link)}" target="_blank" rel="noopener">${esc(n.linkTexto || 'Ver más')} →</a></p>` : ''}
          ${hay(n.etiqueta) ? `<p class="nov__e">${esc(n.etiqueta)}</p>` : ''}
        </div>
      </article>`;
    }).join('');
  })();


  /* ═══ 12 · GALERÍA ═══════════════════════════════════════════════════ */
  (function galeria() {
    const tira = $('#galeriaTira'), boton = $('#galeriaMas');
    const visibles = typeof GALERIA_VISIBLES === 'number' ? GALERIA_VISIBLES : GALERIA.length;

    const pintar = (n) => {
      tira.innerHTML = GALERIA.slice(0, n).map((f, i) => `
        <figure>
          <img src="${esc(f.src)}" alt="${esc(f.alt)}" loading="lazy" decoding="async"
               width="880" height="660" ${f.pos ? `style="--pos:${esc(f.pos)}"` : ''}>
          <figcaption><b>${i + 1}</b> · ${esc(f.alt)}</figcaption>
        </figure>`).join('');
    };

    pintar(visibles);
    if (GALERIA.length > visibles) {
      boton.hidden = false;
      boton.textContent = `Ver las ${GALERIA.length} fotos →`;
      boton.addEventListener('click', () => { pintar(GALERIA.length); boton.hidden = true; }, { once: true });
    }
  })();


  /* ═══ 13 · CONTACTO ══════════════════════════════════════════════════ */
  (function contacto() {
    $('#anclas').innerHTML = SITE.contactos.map((c) => `
      <a href="${wa('Hola ' + SITE.nombre + ', quería hacer una consulta.', 'CONTACTO', c.intl)}"
         target="_blank" rel="noopener"><b>${esc(c.nombre)}</b>&nbsp;· ${esc(c.tel)}</a>`).join('')
      + `<p>${esc(SITE.direccion || SITE.ubicacion || '')}</p>`;

    const m = SITE.mapa || {};
    const ir = $('#contactoMapa');
    if (m.lat && m.lng) ir.href = `https://www.google.com/maps/search/?api=1&query=${m.lat},${m.lng}`;
    else ir.remove();

    const redes = Object.entries(SITE.redes || {}).filter(([, v]) => hay(v));
    $('#contactoRedes').innerHTML = redes.length
      ? redes.map(([n, v]) => `<a href="${esc(v)}" target="_blank" rel="noopener">${n[0].toUpperCase() + n.slice(1)} →</a>`).join(' · ')
      : '';
  })();


  /* ═══ 14 · CINTA ═════════════════════════════════════════════════════
     El único movimiento del sitio. */
  (function cinta() {
    const banda = $('#cinta'), riel = $('#cintaRiel');
    if (!banda || typeof CINTA === 'undefined' || !CINTA.length) return;

    if (typeof CINTA_COLOR === 'string' && /^#[0-9a-f]{3,8}$/i.test(CINTA_COLOR))
      banda.style.setProperty('--verde', CINTA_COLOR);

    const lista = CINTA.map((t) => `<span class="cinta__m">${esc(t)}</span>`).join('');
    banda.hidden = false;

    const quieto = matchMedia('(prefers-reduced-motion: reduce)');
    let turnos = null;

    const armar = () => {
      clearInterval(turnos);
      if (quieto.matches) {
        // Sin movimiento: se muestran los mensajes concatenados y se turnan.
        riel.innerHTML = lista;
        const items = $$('.cinta__m', riel);
        if (items.length < 2) return;
        let i = 0;
        const mostrar = () => { items.forEach((el, n) => { el.hidden = n !== i; }); i = (i + 1) % items.length; };
        mostrar(); turnos = setInterval(mostrar, 5000);
        return;
      }
      riel.innerHTML = lista;
      const una = riel.scrollWidth;
      if (!una) return;
      // Se repite hasta cubrir el ancho de la pantalla: con dos mensajes cortos
      // el bucle dejaría un hueco vacío.
      const copias = Math.max(1, Math.ceil(innerWidth / una) + 1);
      const grupo = lista.repeat(copias);
      riel.innerHTML = grupo + grupo;
      const rec = riel.scrollWidth / 2;
      riel.style.setProperty('--rec', rec + 'px');
      riel.style.setProperty('--dur', Math.max(8, Math.round(rec / 95)) + 's');
    };

    armar();
    let t;
    addEventListener('resize', () => { clearTimeout(t); t = setTimeout(armar, 200); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(armar);
    quieto.addEventListener('change', armar);
  })();
};
