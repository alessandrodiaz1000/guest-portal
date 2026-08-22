/* personal.js — la parte personale dell'ospite, innestata dentro la guida.
 *
 * Un link solo: la guida si apre con ?t=<token> e chiama il portale Jarvis sul
 * Mini per i dati di QUELLA prenotazione (codice porta, orario, documenti,
 * imposta). Senza token la guida resta esattamente com'era, pubblica e senza
 * codice d'accesso.
 *
 * Stati, nell'ordine in cui li vive l'ospite:
 *   1. dati incompleti  → schermata personale a tutto schermo, la guida sta
 *                         dietro. In fondo un link piccolo per saltarla.
 *   2. guida aperta ma  → barra sticky in alto che ricorda cosa manca e
 *      dati incompleti    riapre la schermata.
 *   3. tutto mandato    → la parte personale sparisce; l'orario scelto compare
 *                         nella sezione check-in della guida.
 *   4. imposta da pagare→ la barra del pagamento resta in alto in ogni caso,
 *                         finché Ale non conferma di averla incassata.
 *
 * Se il Mini non risponde la guida resta intera: si mostra solo una riga che
 * dice di scrivere. Mai una pagina rotta.
 */
(function () {
  var API = window.GUEST_PORTAL_API || "";
  var token = new URLSearchParams(location.search).get("t") || "";
  if (!token || !API) return;                 // guida pubblica: niente da fare

  var dati = null;
  var erroreRete = false;
  var guidaAperta = false;                    // ha premuto "vai alla guida"
  var lang = "it";

  // ── testi ──────────────────────────────────────────────────────────────
  var T = {
    it: {
      titolo: "Prima di arrivare",
      sotto: "Due cose e sei a posto. Ci servono per legge e per prepararti l'appartamento.",
      codice: "Codice di accesso", codiceNota: "Attivo dal giorno del check-in.",
      eta: "A che ora arrivi?", etaSalva: "Salva orario", etaOk: "Orario salvato",
      doc: "Documenti d'identità",
      docNota: "La legge italiana ci obbliga a comunicare i dati di ogni ospite alla Questura.",
      docTutti: "Serve il documento di tutte le persone che soggiornano ({n}).",
      docCarica: "Carica un documento", docOk: "Documento ricevuto, grazie.",
      docRicevuti: "{n} ricevuti",
      salta: "Vai direttamente alla guida",
      barraManca: "Mancano i tuoi dati",
      barraApri: "Completa",
      imposta: "Imposta di soggiorno", impostaNota: "Da versare a noi, non è inclusa in quanto hai già pagato.",
      impostaCome: "All'arrivo in contanti, oppure ora con:",
      impostaEsenti: "I minori di 18 anni sono esenti.",
      giu: "Non riusciamo a caricare i tuoi dati. Scrivici su Airbnb o Booking, oppure su WhatsApp al {tel}.",
      scaduto: "Questo link non è più attivo.",
      etaInGuida: "Hai indicato il tuo arrivo per le <strong>{eta}</strong>.",
    },
    en: {
      titolo: "Before you arrive",
      sotto: "Two things and you're set. We need them by law and to get the flat ready for you.",
      codice: "Access code", codiceNota: "Active from your check-in day.",
      eta: "What time will you arrive?", etaSalva: "Save time", etaOk: "Time saved",
      doc: "Identity documents",
      docNota: "Italian law requires us to report every guest's details to the police.",
      docTutti: "We need the ID of everyone staying ({n}).",
      docCarica: "Upload a document", docOk: "Document received, thank you.",
      docRicevuti: "{n} received",
      salta: "Go straight to the guide",
      barraManca: "Your details are missing",
      barraApri: "Complete",
      imposta: "City tax", impostaNota: "Payable to us, not included in what you already paid.",
      impostaCome: "In cash on arrival, or now with:",
      impostaEsenti: "Guests under 18 are exempt.",
      giu: "We can't load your details right now. Message us on Airbnb or Booking, or on WhatsApp at {tel}.",
      scaduto: "This link is no longer active.",
      etaInGuida: "You told us you'll arrive at <strong>{eta}</strong>.",
    },
    es: {
      titolo: "Antes de llegar",
      sotto: "Dos cosas y listo. Nos hacen falta por ley y para prepararte el apartamento.",
      codice: "Código de acceso", codiceNota: "Activo desde el día de tu entrada.",
      eta: "¿A qué hora llegas?", etaSalva: "Guardar hora", etaOk: "Hora guardada",
      doc: "Documentos de identidad",
      docNota: "La ley italiana nos obliga a comunicar los datos de cada huésped a la policía.",
      docTutti: "Necesitamos el documento de todas las personas que se alojan ({n}).",
      docCarica: "Subir un documento", docOk: "Documento recibido, gracias.",
      docRicevuti: "{n} recibidos",
      salta: "Ir directamente a la guía",
      barraManca: "Faltan tus datos",
      barraApri: "Completar",
      imposta: "Tasa turística", impostaNota: "Se paga a nosotros, no está incluida en lo que ya pagaste.",
      impostaCome: "En efectivo al llegar, o ahora con:",
      impostaEsenti: "Los menores de 18 años están exentos.",
      giu: "No podemos cargar tus datos. Escríbenos por Airbnb o Booking, o por WhatsApp al {tel}.",
      scaduto: "Este enlace ya no está activo.",
      etaInGuida: "Nos has indicado que llegas a las <strong>{eta}</strong>.",
    },
    fr: {
      titolo: "Avant votre arrivée",
      sotto: "Deux choses et c'est bon. Elles nous sont demandées par la loi et pour préparer l'appartement.",
      codice: "Code d'accès", codiceNota: "Actif à partir du jour de votre arrivée.",
      eta: "À quelle heure arrivez-vous ?", etaSalva: "Enregistrer l'heure", etaOk: "Heure enregistrée",
      doc: "Pièces d'identité",
      docNota: "La loi italienne nous oblige à communiquer les données de chaque voyageur à la police.",
      docTutti: "Il nous faut la pièce d'identité de chaque personne séjournant ({n}).",
      docCarica: "Télécharger un document", docOk: "Document reçu, merci.",
      docRicevuti: "{n} reçus",
      salta: "Aller directement au guide",
      barraManca: "Vos informations manquent",
      barraApri: "Compléter",
      imposta: "Taxe de séjour", impostaNota: "À régler auprès de nous, non comprise dans ce que vous avez payé.",
      impostaCome: "En espèces à l'arrivée, ou maintenant via :",
      impostaEsenti: "Les moins de 18 ans sont exemptés.",
      giu: "Impossible de charger vos informations. Écrivez-nous sur Airbnb ou Booking, ou sur WhatsApp au {tel}.",
      scaduto: "Ce lien n'est plus actif.",
      etaInGuida: "Vous nous avez indiqué une arrivée à <strong>{eta}</strong>.",
    },
    de: {
      titolo: "Vor Ihrer Ankunft",
      sotto: "Zwei Dinge, dann sind Sie fertig. Wir brauchen sie gesetzlich und um die Wohnung vorzubereiten.",
      codice: "Zugangscode", codiceNota: "Ab Ihrem Anreisetag aktiv.",
      eta: "Wann kommen Sie an?", etaSalva: "Uhrzeit speichern", etaOk: "Uhrzeit gespeichert",
      doc: "Ausweisdokumente",
      docNota: "Das italienische Recht verpflichtet uns, die Daten jedes Gastes der Polizei zu melden.",
      docTutti: "Wir brauchen den Ausweis aller übernachtenden Personen ({n}).",
      docCarica: "Dokument hochladen", docOk: "Dokument erhalten, vielen Dank.",
      docRicevuti: "{n} erhalten",
      salta: "Direkt zum Guide",
      barraManca: "Ihre Angaben fehlen",
      barraApri: "Vervollständigen",
      imposta: "Kurtaxe", impostaNota: "An uns zu zahlen, nicht in Ihrer Zahlung enthalten.",
      impostaCome: "Bar bei Ankunft, oder jetzt über:",
      impostaEsenti: "Unter 18-Jährige sind befreit.",
      giu: "Wir können Ihre Daten nicht laden. Schreiben Sie uns über Airbnb oder Booking, oder per WhatsApp an {tel}.",
      scaduto: "Dieser Link ist nicht mehr aktiv.",
      etaInGuida: "Sie haben uns <strong>{eta}</strong> als Ankunftszeit genannt.",
    },
  };

  function t(k) { return (T[lang] || T.en)[k] || (T.en[k] || ""); }
  function fill(s, vals) {
    return String(s).replace(/\{(\w+)\}/g, function (_, k) { return vals[k] != null ? vals[k] : ""; });
  }
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "className") n.className = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k === "text") n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  // ── rete ───────────────────────────────────────────────────────────────
  function api(path, opts) {
    return fetch(API + "/api/g/" + encodeURIComponent(token) + (path || ""), opts)
      .then(function (r) { return r.json(); });
  }

  function carica() {
    return api("").then(function (d) {
      erroreRete = false;
      dati = d;
      if (d && d.lingua && T[d.lingua]) lang = d.lingua;
      return d;
    }).catch(function () { erroreRete = true; dati = null; });
  }

  // ── pezzi di UI ────────────────────────────────────────────────────────
  function bloccoCodice() {
    if (!dati.codice) return null;
    return el("div", { className: "gp-card" }, [
      el("h3", { text: t("codice") }),
      el("div", { className: "gp-code", text: dati.codice }),
      el("p", { className: "gp-note", text: t("codiceNota") }),
    ]);
  }

  function bloccoEta() {
    var msg = el("p", { className: "gp-msg", hidden: "hidden" });
    var input = el("input", { type: "time", min: "15:00", step: "900", value: dati.eta || "" });
    var btn = el("button", { className: "gp-btn", type: "button", text: t("etaSalva") });
    btn.addEventListener("click", function () {
      btn.disabled = true;
      api("/eta", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eta: input.value }),
      }).then(function (r) {
        msg.hidden = false;
        msg.className = "gp-msg " + (r.ok ? "gp-msg--ok" : "gp-msg--err");
        msg.textContent = r.message || "";
        btn.disabled = false;
        if (r.ok) carica().then(disegna);
      }).catch(function () { btn.disabled = false; });
    });
    return el("div", { className: "gp-card" }, [
      el("h3", { text: t("eta") }), msg, input, btn,
    ]);
  }

  function bloccoDocumenti() {
    var msg = el("p", { className: "gp-msg", hidden: "hidden" });
    var file = el("input", { type: "file", accept: "image/*,application/pdf" });
    var btn = el("button", { className: "gp-btn gp-btn--ghost", type: "button", text: t("docCarica") });
    btn.addEventListener("click", function () {
      if (!file.files[0]) { file.click(); return; }
      btn.disabled = true;
      var fd = new FormData(); fd.append("file", file.files[0]);
      api("/upload", { method: "POST", body: fd }).then(function (r) {
        msg.hidden = false;
        msg.className = "gp-msg " + (r.ok ? "gp-msg--ok" : "gp-msg--err");
        msg.textContent = r.ok ? t("docOk") : (r.message || "");
        file.value = ""; btn.disabled = false;
        if (r.ok) carica().then(disegna);
      }).catch(function () { btn.disabled = false; });
    });
    var kids = [el("h3", { text: t("doc") }), el("p", { className: "gp-note", text: t("docNota") })];
    if (dati.ospitiTotali) {
      kids.push(el("p", { className: "gp-note", text: fill(t("docTutti"), { n: dati.ospitiTotali }) }));
    }
    if (dati.documenti > 0) {
      kids.push(el("p", { className: "gp-ok", text: "✓ " + fill(t("docRicevuti"), { n: dati.documenti }) }));
    }
    kids.push(msg, file, btn);
    return el("div", { className: "gp-card" }, kids);
  }

  function bloccoImposta() {
    if (!dati.imposta || !dati.imposta.daPagare) return null;
    var i = dati.imposta;
    var lista = el("ul", { className: "gp-pay" });
    if (i.paypal) lista.appendChild(el("li", {
      html: "<b>PayPal</b><a href=\"" + i.paypal + "\" target=\"_blank\" rel=\"noopener\">" + i.paypal + "</a>" }));
    if (i.iban) lista.appendChild(el("li", {
      html: "<b>IBAN</b><code>" + i.iban + (i.intestatario ? " · " + i.intestatario : "") + "</code>" }));
    return el("div", { className: "gp-card gp-card--pay" }, [
      el("h3", { text: t("imposta") }),
      el("div", { className: "gp-amount", text: "€ " + i.importo.toFixed(2).replace(".", ",") }),
      el("p", { className: "gp-note", text: t("impostaNota") }),
      el("p", { className: "gp-note", text: t("impostaCome") }),
      lista,
      el("p", { className: "gp-note", text: t("impostaEsenti") }),
    ]);
  }

  // ── stati ──────────────────────────────────────────────────────────────
  function overlay() {
    var kids = [
      el("h2", { text: t("titolo") }),
      el("p", { className: "gp-lead", text: t("sotto") }),
      bloccoCodice(), bloccoEta(), bloccoDocumenti(), bloccoImposta(),
    ];
    var salta = el("button", { className: "gp-skip", type: "button", text: t("salta") });
    salta.addEventListener("click", function () { guidaAperta = true; disegna(); });
    kids.push(salta);
    return el("div", { className: "gp-overlay", id: "gp-overlay" },
      [el("div", { className: "gp-overlay-inner" }, kids)]);
  }

  function barra() {
    var apri = el("button", { className: "gp-bar-btn", type: "button", text: t("barraApri") });
    apri.addEventListener("click", function () { guidaAperta = false; disegna(); });
    return el("div", { className: "gp-bar", id: "gp-bar" }, [
      el("span", { text: t("barraManca") }), apri,
    ]);
  }

  function barraPagamento() {
    var i = dati.imposta;
    var apri = el("button", { className: "gp-bar-btn", type: "button", text: t("barraApri") });
    apri.addEventListener("click", function () { guidaAperta = false; disegna(); });
    return el("div", { className: "gp-bar gp-bar--pay", id: "gp-bar" }, [
      el("span", { text: t("imposta") + " · € " + i.importo.toFixed(2).replace(".", ",") }), apri,
    ]);
  }

  function bannerErrore() {
    return el("div", { className: "gp-bar gp-bar--err", id: "gp-bar" }, [
      el("span", { text: fill(t(erroreRete ? "giu" : "scaduto"), { tel: (dati && dati.telefono) || "" }) }),
    ]);
  }

  /** L'orario scelto va anche dentro la guida, nella sezione check-in: dopo aver
   *  mandato tutto l'ospite non vede più il blocco personale, ma l'informazione
   *  gli serve ancora. */
  /** Inserisce dentro la sezione check-in, prima del riquadro del check-out
   *  (che è l'ultimo elemento): il codice e l'orario riguardano l'arrivo. */
  function inserisciInCheckin(nodo, marcatore) {
    var sez = document.getElementById("checkin");
    if (!sez || sez.querySelector("." + marcatore)) return;
    var cont = sez.querySelector(".container") || sez;
    var checkoutBox = cont.querySelector(".subcard");
    if (checkoutBox) cont.insertBefore(nodo, checkoutBox);
    else cont.appendChild(nodo);
  }

  function etaNellaGuida() {
    if (!dati || !dati.eta) return;
    inserisciInCheckin(
      el("p", { className: "gp-eta-inline", html: fill(t("etaInGuida"), { eta: dati.eta }) }),
      "gp-eta-inline");
  }

  /** Il codice porta nella guida esiste SOLO con il token: la versione pubblica
   *  resta senza, come deciso. */
  function codiceNellaGuida() {
    if (!dati || !dati.codice) return;
    // Il passo "il codice ti è stato mandato su Airbnb" non ha più senso quando
    // il codice è scritto qui sopra: si toglie.
    var passo = document.querySelector('#checkin [data-code-step]');
    if (passo) passo.remove();
    inserisciInCheckin(el("div", { className: "gp-code-inline" }, [
      el("span", { text: t("codice") }),
      el("strong", { text: dati.codice }),
    ]), "gp-code-inline");
  }

  function pulisci() {
    ["gp-overlay", "gp-bar"].forEach(function (id) {
      var n = document.getElementById(id);
      if (n) n.remove();
    });
    document.body.classList.remove("gp-locked");
  }

  function disegna() {
    pulisci();
    if (!dati) { document.body.appendChild(bannerErrore()); return; }

    var incompleto = !dati.completo;
    if (incompleto && !guidaAperta) {
      document.body.appendChild(overlay());
      document.body.classList.add("gp-locked");
      return;                                  // la guida resta dietro, non serve altro
    }
    if (incompleto) document.body.appendChild(barra());
    else if (dati.imposta && dati.imposta.daPagare) document.body.appendChild(barraPagamento());

    codiceNellaGuida();
    etaNellaGuida();
  }

  // La guida si ridisegna a ogni cambio lingua: riattacchiamoci sopra.
  document.addEventListener("guide:rendered", function (e) {
    if (e.detail && e.detail.lang && T[e.detail.lang]) lang = e.detail.lang;
    if (dati || erroreRete) disegna();
  });

  document.addEventListener("DOMContentLoaded", function () {
    carica().then(disegna);
  });
})();
