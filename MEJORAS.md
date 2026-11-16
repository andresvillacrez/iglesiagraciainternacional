# Revisión del código y plan de actualizaciones y mejoras

**Sitio:** Iglesia Gracia Internacional — https://www.igracia.org/
**Fecha de la revisión:** 15 de noviembre de 2026
**Alcance:** auditoría del sitio original (WordPress/Elementor), recreación estática
en HTML/CSS/JS, chatbot y proyección de mejoras.

---

## 1. Resumen ejecutivo

El sitio original es una instalación de **WordPress con el tema Hello Elementor**
y una pila amplia de plugins de Elementor. Visualmente es atractivo, pero carga
muchos recursos independientes, depende de varias librerías y expone la superficie
habitual de un WordPress (login, XML-RPC, plugins, formularios).

Se creó una **recreación estática** en HTML, CSS y JavaScript puro que conserva la
identidad visual, los textos y las fotografías, y que mejora:

- el rendimiento (menos peticiones, fuentes locales, imágenes bajo demanda);
- la mantenibilidad (un solo CSS y tres archivos JS comentados);
- la seguridad (sin base de datos, login ni plugins expuestos);
- la experiencia móvil, la accesibilidad y el SEO estructurado;
- la captación y el acompañamiento con **chatbot**, formularios y WhatsApp.

La siguiente etapa recomendada es **validar el contenido**, publicar en un hosting
estático con HTTPS y luego evolucionar hacia un modelo con **CMS headless + chatbot
con IA + eventos/sermones**, priorizando el acompañamiento real de las personas por
encima de la tecnología.

---

## 2. Diagnóstico del sitio original

### 2.1 Stack detectado en el HTML/CSS público

- Tema: **Hello Elementor**.
- Constructores y addons: **Elementor**, **Elementor Pro**, Header Footer
  Elementor, Essential Addons, Ultimate Addons, ElementsKit, Royal Elementor
  Addons, GutenKit, Sticky Header Effects.
- Formularios: **WPForms Lite**, **MetForm**, **Ninja Forms** (varios sistemas
  conviviendo).
- Social: WP Social.
- Reseñas: WP Ultimate Review.
- SEO: **Yoast SEO** (sitemap y metadatos presentes).
- Analítica: Google Site Kit.
- Otros: Popup Builder Block, Astra Pro Sites (referencia en assets).

> No todos los plugins están necesariamente activos en el frontend, pero su
> presencia en CSS/JS indica una instalación cargada. Conviene auditar plugins
> activos, licencias y actualizaciones en el panel de WordPress.

### 2.2 Rendimiento

Observaciones a partir del HTML público:

- **Decenas de hojas de estilo y scripts** separados (Elementor y addons cargan
  CSS/JS por widget y por plugin).
- Uso de **jQuery** y de varias librerías de animación/slider.
- Fuentes de **Google Fonts** solicitadas externamente (Poppins, Roboto,
  Montserrat, Lato, Playfair Display, Nunito Sans, Raleway). Muchas familias
  para un solo sitio.
- Imágenes servidas hasta **2560 px** de ancho sin `srcset`/formatos modernos.
- Video **IMG_3294.mov de ~20 MB** en formato QuickTime, poco compatible con
  navegadores y costoso en móvil.
- Animaciones de entrada en casi todas las secciones.
- Mucho HTML anidado por el constructor (DOM profundo).

**Recomendación:** medir con Lighthouse/PageSpeed Insights antes y después de
publicar, y fijar objetivos (por ejemplo, LCP < 2,5 s en móvil, CLS < 0,1).

### 2.3 SEO

Fortalezas del original:

- Yoast SEO con títulos, descripciones, Open Graph y sitemap XML.
- Buen uso de palabras clave locales (“iglesia cristiana en Fusagasugá”).
- Estructura de páginas clara.

Oportunidades:

- Datos estructurados más completos (Church, Event, Article, FAQPage).
- Contenido duplicado o de ejemplo (`Sample Page` en inglés).
- Enlaces internos y llamados a la acción más consistentes.
- Imágenes con `alt` descriptivos y nombres de archivo legibles.
- Página de contacto dedicada y textos de privacidad.

### 2.4 Accesibilidad y experiencia de usuario

- Menú y formularios funcionales, pero con dependencia de JavaScript y de
  estilos del constructor.
- Animaciones numerosas; conviene respetar `prefers-reduced-motion`.
- Contraste variable en textos sobre imágenes y en degradados.
- Faltan estados de foco visibles y etiquetas explícitas en algunos campos.
- El video y los mapas externos pueden afectar la carga y la privacidad.

### 2.5 Seguridad y operación

