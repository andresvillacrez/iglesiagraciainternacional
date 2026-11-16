/* =========================================================
   Iglesia Gracia Internacional — JavaScript principal
   ========================================================= */
(function () {
  "use strict";

  var config = window.IGRACIA_CONFIG || {};
  var church = config.church || {};
  var links = config.links || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Utilidades ---------- */
  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  function $$(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  function on(el, evt, fn, opts) {
    if (el) el.addEventListener(evt, fn, opts);
  }

  function onlyDigits(value) {
    return String(value || "").replace(/[^\d]/g, "");
  }

  /* ---------- Splash screen de bienvenida ---------- */
  var splash = document.getElementById("splash");
  if (splash) {
    var splashCfg = config.splash || {};
    var splashOnce = splashCfg.oncePerSession !== false;

    if (!splashOnce) {
      document.documentElement.classList.remove("splash-skip");
    }

    var splashSeen = document.documentElement.classList.contains("splash-skip");

    if (splashCfg.enabled === false || splashSeen) {
      if (splash.parentNode) splash.parentNode.removeChild(splash);
    } else {
      document.body.classList.add("splash-open");

      if (splashOnce) {
        try {
          sessionStorage.setItem("igracia_splash_seen", "1");
        } catch (err) {}
      }

      var splashHide = function () {
        if (!splash || splash.classList.contains("is-hidden")) return;
        splash.classList.add("is-hidden");
        document.body.classList.remove("splash-open");
        window.setTimeout(function () {
          if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
        }, 700);
      };

      var splashDuration = Number(splashCfg.duration || 2600);
      var splashTimer = window.setTimeout(
        splashHide,
        reduceMotion ? 900 : splashDuration
      );

      var splashSkipBtn = document.getElementById("splashSkip");
      if (splashSkipBtn) {
        splashSkipBtn.addEventListener("click", function () {
          window.clearTimeout(splashTimer);
          splashHide();
        });
        window.setTimeout(function () {
          splashSkipBtn.focus({ preventScroll: true });
        }, 80);
      }
    }
  }

  /* ---------- Header + navegación ---------- */
  var header = $("#siteHeader");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  var navToggle = $("#navToggle");
  var nav = $("#primaryNav");

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.classList.remove("is-active");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  }

  function openNav() {
    if (!nav || !navToggle) return;
    nav.classList.add("is-open");
    navToggle.classList.add("is-active");
    navToggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("nav-open");
  }

  on(navToggle, "click", function () {
    if (nav.classList.contains("is-open")) {
      closeNav();
    } else {
      openNav();
    }
  });

  $$(".nav a", nav).forEach(function (a) {
    on(a, "click", closeNav);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  document.addEventListener("click", function (e) {
    if (!nav || !nav.classList.contains("is-open")) return;
    if (nav.contains(e.target) || (navToggle && navToggle.contains(e.target))) return;
    closeNav();
  });

  var page = document.body.getAttribute("data-page");
  if (page) {
    $$("[data-nav]").forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("data-nav") === page);
      if (a.getAttribute("data-nav") === page) {
        a.setAttribute("aria-current", "page");
      }
    });
  }

  /* ---------- Hero: pase de diapositivas ---------- */
  var heroMedia = $("#heroMedia");
  if (heroMedia) {
    var rawSlides = heroMedia.getAttribute("data-slides");
    var slides = [];
    try {
      slides = JSON.parse(rawSlides || "[]");
    } catch (err) {
      slides = [];
    }
    if (slides.length) {
      var slideEls = slides.map(function (src, i) {
        var d = document.createElement("div");
        d.className = "hero__slide" + (i === 0 ? " is-active" : "");
        d.style.backgroundImage = 'url("' + src + '")';
        heroMedia.appendChild(d);
        return d;
      });

      if (slides.length > 1 && !reduceMotion) {
        var current = 0;
        var timer = window.setInterval(function () {
          slideEls[current].classList.remove("is-active");
          current = (current + 1) % slideEls.length;
          slideEls[current].classList.add("is-active");
        }, 6500);

        document.addEventListener("visibilitychange", function () {
          if (document.hidden) {
            window.clearInterval(timer);
          }
        });
      }
    }
  }

  /* ---------- Animaciones al hacer scroll ---------- */
  var reveals = $$(".reveal");
  var forceStatic = /(?:\?|&)noanim(?:&|=|$)/.test(window.location.search);
  if (forceStatic) {
    document.documentElement.classList.add("no-anim");
  }
  if (reveals.length) {
    if (forceStatic || !("IntersectionObserver" in window) || reduceMotion) {
      reveals.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
      );
      reveals.forEach(function (el) {
        io.observe(el);
      });
    }
  }

  /* ---------- Testimonios ---------- */
  var slider = $("[data-slider]");
  if (slider) {
    var track = $("[data-slider-track]", slider);
    var slidesT = track ? Array.prototype.slice.call(track.children) : [];
    var prevBtn = $("[data-slider-prev]", slider);
    var nextBtn = $("[data-slider-next]", slider);
    var dotsWrap = $("[data-slider-dots]", slider);
    var index = 0;
    var autoTimer = null;
    var paused = false;

    function goTo(i) {
      if (!slidesT.length) return;
      index = (i + slidesT.length) % slidesT.length;
      track.style.transform = "translateX(-" + index * 100 + "%)";
      $$(".slider__dot", dotsWrap).forEach(function (dot, di) {
        dot.classList.toggle("is-active", di === index);
        dot.setAttribute("aria-current", di === index ? "true" : "false");
      });
    }

    if (dotsWrap) {
      slidesT.forEach(function (_, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "slider__dot" + (i === 0 ? " is-active" : "");
        b.setAttribute("aria-label", "Ir al testimonio " + (i + 1));
        on(b, "click", function () {
          goTo(i);
          restart();
        });
        dotsWrap.appendChild(b);
      });
    }

    on(prevBtn, "click", function () {
      goTo(index - 1);
      restart();
    });
    on(nextBtn, "click", function () {
      goTo(index + 1);
      restart();
    });

    function start() {
      if (reduceMotion || slidesT.length < 2) return;
      autoTimer = window.setInterval(function () {
        if (!paused) goTo(index + 1);
      }, 7000);
    }

    function restart() {
      window.clearInterval(autoTimer);
      start();
    }

    on(slider, "mouseenter", function () {
      paused = true;
    });
    on(slider, "mouseleave", function () {
      paused = false;
    });
    on(slider, "focusin", function () {
      paused = true;
    });
    on(slider, "focusout", function () {
      paused = false;
    });

    slider.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        goTo(index - 1);
        restart();
      }
      if (e.key === "ArrowRight") {
        goTo(index + 1);
        restart();
      }
    });

    goTo(0);
    start();
  }

  /* ---------- Galería + lightbox ---------- */
  var galleryItems = $$(".gallery-item");
  if (galleryItems.length) {
    var lb = $("#lightbox");
    var lbImg = $("#lightboxImg");
    var lbCaption = $("#lightboxCaption");
    var lbCounter = $("#lightboxCounter");
    var lbClose = $("#lightboxClose");
    var lbPrev = $("#lightboxPrev");
    var lbNext = $("#lightboxNext");
    var lbIndex = 0;

    function openLightbox(i) {
      lbIndex = (i + galleryItems.length) % galleryItems.length;
      var item = galleryItems[lbIndex];
      var full = item.getAttribute("data-full") || item.getAttribute("href");
      var caption = item.getAttribute("data-caption") || "";
      if (lbImg) {
        lbImg.src = full;
        lbImg.alt = caption || "Imagen de la galería";
      }
      if (lbCaption) lbCaption.textContent = caption;
      if (lbCounter) lbCounter.textContent = lbIndex + 1 + " / " + galleryItems.length;
      if (lb) {
        lb.classList.add("is-open");
        lb.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        on(lbClose, "focus", function () {});
        if (lbClose) lbClose.focus();
      }
    }

    function closeLightbox() {
      if (!lb) return;
      lb.classList.remove("is-open");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (galleryItems[lbIndex]) galleryItems[lbIndex].focus();
    }

    function step(delta) {
      openLightbox(lbIndex + delta);
    }

    galleryItems.forEach(function (item, i) {
      on(item, "click", function (e) {
        e.preventDefault();
        openLightbox(i);
      });
      on(item, "keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(i);
        }
      });
    });

    on(lbClose, "click", closeLightbox);
    on(lbPrev, "click", function () {
      step(-1);
    });
    on(lbNext, "click", function () {
      step(1);
    });
    on(lb, "click", function (e) {
      if (e.target === lb) closeLightbox();
    });

    document.addEventListener("keydown", function (e) {
      if (!lb || !lb.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }

  /* ---------- Donaciones ---------- */
  var donateInput = $("#montoDonacion");
  var donateBtn = $("#donarBtn");
  if (donateInput && donateBtn) {
    var amountButtons = $$(".amount");

    amountButtons.forEach(function (btn) {
      on(btn, "click", function () {
        amountButtons.forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");
        donateInput.value = btn.getAttribute("data-amount");
        donateInput.focus();
      });
    });

    on(donateInput, "input", function () {
      amountButtons.forEach(function (b) {
        b.classList.toggle(
          "is-active",
          b.getAttribute("data-amount") === donateInput.value
        );
      });
    });

    on(donateBtn, "click", function () {
      var min = Number(links.wompiMinAmount || 1000);
      var value = Number(onlyDigits(donateInput.value));

      if (!value || value < min) {
        donateInput.focus();
        donateInput.style.borderColor = "#d63637";
        window.setTimeout(function () {
          donateInput.style.borderColor = "";
        }, 2200);
        return;
      }

      var cents = value * 100;
      var base = links.wompi || "https://checkout.wompi.co/l/WPV7eu";
      var url = base + (base.indexOf("?") > -1 ? "&" : "?") + "amount-in-cents=" + cents;
      window.open(url, "_blank", "noopener");
    });
  }

  /* ---------- Formularios ---------- */
  $$("form[data-ajax-form]").forEach(function (form) {
    var status = $(".form-status", form);
    var submitBtn = form.querySelector('[type="submit"]');

    on(form, "submit", function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var data = new FormData(form);
      var endpointKey = form.getAttribute("data-endpoint-key") || "contactEndpoint";
      var endpoint = (config.forms || {})[endpointKey] || "";
      var name = data.get("nombre") || "";

      if (status) {
        status.className = "form-status is-visible";
        status.textContent = "Enviando…";
      }
      if (submitBtn) submitBtn.disabled = true;

      if (endpoint) {
        fetch(endpoint, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: data
        })
          .then(function (res) {
            if (!res.ok) throw new Error("Error " + res.status);
            form.reset();
            if (status) {
              status.className = "form-status is-visible";
              status.textContent =
                "¡Gracias, " +
                name +
                "! Tu mensaje fue enviado. Nuestro equipo te contactará pronto.";
            }
          })
          .catch(function () {
            if (status) {
              status.className = "form-status is-visible is-error";
              status.textContent =
                "No pudimos enviar el formulario. Escríbenos por WhatsApp o al correo " +
                (church.email || "") +
                ".";
            }
          })
          .finally(function () {
            if (submitBtn) submitBtn.disabled = false;
          });
        return;
      }

      var lines = [];
      lines.push("Hola, equipo de " + (church.shortName || "Iglesia Gracia") + ".");
      lines.push("Mi nombre es: " + name);
      if (data.get("correo")) lines.push("Correo: " + data.get("correo"));
      if (data.get("telefono")) lines.push("Teléfono: " + data.get("telefono"));
      if (data.get("motivo")) lines.push("Motivo: " + data.get("motivo"));
      if (data.get("mensaje")) lines.push("Mensaje: " + data.get("mensaje"));

      var phone = onlyDigits(church.phoneTel || church.phoneDisplay || "573004129994");
      var waUrl =
        "https://wa.me/" + phone + "?text=" + encodeURIComponent(lines.join("\n"));
      window.open(waUrl, "_blank", "noopener");

      if (status) {
        status.className = "form-status is-visible";
        status.textContent =
          "Abrimos WhatsApp para que envíes tu mensaje a nuestro equipo. ¡Gracias, " +
          name +
          "!";
      }
      if (submitBtn) submitBtn.disabled = false;
    });
  });

  /* ---------- Año actual en el pie ---------- */
  $$("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- PWA / modo offline ---------- */
  if (
    "serviceWorker" in navigator &&
    /^https?:$/.test(window.location.protocol) &&
    !/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
  ) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }

  /* ---------- Chatbot (si está disponible) ---------- */
  if (window.IGRACIA_CHATBOT && typeof window.IGRACIA_CHATBOT.init === "function") {
    window.IGRACIA_CHATBOT.init(config);
  }
})();
