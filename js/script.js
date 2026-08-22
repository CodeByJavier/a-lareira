/**
 * A LAREIRA — RESTAURANTE
 * JavaScript modular en vanilla JS (sin dependencias), siguiendo el mismo
 * patrón de las plantillas anteriores: cada función "init..." es
 * independiente y se ejecuta mediante safeRun(), así que si un módulo
 * falla el resto de la página sigue funcionando.
 *
 * Esta plantilla no usa galería con filtros, carrusel de testimonios ni
 * acordeón de FAQ (los testimonios se muestran en una rejilla estática),
 * así que esos módulos no están aquí. El formulario esta vez es de
 * reserva de mesa (nombre, teléfono, fecha, hora y comensales).
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    safeRun(setFooterYear);
    safeRun(initHeaderScroll);
    safeRun(initMobileNav);
    safeRun(initScrollReveal);
    safeRun(initReservationForm);
    safeRun(initBackToTop);
  }

  /** Ejecuta una función capturando cualquier error para no romper el resto de módulos. */
  function safeRun(fn) {
    try {
      fn();
    } catch (error) {
      console.error("[ALareira] Error en " + fn.name + ":", error);
    }
  }

  /* ---------------------------------------------------------------------
   * Año dinámico en el footer
   * ------------------------------------------------------------------- */
  function setFooterYear() {
    var year = new Date().getFullYear();
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = year;
    });
  }

  /* ---------------------------------------------------------------------
   * Cabecera: transparente sobre el hero, sólida al hacer scroll.
   * Sin backdrop-filter, así que no interfiere con el menú móvil (fixed).
   * ------------------------------------------------------------------- */
  function initHeaderScroll() {
    var header = document.getElementById("header");
    if (!header) return;

    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 10);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------------------------------------------------------------
   * Menú móvil (hamburguesa + backdrop + cierre con Escape)
   * ------------------------------------------------------------------- */
  function initMobileNav() {
    var toggle = document.getElementById("navToggle");
    var nav = document.getElementById("nav");
    var backdrop = document.getElementById("navBackdrop");
    if (!toggle || !nav || !backdrop) return;

    var iconUse = toggle.querySelector("use");

    function openNav() {
      nav.classList.add("is-open");
      backdrop.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      if (iconUse) iconUse.setAttribute("href", "#icon-close");
    }

    function closeNav() {
      nav.classList.remove("is-open");
      backdrop.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      if (iconUse) iconUse.setAttribute("href", "#icon-menu");
    }

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.contains("is-open");
      isOpen ? closeNav() : openNav();
    });

    backdrop.addEventListener("click", closeNav);

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });
  }

  /* ---------------------------------------------------------------------
   * Animaciones de aparición al hacer scroll (IntersectionObserver)
   * ------------------------------------------------------------------- */
  function initScrollReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    items.forEach(function (item) {
      var delay = item.getAttribute("data-reveal-delay");
      if (delay) item.style.setProperty("--reveal-delay", delay + "ms");
    });

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  /* ---------------------------------------------------------------------
   * Formulario de reserva: validación en tiempo real + envío simulado
   * con estados de carga, éxito y error.
   * ------------------------------------------------------------------- */
  function initReservationForm() {
    var form = document.getElementById("reservationForm");
    if (!form) return;

    var submitBtn = document.getElementById("submitBtn");
    var spinner = form.querySelector("[data-submit-spinner]");
    var btnLabel = submitBtn ? submitBtn.querySelector(".btn__label") : null;
    var statusBox = form.querySelector("[data-form-status]");

    function isFutureDate(value) {
      if (!value) return false;
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var selected = new Date(value + "T00:00:00");
      return selected.getTime() >= today.getTime();
    }

    var validators = {
      name: function (value) {
        return value.trim().length >= 2 ? "" : "Introduce tu nombre completo.";
      },
      phone: function (value) {
        return /^[+]?[\d\s]{9,15}$/.test(value.trim()) ? "" : "Introduce un teléfono válido.";
      },
      date: function (value) {
        if (!value) return "Selecciona una fecha.";
        return isFutureDate(value) ? "" : "Elige una fecha a partir de hoy.";
      },
      time: function (value) {
        return value ? "" : "Selecciona una hora.";
      },
      guests: function (value) {
        return value ? "" : "Indica cuántos vais a ser.";
      },
    };

    function getFieldWrapper(input) {
      return input.closest(".field");
    }

    function getErrorEl(name) {
      return form.querySelector('[data-error-for="' + name + '"]');
    }

    function validateField(input) {
      var validator = validators[input.name];
      if (!validator) return true;

      var message = validator(input.value, input);
      var wrapper = getFieldWrapper(input);
      var errorEl = getErrorEl(input.name);

      if (message) {
        if (wrapper) wrapper.classList.add("has-error");
        if (errorEl) errorEl.textContent = message;
        return false;
      }

      if (wrapper) wrapper.classList.remove("has-error");
      if (errorEl) errorEl.textContent = "";
      return true;
    }

    var trackedFields = Array.prototype.filter.call(form.elements, function (el) {
      return el.name && validators[el.name];
    });

    trackedFields.forEach(function (input) {
      var eventName = input.tagName === "SELECT" || input.type === "date" || input.type === "time" ? "change" : "blur";
      input.addEventListener(eventName, function () {
        validateField(input);
      });
      input.addEventListener("input", function () {
        var wrapper = getFieldWrapper(input);
        if (wrapper && wrapper.classList.contains("has-error")) validateField(input);
      });
    });

    function showStatus(state, message) {
      if (!statusBox) return;
      statusBox.hidden = false;
      statusBox.setAttribute("data-state", state);
      statusBox.textContent = message;
    }

    function hideStatus() {
      if (!statusBox) return;
      statusBox.hidden = true;
      statusBox.removeAttribute("data-state");
    }

    function setLoading(isLoading) {
      if (submitBtn) submitBtn.disabled = isLoading;
      if (spinner) spinner.hidden = !isLoading;
      if (btnLabel) btnLabel.textContent = isLoading ? "Enviando..." : "Solicitar reserva";
    }

    /**
     * Simula el envío de la reserva a un servidor.
     * Sustituye esta función por una llamada real, por ejemplo:
     *   fetch('/api/reservas', { method: 'POST', body: JSON.stringify(payload) })
     * En la demo, hay un 12% de probabilidad de fallo para poder ver el estado de error.
     */
    function submitReservation(payload) {
      return new Promise(function (resolve, reject) {
        window.setTimeout(function () {
          if (Math.random() < 0.88) {
            resolve({ ok: true, payload: payload });
          } else {
            reject(new Error("No se ha podido enviar la reserva. Prueba de nuevo o llámanos al 981 123 456."));
          }
        }, 1100);
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      hideStatus();

      var results = trackedFields.map(validateField);
      var isValid = results.every(Boolean);

      if (!isValid) {
        showStatus("error", "Revisa los campos marcados antes de enviar la reserva.");
        var firstInvalid = form.querySelector(".has-error input, .has-error select, .has-error textarea");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var payload = {};
      new FormData(form).forEach(function (value, key) {
        payload[key] = value;
      });

      setLoading(true);

      submitReservation(payload)
        .then(function () {
          showStatus("success", "¡Gracias! Hemos recibido tu solicitud y te confirmaremos la reserva por teléfono en menos de 24h.");
          form.reset();
          trackedFields.forEach(function (input) {
            var wrapper = getFieldWrapper(input);
            if (wrapper) wrapper.classList.remove("has-error");
          });
        })
        .catch(function (error) {
          showStatus("error", error && error.message ? error.message : "Ha ocurrido un error inesperado. Vuelve a intentarlo.");
        })
        .finally(function () {
          setLoading(false);
        });
    });
  }

  /* ---------------------------------------------------------------------
   * Botón "volver arriba"
   * ------------------------------------------------------------------- */
  function initBackToTop() {
    var button = document.getElementById("backToTop");
    if (!button) return;

    var onScroll = function () {
      button.hidden = window.scrollY < 500;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
