/* ===== Mintaka — Cookie Consent (vanilla JS, sin dependencias) ===== */
(function () {
  "use strict";

  var COOKIE_NAME = "cookie-consent";
  var PRIVACY_URL = "aviso-de-privacidad.html";

  /* ---------- Helpers de cookies ---------- */
  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie =
      name + "=" + encodeURIComponent(value) +
      ";expires=" + d.toUTCString() +
      ";path=/;SameSite=Lax;Secure";
  }

  function getCookie(name) {
    var parts = document.cookie ? document.cookie.split("; ") : [];
    for (var i = 0; i < parts.length; i++) {
      var idx = parts[i].indexOf("=");
      var k = idx > -1 ? parts[i].slice(0, idx) : parts[i];
      if (k === name) return decodeURIComponent(parts[i].slice(idx + 1));
    }
    return null;
  }

  function deleteCookie(name) {
    document.cookie =
      name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax";
  }

  function deleteByPrefix(prefix) {
    var parts = document.cookie ? document.cookie.split("; ") : [];
    for (var i = 0; i < parts.length; i++) {
      var name = parts[i].split("=")[0];
      if (name.indexOf(prefix) === 0) deleteCookie(name);
    }
  }

  /* ---------- Lectura / escritura de preferencias ---------- */
  function readPrefs() {
    var raw = getCookie(COOKIE_NAME);
    if (!raw) return null;
    try {
      var p = JSON.parse(raw);
      if (p && typeof p === "object" && p.necessary === true) return p;
    } catch (e) {}
    return null;
  }

  function savePrefs(prefs) {
    prefs.necessary = true; // siempre activas
    setCookie(COOKIE_NAME, JSON.stringify(prefs), 365);
    applyPreferences(prefs);
  }

  /* ---------- Aplicación de preferencias ---------- */
  function applyPreferences(prefs) {
    if (!prefs.analytics) {
      deleteCookie("_ga");
      deleteCookie("_gid");
      deleteByPrefix("_ga_");
    }
    if (!prefs.marketing) {
      deleteCookie("_gcl_au");
      deleteCookie("_fbp");
      deleteCookie("_fbc");
    }
    try {
      document.dispatchEvent(
        new CustomEvent("cookie-consent-updated", { detail: prefs })
      );
    } catch (e) {}
  }

  /* ---------- Categorías ---------- */
  var CATEGORIES = [
    {
      key: "necessary",
      title: "Esenciales / Técnicas",
      desc: "Necesarias para la navegación segura, la protección de formularios (CSRF) y guardar tu consentimiento. Siempre activas.",
      locked: true,
    },
    {
      key: "preferences",
      title: "Preferencias y Funcionales",
      desc: "Recuerdan tu idioma, tema y región para personalizar tu experiencia.",
      locked: false,
    },
    {
      key: "analytics",
      title: "Medición y Analíticas",
      desc: "Nos ayudan a entender el uso del sitio (Google Analytics: _ga, _gid, _ga_*).",
      locked: false,
    },
    {
      key: "marketing",
      title: "Publicidad y Marketing",
      desc: "Permiten mostrar publicidad relevante (Google Ads: _gcl_au; Meta/Facebook Pixel: _fbp, _fbc).",
      locked: false,
    },
  ];

  /* ---------- Construcción del banner ---------- */
  function buildBanner() {
    if (document.getElementById("mk-cookie-consent")) return null;

    var wrap = document.createElement("div");
    wrap.className = "mk-cc";
    wrap.id = "mk-cookie-consent";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-label", "Preferencias de cookies");
    wrap.setAttribute("aria-live", "polite");

    var catsHtml = CATEGORIES.map(function (c) {
      var checked = c.locked ? "checked disabled" : "";
      return (
        '<div class="mk-cc-cat">' +
          '<div class="mk-cc-cat-info">' +
            '<h4 id="mk-cc-lbl-' + c.key + '">' + c.title + (c.locked ? ' <span class="mk-cc-tag">Siempre activas</span>' : "") + "</h4>" +
            "<p>" + c.desc + "</p>" +
          "</div>" +
          '<label class="mk-cc-switch">' +
            '<input type="checkbox" data-cat="' + c.key + '" aria-labelledby="mk-cc-lbl-' + c.key + '" ' + checked + ">" +
            '<span class="mk-cc-slider" aria-hidden="true"></span>' +
          "</label>" +
        "</div>"
      );
    }).join("");

    wrap.innerHTML =
      // ---- Vista principal: barra inferior ----
      '<div class="mk-cc-bar" data-view="main">' +
        '<div class="mk-cc-bar-inner">' +
          '<div class="mk-cc-text">' +
            '<span class="mk-cc-ico" aria-hidden="true"><i class="fa-solid fa-cookie-bite"></i></span>' +
            "<p><strong>Usamos cookies.</strong> Para que el sitio funcione, recordar tus preferencias, medir el tráfico y mostrar contenido relevante. Consulta nuestra <a href=\"" + PRIVACY_URL + "\">Política de privacidad</a>.</p>" +
          "</div>" +
          '<div class="mk-cc-actions">' +
            '<button type="button" class="mk-cc-btn mk-cc-btn--ghost" data-cc="reject">Rechazar opcionales</button>' +
            '<button type="button" class="mk-cc-btn mk-cc-btn--ghost" data-cc="customize">Personalizar</button>' +
            '<button type="button" class="mk-cc-btn mk-cc-btn--primary" data-cc="accept">Aceptar todas</button>' +
          "</div>" +
        "</div>" +
      "</div>" +
      // ---- Panel de personalización ----
      '<div class="mk-cc-panel" data-view="panel" hidden>' +
        '<div class="mk-cc-panel-inner">' +
          '<div class="mk-cc-head">' +
            '<span class="mk-cc-ico" aria-hidden="true"><i class="fa-solid fa-sliders"></i></span>' +
            "<h3>Personaliza tus preferencias</h3>" +
          "</div>" +
          '<div class="mk-cc-cats">' + catsHtml + "</div>" +
          '<div class="mk-cc-actions">' +
            '<button type="button" class="mk-cc-btn mk-cc-btn--ghost" data-cc="back">Atrás</button>' +
            '<button type="button" class="mk-cc-btn mk-cc-btn--primary" data-cc="save">Guardar selección</button>' +
          "</div>" +
        "</div>" +
      "</div>";

    document.body.appendChild(wrap);
    return wrap;
  }

  /* ---------- Lógica de UI ---------- */
  function init() {
    if (window.__mkCookieConsentInit) return;
    window.__mkCookieConsentInit = true;

    var saved = readPrefs();
    if (saved) {
      applyPreferences(saved); // ya consintió: aplica y no muestra banner
      return;
    }

    var el = buildBanner();
    if (!el) return;

    var main = el.querySelector('[data-view="main"]');
    var panel = el.querySelector('[data-view="panel"]');

    function show() {
      requestAnimationFrame(function () {
        el.classList.add("is-visible");
      });
    }
    function hide() {
      el.classList.remove("is-visible");
      setTimeout(function () {
        if (el && el.parentNode) el.parentNode.removeChild(el);
      }, 550);
    }
    function showPanel(on) {
      panel.hidden = !on;
      main.hidden = on;
      el.classList.toggle("mk-cc--panel-open", on);
    }
    function collectToggles() {
      var prefs = { necessary: true };
      var inputs = panel.querySelectorAll("input[data-cat]");
      for (var i = 0; i < inputs.length; i++) {
        prefs[inputs[i].getAttribute("data-cat")] = inputs[i].checked;
      }
      return prefs;
    }

    el.addEventListener("click", function (e) {
      var t = e.target.closest("[data-cc]");
      if (!t) return;
      var action = t.getAttribute("data-cc");

      if (action === "accept") {
        savePrefs({ necessary: true, preferences: true, analytics: true, marketing: true });
        hide();
      } else if (action === "reject") {
        savePrefs({ necessary: true, preferences: false, analytics: false, marketing: false });
        hide();
      } else if (action === "customize") {
        showPanel(true);
      } else if (action === "back") {
        showPanel(false);
      } else if (action === "save") {
        savePrefs(collectToggles());
        hide();
      }
    });

    setTimeout(show, 1200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Reinicio en navegación SPA/transiciones (si aplica)
  document.addEventListener("page:loaded", function () {
    window.__mkCookieConsentInit = false;
    init();
  });

  // API pública opcional
  window.MintakaCookies = {
    get: readPrefs,
    apply: applyPreferences,
    reset: function () {
      deleteCookie(COOKIE_NAME);
      window.__mkCookieConsentInit = false;
      init();
    },
  };
})();