- WordPress expone `/wp-login.php`, `/xmlrpc.php` (respondió 403) y la superficie
  de plugins. Requiere actualizaciones, backups, WAF y monitoreo.
- El sitio original no mostraba una política de privacidad ni un aviso de cookies
  visible en el HTML revisado.
- Formularios y chatbot deben informar el tratamiento de datos (Ley 1581 de 2018
  en Colombia y normas equivalentes).

### 2.6 Contenido a validar

- **Teléfono inconsistente:** el texto muestra **+57 300 412 9994**, pero el
  enlace `tel:` apuntaba a **311 470 7918**. Hay que confirmar el número oficial.
- **Testimonios:** varios parecen textos de ejemplo; deben reemplazarse por
  historias reales con autorización.
- **Sample Page** con texto en inglés (“This is an example page…”): eliminar.
- **Horarios del instituto bíblico:** se mencionan, pero no hay detalle público.
- **Video del lugar:** convertir a MP4/WebM y comprimir antes de publicar.
- **Redes:** el topbar menciona TikTok/Twitter/LinkedIn, pero solo se enlazan
  Facebook, Instagram y WhatsApp.

---

## 3. Lo que ya se implementó en la recreación

| Área | Mejora aplicada |
|---|---|
| Arquitectura | 6 páginas HTML + 404, sin base de datos ni plugins |
| Diseño | Sistema de diseño con variables CSS, tipografía Playfair + Poppins, paleta violeta de la iglesia |
| Responsive | Menú móvil, grids fluidos, hero adaptativo y botones táctiles |
| Rendimiento | Fuentes autoalojadas, CSS/JS únicos, `loading="lazy"`, `width`/`height` en imágenes |
| SEO | Títulos y descripciones por página, Open Graph, JSON-LD `Church`, `robots.txt`, `sitemap.xml` |
| Accesibilidad | Skip link, ARIA, foco visible, `prefers-reduced-motion`, contraste cuidado |
| Chatbot | Asistente flotante con FAQ local y modo webhook configurable |
| Conversión | CTAs a WhatsApp, formulario con respaldo WhatsApp, botón flotante |
| Donaciones | Selector de montos, Wompi (PSE/Nequi/tarjeta) y PayPal internacional |
| Galería | 31 fotos con lightbox, teclado y contador |
| Formularios | Validación, estados de envío y endpoint configurable |
| PWA | Manifest, íconos y service worker con soporte offline |
| Bienvenida | Splash screen negra con logo blanco, salida automática y botón Entrar |
| Transmisiones | Banner de YouTube con estado EN VIVO, última transmisión y selector de anteriores |
| Despliegue | `_redirects`, `vercel.json` y `.htaccess` con redirecciones 301 |
| Documentación | `README.md`, `MEJORAS.md` y configuración centralizada |

---

## 4. Plan de actualizaciones y mejoras

### Fase 0 — Validación y publicación (1–2 semanas)

1. Confirmar teléfono, correo, dirección, horarios y nombres de pastores.
2. Reemplazar testimonios de ejemplo por historias reales autorizadas.
3. Revisar derechos de uso de las fotografías.
4. Probar Wompi y PayPal con montos mínimos.
5. Configurar el endpoint de formularios (Formspree/n8n/Netlify Forms) o dejar
   el respaldo por WhatsApp.
6. Publicar en Netlify/Vercel/Cloudflare con HTTPS y dominio `igracia.org`.
7. Configurar Google Search Console y enviar `sitemap.xml`.
8. Añadir política de privacidad y aviso de tratamiento de datos.

### Fase 1 — Primeros 30 días

- **Analítica:** GA4 o Plausible + Search Console + eventos de clic en WhatsApp,
  donaciones y chatbot.
- **Imágenes:** convertir a WebP/AVIF, generar `srcset` y comprimir la galería.
- **Mapa:** cargar Google Maps solo al hacer clic (fachada con dirección) para
  mejorar privacidad y rendimiento.
- **Chatbot:** revisar las preguntas reales recibidas, ampliar intenciones y
  medir cuántos casos se resuelven sin escalar a WhatsApp.
- **Contenido:** crear página de eventos y un bloque de “próximas actividades”.
- **SEO local:** ficha de Google Business Profile, reseñas y enlaces locales.
- **Accesibilidad:** auditoría con Lighthouse/axe y corrección de hallazgos.

### Fase 2 — 2 a 3 meses

- **CMS headless** para que el equipo edite sin tocar HTML:
  - Opción simple: **Decap CMS** + GitHub (edición en Markdown).
  - Opción robusta: **Sanity** o **Strapi** con vistas previas.
- **Sermones:** audio/video con reproductor, feed de podcast y playlist de
  YouTube/Spotify.
