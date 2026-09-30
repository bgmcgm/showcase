/* Erfahrung gesucht – statischer Prototyp (kein Server nötig).
   Zustand (Rolle, Interessen, neue Gesuche/Profile) liegt nur im Browser (localStorage). */
(function () {
  "use strict";
  var C = window.EG_CONFIG, D = window.EG_DATA;
  var T = C.texts, E = C.earnings;

  // ---------- Zustand ----------
  var KEY = "eg-state-v1", mem = null;
  function load() {
    try { var s = localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch (e) {}
    return mem || { who: "guest", anrede: C.app.defaultAnrede, interests: [], postings: [], seniors: [] };
  }
  var S = load();
  function save() { mem = S; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  var businesses = function () { return D.businesses; };
  var postings = function () { return D.postings.concat(S.postings); };
  var seniors = function () { return D.seniors.concat(S.seniors); };
  var interests = function () { return D.interests.concat(S.interests); };
  var byId = function (a, id) { return a.filter(function (x) { return x.id === id; })[0]; };

  function me() {
    var p = (S.who || "guest").split(":");
    if (p[0] === "business") { var b = byId(businesses(), p[1]); if (b) return { role: "business", id: b.id, name: b.name, anrede: C.app.defaultAnrede, rec: b }; }
    if (p[0] === "senior") { var s = byId(seniors(), p[1]); if (s) return { role: "senior", id: s.id, name: s.vorname, anrede: s.anrede, rec: s }; }
    return { role: "guest", anrede: S.anrede || C.app.defaultAnrede };
  }
  function tr(o) { return o[me().anrede] || o.sie; }
  function matchState(pid, sid, who) {
    var rows = interests().filter(function (i) { return i.postingId === pid && i.seniorId === sid; });
    var mine = rows.some(function (r) { return r.von === who; });
    var theirs = rows.some(function (r) { return r.von !== who; });
    return mine && theirs ? "match" : mine ? "mine" : theirs ? "theirs" : "none";
  }

  // ---------- Helfer ----------
  function h(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function csv(s) { return s ? s.split(",").map(function (x) { return x.trim(); }).filter(Boolean) : []; }
  function opts(obj, sel, first) {
    var o = first ? '<option value="">' + h(first) + "</option>" : "";
    Object.keys(obj).forEach(function (k) { o += '<option value="' + h(k) + '"' + (k === sel ? " selected" : "") + ">" + h(obj[k]) + "</option>"; });
    return o;
  }
  var tName = function (k) { return C.taetigkeiten[k] || k; };
  var zNames = function (s) { return csv(s).map(function (k) { return C.zeitraeume[k] || k; }); };
  var aName = function (k) { return C.anstellungsarten[k] || k; };
  function chips(list, cls) { return '<ul class="chips" aria-label="Merkmale">' + list.map(function (x, i) { return '<li class="chip ' + ((cls && cls[i]) || "") + '">' + h(x) + "</li>"; }).join("") + "</ul>"; }
  function uid() { return "n" + Math.random().toString(36).slice(2, 10); }

  function haversine(a, b) {
    var R = 6371, r = function (d) { return d * Math.PI / 180; };
    var dl = r(b[0] - a[0]), dn = r(b[1] - a[1]);
    var x = Math.sin(dl / 2) * Math.sin(dl / 2) + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dn / 2) * Math.sin(dn / 2);
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  // Verfremdung: Versatz bis ~700 m, Raster ~1 km. Die Eingabe wird nie gespeichert.
  function fuzz(lat, lng) {
    var a = Math.random() * 2 * Math.PI, d = 0.2 + Math.random() * 0.5;
    var la = lat + Math.sin(a) * d / 111, ln = lng + Math.cos(a) * d / (111 * Math.cos(lat * Math.PI / 180));
    return [Math.round(la / 0.009) * 0.009, Math.round(ln / 0.0135) * 0.0135];
  }
  var ortByName = function (n) { return C.region.orte.filter(function (o) { return o.name === n; })[0]; };
  var TAGMAP = { service: ["Gastronomie", "Verkauf"], kueche: ["Kochen", "Gastronomie"], kassa: ["Verkauf", "Buchhaltung", "Büro"], garten: ["Garten", "Landwirtschaft"], boten: ["Fahren (Führerschein B)"], sonstiges: [] };

  // ---------- Bausteine ----------
  function postingCard(p) {
    var b = byId(businesses(), p.businessId);
    return '<article class="card"><h3><a href="#/gesuche/' + p.id + '">' + h(tName(p.taetigkeit)) + " – " + h(b.name) + "</a></h3>" +
      '<p style="margin:0">' + h(b.ort) + " · " + p.stundenProWoche + " Std./Woche · " + h(p.tage) + "</p>" +
      chips([aName(p.anstellungsart)].concat(zNames(p.zeitraum)), ["acc"]) + "</article>";
  }
  function profileCard(s) {
    var e = s.erfahrung.length > 110 ? s.erfahrung.slice(0, 110) + "…" : s.erfahrung;
    var tg = csv(s.tags), zz = zNames(s.verfuegbarkeit);
    return '<article class="card"><h3><a href="#/profile/' + s.id + '">' + h(s.vorname) + "</a> · Raum " + h(s.ort) + (s.ortsteil ? ", " + h(s.ortsteil) : "") + "</h3>" +
      '<p style="margin:0">' + h(e) + "</p>" +
      chips(tg.concat(zz, ["Radius " + s.radiusKm + " km"]), tg.map(function () { return "acc"; })) + "</article>";
  }
  function statusBox(state, pid, sid, label, contact) {
    var id = "ib-" + pid + "-" + (sid || "x"), html = '<section class="card" aria-labelledby="' + id + '"><h3 id="' + id + '">' + h(label) + "</h3>";
    if (state === "match") {
      html += '<p class="notice ok"><strong>' + h(T.interest.match) + "</strong></p>";
      html += '<table class="kv"><tbody><tr><th>Name</th><td>' + h(contact.name) + '</td></tr><tr><th>E-Mail</th><td><a href="mailto:' + h(contact.email) + '">' + h(contact.email) + '</a></td></tr><tr><th>Telefon</th><td><a href="tel:' + h(contact.tel.replace(/\s/g, "")) + '">' + h(contact.tel) + "</a></td></tr></tbody></table>";
      html += '<p class="hint">Alles Weitere (Anstellung, Bedingungen) besprechen Sie direkt miteinander.</p>';
    } else {
      html += "<p>" + h(state === "theirs" ? "Die andere Seite hat bereits Interesse gezeigt. Zeigen Sie auch Interesse, um Kontaktdaten freizugeben." : T.interest.erklaerung) + "</p>";
      html += '<button class="btn big ' + (state === "mine" ? "secondary" : "") + '" data-act="toggle" data-posting="' + pid + '"' + (sid ? ' data-senior="' + sid + '"' : "") + ">" +
        h(state === "mine" ? T.interest.gezeigt + " – zurücknehmen" : T.interest.zeigen) + "</button>";
      if (state === "mine") html += '<p class="hint" role="status">' + h(T.interest.warten) + "</p>";
    }
    return html + "</section>";
  }

  // ---------- Header / Footer ----------
  function renderChrome() {
    var u = me();
    var sel = '<option value="guest"' + (u.role === "guest" ? " selected" : "") + ">Gast (nicht angemeldet)</option><optgroup label=\"Betrieb\">" +
      businesses().slice().sort(function (a, b) { return a.name.localeCompare(b.name, "de"); }).map(function (b) { var v = "business:" + b.id; return '<option value="' + v + '"' + (S.who === v ? " selected" : "") + ">" + h(b.name) + "</option>"; }).join("") +
      '</optgroup><optgroup label="Senior:in">' +
      seniors().slice().sort(function (a, b) { return a.vorname.localeCompare(b.vorname, "de"); }).map(function (s) { var v = "senior:" + s.id; return '<option value="' + v + '"' + (S.who === v ? " selected" : "") + ">" + h(s.vorname) + " (" + h(s.ort) + ")</option>"; }).join("") + "</optgroup>";
    var anr = u.role === "guest" ? '<label for="anrede" class="sr">Anrede</label><select id="anrede" data-change="anrede" style="width:auto"><option value="sie"' + (u.anrede === "sie" ? " selected" : "") + '>Sie-Form</option><option value="du"' + (u.anrede === "du" ? " selected" : "") + ">Du-Form</option></select>" : "";
    document.getElementById("header").innerHTML =
      '<header class="site-header"><div class="demo" role="region" aria-label="Demo-Modus"><div class="wrap in"><strong>Demo-Modus (simulierte Anmeldung):</strong>' +
      '<label for="who" class="sr">Ansicht als</label><select id="who" data-change="who" style="width:auto;max-width:70vw">' + sel + "</select>" + anr +
      "<span>" + (u.role === "guest" ? "Gast" : u.role === "business" ? "Betrieb: " + h(u.name) : "Senior:in: " + h(u.name)) + ' </span><button class="btn secondary" style="min-height:40px" data-act="reset" title="Alle im Browser gespeicherten Demo-Änderungen löschen">Demo zurücksetzen</button></div></div>' +
      '<div class="wrap bar"><a href="#/" class="brand">' + h(C.app.title) + '</a><nav class="nav" aria-label="Hauptmenü">' +
      '<a href="#/">' + "Karte" + '</a><a href="#/ideen">Ideen</a><a href="#/ideen/fuer-betriebe">Für Betriebe</a><a href="#/meine-kontakte">Meine Kontakte</a>' +
      (u.role === "business" ? '<a href="#/gesuche/neu">Gesuch erstellen</a>' : '<a href="#/ich-biete">Ich biete</a>') + "</nav></div></header>";
    document.getElementById("footer").innerHTML = '<div class="wrap"><p>' + h(C.app.title) + " · Region: " + h(C.region.name) + ". Prototyp mit fiktiven Daten. Wir sind Treffpunkt und Ideengeber, kein Arbeitgeber und keine Vermittlung.</p>" +
      '<p><a href="#/impressum">Impressum</a> · <a href="#/datenschutz">Datenschutz</a> · Keine Tracker, keine Cookies (nur lokaler Speicher für die Demo).</p></div>';
  }

  // ---------- Seiten ----------
  var map = null;
  function killMap() { if (map) { map.remove(); map = null; } }

  function pageHome(q) {
    var f = { taetigkeit: q.taetigkeit || "", zeitraum: q.zeitraum || "", ort: q.ort || "", umkreis: q.umkreis ? +q.umkreis : 0, zeige: q.zeige === "gesuche" || q.zeige === "profile" ? q.zeige : "beide" };
    var ansicht = q.ansicht === "liste" ? "liste" : "karte";
    var ref = f.ort && f.umkreis ? ortByName(f.ort) : null;
    var inR = function (pos) { return !ref || haversine([ref.lat, ref.lng], pos) <= f.umkreis; };
    var P = postings().filter(function (p) {
      var b = byId(businesses(), p.businessId);
      return (!f.taetigkeit || p.taetigkeit === f.taetigkeit) && (!f.zeitraum || csv(p.zeitraum).indexOf(f.zeitraum) >= 0) && inR([b.lat, b.lng]);
    });
    var need = f.taetigkeit ? TAGMAP[f.taetigkeit] || [] : [];
    var Sn = seniors().filter(function (s) {
      return (!need.length || csv(s.tags).some(function (t) { return need.indexOf(t) >= 0; })) && (!f.zeitraum || csv(s.verfuegbarkeit).indexOf(f.zeitraum) >= 0) && inR([s.fuzzyLat, s.fuzzyLng]);
    });
    var showP = f.zeige !== "profile", showS = f.zeige !== "gesuche";
    var qs = function (extra) { var o = {}, k; for (k in q) o[k] = q[k]; for (k in extra) o[k] = extra[k]; return "#/?" + Object.keys(o).filter(function (k) { return o[k]; }).map(function (k) { return k + "=" + encodeURIComponent(o[k]); }).join("&"); };
    var ortObj = {}; C.region.orte.forEach(function (o) { ortObj[o.name] = o.name; });
    var umk = {}; C.umkreise.forEach(function (u) { umk[u] = u + " km"; });

    var html = "<h1>" + h(T.home.titel) + ": " + h(C.region.name) + "</h1><p>" + h(T.home.claim) + '</p><p class="notice">' + h(T.home.disclaimer) + "</p>" +
      '<form class="card" data-form="filter" aria-label="Filter"><div class="filters">' +
      '<div><label for="f-t">Tätigkeit</label><select id="f-t" name="taetigkeit">' + opts(C.taetigkeiten, f.taetigkeit, "Alle") + "</select></div>" +
      '<div><label for="f-z">Zeitraum</label><select id="f-z" name="zeitraum">' + opts(C.zeitraeume, f.zeitraum, "Alle") + "</select></div>" +
      '<div><label for="f-o">Ort</label><select id="f-o" name="ort">' + opts(ortObj, f.ort, "Ganzer Bezirk") + "</select></div>" +
      '<div><label for="f-u">Umkreis</label><select id="f-u" name="umkreis">' + opts(umk, String(f.umkreis || ""), "Beliebig") + "</select></div>" +
      '<div><label for="f-s">Anzeigen</label><select id="f-s" name="zeige">' + opts({ beide: "Gesuche und Profile", gesuche: "Nur Gesuche der Betriebe", profile: "Nur Profile" }, f.zeige) + "</select></div>" +
      '</div><input type="hidden" name="ansicht" value="' + ansicht + '"><div class="actions" style="margin-top:0"><button class="btn">Filtern</button><a class="btn secondary" href="#/?ansicht=' + ansicht + '">Zurücksetzen</a></div></form>' +
      '<div class="tabs" role="navigation" aria-label="Ansicht"><a href="' + qs({ ansicht: "karte" }) + '" aria-current="' + (ansicht === "karte") + '">Karte</a><a href="' + qs({ ansicht: "liste" }) + '" aria-current="' + (ansicht === "liste") + '">Liste</a></div>' +
      '<p role="status">' + (showP ? P.length + " Gesuch" + (P.length === 1 ? "" : "e") : "") + (showP && showS ? " · " : "") + (showS ? Sn.length + " Profil" + (Sn.length === 1 ? "" : "e") : "") + "</p>";

    if (ansicht === "karte") {
      html += '<div class="legend" aria-hidden="true"><span><span class="sw" style="background:var(--accent)"></span>Betrieb mit Gesuch (exakter Standort)</span><span><span class="sw" style="background:var(--primary)"></span>Senior:in – nur ungefährer Bereich (~1 km)</span></div>' +
        '<div id="map" role="region" aria-label="Karte mit Betrieben und ungefähren Bereichen von Profilen. Alle Einträge stehen auch in der Listenansicht."></div>' +
        '<p class="hint">Kartenkacheln stammen von OpenStreetMap. Alle Einträge finden Sie auch in der <a href="' + qs({ ansicht: "liste" }) + '">Liste</a>.</p>';
    } else {
      if (showP) html += "<h2>Gesuche der Betriebe</h2>" + '<div class="grid">' + P.map(postingCard).join("") + "</div>" + (P.length ? "" : "<p>Keine Gesuche für diese Auswahl.</p>");
      if (showS) html += '<h2 style="margin-top:1.5rem">Profile: „Ich biete“</h2><div class="grid">' + Sn.map(profileCard).join("") + "</div>" + (Sn.length ? "" : "<p>Keine Profile für diese Auswahl.</p>");
    }
    return { html: html, after: function () { if (ansicht === "karte") initMap(showP ? P : [], showS ? Sn : []); } };
  }

  function initMap(P, Sn) {
    var el = document.getElementById("map"); if (!el || !window.L) return;
    map = L.map(el, { scrollWheelZoom: false }).setView(C.region.center, C.region.zoom);
    L.tileLayer(C.app.tiles.url, { attribution: C.app.tiles.attribution, maxZoom: 18 }).addTo(map);
    var pts = [], byBiz = {};
    P.forEach(function (p) { (byBiz[p.businessId] = byBiz[p.businessId] || []).push(p); });
    Object.keys(byBiz).forEach(function (bid) {
      var b = byId(businesses(), bid);
      var icon = L.divIcon({ className: "", html: '<div class="pin"></div>', iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28] });
      var li = byBiz[bid].map(function (p) { return '<li><a href="#/gesuche/' + p.id + '">' + h(tName(p.taetigkeit)) + " (" + p.stundenProWoche + " Std.)</a></li>"; }).join("");
      L.marker([b.lat, b.lng], { icon: icon, title: b.name, alt: b.name }).addTo(map).bindPopup("<strong>" + h(b.name) + "</strong><br>" + h(b.ort) + '<ul style="padding-left:1.1rem;margin:.4rem 0 0">' + li + "</ul>");
      pts.push([b.lat, b.lng]);
    });
    Sn.forEach(function (s) {
      L.circle([s.fuzzyLat, s.fuzzyLng], { radius: 1000, color: "#1f5f3f", weight: 2, fillColor: "#1f5f3f", fillOpacity: 0.22 }).addTo(map)
        .bindPopup("<strong>" + h(s.vorname) + "</strong>, Raum " + h(s.ort) + "<br>" + h(csv(s.tags).join(", ")) + '<br><a href="#/profile/' + s.id + '">Profil ansehen</a>');
      pts.push([s.fuzzyLat, s.fuzzyLng]);
    });
    if (pts.length > 1) map.fitBounds(pts, { padding: [30, 30], maxZoom: 14 });
    map.on("click", function () { map.scrollWheelZoom.enable(); });
  }

  function pageGesuch(id) {
    var p = byId(postings(), id); if (!p) return notFound();
    var b = byId(businesses(), p.businessId), u = me(), back = "#/gesuche/" + id, box = "";
    if (u.role === "guest") box = '<p class="notice">Wählen Sie oben im Demo-Modus eine Rolle, um Interesse zu zeigen.</p>';
    else if (u.role === "senior") box = statusBox(matchState(id, u.id, "senior"), id, null, "Interesse an diesem Gesuch", { name: b.kontaktName + " (" + b.name + ")", email: b.kontaktEmail, tel: b.kontaktTel });
    else if (u.id === b.id) {
      var ids = []; interests().forEach(function (i) { if (i.postingId === id && ids.indexOf(i.seniorId) < 0) ids.push(i.seniorId); });
      box = "<section><h2>Interessent:innen</h2>" + (ids.length ? "" : '<p>Noch niemand. Stöbern Sie in den <a href="#/?zeige=profile&ansicht=liste">Profilen</a>.</p>') +
        ids.map(function (sid) { var s = byId(seniors(), sid); return '<div style="margin-bottom:1rem">' + profileCard(s) + statusBox(matchState(id, sid, "business"), id, sid, "Kontakt zu " + s.vorname, { name: s.vorname, email: s.kontaktEmail, tel: s.kontaktTel }) + "</div>"; }).join("") + "</section>";
    }
    return { html: '<p><a href="#/">← Zurück zur Übersicht</a></p><h1>' + h(tName(p.taetigkeit)) + " – " + h(b.name) + "</h1><p>" + h(b.branche) + " in " + h(b.ort) + "</p>" +
      chips([aName(p.anstellungsart)].concat(zNames(p.zeitraum)), ["acc"]) +
      '<div class="card" style="margin-bottom:1.25rem"><table class="kv"><tbody><tr><th>Tage</th><td>' + h(p.tage) + "</td></tr><tr><th>Stunden/Woche</th><td>" + p.stundenProWoche + "</td></tr><tr><th>Standort</th><td>" + h(b.adresse) + "</td></tr></tbody></table><p style=\"margin-top:1rem\">" + h(p.beschreibung) + "</p></div>" + box };
  }

  function pageProfil(id, q) {
    var s = byId(seniors(), id); if (!s) return notFound();
    var u = me(), box = "";
    if (u.role === "business") {
      var mine = postings().filter(function (p) { return p.businessId === u.id; });
      box = mine.length ? "<h2>Interesse zeigen für eines Ihrer Gesuche</h2>" + mine.map(function (p) { return '<div style="margin-bottom:1rem">' + statusBox(matchState(p.id, s.id, "business"), p.id, s.id, "Gesuch: " + tName(p.taetigkeit), { name: s.vorname, email: s.kontaktEmail, tel: s.kontaktTel }) + "</div>"; }).join("")
        : '<p class="notice">Erstellen Sie zuerst ein <a href="#/gesuche/neu">Gesuch</a>.</p>';
    } else if (u.role === "guest") box = '<p class="notice">Wählen Sie oben im Demo-Modus „Betrieb“, um Interesse zu zeigen.</p>';
    var tg = csv(s.tags);
    return { html: (q.neu ? '<p class="notice ok" role="status"><strong>Danke! Ihr Profil ist angelegt.</strong> Sie sind jetzt als ' + h(s.vorname) + ' angemeldet (Demo). Stöbern Sie in den <a href="#/?zeige=gesuche">Gesuchen</a>.</p>' : "") +
      '<p><a href="#/">← Zurück zur Übersicht</a></p><h1>' + h(s.vorname) + "</h1><p>Raum " + h(s.ort) + (s.ortsteil ? ", " + h(s.ortsteil) : "") + " · Radius " + s.radiusKm + " km</p>" +
      chips(tg.concat(zNames(s.verfuegbarkeit)), tg.map(function () { return "acc"; })) +
      '<div class="card" style="margin-bottom:1.25rem"><p>' + h(s.erfahrung) + '</p><p class="hint">Es wird nur ein ungefährer Bereich angezeigt, niemals eine genaue Adresse.</p></div>' + box };
  }

  function checks(name, obj) { return '<div class="check-grid">' + Object.keys(obj).map(function (k) { return '<label><input type="checkbox" name="' + name + '" value="' + h(k) + '">' + h(obj[k]) + "</label>"; }).join("") + "</div>"; }

  function pageNeu() {
    var u = me();
    if (u.role !== "business") return { html: '<h1>Gesuch erstellen</h1><p class="notice">Bitte wählen Sie oben im Demo-Modus einen Betrieb aus.</p>' };
    return { html: "<h1>Gesuch erstellen</h1><p>Für " + h(u.name) + '. Ort und Standort stammen aus Ihrem Betriebsprofil.</p><form class="card" data-form="posting">' +
      '<div class="field"><label for="n-t">Tätigkeit</label><select id="n-t" name="taetigkeit" required>' + opts(C.taetigkeiten) + "</select></div>" +
      '<fieldset class="field" style="border:0;padding:0"><legend style="font-weight:600;margin-bottom:.3rem">Zeitraum</legend>' + checks("zeitraum", C.zeitraeume) + "</fieldset>" +
      '<div class="field"><label for="n-d">Tage / genaue Zeiten</label><input id="n-d" name="tage" type="text" placeholder="z. B. Fr–So ab 15 Uhr" required></div>' +
      '<div class="field"><label for="n-h">Stunden pro Woche</label><input id="n-h" name="stunden" type="number" min="1" max="40" value="8" required></div>' +
      '<div class="field"><label for="n-a">Gewünschte Anstellungsart</label><select id="n-a" name="anstellungsart">' + opts(C.anstellungsarten) + "</select></div>" +
      '<div class="field"><label for="n-b">Beschreibung</label><textarea id="n-b" name="beschreibung" required maxlength="1500"></textarea><p class="hint">Die Anstellung läuft direkt zwischen Ihnen und der Person, wir sind nur der Treffpunkt.</p></div>' +
      '<button class="btn big">Gesuch veröffentlichen</button></form>' };
  }

  function pageOnboarding() {
    var o = T.onboarding, u = me(), a = u.anrede;
    var ort0 = C.region.orte[0];
    return { html: "<h1>" + h(tr(o.titel)) + '</h1><form class="card" data-form="profile" style="font-size:1.1rem" id="onb">' +
      '<div class="steps" id="onb-steps"><span class="on">Schritt 1 von 3</span><span>Schritt 2 von 3</span><span>Schritt 3 von 3</span></div><h2 id="onb-h" aria-live="polite">' + h(tr(o.schritt1)) + "</h2>" +
      '<div data-step="1"><div class="field"><label for="o-v">Vorname</label><input id="o-v" name="vorname" type="text" required autocomplete="given-name" maxlength="40"></div>' +
      '<div class="field"><label for="o-o">Ort</label><select id="o-o" name="ort" data-change="ort">' + C.region.orte.map(function (x) { return "<option>" + h(x.name) + "</option>"; }).join("") + "</select></div>" +
      '<div class="field" id="o-teil"><label for="o-t">Ortsteil (freiwillig)</label><select id="o-t" name="ortsteil"><option value="">–</option>' + (ort0.ortsteile || []).map(function (t) { return "<option>" + h(t) + "</option>"; }).join("") + "</select></div>" +
      '<div class="field"><label for="o-a">Wie möchten Sie angesprochen werden?</label><select id="o-a" name="anrede"><option value="sie"' + (a === "sie" ? " selected" : "") + '>Mit „Sie“</option><option value="du"' + (a === "du" ? " selected" : "") + ">Mit „Du“</option></select></div>" +
      '<p class="notice ok">' + h(tr(o.datenschutz)) + "</p></div>" +
      '<div data-step="2" hidden><fieldset class="field" style="border:0;padding:0"><legend style="font-weight:600;margin-bottom:.3rem">Was passt? (mehrere möglich)</legend><div class="check-grid">' +
      C.erfahrungTags.map(function (t) { return '<label><input type="checkbox" name="tags" value="' + h(t) + '">' + h(t) + "</label>"; }).join("") + "</div></fieldset>" +
      '<div class="field"><label for="o-e">In eigenen Worten</label><textarea id="o-e" name="erfahrung" maxlength="1000" placeholder="z. B. 30 Jahre im Service gearbeitet …"></textarea></div></div>' +
      '<div data-step="3" hidden><fieldset class="field" style="border:0;padding:0"><legend style="font-weight:600;margin-bottom:.3rem">Wann haben Sie Zeit?</legend>' + checks("verfuegbarkeit", C.zeitraeume) + "</fieldset>" +
      '<div class="field"><label for="o-r">Wie weit würden Sie fahren?</label><select id="o-r" name="radius"><option value="5">5 km</option><option value="10" selected>10 km</option><option value="15">15 km</option><option value="25">25 km</option></select></div>' +
      '<div class="field"><label for="o-m">E-Mail</label><input id="o-m" name="email" type="email" required autocomplete="email"><p class="hint">Wird erst sichtbar, wenn beide Seiten Interesse gezeigt haben.</p></div>' +
      '<div class="field"><label for="o-p">Telefon (freiwillig)</label><input id="o-p" name="tel" type="tel" autocomplete="tel"></div><p class="hint">Ein Foto ist nicht nötig.</p></div>' +
      '<div class="actions"><button type="button" class="btn secondary big" data-act="prev" id="b-prev" hidden>Zurück</button><button type="button" class="btn big" data-act="next" id="b-next">Weiter</button><button class="btn big" id="b-send" hidden>Profil anlegen</button></div></form>',
      after: function () { onbStep = 1; } };
  }
  var onbStep = 1;
  function onbShow(n) {
    var f = document.getElementById("onb"); if (!f) return; onbStep = n;
    var u = me(), titles = [tr(T.onboarding.schritt1), tr(T.onboarding.schritt2), tr(T.onboarding.schritt3)];
    [1, 2, 3].forEach(function (i) { f.querySelector('[data-step="' + i + '"]').hidden = i !== n; });
    var sp = f.querySelectorAll("#onb-steps span"); for (var i = 0; i < 3; i++) { sp[i].className = i === n - 1 ? "on" : ""; }
    document.getElementById("onb-h").textContent = titles[n - 1];
    document.getElementById("b-prev").hidden = n === 1; document.getElementById("b-next").hidden = n === 3; document.getElementById("b-send").hidden = n !== 3;
    window.scrollTo(0, 0);
  }

  function pageKontakte() {
    var u = me();
    if (u.role === "guest") return { html: '<h1>Meine Kontakte</h1><p class="notice">Wählen Sie oben im Demo-Modus eine Rolle.</p>' };
    var pairs = {}, order = [];
    interests().forEach(function (i) {
      var p = byId(postings(), i.postingId); if (!p) return;
      if (u.role === "senior" ? i.seniorId !== u.id : p.businessId !== u.id) return;
      var k = i.postingId + "|" + i.seniorId; if (!pairs[k]) { pairs[k] = { pid: i.postingId, sid: i.seniorId, von: [] }; order.push(k); }
      pairs[k].von.push(i.von);
    });
    var items = order.map(function (k) { var x = pairs[k]; x.match = x.von.indexOf("business") >= 0 && x.von.indexOf("senior") >= 0; x.mine = x.von.indexOf(u.role) >= 0; return x; }).sort(function (a, b) { return (b.match ? 1 : 0) - (a.match ? 1 : 0); });
    return { html: "<h1>Meine Kontakte</h1><p>Kontaktdaten sehen Sie erst, wenn beide Seiten Interesse gezeigt haben.</p>" + (items.length ? "" : '<p>Noch nichts vorhanden. Stöbern Sie auf der <a href="#/">Karte</a>.</p>') + '<div class="grid">' +
      items.map(function (x) {
        var p = byId(postings(), x.pid), b = byId(businesses(), p.businessId), s = byId(seniors(), x.sid);
        var title = u.role === "senior" ? tName(p.taetigkeit) + " – " + b.name : s.vorname + " für „" + tName(p.taetigkeit) + "“";
        var ct = u.role === "senior" ? [["Ansprechperson", b.kontaktName], ["E-Mail", b.kontaktEmail], ["Telefon", b.kontaktTel]] : [["Name", s.vorname], ["E-Mail", s.kontaktEmail], ["Telefon", s.kontaktTel]];
        return '<article class="card"><h3>' + h(title) + '</h3><p class="chip acc" style="display:inline-block">' + (x.match ? "Gegenseitig – Kontakt frei" : x.mine ? "Warten auf Antwort" : "Andere Seite hat Interesse gezeigt") + "</p>" +
          (x.match ? '<table class="kv"><tbody>' + ct.map(function (r) { return "<tr><th>" + r[0] + "</th><td>" + (r[0] === "E-Mail" ? '<a href="mailto:' + h(r[1]) + '">' + h(r[1]) + "</a>" : h(r[1])) + "</td></tr>"; }).join("") + "</tbody></table>" : "") +
          '<p><a href="' + (u.role === "senior" ? "#/gesuche/" + p.id : "#/profile/" + s.id) + '">Details ansehen</a></p></article>';
      }).join("") + "</div>" };
  }

  var eur = function (n) { return n.toLocaleString("de-AT", { style: "currency", currency: "EUR" }); };
  function pageIdeen() {
    var keys = Object.keys(E.szenarien);
    var html = "<h1>Ideen & Zuverdienst</h1><p>Was ist möglich, und was bleibt netto? Hier finden Sie Inspiration und einen ersten Überblick.</p>" +
      '<section class="card" aria-labelledby="rechner-h"><h2 id="rechner-h">Zuverdienst-Rechner</h2><p class="notice"><strong>' + h(E.hinweis) + "</strong></p>" +
      '<fieldset class="field" style="border:0;padding:0"><legend style="font-weight:600;margin-bottom:.4rem">Ihre Pensionsart</legend>' +
      keys.map(function (k, i) { return '<label style="display:flex;gap:.6rem;align-items:center;font-weight:500;min-height:48px"><input type="radio" name="sz" value="' + k + '"' + (i === 0 ? " checked" : "") + ' style="width:24px;height:24px;accent-color:var(--primary)" data-change="calc">' + h(E.szenarien[k].label) + "</label>"; }).join("") + "</fieldset>" +
      '<p id="r-desc"></p><div class="field"><label for="monat">Geplanter Zuverdienst pro Monat (brutto, in Euro)</label><input id="monat" type="number" min="0" step="10" value="450" data-input="calc"></div><div aria-live="polite" id="r-out"></div>' +
      '<h3>Voraussetzungen</h3><ul id="r-vor"></ul><p class="hint">Stand: ' + h(E.stand) + ". Bitte prüfen. Keine Rechts- oder Steuerberatung.</p></section>" +
      '<h2 style="margin-top:2rem">Beispiel-Jobs</h2><div class="grid">' +
      T.jobBeispiele.map(function (j) { return '<article class="card"><h3>' + h(j.titel) + '</h3><p class="chip acc" style="display:inline-block">' + h(tName(j.taetigkeit)) + "</p><p>" + h(j.umfang) + '</p><p class="hint">' + h(j.beispiel) + ' (fiktiv)</p><a class="btn secondary" href="#/?taetigkeit=' + j.taetigkeit + '&ansicht=liste">Passende Gesuche</a></article>'; }).join("") +
      '</div><p style="margin-top:1.5rem">Sie sind Betrieb? <a href="#/ideen/fuer-betriebe">So beschäftigen Sie Pensionist:innen</a>.</p>';
    return { html: html, after: calc };
  }
  function calc() {
    var r = document.querySelector('input[name="sz"]:checked'); if (!r) return;
    var s = E.szenarien[r.value], m = Math.max(0, Number(document.getElementById("monat").value) || 0);
    var over = s.freibetragMonat != null && s.freibetragMonat > 0 && m > s.freibetragMonat;
    var abzug = m * ((s.svSatzDienstnehmer || 0) + (s.pauschalSteuersatz || 0)), geri = m <= E.geringfuegigkeitsgrenzeMonat;
    document.getElementById("r-desc").textContent = s.beschreibung;
    document.getElementById("r-vor").innerHTML = s.voraussetzungen.map(function (v) { return "<li>" + h(v) + "</li>"; }).join("");
    document.getElementById("r-out").innerHTML = '<p>Jahreszuverdienst brutto: <span class="big-number">' + eur(m * 12) + "</span></p>" +
      "<p>Geringfügigkeitsgrenze (" + eur(E.geringfuegigkeitsgrenzeMonat) + "/Monat): " + (geri ? "unterschritten (geringfügig)" : "überschritten (vollversichert)") + ".</p>" +
      (s.freibetragMonat != null && s.freibetragMonat > 0 ? '<p class="notice ' + (over ? "" : "ok") + '">Zuverdienstgrenze in diesem Szenario: ' + eur(s.freibetragMonat) + "/Monat – " + (over ? "überschritten: Pension könnte ruhen oder gekürzt werden." : "eingehalten.") + "</p>" : "") +
      (s.freibetragMonat == null ? '<p class="notice ok">In diesem Szenario gibt es keine Zuverdienstgrenze.</p>' : "") +
      "<p>Grobe Abgabenschätzung: " + eur(abzug) + " · verbleibend ca. " + eur(m - abzug) + ' <span class="hint">(Platzhaltersätze!)</span></p>';
  }

  function pageBetriebe() {
    return { html: "<h1>" + h(T.ideenBetriebe.titel) + '</h1><p class="notice">Platzhaltertexte – Inhalte werden in <code>js/config.js</code> befüllt.</p>' +
      T.ideenBetriebe.abschnitte.map(function (a) { return '<section class="card" style="margin-bottom:1rem"><h2>' + h(a.h) + "</h2><p>" + h(a.p) + "</p></section>"; }).join("") };
  }
  function notFound() { return { html: '<h1>Nicht gefunden</h1><p><a href="#/">Zur Startseite</a></p>' }; }

  // ---------- Router ----------
  function parse() {
    var raw = location.hash.replace(/^#/, "") || "/", i = raw.indexOf("?"), path = i < 0 ? raw : raw.slice(0, i), q = {};
    if (i >= 0) raw.slice(i + 1).split("&").forEach(function (kv) { var p = kv.split("="); if (p[0]) q[decodeURIComponent(p[0])] = decodeURIComponent((p[1] || "").replace(/\+/g, " ")); });
    return { path: path.replace(/\/$/, "") || "/", q: q };
  }
  function render() {
    killMap(); renderChrome();
    var r = parse(), p = r.path, m, page;
    if (p === "/") page = pageHome(r.q);
    else if ((m = p.match(/^\/gesuche\/([^/]+)$/))) page = m[1] === "neu" ? pageNeu() : pageGesuch(m[1]);
    else if ((m = p.match(/^\/profile\/([^/]+)$/))) page = pageProfil(m[1], r.q);
    else if (p === "/ich-biete") page = pageOnboarding();
    else if (p === "/meine-kontakte") page = pageKontakte();
    else if (p === "/ideen") page = pageIdeen();
    else if (p === "/ideen/fuer-betriebe") page = pageBetriebe();
    else if (p === "/impressum") page = { html: "<h1>Impressum</h1><p>" + h(T.rechtlich.impressum) + "</p>" };
    else if (p === "/datenschutz") page = { html: "<h1>Datenschutzerklärung</h1><p>" + h(T.rechtlich.datenschutz) + "</p>" };
    else page = notFound();
    var main = document.getElementById("inhalt"); main.innerHTML = page.html;
    var links = document.querySelectorAll(".nav a"); for (var k = 0; k < links.length; k++) if (links[k].getAttribute("href") === "#" + p) links[k].setAttribute("aria-current", "page");
    if (page.after) page.after();
  }

  // ---------- Ereignisse ----------
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-act]"); if (!el) return;
    var act = el.getAttribute("data-act");
    if (act === "toggle") {
      var u = me(); if (u.role === "guest") return;
      var pid = el.getAttribute("data-posting"), sid = u.role === "senior" ? u.id : el.getAttribute("data-senior");
      var p = byId(postings(), pid);
      if (u.role === "business" && (!p || p.businessId !== u.id)) return; // nur eigene Gesuche
      var has = interests().some(function (i) { return i.postingId === pid && i.seniorId === sid && i.von === u.role; });
      if (has) { // zurücknehmen: aus Seed-Daten oder lokalem Zustand entfernen
        var f = function (i) { return !(i.postingId === pid && i.seniorId === sid && i.von === u.role); };
        D.interests = D.interests.filter(f); S.interests = S.interests.filter(f);
        S.removedSeed = (S.removedSeed || []).concat([[pid, sid, u.role]]);
      } else {
        S.removedSeed = (S.removedSeed || []).filter(function (r) { return !(r[0] === pid && r[1] === sid && r[2] === u.role); });
        S.interests.push({ postingId: pid, seniorId: sid, von: u.role });
      }
      save(); render();
    } else if (act === "next") {
      var f2 = document.getElementById("onb"), sec = f2.querySelector('[data-step="' + onbStep + '"]'), ok = true;
      sec.querySelectorAll("input,select,textarea").forEach(function (x) { if (ok && !x.reportValidity()) ok = false; });
      if (ok) onbShow(onbStep + 1);
    } else if (act === "prev") onbShow(onbStep - 1);
    else if (act === "reset") { try { localStorage.removeItem(KEY); } catch (er) {} mem = null; location.hash = "#/"; location.reload(); }
  });
  document.addEventListener("change", function (e) {
    var t = e.target, k = t.getAttribute && t.getAttribute("data-change"); if (!k) return;
    if (k === "who") { S.who = t.value; save(); location.hash = "#/"; render(); }
    else if (k === "anrede") { S.anrede = t.value; save(); render(); }
    else if (k === "ort") {
      var o = ortByName(t.value), sel = document.getElementById("o-t");
      sel.innerHTML = '<option value="">–</option>' + ((o && o.ortsteile) || []).map(function (x) { return "<option>" + h(x) + "</option>"; }).join("");
    } else if (k === "calc") calc();
  });
  document.addEventListener("input", function (e) { if (e.target.getAttribute && e.target.getAttribute("data-input") === "calc") calc(); });
  document.addEventListener("submit", function (e) {
    var form = e.target, kind = form.getAttribute("data-form"); if (!kind) return; e.preventDefault();
    var fd = new FormData(form), g = function (k) { return String(fd.get(k) || "").trim(); }, all = function (k) { return fd.getAll(k).join(","); };
    if (kind === "filter") {
      var parts = []; ["taetigkeit", "zeitraum", "ort", "umkreis", "zeige", "ansicht"].forEach(function (k) { if (g(k)) parts.push(k + "=" + encodeURIComponent(g(k))); });
      location.hash = "#/?" + parts.join("&");
    } else if (kind === "posting") {
      var u = me(); if (u.role !== "business") return;
      var np = { id: uid(), businessId: u.id, taetigkeit: g("taetigkeit"), zeitraum: all("zeitraum"), tage: g("tage"), stundenProWoche: Math.max(1, Math.min(40, Number(g("stunden")) || 5)), beschreibung: g("beschreibung").slice(0, 1500), anstellungsart: g("anstellungsart") };
      S.postings.push(np); save(); location.hash = "#/gesuche/" + np.id;
    } else if (kind === "profile") {
      var ort = ortByName(g("ort")) || C.region.orte[0], pos = fuzz(ort.lat, ort.lng), an = g("anrede") === "du" ? "du" : "sie";
      var ns = { id: uid(), vorname: g("vorname").slice(0, 40) || "Vorname", ort: ort.name, ortsteil: g("ortsteil") || null, fuzzyLat: pos[0], fuzzyLng: pos[1], radiusKm: Number(g("radius")) || 10, erfahrung: g("erfahrung").slice(0, 1000), tags: all("tags"), verfuegbarkeit: all("verfuegbarkeit"), anrede: an, kontaktEmail: g("email").slice(0, 120), kontaktTel: g("tel").slice(0, 40) };
      S.seniors.push(ns); S.who = "senior:" + ns.id; save(); location.hash = "#/profile/" + ns.id + "?neu=1";
    }
  });
  window.addEventListener("hashchange", function () { render(); window.scrollTo(0, 0); });

  // Beim Laden: entfernte Seed-Interessen (Rücknahmen) erneut anwenden
  (S.removedSeed || []).forEach(function (r) { D.interests = D.interests.filter(function (i) { return !(i.postingId === r[0] && i.seniorId === r[1] && i.von === r[2]); }); });
  render();
})();
