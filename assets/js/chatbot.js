/* =========================================================
   Iglesia Gracia Internacional — Asistente virtual
   Motor local de preguntas frecuentes + soporte para webhook.
   ========================================================= */
(function () {
  "use strict";

  var initialized = false;
  var cfg = null;
  var chat = null;
  var body = null;
  var form = null;
  var input = null;
  var typing = null;
  var sessionId =
    (window.sessionStorage && sessionStorage.getItem("igracia_chat_session")) ||
    "s_" + Math.random().toString(36).slice(2) + Date.now().toString(36);

  if (window.sessionStorage) {
    sessionStorage.setItem("igracia_chat_session", sessionId);
  }

  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function link(url, label) {
    return '<a href="' + url + '" target="_blank" rel="noopener">' + label + "</a>";
  }

  function churchInfo() {
    return (cfg && cfg.church) || {};
  }

  function links() {
    return (cfg && cfg.links) || {};
  }

  function scheduleHtml() {
    var s = churchInfo().schedule || [];
    if (!s.length) return "Consulta nuestros horarios en la página de inicio.";
    return (
      "Nuestras reuniones son:<br>" +
      s
        .map(function (item) {
          return "<strong>" + item.day + ":</strong> " + item.time + " — " + item.label;
        })
        .join("<br>")
    );
  }

  /* ---------- Intenciones ---------- */
  var intents = [
    {
      id: "horarios",
      keys: ["horario", "hora", "reunion", "reuniones", "culto", "servicio", "domingo", "miercoles", "cuando", "a que hora"],
      reply: function () {
        return (
          scheduleHtml() +
          '<div class="msg__actions"><a href="index.html#horarios">Ver horarios</a></div>'
        );
      }
    },
    {
      id: "ubicacion",
      keys: ["ubicacion", "direccion", "donde", "llego", "llegar", "mapa", "como llegar", "queda", "sede", "local"],
      reply: function () {
        var c = churchInfo();
        return (
          "Nos encontramos en <strong>" +
          (c.address || "") +
          "</strong>" +
          (c.addressNote ? ", " + c.addressNote : "") +
          "." +
          '<div class="msg__actions"><a href="' +
          (c.mapLink || "#") +
          '" target="_blank" rel="noopener">Abrir en Google Maps</a></div>'
        );
      }
    },
    {
      id: "donaciones",
      keys: ["donacion", "donar", "donaciones", "diezmo", "ofrenda", "ofrendas", "wompi", "pse", "nequi", "paypal", "contribuir", "aporte"],
      reply: function () {
        var l = links();
        return (
          "Puedes contribuir de forma segura en línea con Wompi (PSE, Nequi o tarjeta) o con PayPal desde el exterior." +
          '<div class="msg__actions"><a href="donaciones.html">Ir a donaciones</a>' +
          (l.paypal
            ? '<a href="' + l.paypal + '" target="_blank" rel="noopener">Donar con PayPal</a>'
            : "") +
          "</div>"
        );
      }
    },
    {
      id: "soy-nuevo",
      keys: ["soy nuevo", "nuevo", "primera vez", "primera visita", "visitar", "visita", "conocer", "como es"],
      reply: function () {
        return (
          "¡Nos alegra mucho que estés aquí! Si es tu primera vez, solo ven tal como eres: tendremos alabanza, adoración y una enseñanza bíblica clara y aplicable." +
          '<div class="msg__actions"><a href="soy-nuevo.html">Soy nuevo</a><a href="' +
          (links().whatsapp || "#") +
          '" target="_blank" rel="noopener">Escribir por WhatsApp</a></div>'
        );
      }
    },
    {
      id: "pastores",
      keys: ["pastor", "pastores", "deymar", "denis", "forigua", "lider", "lideres"],
      reply: function () {
        return (
          "Nuestros pastores son <strong>Deymar Pico</strong> (Pastor Principal) y <strong>Denis Andrea Forigua</strong> (Liderazgo de Mujeres y Niños)." +
          '<div class="msg__actions"><a href="index.html#pastores">Conocer a los pastores</a></div>'
        );
      }
    },
    {
      id: "fundacion",
      keys: ["fundacion", "la luz", "ips", "adicciones", "restauracion", "comunidad", "social"],
      reply: function () {
        var l = links();
        return (
          "A través de la <strong>Fundación La Luz IPS</strong> acompañamos procesos de restauración, especialmente en el área de adicciones, con apoyo espiritual y emocional." +
          '<div class="msg__actions"><a href="comunidad.html">Conocer la Fundación</a>' +
          (l.fundacion
            ? '<a href="' + l.fundacion + '" target="_blank" rel="noopener">Fundación La Luz</a>'
            : "") +
          "</div>"
        );
      }
    },
    {
      id: "contacto",
      keys: ["contacto", "contactenos", "telefono", "llamar", "correo", "email", "escribir", "numero"],
      reply: function () {
        var c = churchInfo();
        return (
          "Puedes contactarnos así:<br><strong>Teléfono / WhatsApp:</strong> " +
          (c.phoneDisplay || "") +
          "<br><strong>Correo:</strong> " +
          (c.email || "") +
          '<div class="msg__actions"><a href="contacto.html">Formulario de contacto</a></div>'
        );
      }
    },
    {
      id: "whatsapp",
      keys: ["whatsapp", "hablar con alguien", "persona", "asesor", "equipo", "humano", "ayuda"],
      reply: function () {
        return (
          "Claro, puedes hablar directamente con nuestro equipo por WhatsApp. Estarán encantados de ayudarte." +
          '<div class="msg__actions"><a href="' +
          (links().whatsapp || "#") +
          '" target="_blank" rel="noopener">Abrir WhatsApp</a></div>'
        );
      }
    },
    {
      id: "oracion",
      keys: ["oracion", "orar", "peticion", "necesito", "ayuda espiritual", "consejo"],
      reply: function () {
        return (
          "Nos encantaría orar por ti. Puedes enviarnos tu petición por WhatsApp o desde el formulario de contacto; nuestro equipo la recibirá con confianza." +
          '<div class="msg__actions"><a href="contacto.html">Enviar petición</a><a href="' +
          (links().whatsapp || "#") +
          '" target="_blank" rel="noopener">WhatsApp</a></div>'
        );
      }
    },
    {
      id: "ministerios",
      keys: ["ninos", "ninas", "mujeres", "ministerio", "ministerios", "jovenes", "familia", "instituto", "biblico", "teologia", "discipulado"],
      reply: function () {
        return (
          "Contamos con espacios de formación, discipulado y ministerios de mujeres, niños y familias. Escríbenos y con gusto te contamos cómo integrarte." +
          '<div class="msg__actions"><a href="' +
          (links().whatsapp || "#") +
          '" target="_blank" rel="noopener">Pedir información</a></div>'
        );
      }
    },
    {
      id: "saludo",
      keys: ["hola", "buenas", "buenos dias", "buenas tardes", "buenas noches", "hey", "saludos"],
      reply: function () {
        return "¡Hola! ¿En qué puedo ayudarte? Puedes preguntarme por horarios, ubicación, donaciones o tu primera visita.";
      }
    },
    {
      id: "gracias",
      keys: ["gracias", "muchas gracias", "ok gracias", "perfecto"],
      reply: function () {
        return "¡Con gusto! Si necesitas algo más, aquí estaré. Dios te bendiga.";
      }
    }
  ];

  function localReply(text) {
    var t = normalize(text);

    for (var i = 0; i < intents.length; i++) {
      var intent = intents[i];
      for (var k = 0; k < intent.keys.length; k++) {
        if (t.indexOf(intent.keys[k]) > -1) {
          return intent.reply();
        }
      }
    }

    var fallback =
      (cfg && cfg.chat && cfg.chat.fallback) ||
      "No estoy seguro de haber entendido. Puedes preguntarme por horarios, ubicación, donaciones o hablar con nuestro equipo.";
    return (
      fallback +
      '<div class="msg__actions"><a href="' +
      (links().whatsapp || "#") +
      '" target="_blank" rel="noopener">Hablar con alguien</a></div>'
    );
  }

  /* ---------- Render ---------- */
  function scrollBottom() {
    if (body) body.scrollTop = body.scrollHeight;
  }

  function addMessage(html, who) {
    if (!body) return null;
    var msg = document.createElement("div");
    msg.className = "msg msg--" + who;
    if (who === "bot") {
      msg.innerHTML = html;
    } else {
      msg.textContent = html;
    }
    body.appendChild(msg);
    scrollBottom();
    return msg;
  }

  function showTyping() {
    if (!body) return;
    if (typing) return;
    typing = document.createElement("div");
    typing.className = "chat__typing";
    typing.innerHTML = "<span></span><span></span><span></span>";
    body.appendChild(typing);
    scrollBottom();
  }

  function hideTyping() {
    if (typing && typing.parentNode) typing.parentNode.removeChild(typing);
    typing = null;
  }

  function respond(text) {
    var chatCfg = (cfg && cfg.chat) || {};

    if (chatCfg.mode === "webhook" && chatCfg.webhookUrl) {
      showTyping();
      fetch(chatCfg.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sessionId: sessionId,
          source: "igracia-web"
        })
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .then(function (data) {
          hideTyping();
          addMessage(
            data.reply || localReply(text),
            "bot"
          );
        })
        .catch(function () {
          hideTyping();
          addMessage(
            "No pude conectarme en este momento. Te dejo el acceso directo a nuestro equipo:" +
              '<div class="msg__actions"><a href="' +
              (links().whatsapp || "#") +
              '" target="_blank" rel="noopener">Hablar por WhatsApp</a></div>',
            "bot"
          );
        });
      return;
    }

    var instant =
      /(?:\?|&)noanim(?:&|=|$)/.test(window.location.search) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (instant) {
      addMessage(localReply(text), "bot");
      return;
    }

    showTyping();
    window.setTimeout(function () {
      hideTyping();
      addMessage(localReply(text), "bot");
    }, 550);
  }
  function renderQuickReplies() {
    var wrap = document.getElementById("chatQuick");
    if (!wrap) return;
    var list = (cfg && cfg.chat && cfg.chat.quickReplies) || [];
    wrap.innerHTML = "";
    list.forEach(function (label) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "quick-chip";
      b.textContent = label;
      b.addEventListener("click", function () {
        addMessage(label, "user");
        respond(label);
      });
      wrap.appendChild(b);
    });
  }

  function openChat() {
    if (!chat) return;
    chat.classList.add("is-open");
    chat.setAttribute("aria-hidden", "false");
    var toggle = document.getElementById("chatToggle");
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    window.setTimeout(function () {
      if (input) input.focus();
    }, 120);
  }

  function closeChat() {
    if (!chat) return;
    chat.classList.remove("is-open");
    chat.setAttribute("aria-hidden", "true");
    var toggle = document.getElementById("chatToggle");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  function init(config) {
    if (initialized) return;
    initialized = true;
    cfg = config || window.IGRACIA_CONFIG || {};

    chat = document.getElementById("chatWidget");
    body = document.getElementById("chatBody");
    form = document.getElementById("chatForm");
    input = document.getElementById("chatInput");

    var toggle = document.getElementById("chatToggle");
    var close = document.getElementById("chatClose");

    if (toggle) {
      toggle.addEventListener("click", function () {
        if (chat && chat.classList.contains("is-open")) closeChat();
        else openChat();
      });
    }
    if (close) close.addEventListener("click", closeChat);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeChat();
    });

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var text = input ? input.value.trim() : "";
        if (!text) return;
        addMessage(text, "user");
        if (input) input.value = "";
        respond(text);
      });
    }

    var welcome = (cfg.chat && cfg.chat.welcome) || "¡Hola! ¿En qué puedo ayudarte?";
    addMessage(welcome, "bot");
    renderQuickReplies();

    var params;
    try {
      params = new URLSearchParams(window.location.search);
    } catch (err) {
      params = null;
    }

    var preset = params ? params.get("chatq") : null;
    if (preset) {
      openChat();
      addMessage(preset, "user");
      respond(preset);
    } else if (params && params.get("chat") === "open") {
      openChat();
    }
  }

  window.IGRACIA_CHATBOT = {
    init: init,
    open: openChat,
    close: closeChat
  };
})();