- **Eventos:** calendario, inscripción y archivo `.ics`.
- **Devocionales/blog:** contenido semanal para SEO y fidelización.
- **Newsletter:** Brevo/Mailchimp con formulario y doble confirmación.
- **Peticiones de oración:** flujo con categoría, confidencialidad y asignación
  a un líder.
- **Chatbot con IA:** conectar el webhook a un flujo con RAG sobre contenido de la
  iglesia (ver sección 5).

### Fase 3 — 6 a 12 meses

- **Área de miembros / instituto bíblico:** cursos, lecciones, progreso y
  certificados.
- **Grupos pequeños:** buscador por zona, horario y líder.
- **Voluntariado:** formularios por ministerio y agenda de servicio.
- **Donaciones recurrentes:** suscripciones con Wompi/PayPal y recibos.
- **CRM:** Planning Center, HubSpot o Airtable para seguimiento de visitantes.
- **WhatsApp Business API:** atención automatizada con handoff humano.
- **Multiidioma:** español/inglés si hay comunidad internacional.
- **App/PWA avanzada:** notificaciones push para eventos y devocionales.

### Prioridad sugerida

| Prioridad | Iniciativa | Impacto | Esfuerzo |
|---|---|---|---|
| Alta | Validar contenido y publicar con HTTPS | Alto | Bajo |
| Alta | Analítica + Search Console | Alto | Bajo |
| Alta | Optimización de imágenes | Alto | Medio |
| Alta | Endpoint de formularios y prueba de donaciones | Alto | Bajo |
| Media | Chatbot con IA y RAG | Alto | Medio |
| Media | Eventos y sermones | Alto | Medio |
| Media | CMS headless | Medio | Medio |
| Media | Newsletter y oración | Medio | Bajo |
| Baja | Área de miembros/cursos | Medio | Alto |
| Baja | Multiidioma | Medio | Alto |

---

## 5. Evolución del chatbot

### 5.1 Estado actual

- Motor local de intenciones (horarios, ubicación, donaciones, primera visita,
  pastores, Fundación La Luz, oración, contacto).
- Respuestas con enlaces y botones.
- Escalamiento a WhatsApp.
- Modo webhook listo para conectar un backend.

### 5.2 Arquitectura recomendada para IA

```text
Usuario
  │
  ▼
Widget (chatbot.js)
  │  POST { message, sessionId }
  ▼
Orquestador (n8n / Make / backend)
  │
  ├─► Base de conocimiento (FAQ, sermones, eventos, páginas)
  │      └─ Búsqueda semántica (pgvector / Pinecone / Supabase)
  │
  ├─► LLM con instrucciones y límites (OpenAI / Gemini / Claude)
  │
  ├─► Herramientas: consultar eventos, enviar oración, agendar visita
  │
  └─► Handoff a WhatsApp / correo / CRM
```

### 5.3 Buenas prácticas

- **Instrucciones claras:** el asistente representa a la iglesia; debe ser cálido,
  breve y no inventar doctrina ni datos.
- **RAG:** responder solo con contenido aprobado (FAQ, sermones, eventos).
- **Escalamiento:** ofrecer WhatsApp cuando haya crisis, temas sensibles o
  peticiones de oración.
- **Privacidad:** informar que es un asistente virtual, no pedir datos sensibles,
  limitar retención de conversaciones y permitir borrar el historial.
- **Guardrails:** no dar consejería médica/legal, no prometer resultados, no
  recaudar dinero dentro del chat.
- **Medición:** registrar intenciones (sin datos personales) para mejorar el
  contenido y detectar necesidades.
- **Idioma:** español colombiano; evaluar inglés si llegan visitantes.

### 5.4 Proveedores posibles

- **n8n/Make + OpenAI + Supabase:** control y costos bajos, buena opción inicial.
- **Botpress / Dialogflow:** flujos guiados y analítica.
- **OpenAI Assistants / Vertex AI:** RAG gestionado.
- **WhatsApp Business API (Meta/Twilio):** cuando el volumen lo justifique.

---

## 6. Otras mejoras recomendadas

- **Página de eventos** con filtros y “agregar a calendario”.
- **Sermones** con búsqueda por tema, serie y fecha.
- **Testimonios** con formulario de envío y moderación.
- **Buscador interno** (Algolia/Pagefind) cuando crezca el contenido.
- **Cookies/privacidad** con consentimiento para analítica y mapas.
- **Optimización de imágenes** automática en el pipeline de publicación.
- **Cabeceras de seguridad** (CSP, HSTS, X-Frame-Options) en el hosting.
- **Monitoreo** de disponibilidad (UptimeRobot) y backups del repositorio.
- **Accesibilidad continua:** revisar contraste, foco, textos alternativos y
  navegación por teclado en cada cambio.
