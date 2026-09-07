/* ============================================================================
   app.js — estado, cálculo de deltas, render de la vista previa y del panel.
   Sin dependencias. Funciona abriendo index.html directamente (file://).
   ========================================================================== */
(function () {
  "use strict";

  var KEY = "reporte-performance-mensual/v1";

  /* ---- Formatos numéricos ---------------------------------------------- */
  var FORMATS = {
    money_uyu:   { d: 0, p: "$" },
    money_usd:   { d: 0, p: "US$" },
    money_uyu_2: { d: 2, p: "$" },
    money_usd_2: { d: 2, p: "US$" },
    int:         { d: 0 },
    num2:        { d: 2 },
    num_trim:    { d: 2, trim: true },
    roas_x1:     { d: 1, s: "x" }
  };
  var FORMAT_LABELS = {
    money_uyu: "$ pesos",
    money_usd: "US$ dólares",
    money_uyu_2: "$ pesos (2 dec.)",
    money_usd_2: "US$ dólares (2 dec.)",
    int: "Número entero",
    num2: "Número (2 dec.)",
    num_trim: "Número (dec. si hay)",
    roas_x1: "ROAS (0,0x)"
  };

  var ICONS = {
    bars: '<svg width="13" height="13" viewBox="0 0 24 24"><rect x="3" y="13" width="4" height="8" rx="1" fill="#f0a52b"/><rect x="10" y="8" width="4" height="13" rx="1" fill="#f0a52b"/><rect x="17" y="3" width="4" height="18" rx="1" fill="#f0a52b"/></svg>',
    meta: '<svg width="14" height="14" viewBox="0 0 24 24" fill="#0866ff"><path d="M6.5 6C3.6 6 1.6 8.5 1.6 12S3.6 18 6.5 18c2.5 0 4.2-1.9 5.5-3.9C13.3 16.1 15 18 17.5 18c2.9 0 4.9-2.5 4.9-6s-2-6-4.9-6c-2.5 0-4.2 1.9-5.5 3.9C10.7 7.9 9 6 6.5 6Zm0 2.3c1.4 0 2.6 1.5 3.6 3.1-1 1.6-2.2 3.3-3.6 3.3-1.6 0-2.6-1.4-2.6-3.7 0-2.3 1-3.7 2.6-3.7Zm11 0c1.6 0 2.6 1.4 2.6 3.7 0 2.3-1 3.7-2.6 3.7-1.4 0-2.6-1.7-3.6-3.3 1-1.6 2.2-3.1 3.6-3.1Z"/></svg>',
    google: '<svg width="13" height="13" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.2 13.3 17.6 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.4c-.5 2.9-2.1 5.3-4.6 6.9l7.1 5.5C43.9 37.5 46.1 31.6 46.1 24.6z"/><path fill="#FBBC05" d="M10.4 28.3c-.5-1.4-.8-2.9-.8-4.3s.3-3 .8-4.3l-7.8-6.1C1 16.6 0 20.2 0 24s1 7.4 2.6 10.4l7.8-6.1z"/><path fill="#EA4335" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2 1.3-4.6 2.1-8.8 2.1-6.4 0-11.8-3.8-13.6-9.3l-7.8 6.1C6.5 42.6 14.6 48 24 48z"/></svg>'
  };
  ICONS.gm = ICONS.meta + ICONS.google;

  var KPI_DEFS = [
    { key: "ingresosTotales",        icon: "bars", strip: false },
    { key: "ingresosGoogleMeta",     icon: "gm",   strip: false },
    { key: "compras",                icon: "bars", strip: false },
    { key: "comprasGoogleMeta",      icon: "gm",   strip: false },
    { key: "ticketPromedio",         icon: "bars", strip: true },
    { key: "inversionTotal",         icon: "bars", strip: true },
    { key: "ingresosSobreInversion", icon: "gm",   strip: true }
  ];

  /* ---- Utilidades ------------------------------------------------------ */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function clone(x) { return JSON.parse(JSON.stringify(x)); }

  function merge(def, src) {
    if (Array.isArray(def)) return Array.isArray(src) ? src : def;
    if (def && typeof def === "object") {
      var out = {}, keys = {};
      Object.keys(def).forEach(function (k) { keys[k] = 1; });
      if (src && typeof src === "object") Object.keys(src).forEach(function (k) { keys[k] = 1; });
      Object.keys(keys).forEach(function (k) { out[k] = merge(def[k], src ? src[k] : undefined); });
      return out;
    }
    return src === undefined ? def : src;
  }

  function getPath(obj, path) {
    var parts = path.split("."), o = obj;
    for (var i = 0; i < parts.length; i++) {
      if (o == null) return undefined;
      var k = parts[i];
      o = o[/^\d+$/.test(k) ? +k : k];
    }
    return o;
  }
  function setPath(obj, path, val) {
    var parts = path.split("."), o = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      var k = parts[i];
      o = o[/^\d+$/.test(k) ? +k : k];
    }
    var last = parts[parts.length - 1];
    o[/^\d+$/.test(last) ? +last : last] = val;
  }

  /* Parsea números pegados con separadores: "1.527.704", "71,05", "US$1.246". */
  function parseNum(v) {
    if (v == null) return NaN;
    var s = String(v).trim();
    if (!s) return NaN;
    s = s.replace(/\s/g, "").replace(/US\$/gi, "").replace(/\$/g, "").replace(/x/gi, "").replace(/%/g, "");
    var hasComma = s.indexOf(",") >= 0, hasDot = s.indexOf(".") >= 0;
    if (hasComma && hasDot) s = s.replace(/\./g, "").replace(",", ".");
    else if (hasComma) s = s.replace(",", ".");
    else if (hasDot) {
      var parts = s.split(".");
      if (parts.length > 2) s = s.replace(/\./g, "");
      else if (parts[1] && parts[1].length === 3) s = s.replace(/\./g, "");
    }
    var n = Number(s);
    return isFinite(n) ? n : NaN;
  }

  function fmtNum(value, opt) {
    opt = opt || {};
    if (!isFinite(value)) return "—";
    var d = opt.d || 0;
    var neg = value < 0;
    var str = Math.abs(value).toFixed(d);
    var intp = str, decp = "";
    var di = str.indexOf(".");
    if (di >= 0) { intp = str.slice(0, di); decp = str.slice(di + 1); }
    intp = intp.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    var body = decp ? intp + "," + decp : intp;
    if (opt.trim && body.indexOf(",") >= 0) body = body.replace(/0+$/, "").replace(/,$/, "");
    return (opt.p || "") + (neg ? "-" : "") + body + (opt.s || "");
  }

  function fmtValue(raw, fmtKey, display) {
    if (display != null && String(display).trim()) return String(display).trim();
    var n = parseNum(raw);
    if (isFinite(n)) return fmtNum(n, FORMATS[fmtKey] || {});
    return raw != null && String(raw).trim() ? String(raw).trim() : "—";
  }

  function computeDelta(actualStr, compStr, dir) {
    var a = parseNum(actualStr), c = parseNum(compStr);
    if (!isFinite(a) || !isFinite(c) || c === 0) return { show: false };
    var pct = Math.round((a - c) / Math.abs(c) * 100);
    if (pct === 0) return { show: true, arrow: "●", tone: "neutral", text: "0%" };
    var up = pct > 0, tone;
    if (dir === "neutral") tone = "neutral";
    else if ((up && dir === "up") || (!up && dir === "down")) tone = "pos";
    else tone = "neg";
    return { show: true, arrow: up ? "▲" : "▼", tone: tone, text: Math.abs(pct) + "%" };
  }
  function deltaHTML(d, suffix) {
    if (!d.show) return '<span class="delta delta--neutral">—</span>';
    return '<span class="delta delta--' + d.tone + '"><span class="delta__arrow">' + d.arrow + "</span>" +
      d.text + (suffix ? ' <em>' + esc(suffix) + "</em>" : "") + "</span>";
  }

  /* ---- Estado -------------------------------------------------------- */
  var state;
  try {
    var saved = localStorage.getItem(KEY);
    state = saved ? merge(DEFAULTS, JSON.parse(saved)) : clone(EXAMPLE);
  } catch (e) { state = clone(EXAMPLE); }

  var openSecs = { cabecera: 1, kpis: 1 };
  var rt, st;
  function scheduleRender() { clearTimeout(rt); rt = setTimeout(renderReport, 90); }
  function saveSoon() { clearTimeout(st); st = setTimeout(save, 250); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function refreshAll() { save(); buildEditor(); renderReport(); }

  /* ---- Render del reporte ------------------------------------------- */
  function logoHTML(kind) {
    var url = state.meta[kind === "agencia" ? "logoAgencia" : "logoCliente"];
    var cls = kind === "agencia" ? "r-logo--agencia" : "r-logo--cliente";
    if (url) return '<div class="r-logo ' + cls + '"><img src="' + esc(url) + '" alt=""></div>';
    var txt = kind === "agencia" ? "W" : (String(state.meta.cliente || "·").trim().charAt(0) || "·").toUpperCase();
    return '<div class="r-logo ' + cls + '">' + esc(txt) + "</div>";
  }

  function kpiCellHTML(def) {
    var k = state.kpis[def.key];
    var dm = computeDelta(k.actual, k.mesAnt, k.dir);
    var dy = computeDelta(k.actual, k.anioAnt, k.dir);
    return '<div class="kpi-label">' + ICONS[def.icon] + "<span>" + esc(k.label) + "</span></div>" +
      '<div class="kpi-value">' + esc(fmtValue(k.actual, k.fmt, k.display)) + "</div>" +
      '<div class="kpi-deltas">' + deltaHTML(dm, "mes") + deltaHTML(dy, "año") + "</div>";
  }

  function adsTableHTML(cfg, tkey) {
    var m = state.meta;
    var rows = state[tkey].filas.map(function (f) {
      var dm = computeDelta(f.actual, f.mesAnt, f.dir);
      var dy = computeDelta(f.actual, f.anioAnt, f.dir);
      return "<tr><td>" + esc(f.label) + "</td>" +
        '<td class="num">' + esc(fmtValue(f.actual, f.fmt, f.display)) + "</td>" +
        '<td class="num">' + esc(fmtValue(f.mesAnt, f.fmt, "")) + "</td>" +
        "<td>" + deltaHTML(dm) + "</td>" +
        '<td class="num">' + esc(fmtValue(f.anioAnt, f.fmt, "")) + "</td>" +
        "<td>" + deltaHTML(dy) + "</td></tr>";
    }).join("");
    return '<div class="r-card"><div class="r-card__head">' + ICONS[cfg.icon] +
      "<h3>" + esc(cfg.titulo) + " · " + esc(cfg.moneda) + "</h3>" +
      '<span class="r-card__aside">' + esc(cfg.canales) + "</span></div>" +
      '<table class="r-table"><thead><tr><th>CANAL / MÉTRICA</th><th>' + esc(m.colActual) +
      "</th><th>" + esc(m.colMes) + "</th><th>" + esc(m.colMesHead) + "</th><th>" + esc(m.colAnio) +
      "</th><th>" + esc(m.colAnioHead) + "</th></tr></thead><tbody>" + rows + "</tbody></table></div>";
  }

  function desgloseHTML() {
    var m = state.meta, body = "";
    state.desglose.grupos.forEach(function (grp) {
      body += '<tr class="r-group-row"><td colspan="6">' + esc(grp.titulo) + "</td></tr>";
      grp.filas.forEach(function (f) {
        var dm = computeDelta(f.actual, f.mesAnt, grp.dir);
        var dy = computeDelta(f.actual, f.anioAnt, grp.dir);
        body += "<tr><td>" + esc(f.label) + "</td>" +
          '<td class="num">' + esc(fmtValue(f.actual, grp.fmt, f.display)) + "</td>" +
          '<td class="num">' + esc(fmtValue(f.mesAnt, grp.fmt, "")) + "</td>" +
          "<td>" + deltaHTML(dm) + "</td>" +
          '<td class="num">' + esc(fmtValue(f.anioAnt, grp.fmt, "")) + "</td>" +
          "<td>" + deltaHTML(dy) + "</td></tr>";
      });
    });
    return '<div class="r-card"><div class="r-card__head">' + ICONS.google +
      "<h3>" + esc(m.desgloseTitulo) + "</h3></div>" +
      '<table class="r-table"><thead><tr><th>CAMPAÑA</th><th>' + esc(m.colActual) +
      "</th><th>" + esc(m.colMes) + "</th><th>" + esc(m.colMesHead) + "</th><th>" + esc(m.colAnio) +
      "</th><th>" + esc(m.colAnioHead) + "</th></tr></thead><tbody>" + body + "</tbody></table></div>";
  }

  function renderReport() {
    var m = state.meta;
    var head = '<div class="r-head"><div class="r-head__top"><div class="r-logos">' +
      logoHTML("agencia") + '<span class="r-logos__x">&times;</span>' + logoHTML("cliente") +
      '</div><div class="r-head__comp">' + esc(m.comparativo) + "</div></div>" +
      '<h1 class="r-title">' + esc(m.tituloReporte) + "</h1>" +
      '<div class="r-period">' + esc(m.periodo) + "</div>" +
      '<div class="r-subtitle">' + ICONS.gm + "<span>" + esc(m.subtitulo) + "</span></div></div>";

    var hero = '<div class="r-card"><div class="kpi-hero">' +
      KPI_DEFS.filter(function (d) { return !d.strip; })
        .map(function (d) { return '<div class="kpi-hero__cell">' + kpiCellHTML(d) + "</div>"; }).join("") +
      "</div></div>";

    var strip = '<div class="kpi-strip">' +
      KPI_DEFS.filter(function (d) { return d.strip; })
        .map(function (d) { return '<div class="kpi-strip__card">' + kpiCellHTML(d) + "</div>"; }).join("") +
      "</div>";

    var metaCfg = { icon: "meta", titulo: m.metaTitulo, moneda: m.metaMoneda, canales: m.metaCanales };
    var googleCfg = { icon: "google", titulo: m.googleTitulo, moneda: m.googleMoneda, canales: m.googleCanales };

    var lecturaLis = state.lectura.items.map(function (it) {
      return "<li>" + (it.lead ? "<strong>" + esc(it.lead) + "</strong> " : "") + esc(it.texto) + "</li>";
    }).join("");
    var lg = state.lectura.legend;
    var legend = '<div class="r-legend"><span><i class="pos"></i>' + esc(lg.pos) +
      '</span><span><i class="neg"></i>' + esc(lg.neg) +
      '</span><span><i class="neutral"></i>' + esc(lg.neutral) + "</span></div>";
    var lectura = state.lectura.items.length
      ? '<div class="r-card r-card--beige r-lectura"><div class="r-card__head"><h3>LECTURA DEL MES</h3></div><ul>' +
        lecturaLis + "</ul>" + legend + "</div>"
      : "";

    var b = state.benchmark;
    var benchRows = b.filas.map(function (f) {
      return '<tr><td class="b-label">' + esc(f.label) + '</td><td class="b-val">' + esc(f.valor) +
        '</td><td class="b-nota">' + esc(f.nota) + "</td></tr>";
    }).join("");
    var bench = (b.titulo || b.intro || b.filas.length || b.cierre)
      ? '<div class="r-card r-card--beige"><div class="r-card__head"><h3>' + esc(b.titulo) + "</h3></div>" +
        (b.intro ? '<p class="r-bench__intro">' + esc(b.intro) + "</p>" : "") +
        (b.filas.length ? '<table class="r-bench__table"><tbody>' + benchRows + "</tbody></table>" : "") +
        (b.cierre ? '<p class="r-bench__cierre">' + esc(b.cierre) + "</p>" : "") +
        (b.fuente ? '<p class="r-source">' + esc(b.fuente) + "</p>" : "") + "</div>"
      : "";

    var glos = state.glosario.items.length
      ? '<div class="r-card r-glosario"><div class="r-card__head"><h3>' + esc(state.glosario.titulo) +
        '</h3></div><div class="r-glosario__grid">' +
        state.glosario.items.map(function (g) {
          return '<div class="r-glos-item"><div class="g-term">' + esc(g.t) +
            '</div><div class="g-def">' + esc(g.d) + "</div></div>";
        }).join("") + "</div></div>"
      : "";

    var footer = state.footer ? '<div class="r-footer">' + esc(state.footer) + "</div>" : "";

    document.getElementById("report").innerHTML =
      head + hero + strip +
      adsTableHTML(metaCfg, "metaAds") + adsTableHTML(googleCfg, "googleAds") + desgloseHTML() +
      '<div class="r-page2">' + lectura + bench + glos + footer + "</div>";

    document.title = "Reporte" + (m.cliente ? " " + m.cliente : "") + (m.periodo ? " · " + m.periodo : "");
  }

  /* ---- Panel de edición -------------------------------------------- */
  function inp(path, value, ph, cls) {
    return '<input type="text"' + (cls ? ' class="' + cls + '"' : "") +
      ' data-path="' + path + '" value="' + esc(value == null ? "" : value) + '"' +
      (ph ? ' placeholder="' + esc(ph) + '"' : "") + ">";
  }
  function ta(path, value, ph) {
    return '<textarea data-path="' + path + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : "") + ">" +
      esc(value == null ? "" : value) + "</textarea>";
  }
  function fld(label, control) { return '<label class="f"><span>' + esc(label) + "</span>" + control + "</label>"; }
  function selOf(pairs, path, value) {
    return '<select data-path="' + path + '">' + pairs.map(function (p) {
      return '<option value="' + p[0] + '"' + (p[0] === value ? " selected" : "") + ">" + esc(p[1]) + "</option>";
    }).join("") + "</select>";
  }
  function fmtSelect(path, value) {
    return selOf(Object.keys(FORMAT_LABELS).map(function (k) { return [k, FORMAT_LABELS[k]]; }), path, value);
  }
  function dirSelect(path, value) {
    return selOf([["up", "Subir es bueno"], ["down", "Bajar es bueno"], ["neutral", "Sin veredicto"]], path, value);
  }
  function valGrid(base) {
    return '<div class="ed-grid3">' +
      fld("Este mes", inp(base + ".actual", getPath(state, base + ".actual"))) +
      fld("Mes anterior", inp(base + ".mesAnt", getPath(state, base + ".mesAnt"))) +
      fld("Año anterior", inp(base + ".anioAnt", getPath(state, base + ".anioAnt"))) + "</div>";
  }

  function logoField(kind) {
    var key = kind === "agencia" ? "logoAgencia" : "logoCliente";
    var url = state.meta[key];
    return '<div class="logo-row">' + (url ? '<img src="' + esc(url) + '" alt="">' : "") +
      '<div style="flex:1"><label class="f"><span>Logo ' + kind + (url ? "" : " (opcional)") +
      '</span><input type="file" accept="image/*" data-logo="' + key + '"></label>' +
      (url ? '<button type="button" class="ed-del" data-act="logo-clear" data-key="' + key + '">Quitar logo</button>' : "") +
      "</div></div>";
  }

  function cabeceraEditor() {
    var m = state.meta;
    return fld("Cliente", inp("meta.cliente", m.cliente)) +
      logoField("agencia") + logoField("cliente") +
      fld("Texto comparativo (arriba a la derecha)", inp("meta.comparativo", m.comparativo)) +
      fld("Título del reporte", inp("meta.tituloReporte", m.tituloReporte)) +
      fld("Período (título grande)", inp("meta.periodo", m.periodo)) +
      fld("Subtítulo (monedas / TC)", inp("meta.subtitulo", m.subtitulo)) +
      '<div class="ed-grid2">' +
      fld("Columna mes actual", inp("meta.colActual", m.colActual)) +
      fld("Columna mes anterior", inp("meta.colMes", m.colMes)) +
      fld("Encabezado “mes a mes”", inp("meta.colMesHead", m.colMesHead)) +
      fld("Columna año anterior", inp("meta.colAnio", m.colAnio)) +
      fld("Encabezado “año a año”", inp("meta.colAnioHead", m.colAnioHead)) +
      "</div>" +
      '<div class="ed-grid2">' +
      fld("Meta · título", inp("meta.metaTitulo", m.metaTitulo)) +
      fld("Meta · moneda", inp("meta.metaMoneda", m.metaMoneda)) + "</div>" +
      fld("Meta · canales", inp("meta.metaCanales", m.metaCanales)) +
      '<div class="ed-grid2">' +
      fld("Google · título", inp("meta.googleTitulo", m.googleTitulo)) +
      fld("Google · moneda", inp("meta.googleMoneda", m.googleMoneda)) + "</div>" +
      fld("Google · canales", inp("meta.googleCanales", m.googleCanales)) +
      fld("Desglose · título", inp("meta.desgloseTitulo", m.desgloseTitulo));
  }

  function kpisEditor() {
    return KPI_DEFS.map(function (def) {
      var k = state.kpis[def.key], base = "kpis." + def.key;
      return '<div class="ed-block">' + inp(base + ".label", k.label, "", "ed-title") + valGrid(base) +
        '<div class="ed-grid3">' +
        fld("Formato", fmtSelect(base + ".fmt", k.fmt)) +
        fld("Dirección", dirSelect(base + ".dir", k.dir)) +
        fld("Mostrar como", inp(base + ".display", k.display, "auto")) +
        "</div></div>";
    }).join("");
  }

  function tablaEditor(tkey) {
    var rows = state[tkey].filas.map(function (f, i) {
      var base = tkey + ".filas." + i;
      return '<div class="ed-block">' + inp(base + ".label", f.label, "", "ed-title") + valGrid(base) +
        '<div class="ed-grid3">' +
        fld("Formato", fmtSelect(base + ".fmt", f.fmt)) +
        fld("Dirección", dirSelect(base + ".dir", f.dir)) +
        fld("Mostrar como", inp(base + ".display", f.display, "auto")) +
        '</div><button type="button" class="ed-del" data-act="del-row" data-t="' + tkey +
        '" data-i="' + i + '">Quitar fila</button></div>';
    }).join("");
    return rows + '<button type="button" class="ed-add" data-act="add-row" data-t="' + tkey + '">+ Agregar fila</button>';
  }

  function desgloseEditor() {
    var groups = state.desglose.grupos.map(function (grp, gi) {
      var gbase = "desglose.grupos." + gi;
      var filas = grp.filas.map(function (f, fi) {
        var base = gbase + ".filas." + fi;
        return '<div class="ed-row">' + inp(base + ".label", f.label, "", "ed-title") + valGrid(base) +
          fld("Mostrar como (mes actual)", inp(base + ".display", f.display, "auto")) +
          '<button type="button" class="ed-del" data-act="del-dfila" data-g="' + gi + '" data-i="' + fi +
          '">Quitar campaña</button></div>';
      }).join("");
      return '<div class="ed-block">' + inp(gbase + ".titulo", grp.titulo, "", "ed-title") +
        '<div class="ed-grid2">' +
        fld("Formato", fmtSelect(gbase + ".fmt", grp.fmt)) +
        fld("Dirección", dirSelect(gbase + ".dir", grp.dir)) + "</div>" + filas +
        '<button type="button" class="ed-add" data-act="add-dfila" data-g="' + gi + '">+ Campaña</button> ' +
        '<button type="button" class="ed-del" data-act="del-grupo" data-g="' + gi + '">Quitar grupo</button></div>';
    }).join("");
    return groups + '<button type="button" class="ed-add" data-act="add-grupo">+ Agregar grupo</button>';
  }

  function lecturaEditor() {
    var items = state.lectura.items.map(function (it, i) {
      return '<div class="ed-row">' +
        fld("Título en negrita", inp("lectura.items." + i + ".lead", it.lead)) +
        fld("Texto", ta("lectura.items." + i + ".texto", it.texto)) +
        '<button type="button" class="ed-del" data-act="del-bullet" data-i="' + i + '">Quitar párrafo</button></div>';
    }).join("");
    var lg = state.lectura.legend;
    return items + '<button type="button" class="ed-add" data-act="add-bullet">+ Agregar párrafo</button>' +
      '<div class="ed-grid3" style="margin-top:8px">' +
      fld("Etiqueta favorable", inp("lectura.legend.pos", lg.pos)) +
      fld("Etiqueta desfavorable", inp("lectura.legend.neg", lg.neg)) +
      fld("Etiqueta referencia", inp("lectura.legend.neutral", lg.neutral)) + "</div>";
  }

  function benchmarkEditor() {
    var b = state.benchmark;
    var filas = b.filas.map(function (f, i) {
      var base = "benchmark.filas." + i;
      return '<div class="ed-row"><div class="ed-grid3">' +
        fld("Etiqueta", inp(base + ".label", f.label)) +
        fld("Valor", inp(base + ".valor", f.valor)) +
        fld("Nota", inp(base + ".nota", f.nota)) +
        '</div><button type="button" class="ed-del" data-act="del-bench" data-i="' + i + '">Quitar fila</button></div>';
    }).join("");
    return fld("Título", inp("benchmark.titulo", b.titulo)) +
      fld("Introducción", ta("benchmark.intro", b.intro)) + filas +
      '<button type="button" class="ed-add" data-act="add-bench">+ Agregar fila</button>' +
      fld("Cierre", ta("benchmark.cierre", b.cierre)) +
      fld("Fuente", ta("benchmark.fuente", b.fuente));
  }

  function glosarioEditor() {
    var items = state.glosario.items.map(function (g, i) {
      return '<div class="ed-row">' +
        fld("Término", inp("glosario.items." + i + ".t", g.t)) +
        fld("Definición", ta("glosario.items." + i + ".d", g.d)) +
        '<button type="button" class="ed-del" data-act="del-glos" data-i="' + i + '">Quitar término</button></div>';
    }).join("");
    return '<p class="ed-hint">Se imprime en la página 2, en dos columnas.</p>' + items +
      '<button type="button" class="ed-add" data-act="add-glos">+ Agregar término</button>';
  }

  function sec(id, title, inner) {
    return '<details class="sec" data-id="' + id + '"' + (openSecs[id] ? " open" : "") + "><summary>" +
      esc(title) + '</summary><div class="sec__inner">' + inner + "</div></details>";
  }

  function captureOpen() {
    var cur = document.querySelectorAll("#editorBody details.sec");
    if (!cur.length) return;
    openSecs = {};
    cur.forEach(function (d) { if (d.open) openSecs[d.getAttribute("data-id")] = 1; });
  }

  function buildEditor() {
    var body = document.getElementById("editorBody");
    var scroll = body.scrollTop;
    captureOpen();
    body.innerHTML =
      sec("cabecera", "Cabecera y textos", cabeceraEditor()) +
      sec("kpis", "KPIs principales", kpisEditor()) +
      sec("meta", "Tabla Meta Ads", tablaEditor("metaAds")) +
      sec("google", "Tabla Google Ads", tablaEditor("googleAds")) +
      sec("desglose", "Desglose por campaña", desgloseEditor()) +
      sec("lectura", "Lectura del mes", lecturaEditor()) +
      sec("benchmark", "Benchmark del rubro", benchmarkEditor()) +
      sec("glosario", "Glosario", glosarioEditor()) +
      sec("footer", "Pie de página",
        '<label class="f"><span>Texto del pie</span>' + ta("footer", state.footer) + "</label>");
    body.scrollTop = scroll;
  }

  /* ---- Eventos ----------------------------------------------------- */
  function onFieldEvent(e) {
    var t = e.target;
    if (t.dataset && t.dataset.path !== undefined) {
      setPath(state, t.dataset.path, t.value);
      scheduleRender();
      saveSoon();
    }
  }

  function onEditorChange(e) {
    var t = e.target;
    if (t.dataset && t.dataset.path !== undefined) { onFieldEvent(e); return; }
    if (t.dataset && t.dataset.logo) {
      var file = t.files && t.files[0];
      if (!file) return;
      var r = new FileReader();
      r.onload = function () { state.meta[t.dataset.logo] = r.result; refreshAll(); };
      r.readAsDataURL(file);
    }
  }

  var blankRow = function (tkey) {
    return { label: "Nueva métrica", actual: "", mesAnt: "", anioAnt: "",
      fmt: tkey === "googleAds" ? "money_usd" : "money_uyu", dir: "up", display: "" };
  };
  var blankDFila = function () { return { label: "Nueva campaña", actual: "", mesAnt: "", anioAnt: "", display: "" }; };

  function onEditorClick(e) {
    var t = e.target;
    var act = t.dataset ? t.dataset.act : null;
    if (!act) return;
    var g = +t.dataset.g, i = +t.dataset.i;
    if (act === "add-row") state[t.dataset.t].filas.push(blankRow(t.dataset.t));
    else if (act === "del-row") state[t.dataset.t].filas.splice(i, 1);
    else if (act === "add-grupo") state.desglose.grupos.push({ titulo: "NUEVO GRUPO", fmt: "num_trim", dir: "up", filas: [blankDFila()] });
    else if (act === "del-grupo") state.desglose.grupos.splice(g, 1);
    else if (act === "add-dfila") state.desglose.grupos[g].filas.push(blankDFila());
    else if (act === "del-dfila") state.desglose.grupos[g].filas.splice(i, 1);
    else if (act === "add-bullet") state.lectura.items.push({ lead: "", texto: "" });
    else if (act === "del-bullet") state.lectura.items.splice(i, 1);
    else if (act === "add-bench") state.benchmark.filas.push({ label: "", valor: "", nota: "" });
    else if (act === "del-bench") state.benchmark.filas.splice(i, 1);
    else if (act === "add-glos") state.glosario.items.push({ t: "", d: "" });
    else if (act === "del-glos") state.glosario.items.splice(i, 1);
    else if (act === "logo-clear") state.meta[t.dataset.key] = null;
    else return;
    refreshAll();
  }

  function slug(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "x";
  }
  function exportJSON() {
    var name = "reporte-" + slug(state.meta.cliente || "cliente") + "-" + slug(state.meta.periodo || "periodo") + ".json";
    var blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  function wire() {
    var body = document.getElementById("editorBody");
    body.addEventListener("input", onFieldEvent);
    body.addEventListener("change", onEditorChange);
    body.addEventListener("click", onEditorClick);

    document.querySelector(".toolbar").addEventListener("click", function (e) {
      var a = e.target.dataset.action;
      if (!a) return;
      if (a === "pdf") window.print();
      else if (a === "export") exportJSON();
      else if (a === "import") document.getElementById("fileImport").click();
      else if (a === "example") {
        if (confirm("¿Cargar los datos de ejemplo? Reemplaza lo que tengas cargado.")) { state = clone(EXAMPLE); refreshAll(); }
      } else if (a === "clear") {
        if (confirm("¿Vaciar todo y empezar de cero?")) { state = clone(DEFAULTS); refreshAll(); }
      }
    });

    document.getElementById("fileImport").addEventListener("change", function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var r = new FileReader();
      r.onload = function () {
        try { state = merge(DEFAULTS, JSON.parse(r.result)); refreshAll(); }
        catch (err) { alert("No pude leer el JSON: " + err.message); }
        e.target.value = "";
      };
      r.readAsText(file);
    });

    window.addEventListener("beforeprint", renderReport);
  }

  buildEditor();
  renderReport();
  wire();
})();
