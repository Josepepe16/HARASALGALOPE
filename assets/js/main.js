/* ==========================================================================
   HARAS AL GALOPE — lógica del sitio
   Dibuja la página con el contenido que carga contenido.js. No hace falta
   tocar este archivo para actualizar textos ni fotos: eso se hace desde el
   panel (/admin) o editando los archivos de la carpeta content/.
   ========================================================================== */
window.iniciarSitio = function () {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (m) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const horse = '<svg aria-hidden="true"><use href="#i-shoe"/></svg>';

  /* Una ruta relativa metida en una variable CSS la resuelve el navegador
     contra la HOJA DE ESTILO que la usa, no contra la página. Como --foto se
     escribe acá pero se usa en style.css, quedaba assets/css/assets/img/...
     Pasarla a absoluta la vuelve inmune a quién la consuma. */
  const urlAbs = (u) => (u ? new URL(u, document.baseURI).href : '');


  /* ─────────────── Navegación ─────────────── */
  const nav = $('#nav'), burger = $('#burger'), links = $('#navLinks');

  const onScroll = () => nav.classList.toggle('stuck', window.scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  burger.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  links.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      links.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });


  /* ─────────────── Aparición al hacer scroll ───────────────
     A propósito NO se usa IntersectionObserver: el navegador lo throttlea
     cuando la pestaña no está en primer plano y el contenido puede quedar
     invisible para siempre. Con scroll + requestAnimationFrame eso no puede
     pasar: si el elemento está en pantalla, se muestra. */
  let pendientes = [];
  let barridoPedido = false;

  const enPantalla = (el) => {
    const r = el.getBoundingClientRect();
    return r.top < innerHeight - 40 && r.bottom > 0;
  };

  const contar = (b) => {
    const fin = +b.dataset.count;
    let n = 0;
    const paso = () => {
      n += Math.max(1, Math.ceil(fin / 24));
      if (n >= fin) { b.textContent = fin; return; }
      b.textContent = n;
      requestAnimationFrame(paso);
    };
    // Si el rAF se pausa a mitad, el número quedaría cortado. Esto lo asegura.
    setTimeout(() => { b.textContent = fin; }, 1500);
    paso();
  };

  const barrer = () => {
    barridoPedido = false;
    pendientes = pendientes.filter((el) => {
      if (!enPantalla(el)) return true;
      el.classList.add('in');
      el.querySelectorAll('[data-count]').forEach(contar);
      return false;
    });
  };

  // Throttle por tiempo, no por requestAnimationFrame: el rAF se pausa del
  // todo cuando la pestaña no está dibujando y el contenido quedaría oculto.
  let ultimoBarrido = 0;
  const pedirBarrido = () => {
    const ahora = Date.now();
    if (ahora - ultimoBarrido >= 100) { ultimoBarrido = ahora; barrer(); return; }
    if (barridoPedido) return;
    barridoPedido = true;
    setTimeout(() => { ultimoBarrido = Date.now(); barrer(); }, 100);
  };

  addEventListener('scroll', pedirBarrido, { passive: true });
  addEventListener('resize', pedirBarrido);

  const watch = (root = document) => {
    $$('.reveal', root).forEach((el, i) => {
      // Escalonado corto: con retardos largos la página se siente lenta.
      el.style.transitionDelay = (Math.min(i, 3) * 28) + 'ms';
      pendientes.push(el);
    });
    barrer();
    // Reintentos por si el alto cambia al terminar de cargar fuentes o fotos.
    setTimeout(barrer, 400);
    setTimeout(barrer, 1500);
  };


  /* ─────────────── Fotos reales con respaldo ───────────────
     Si existe el archivo indicado en data-photo lo usa; si no,
     queda el marco con la silueta. Así el sitio nunca se ve roto. */
  function loadPhotos(root = document) {
    $$('[data-photo]', root).forEach((box) => {
      const src = box.dataset.photo;
      if (!src) return;
      const img = new Image();
      img.onload = () => {
        img.alt = box.dataset.alt || '';
        // medidas explícitas: el navegador reserva el espacio y no salta el layout
        img.width = img.naturalWidth; img.height = img.naturalHeight;
        img.decoding = 'async';
        box.appendChild(img);
      };
      img.src = src;
    });
  }


  /* El tema que se eligió en el panel. Sólo cambia el acento; el azul del
     logo queda igual. Si viene un nombre que no existe, se ignora y queda
     el dorado, que es el que está escrito en el CSS. */
  (function tema() {
    const t = String(SITE.tema || '').toLowerCase();
    if (['verde', 'cobre', 'plata'].indexOf(t) >= 0) {
      document.documentElement.dataset.tema = t;
    } else {
      delete document.documentElement.dataset.tema;
    }
  })();


  /* ─────────────── Imágenes que manda el panel ───────────────
     Logo, foto de portada y foto de "El Haras". Si el panel no trae alguna,
     se deja lo que ya estaba en el HTML y no se rompe nada. */
  (function imagenesDelPanel() {
    if (SITE.logo) $$('.brand__logo, .foot__logo').forEach((i) => { i.src = SITE.logo; });
    if (SITE.fotoPortada) {
      const p = $('.hero__photo');
      if (p) p.style.backgroundImage = `url("${SITE.fotoPortada}")`;
    }
    if (SITE.fotoHaras) {
      const h = $('.photo--square');
      if (h) {
        h.dataset.photo = SITE.fotoHaras;
        // El marco es cuadrado: si la foto es vertical hay que decidir qué
        // parte se ve. Sin esto, una foto nueva puede quedar decapitada.
        if (SITE.fotoHarasPos) h.style.setProperty('--pos', SITE.fotoHarasPos);
      }
    }
  })();


  /* ─────────────── Cuenta regresiva ─────────────── */
  (function countdown() {
    const box = $('#countdown');
    const target = new Date(REMATE.fechaISO).getTime();
    if (isNaN(target)) return;

    const pad = (n) => String(n).padStart(2, '0');
    const cells = { d: $('#cdD'), h: $('#cdH'), m: $('#cdM'), s: $('#cdS') };

    const tick = () => {
      const left = target - Date.now();
      if (left <= 0) {
        box.innerHTML = '<p class="countdown__lbl">El remate ya comenzó</p>' +
          '<p style="margin:0;font-family:var(--serif);font-size:1.4rem">¡Seguilo en vivo!</p>';
        clearInterval(timer);
        return;
      }
      const s = Math.floor(left / 1000);
      cells.d.textContent = Math.floor(s / 86400);
      cells.h.textContent = pad(Math.floor(s / 3600) % 24);
      cells.m.textContent = pad(Math.floor(s / 60) % 60);
      cells.s.textContent = pad(s % 60);
    };

    box.hidden = false;
    tick();
    const timer = setInterval(tick, 1000);
  })();



  /* ─────────────── Padrillos ─────────────── */
  $('#padrillosGrid').innerHTML = PADRILLOS.map((p, i) => `
    <button class="pad${p.destacado ? ' pad--star' : ''}" data-pad="${i}" type="button">
      <span class="pad__img" data-photo="${esc(p.foto || '')}"
            ${p.foto ? `style="--foto:url('${esc(urlAbs(p.foto))}')"` : ''}>
        ${horse}
        ${p.destacado ? `<span class="pad__star">${esc(p.etiqueta || 'Destacado')}</span>` : ''}
      </span>
      <span class="pad__body">
        <span class="pad__name">${esc(p.nombre)}</span>
        <span class="pad__idx">${esc(p.indice || p.titular)}</span>
        <span class="pad__lead">${esc(p.resumen)}</span>
        ${p.padre ? `<span class="pad__ped"><b>${esc(p.padre)}</b> × ${esc(p.madre || '—')}</span>` : ''}
        <span class="pad__more">Ver ficha</span>
      </span>
    </button>`).join('');


  /* ─────────────── Modal de padrillo ─────────────── */
  const modal = $('#modal'), mbody = $('#modalBody');
  let lastFocus = null;

  function openPad(i) {
    const p = PADRILLOS[i];
    mbody.innerHTML = `
      <div class="mhead" data-photo="${esc(p.foto || '')}"
           ${p.foto ? `style="--foto:url('${esc(urlAbs(p.foto))}')"` : ''}>${horse}</div>
      <div class="mbody">
        <h3 id="modalTitle">${esc(p.nombre)}</h3>
        <p class="pad__idx">${esc(p.indice || p.titular || '')}</p>
        <p class="lead">${esc(p.resumen)}</p>
        <dl class="mtable">
          ${p.ficha.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
        </dl>
        ${p.hijos && p.hijos.length ? `
          <div class="mkids">
            <h4>Hijos destacados</h4>
            <ul>${p.hijos.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
          </div>` : ''}
        <a class="btn btn--gold btn--full" href="${waLink('Hola, quiero consultar por el servicio de ' + p.nombre + '.')}"
           target="_blank" rel="noopener">Consultar servicio por WhatsApp</a>
      </div>`;

    loadPhotos(mbody);
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('locked');
    $('.modal__x').focus();
  }

  function closePad() {
    modal.hidden = true;
    document.body.classList.remove('locked');
    if (lastFocus) lastFocus.focus();
  }

  /* Visor de la galería: reusa el mismo modal. */
  function openFoto(i) {
    const f = GALERIA[i];
    mbody.innerHTML = `
      <figure class="visor">
        <img src="${esc(f.src)}" alt="${esc(f.alt)}">
        <figcaption id="modalTitle">${esc(f.alt)}</figcaption>
      </figure>`;
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('locked');
    $('.modal__x').focus();
  }

  document.addEventListener('click', (e) => {
    const card = e.target.closest('[data-pad]');
    if (card) return openPad(+card.dataset.pad);
    const foto = e.target.closest('[data-foto]');
    if (foto) return openFoto(+foto.dataset.foto);
    if (e.target.closest('[data-close]')) closePad();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closePad();
  });


  /* ─────────────── Caballos + filtros ─────────────── */
  const LABEL = { carrera: 'Carrera', tambores: 'Tambores', madres: 'Madres' };

  $('#horsesGrid').innerHTML = CABALLOS.map((h) => {
    const ped = [
      h.padre ? `<b>${esc(h.padre)}</b>` : '',
      h.madre ? esc(h.madre) : ''
    ].filter(Boolean).join(' × ');

    return `
      <article class="horse" data-cat="${esc(h.cat)}">
        <div class="horse__top">
          <h3 class="horse__name">${esc(h.nombre)}</h3>
          <span class="horse__tag" data-c="${esc(h.cat)}">${esc(LABEL[h.cat] || h.cat)}</span>
        </div>
        ${h.titulo ? `<p class="horse__title">${esc(h.titulo)}</p>` : ''}
        <p class="horse__ped">
          ${[h.sexo, h.anio].filter(Boolean).join(' · ')}${ped ? '<br>' + ped : ''}
        </p>
        <ul class="horse__list">${h.logros.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
      </article>`;
  }).join('');

  $('#filters').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    $$('.chip').forEach((c) => {
      const on = c === chip;
      c.classList.toggle('is-on', on);
      c.setAttribute('aria-selected', String(on));
    });
    const cat = chip.dataset.cat;
    $$('.horse').forEach((card) => {
      card.classList.toggle('hide', cat !== 'todos' && card.dataset.cat !== cat);
    });
  });


  /* ─────────────── Cinta de novedades ───────────────
     Para que el bucle no tenga saltos, la lista se escribe DOS veces y el
     riel se desplaza exactamente la mitad: al terminar, la segunda copia
     está justo donde arrancó la primera. */
  (function cinta() {
    const banda = $('#cinta'), riel = $('#cintaRiel');
    if (!banda || typeof CINTA === 'undefined' || !CINTA.length) return;

    const lista = CINTA.map((t) =>
      `<span class="cinta__item">${esc(t)}</span>`).join('');
    banda.hidden = false;

    // El color lo elige el panel. Si no viene, queda el verde del afiche de
    // Favorito Verde, que es el que está puesto en el CSS.
    if (typeof CINTA_COLOR === 'string' && /^#[0-9a-f]{3,8}$/i.test(CINTA_COLOR)) {
      banda.style.setProperty('--verde', CINTA_COLOR);
    }

    // Si el sistema pide menos movimiento, no se desliza: se van turnando
    // los mensajes en el lugar. Así la cinta no queda muerta.
    const quieto = matchMedia('(prefers-reduced-motion: reduce)');
    let turnos = null;

    const modoQuieto = () => {
      riel.innerHTML = lista;
      const items = $$('.cinta__item', riel);
      let i = 0;
      const mostrar = () => {
        items.forEach((el, n) => el.classList.toggle('turno', n === i));
        i = (i + 1) % items.length;
      };
      mostrar();
      clearInterval(turnos);
      if (items.length > 1) turnos = setInterval(mostrar, 5000);
    };

    const armar = () => {
      if (quieto.matches) { modoQuieto(); return; }
      clearInterval(turnos);

      // Cuánto mide la lista una sola vez.
      riel.innerHTML = lista;
      const unaVuelta = riel.scrollWidth;
      if (!unaVuelta) return;

      // Con pocas noticias la lista puede ser más angosta que la pantalla, y
      // entonces el bucle deja un hueco vacío. Se repite hasta cubrirla.
      const copias = Math.max(1, Math.ceil(innerWidth / unaVuelta) + 1);
      const grupo = lista.repeat(copias);

      // El grupo va dos veces: al terminar de correr uno, el otro está
      // exactamente donde arrancó el primero. Por eso no se ve el salto.
      riel.innerHTML = grupo + grupo;
      const recorrido = riel.scrollWidth / 2;

      // 95 px por segundo: el paso de un zócalo de informativo. Más lento que
      // esto, en una pantalla de celular, parece que la cinta está quieta.
      riel.style.setProperty('--recorrido', recorrido + 'px');
      riel.style.setProperty('--duracion', Math.max(8, Math.round(recorrido / 95)) + 's');
    };

    armar();
    let t;
    addEventListener('resize', () => { clearTimeout(t); t = setTimeout(armar, 200); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(armar);
    // si el visitante cambia la preferencia sin recargar, la cinta se adapta
    quieto.addEventListener('change', armar);

    // Deja lugar para que la cinta no tape el final de la página.
    document.body.style.paddingBottom = banda.offsetHeight + 'px';
  })();


  /* ─────────────── Galería ───────────────
     Sólo se muestran las primeras (GALERIA_VISIBLES); el resto entra con el
     botón. Las ocultas igual se generan, así el botón no tiene que esperar a
     que carguen: aparecen de inmediato. */
  const VISIBLES = typeof GALERIA_VISIBLES === 'number' ? GALERIA_VISIBLES : GALERIA.length;

  $('#galeriaGrid').innerHTML = GALERIA.map((f, i) => `
    <button class="foto${i >= VISIBLES ? ' foto--oculta' : ''}" data-foto="${i}" type="button"
            aria-label="Ampliar: ${esc(f.alt)}">
      <img src="${esc(f.src)}" alt="${esc(f.alt)}" loading="lazy"
           width="880" height="880" decoding="async"
           style="object-position:${esc(f.pos || '50% 50%')}">
      <span class="foto__lupa" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4.2-4.2"/></svg></span>
    </button>`).join('');

  const ocultas = GALERIA.length - VISIBLES;
  const masBtn = $('#galeriaMas');
  if (ocultas > 0) {
    masBtn.hidden = false;
    masBtn.textContent = `Ver ${ocultas} fotos más`;
    masBtn.addEventListener('click', () => {
      $$('.foto--oculta').forEach((el) => el.classList.remove('foto--oculta'));
      masBtn.hidden = true;
      // el foco salta a la primera foto que acaba de aparecer, para no perderlo
      const primera = $$('.foto')[VISIBLES];
      if (primera) primera.focus({ preventScroll: true });
    });
  }


  /* ─────────────── Servicios ─────────────── */
  $('#servicesGrid').innerHTML = SERVICIOS.map((s) => `
    <article class="svc">
      <svg class="svc__ico" aria-hidden="true"><use href="#i-${esc(s.icono)}"/></svg>
      <h3>${esc(s.titulo)}</h3>
      <p>${esc(s.texto)}</p>
      ${s.detalles && s.detalles.length
        ? `<ul>${s.detalles.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}
    </article>`).join('');


  /* ─────────────── Remate ─────────────── */
  $('#aucTitle').textContent = REMATE.titulo;
  $('#aucSub').textContent = REMATE.subtitulo;
  $('#aucLink').href = REMATE.link;

  $('#aucFacts').innerHTML = [
    ['Fecha',     REMATE.fechaTexto],
    ['Hora',      REMATE.hora],
    ['Modalidad', REMATE.modalidad],
    ['Lugar',     REMATE.lugar],
    ['Rematador', REMATE.rematador],
    ['Transmite', REMATE.transmite.join(' · ')],
    ['Invitados', (REMATE.invitados || []).join(' · ')],
    ['Premios',   REMATE.premio]
  ].filter(([, v]) => v).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');

  $('#aucTerms').innerHTML = REMATE.condiciones.map((c) => `<li>${esc(c)}</li>`).join('');


  /* ─────────────── Novedades ─────────────── */
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];
  const fecha = (iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} ${MESES[m - 1]} ${y}`;
  };

  $('#newsGrid').innerHTML = NOVEDADES.map((n) => `
    <article class="new">
      <div class="new__meta">
        <span class="new__tag">${esc(n.etiqueta)}</span>
        <time class="new__date" datetime="${esc(n.fecha)}">${esc(fecha(n.fecha))}</time>
      </div>
      <h3>${esc(n.titulo)}</h3>
      <p>${esc(n.texto)}</p>
      ${n.link ? `<a href="${esc(n.link)}" target="_blank" rel="noopener">${esc(n.linkTexto || 'Ver más')} →</a>` : ''}
    </article>`).join('');


  /* ─────────────── Contacto ─────────────── */
  function waLink(msg) {
    const c = SITE.contactos[0];
    return `https://wa.me/${c.intl}?text=${encodeURIComponent(msg)}`;
  }

  $('#contactCards').innerHTML = SITE.contactos.map((c) => `
    <div class="card">
      <div>
        <p class="card__name">${esc(c.nombre)}</p>
        <span class="card__rol">${esc(c.rol)}</span>
      </div>
      <a class="card__tel" href="https://wa.me/${esc(c.intl)}" target="_blank" rel="noopener">
        ${esc(c.tel)}
      </a>
    </div>`).join('');

  /* ─────────────── Centro reproductivo ───────────────
     Si en el panel se apaga la sección, o no hay contenido, no se dibuja
     nada: la sección y su enlace del menú quedan ocultos. */
  (function reproduccion() {
    const sec = $('#reproduccion');
    if (!sec) return;
    const R = typeof REPRO === 'object' && REPRO ? REPRO : null;
    if (!R || R.activa === false || !(R.procedimientos || []).length) return;

    const poner = (id, txt) => { const e = $(id); if (e) e.textContent = txt || ''; };

    poner('#reproEyebrow', R.eyebrow);
    poner('#reproIntro', R.intro);
    poner('#reproRol', R.rol);
    poner('#reproVet', R.responsable);
    poner('#reproCifra', R.cifra);
    poner('#reproCifraTxt', R.cifraTexto);
    poner('#reproTitLista', R.tituloProcedimientos || 'Lo que hacemos');
    poner('#reproTitRecursos', R.tituloRecursos || 'Con qué contamos');

    $('#reproTitulo').innerHTML = R.tituloItalica
      ? `${esc(R.titulo)} <span class="ital">${esc(R.tituloItalica)}</span>`
      : esc(R.titulo || '');

    $('#reproProcedimientos').innerHTML = (R.procedimientos || [])
      .map((p) => `<li>${esc(p)}</li>`).join('');

    $('#reproRecursos').innerHTML = (R.recursos || []).map((r) => `
      <div>
        <dt>${esc(r.titulo)}</dt>
        <dd>${esc(r.texto)}</dd>
      </div>`).join('');

    /* Contacto propio del centro. Si todavía no se cargó un número para la
       veterinaria, la consulta va al teléfono del haras — pero con el mensaje
       ya escrito, así quien la recibe sabe que es por reproducción. */
    /* Borrar una foto de la biblioteca del panel NO la saca de acá: la ficha
       sigue apuntando a un archivo que ya no existe. En vez de mostrar el
       cuadrito roto, se esconde. */
    const siFalta = (img, quitar) => {
      img.addEventListener('error', () => { quitar.hidden = true; }, { once: true });
    };

    // Retrato de quien está a cargo, si se cargó uno en el panel
    if (R.fotoResponsable) {
      const rt = $('#reproRetrato');
      rt.innerHTML = `<img src="${esc(R.fotoResponsable)}" alt="${esc(R.responsable || '')}"
        loading="lazy" decoding="async" width="96" height="96"
        ${R.fotoResponsablePos ? `style="--pos:${esc(R.fotoResponsablePos)}"` : ''}>`;
      rt.hidden = false;
      siFalta(rt.querySelector('img'), rt);
    }

    // Las fotos del trabajo en el centro
    const fotos = (R.fotos || []).filter((f) => f && f.foto);
    if (fotos.length) {
      const caja = $('#reproFotos');
      caja.innerHTML = fotos.map((f) => `
        <figure>
          <img src="${esc(f.foto)}" alt="${esc(f.alt || '')}" loading="lazy" decoding="async"
               ${f.pos ? `style="--pos:${esc(f.pos)}"` : ''}>
          ${f.pie ? `<figcaption>${esc(f.pie)}</figcaption>` : ''}
        </figure>`).join('');
      caja.hidden = false;

      // Cada foto que no exista se esconde sola; si no queda ninguna, se
      // esconde la tira entera para no dejar un espacio vacío.
      $$('figure', caja).forEach((fig) => {
        const img = fig.querySelector('img');
        img.addEventListener('error', () => {
          fig.hidden = true;
          if (!$$('figure:not([hidden])', caja).length) caja.hidden = true;
        }, { once: true });
      });
    }

    const k = R.contacto || {};
    const intl = k.intl || (SITE.contactos[0] || {}).intl;
    if (intl) {
      const msg = k.mensaje || `Hola ${SITE.nombre}, quería consultar por el centro reproductivo.`;
      $('#reproCta').innerHTML = `
        <a class="btn btn--gold btn--full" href="https://wa.me/${esc(intl)}?text=${encodeURIComponent(msg)}"
           target="_blank" rel="noopener">${esc(k.textoBoton || 'Consultar por el centro')}</a>`;
    }

    sec.hidden = false;
    $$('[data-repro-nav]').forEach((a) => { a.hidden = false; });
  })();


  $('#placeTxt').textContent = SITE.direccion;

  /* El mapa se pide por recuadro (bbox), no por zoom, así que hay que
     traducirlo. Antes el recuadro estaba fijo en ±0.35°, unos 64 km de ancho:
     el campo "Zoom" del panel no hacía nada.

     En Mercator, a zoom Z el mundo mide 256·2^Z píxeles y abarca 360°. De ahí
     salen los grados por píxel; la latitud además se comprime con el coseno. */
  (function mapa() {
    const caja = $('#map');
    if (!caja || !SITE.mapa) return;

    const { lat, lng } = SITE.mapa;
    const z = Math.min(18, Math.max(5, SITE.mapa.zoom || 13));
    const ancho = Math.max(320, caja.clientWidth || 640);
    const alto = Math.max(220, caja.clientHeight || 420);
    const grados = 360 / (256 * Math.pow(2, z));

    const dLng = (ancho * grados) / 2;
    const dLat = (alto * grados * Math.cos((lat * Math.PI) / 180)) / 2;
    const bbox = [lng - dLng, lat - dLat, lng + dLng, lat + dLat].join(',');

    caja.innerHTML =
      `<iframe title="Ubicación de ${esc(SITE.nombre)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
        src="https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(lat + ',' + lng)}"></iframe>`;
  })();

  // WhatsApp flotante
  const wa = $('#waFloat');
  wa.href = waLink(`Hola ${SITE.nombre}, quería hacer una consulta.`);
  addEventListener('scroll', () => wa.classList.toggle('show', window.scrollY > 600), { passive: true });

  // Redes en el pie
  const ICON = {
    instagram: 'M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.9c-.1 3.2-1.6 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1s-3.6 0-4.9-.1c-3.3-.2-4.8-1.7-4.9-4.9-.1-1.3-.1-1.6-.1-4.9s0-3.6.1-4.9C2.3 3.9 3.8 2.4 7.1 2.3c1.3 0 1.7-.1 4.9-.1zm0 5.4a4.4 4.4 0 1 0 0 8.8 4.4 4.4 0 0 0 0-8.8zm0 7.2a2.9 2.9 0 1 1 0-5.8 2.9 2.9 0 0 1 0 5.8zm5.6-7.4a1 1 0 1 1-2 0 1 1 0 0 1 2 0z',
    facebook:  'M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z',
    youtube:   'M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.8-1.8C19.3 5 12 5 12 5s-7.3 0-8.8.5A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.8 1.8C4.7 19 12 19 12 19s7.3 0 8.8-.5a2.5 2.5 0 0 0 1.8-1.8C23 15.2 23 12 23 12zM9.8 15.2V8.8l6.1 3.2-6.1 3.2z'
  };
  $('#footSocial').innerHTML = Object.entries(SITE.redes)
    .filter(([, url]) => url)
    .map(([red, url]) => `
      <a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${esc(red)}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICON[red]}"/></svg>
      </a>`).join('');

  $('#year').textContent = new Date().getFullYear();


  /* ─────────────── Formulario → WhatsApp ─────────────── */
  $('#form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    let ok = true;

    ['nombre', 'medio'].forEach((n) => {
      const field = f.elements[n];
      const bad = !field.value.trim();
      field.classList.toggle('err', bad);
      if (bad) ok = false;
    });
    if (!ok) return f.elements.nombre.focus();

    const msg =
      `Hola ${SITE.nombre}!\n\n` +
      `Nombre: ${f.elements.nombre.value.trim()}\n` +
      `Contacto: ${f.elements.medio.value.trim()}\n` +
      `Consulta por: ${f.elements.tema.value}\n\n` +
      (f.elements.msg.value.trim() || '(sin mensaje)');

    window.open(waLink(msg), '_blank', 'noopener');
  });

  $('#form').addEventListener('input', (e) => e.target.classList.remove('err'));


  /* ─────────────── Arranque ─────────────── */
  watch();
  loadPhotos();
};