- **Formularios inteligentes:** derivar según motivo (visita, oración, donaciones,
  Fundación) al área correspondiente.

---

## 7. Stack recomendado para escalar

| Necesidad | Recomendación |
|---|---|
| Sitio estático actual | HTML/CSS/JS (ya implementado) |
| Edición por no técnicos | Decap CMS o Sanity |
| Generador de sitio (opcional) | Astro o Eleventy |
| Formularios | Netlify Forms, Formspree o n8n |
| Chatbot | n8n + OpenAI + Supabase (pgvector) |
| Analítica | Plausible o GA4 con consentimiento |
| Imágenes | sharp/squoosh en el flujo de publicación |
| Hosting | Netlify, Vercel o Cloudflare Pages |
| Correo transaccional | Brevo, Resend o Amazon SES |
| CRM | Planning Center, HubSpot o Airtable |

---

## 8. Métricas para medir el éxito

- Visitas orgánicas y posiciones para “iglesia cristiana Fusagasugá”.
- Clics en WhatsApp y formularios enviados.
- Visitas a “Soy nuevo” y a “Donaciones”.
- Donaciones completadas y monto (sin almacenar datos de tarjeta).
- Conversaciones del chatbot y porcentaje resuelto sin escalar.
- Tiempo de carga (LCP/INP/CLS) y puntuación de accesibilidad.
- Suscriptores de newsletter y asistencia a eventos.

---

## 9. Checklist de lanzamiento

- [ ] Teléfono, correo y dirección confirmados.
- [ ] Testimonios reales y autorizados.
- [ ] Fotos con derechos verificados y optimizadas.
- [ ] Formularios probados (endpoint o WhatsApp).
- [ ] Wompi y PayPal probados.
- [ ] Política de privacidad y aviso de datos.
- [ ] Dominio, DNS y HTTPS configurados.
- [ ] `sitemap.xml` enviado a Search Console.
- [ ] Analítica y eventos configurados.
- [ ] Pruebas en móvil, tablet y escritorio.
- [ ] Lighthouse y accesibilidad revisados.
- [ ] Copia de seguridad y repositorio versionado.
- [ ] Responsable de actualizar contenido definido.

---

## 10. Riesgos y consideraciones

- **Contenido de ejemplo:** publicar testimonios o teléfonos incorrectos afecta
  la confianza y la reputación.
- **Dependencia de enlaces externos:** Wompi/PayPal/WhatsApp pueden cambiar; hay
  que revisarlos periódicamente.
- **Privacidad:** los formularios y el chatbot reciben datos personales; se
  requiere consentimiento, finalidad y política de tratamiento.
- **IA:** un chatbot sin límites puede responder con información incorrecta;
  mantener RAG, revisión humana y escalamiento.
- **Imágenes:** conservar originales y optimizar copias; evitar subir fotos de
  menores sin autorización.
- **Mantenimiento:** el sitio estático no se actualiza solo; asignar un
  responsable y un calendario de revisión.

---

## 11. Anexo: plugins detectados y función

| Plugin | Función | Observación |
|---|---|---|
| Elementor / Elementor Pro | Constructor visual y widgets | Núcleo del sitio; genera mucho CSS/JS |
| Hello Elementor | Tema base | Liviano, pero depende de Elementor |
| Header Footer Elementor | Plantillas de header/footer | Duplica funcionalidad de Elementor Pro |
| Essential Addons / Ultimate Addons / ElementsKit / Royal Elementor / GutenKit | Widgets y addons | Varios addons con funciones solapadas |
| Sticky Header Effects | Header fijo | Se puede resolver con CSS |
| WPForms Lite / MetForm / Ninja Forms | Formularios | Tres sistemas; conviene uno solo |
| WP Social | Iconos/enlaces sociales | Se puede resolver con HTML/SVG |
| WP Ultimate Review | Reseñas | Evaluar si se usa |
| Yoast SEO | SEO, sitemap, Open Graph | Mantener; buena base |
| Google Site Kit | Analítica/Search Console | Útil con consentimiento |
| Popup Builder Block | Popups | Usar con moderación |
| Astra Pro Sites | Plantillas/preview | Verificar si está activo |

---

**Conclusión:** la recreación deja una base rápida, segura y fácil de mantener.
El mayor valor a corto plazo está en **validar el contenido, publicar con HTTPS,
medir y activar el acompañamiento (chatbot/WhatsApp/formularios)**. Después, el
crecimiento vendrá de **eventos, sermones, newsletter y un CMS** que permita al
equipo de la iglesia publicar sin depender de un desarrollador.
