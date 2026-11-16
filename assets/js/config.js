/* =========================================================
   Iglesia Gracia Internacional - Configuración global
   Edita este archivo para cambiar datos de contacto,
   enlaces, formularios y el chatbot.
   ========================================================= */
window.IGRACIA_CONFIG = {
  church: {
    name: "Iglesia Gracia Internacional",
    shortName: "Iglesia Gracia",
    tagline: "Un Lugar Diferente",
    city: "Fusagasugá, Cundinamarca",
    address: "Cl. 2 #4-26, Fusagasugá, Colombia",
    addressNote: "Centro Comercial La Palma, segundo piso",
    phoneDisplay: "+57 300 412 9994",
    phoneTel: "+573004129994",
    email: "info@igracia.org",
    schedule: [
      { day: "Domingos", time: "10:00 a.m.", label: "Reunión General" },
      { day: "Miércoles", time: "6:30 p.m.", label: "Reunión General" }
    ],
    mapEmbed:
      "https://www.google.com/maps?q=Cl.%202%20%234-26%2C%20Fusagasug%C3%A1%2C%20Colombia&output=embed",
    mapLink:
      "https://www.google.com/maps/search/?api=1&query=Cl.%202%20%234-26%2C%20Fusagasug%C3%A1%2C%20Colombia"
  },

  /* Banner principal: el primer slide es la imagen base.
     Los siguientes son anuncios. Si dejas solo uno, no hay carrusel. */
  hero: {
    slides: [
      { image: "assets/img/comunidad-1.jpeg", label: "Comunidad" },
      { image: "assets/img/gallery-16.jpg", label: "Reunión" },
      { image: "assets/img/gallery-22.jpg", label: "Comunidad Gracia" }
    ]
  },

  links: {
    whatsapp: "https://wa.link/y4h3b3",
    instagram: "https://www.instagram.com/iglesiagraciainternacional/",
    facebook: "https://www.facebook.com/profile.php?id=100067776421680",
    fundacion: "https://www.fundacionlaluz.co/",
    mahanaim: "https://unimahanaim.org/",
    paypal: "https://www.paypal.com/donate/?hosted_button_id=6RD3JQSC83GZN",
    wompi: "https://checkout.wompi.co/l/WPV7eu",
    wompiMinAmount: 1000
  },

  /* Formularios: si dejas el endpoint vacío, el formulario abrirá
     WhatsApp con el mensaje prellenado como respaldo.
     Puedes usar Formspree, Netlify Forms, n8n, Make, etc. */
  forms: {
    contactEndpoint: "",
    prayerEndpoint: ""
  },

  /* Chatbot:
     mode: "local"  -> responde con las preguntas frecuentes locales
     mode: "webhook" -> envía cada mensaje a chat.webhookUrl y espera
                        una respuesta JSON: { "reply": "texto" } */
  chat: {
    mode: "local",
    webhookUrl: "",
    botName: "Asistente Gracia",
    welcome:
      "¡Hola! Soy el asistente virtual de Iglesia Gracia Internacional. ¿En qué puedo ayudarte?",
    fallback:
      "No estoy seguro de haber entendido. Puedes escribirme sobre horarios, ubicación, donaciones, primera visita o hablar directamente con nuestro equipo por WhatsApp.",
    whatsappLabel: "Hablar con alguien",
    quickReplies: ["Horarios", "¿Cómo llego?", "Donaciones", "Soy nuevo", "Hablar con alguien"]
  },

  /* Splash screen de bienvenida */
  splash: {
    enabled: true,
    duration: 2600,
    oncePerSession: true
  },

  /* YouTube: banner de transmisiones */
  youtube: {
    channelId: "UC2Y10_965PnaAntW5T4u4rg",
    channelUrl: "https://www.youtube.com/@iglesiagraciainternacional",
    dataUrl: "assets/data/youtube.json"
  }
};
