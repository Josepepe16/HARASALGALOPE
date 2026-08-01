/* ==========================================================================
   HARAS AL GALOPE — carga del contenido
   --------------------------------------------------------------------------
   Lee los archivos de content/ (los que edita el panel en /admin) y los deja
   en el formato que espera main.js. Es el puente entre el panel y el sitio.

   No hace falta tocar este archivo para cambiar contenido.
   ========================================================================== */
(function () {
  'use strict';

  var ARCHIVOS = ['sitio', 'remate', 'cinta', 'padrillos', 'caballos',
                  'servicios', 'novedades', 'galeria', 'reproduccion'];

  // El panel guarda las listas como objetos ({texto: '...'}) porque así puede
  // mostrar un formulario por fila. Acá se vuelven a texto plano.
  function planas(lista, campo) {
    return (lista || []).map(function (x) {
      return x && typeof x === 'object' ? (x[campo] || '') : x;
    }).filter(Boolean);
  }

  function acomodar(c) {
    var sitio = c.sitio || {};

    window.SITE = {
      nombre: sitio.nombre,
      lema: sitio.lema,
      ubicacion: sitio.ubicacion,
      direccion: sitio.direccion,
      desde: sitio.desde,
      contactos: sitio.contactos || [],
      email: sitio.email || '',
      redes: sitio.redes || {},
      mapa: sitio.mapa || {},
      logo: sitio.logo,
      fotoPortada: sitio.fotoPortada,
      fotoHaras: sitio.fotoHaras,
      fotoHarasPos: sitio.fotoHarasPos
    };

    var r = c.remate || {};
    window.REMATE = Object.assign({}, r, {
      transmite: planas(r.transmite, 'nombre'),
      invitados: planas(r.invitados, 'nombre'),
      condiciones: planas(r.condiciones, 'texto')
    });

    var cn = c.cinta || {};
    window.CINTA = planas(cn.mensajes, 'texto');
    window.CINTA_COLOR = cn.color || '';

    window.PADRILLOS = ((c.padrillos || {}).items || []).map(function (p, i) {
      return {
        id: 'p' + i,
        foto: p.foto || '',
        nombre: p.nombre,
        indice: p.indice,
        titular: p.titular,
        etiqueta: p.etiqueta,
        destacado: p.destacado,
        padre: p.padre,
        madre: p.madre,
        resumen: p.resumen,
        // la ficha vuelve a ser pares [dato, valor]
        ficha: (p.ficha || []).map(function (f) { return [f.dato, f.valor]; }),
        hijos: planas(p.hijos, 'nombre')
      };
    });

    window.CABALLOS = ((c.caballos || {}).items || []).map(function (h) {
      return {
        nombre: h.nombre,
        cat: h.categoria,
        sexo: h.sexo,
        anio: h.anio,
        padre: h.padre,
        madre: h.madre,
        titulo: h.titulo,
        logros: planas(h.logros, 'texto')
      };
    });

    window.SERVICIOS = ((c.servicios || {}).items || []).map(function (s) {
      return { icono: s.icono, titulo: s.titulo, texto: s.texto,
               detalles: planas(s.detalles, 'texto') };
    });

    window.NOVEDADES = ((c.novedades || {}).items || []);

    var rp = c.reproduccion || {};
    window.REPRO = {
      activa: rp.activa !== false,
      eyebrow: rp.eyebrow,
      titulo: rp.titulo,
      tituloItalica: rp.tituloItalica,
      responsable: rp.responsable,
      rol: rp.rol,
      intro: rp.intro,
      cifra: rp.cifra,
      cifraTexto: rp.cifraTexto,
      tituloProcedimientos: rp.tituloProcedimientos,
      tituloRecursos: rp.tituloRecursos,
      procedimientos: planas(rp.procedimientos, 'texto'),
      recursos: (rp.recursos || []),
      fotoResponsable: rp.fotoResponsable,
      fotoResponsablePos: rp.fotoResponsablePos,
      fotos: (rp.fotos || []),
      contacto: rp.contacto || {}
    };

    var g = c.galeria || {};
    window.GALERIA_VISIBLES = g.visibles || 7;
    window.GALERIA = (g.items || []).map(function (f) {
      return { src: f.foto, alt: f.alt, pos: f.pos || '' };
    });
  }

  function fallo(e) {
    console.error('No se pudo cargar el contenido del sitio.', e);
    var aviso = document.createElement('p');
    aviso.style.cssText = 'padding:6rem 1.5rem;text-align:center;font-family:sans-serif';
    aviso.textContent = 'No se pudo cargar el contenido. Recargá la página en un momento.';
    document.getElementById('main').appendChild(aviso);
  }

  // En el archivo único el contenido viaja adentro; en el sitio se busca.
  if (window.CONTENIDO) {
    try { acomodar(window.CONTENIDO); window.iniciarSitio(); }
    catch (e) { fallo(e); }
    return;
  }

  Promise.all(ARCHIVOS.map(function (n) {
    return fetch('content/' + n + '.json?v=' + Date.now())
      .then(function (res) {
        if (!res.ok) throw new Error(n + '.json → ' + res.status);
        return res.json();
      });
  }))
    .then(function (partes) {
      var c = {};
      ARCHIVOS.forEach(function (n, i) { c[n] = partes[i]; });
      acomodar(c);
      window.iniciarSitio();
    })
    .catch(fallo);
})();
