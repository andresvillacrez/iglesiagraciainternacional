# Iglesia Gracia Internacional — Sitio web (HTML/CSS/JS)

Recreación estática, moderna y autocontenida del sitio **https://www.igracia.org/**.
Está construida en HTML, CSS y JavaScript puro (sin WordPress ni dependencias de
compilación), lista para publicarse en cualquier hosting estático.

**Demo en vivo (GitHub Pages):**
https://andresvillacrez.github.io/iglesiagraciainternacional/

> **Importante:** las imágenes, logos y textos provienen del sitio público de la
> iglesia y se conservan aquí como material de la propia iglesia. Verifica y
> autoriza su uso antes de publicar. Revisa también `MEJORAS.md` para el plan de
> actualizaciones y la lista de contenidos que conviene validar.

---

## 1. Qué incluye

| Página | Archivo | Descripción |
|---|---|---|
| Inicio | `index.html` | Hero, bienvenida, quiénes somos, pastores, testimonios, horarios, mapa y donaciones |
| Soy nuevo | `soy-nuevo.html` | Primera visita, preguntas frecuentes y pasos para comenzar |
| Galería | `galeria.html` | 31 fotos con visor (lightbox) y navegación por teclado |
| Donaciones | `donaciones.html` | Montos, Wompi (PSE/Nequi/tarjeta) y PayPal internacional |
| Fundación La Luz | `comunidad.html` | Labor social y apoyo terapéutico/espiritual |
| Contáctenos | `contacto.html` | Datos, formulario, WhatsApp y mapa |
| 404 | `404.html` | Página de error con accesos rápidos |

Además:

- **Chatbot** flotante con respuestas locales de preguntas frecuentes y modo
  webhook para conectarlo a IA/automatización.
- **Diseño responsive** con menú móvil, animaciones al hacer scroll y modo
  `prefers-reduced-motion`.
- **PWA** con `manifest.webmanifest` y `sw.js` (instalable y con soporte offline
  al publicarse por HTTPS).
- **Fuentes autoalojadas** (Poppins y Playfair Display) en `assets/fonts/`.
- **SEO** con metadatos, Open Graph, JSON-LD de tipo `Church`, `robots.txt` y
  `sitemap.xml`.
- **Formularios** con validación y respaldo por WhatsApp (o endpoint propio).
- **Accesibilidad**: enlaces de salto, etiquetas ARIA, foco visible y contraste.

---

## 2. Estructura

```text
PAGINA WEB/
├─ index.html
├─ soy-nuevo.html
├─ galeria.html
├─ donaciones.html
├─ comunidad.html
├─ contacto.html
├─ 404.html
├─ manifest.webmanifest
├─ sw.js
├─ robots.txt
├─ sitemap.xml
├─ _redirects                 # Netlify / Cloudflare Pages
├─ vercel.json                # Vercel
├─ .htaccess                  # Apache / cPanel
└─ assets/
   ├─ css/
   │  ├─ styles.css           # Diseño y componentes
   │  └─ fonts.css            # @font-face de las fuentes locales
   ├─ js/
   │  ├─ config.js            # ⚙️ Datos de contacto, enlaces, formularios y chatbot
   │  ├─ main.js              # Navegación, sliders, galería, donaciones, formularios
   │  └─ chatbot.js           # Asistente virtual (FAQ local + webhook)
   ├─ fonts/                  # Poppins y Playfair Display (woff2)
   └─ img/                    # Logos, fotos de pastores y galería
```

---

## 3. Ver el sitio en local

No abras los archivos con doble clic si puedes evitarlo: algunos navegadores
restringen funciones (service worker, fuentes, fetch). Usa un servidor local:

```powershell
cd "D:\En tu casa Drive\Iglesia Gracia Internacional\PAGINA WEB"
python -m http.server 8000
```

Luego abre: http://localhost:8000

También puedes usar la extensión **Live Server** de VS Code.

> Si necesitas revisar el diseño sin animaciones de entrada añade `?noanim` a la
> URL, por ejemplo: `http://localhost:8000/index.html?noanim`.

---

## 4. Configuración rápida

Casi todo lo editable está en **`assets/js/config.js`**:

```js
church: {
  phoneDisplay: "+57 300 412 9994",
  email: "info@igracia.org",
  address: "Cl. 2 #4-26, Fusagasugá, Colombia",
  schedule: [ ... ]
},
links: {
  whatsapp: "https://wa.link/y4h3b3",
  instagram: "...",
  facebook: "...",
  paypal: "https://www.paypal.com/donate/?hosted_button_id=6RD3JQSC83GZN",
  wompi: "https://checkout.wompi.co/l/WPV7eu"
},
forms: {
  contactEndpoint: "",   // déjalo vacío para usar WhatsApp como respaldo
  prayerEndpoint: ""
},
chat: {
  mode: "local",         // "local" o "webhook"
  webhookUrl: ""
}
```

Después de cambiar datos de contacto, actualiza también el texto visible de las
páginas (header, footer, contacto y JSON-LD) si aplica.

### 4.1 Chatbot

- **Modo local (por defecto):** responde sobre horarios, ubicación, donaciones,
  primera visita, pastores, Fundación La Luz, oración y contacto. Los textos y
  las respuestas están en `assets/js/chatbot.js`.
- **Modo webhook:** cambia `chat.mode` a `"webhook"` y define `chat.webhookUrl`.
  El sitio enviará:

  ```json
  { "message": "texto del usuario", "sessionId": "s_...", "source": "igracia-web" }
  ```

  y espera una respuesta JSON:

  ```json
  { "reply": "respuesta en HTML o texto" }
  ```

  Puedes conectar este webhook a n8n, Make, Botpress, Dialogflow, OpenAI
  Assistants o un backend propio. Recomendaciones y plan de evolución en
  `MEJORAS.md`.

- **Enlaces directos al asistente:** `index.html?chat=open` abre el chat y
  `index.html?chatq=horarios` lo abre y envía la pregunta. Útil para códigos QR
  o botones externos.

### 4.2 Formularios

- Si `forms.contactEndpoint` está vacío, el formulario abre **WhatsApp** con el
  mensaje ya escrito (respaldo inmediato, sin backend).
- Si defines un endpoint (Formspree, Netlify Forms, n8n, Make, API propia), se
  envía por `POST` con `FormData`.
- Para Netlify Forms añade `data-netlify="true"` al `<form>` y el campo oculto
  `form-name`; consulta la documentación de Netlify.

### 4.3 Donaciones

- **Wompi:** el monto se convierte a centavos y se abre el link configurado en
  `links.wompi`, igual que en el sitio original.
- **PayPal:** enlace directo configurado en `links.paypal`.
- Prueba ambos flujos con montos pequeños antes de publicar.

### 4.4 Galería

Las imágenes están en `assets/img/gallery-01…31`. Para cambiar una foto:
1. Reemplaza el archivo manteniendo el nombre, o
2. Edita el bloque `.gallery-grid` en `galeria.html` (cada ítem tiene `href`,
   `data-full`, `data-caption`, `alt`, `width` y `height`).

Optimiza las imágenes (WebP/AVIF, máx. ~1600 px) antes de subirlas para mantener
el rendimiento.

### 4.5 Splash screen

La pantalla de bienvenida a pantalla completa se configura en
`assets/js/config.js`:

```js
splash: {
  enabled: true,
  duration: 2600,        // milisegundos antes de ocultarse
  oncePerSession: true   // true: una vez por sesión; false: en cada carga
}
```

- Fondo negro y logo blanco: `assets/img/logo-splash.png`.
- Se oculta sola y también con el botón **Entrar**.
- Respeta `prefers-reduced-motion` (se oculta más rápido).
- Para desactivarla: `enabled: false`.
- Si cambias el logo, reemplaza `logo-splash.png` manteniendo fondo transparente
  y letras blancas.

### 4.6 Banner de transmisiones de YouTube

La página de inicio incluye un banner que muestra:

- La transmisión **EN VIVO** cuando el canal está transmitiendo.
- Si no hay transmisión, la **última transmisión** disponible.
- Un selector con las transmisiones anteriores.

Configuración y datos:

- `assets/js/config.js` → `youtube` (`channelId`, `channelUrl`, `dataUrl`).
- `assets/data/youtube.json` y `assets/data/youtube.js` → estado y listado de
  transmisiones (el `.js` permite que el banner funcione al abrir el HTML
  directamente).
- Actualización manual:

  ```powershell
  python tools/update_youtube.py
  ```

- En GitHub Pages, `.github/workflows/pages.yml` ejecuta el script antes de
  desplegar y también **cada 20 minutos**. Si YouTube no responde, se conserva
  el último JSON y el sitio sigue funcionando.
- La detección de “EN VIVO” usa `isLiveNow`; el campo `isLive` no basta porque
  también aparece en repeticiones y transmisiones programadas.
- El botón **Ver en vivo** abre directamente
  `https://www.youtube.com/@iglesiagraciainternacional/live`, por lo que siempre
  lleva al estado real del canal.
- Para cambiar de canal, actualiza `channelId`/`channelUrl` en `config.js` y las
  constantes `HANDLE`/`CHANNEL_ID` en `tools/update_youtube.py`.

> **Error 153 / el video no reproduce:** ocurre cuando el HTML se abre con doble
> clic (`file://`) o cuando YouTube no recibe un referer válido. Para probar el
> reproductor usa un servidor local (`python -m http.server`). Si aun así no
> carga, el banner muestra una portada con enlace directo a YouTube y el botón
> **Ver en YouTube**.

---

## 5. Publicación

El sitio es 100 % estático. Opciones recomendadas:

### Netlify / Cloudflare Pages
1. Arrastra la carpeta `PAGINA WEB` a Netlify Drop, o conecta el repositorio.
2. `_redirects` ya redirige las URLs antiguas de WordPress a las nuevas `.html`.
3. Configura el dominio `igracia.org` y activa HTTPS.

### Vercel
1. Importa el proyecto.
2. `vercel.json` incluye redirecciones 301 y cabeceras de caché/seguridad.
3. Asigna el dominio en el panel de Vercel.

### GitHub Pages (ya configurado)
El sitio ya está publicado en:

- https://andresvillacrez.github.io/iglesiagraciainternacional/

El repositorio incluye `.github/workflows/pages.yml`, que despliega
automáticamente en cada push a `main`. La primera vez se habilitó Pages con
origen **GitHub Actions**.

Para usar el dominio propio `www.igracia.org`:
1. En GitHub → **Settings → Pages → Custom domain**, escribe `www.igracia.org`.
2. En el proveedor de DNS crea un `CNAME` para `www` apuntando a
   `andresvillacrez.github.io`.
3. Activa **Enforce HTTPS**.
4. Si quieres que el dominio raíz (`igracia.org`) también funcione, configura
   los registros `A` de GitHub Pages y una redirección hacia `www`.

> Mientras no se configure el dominio propio, el sitio funciona en la URL de
> GitHub Pages. Los metadatos `canonical` y `og:image` apuntan a
> `https://www.igracia.org/`, que es el destino final previsto.

### Apache / cPanel
1. Sube todo el contenido a `public_html`.
2. Conserva `.htaccess` para redirecciones, compresión y caché.

> **URLs:** el sitio usa enlaces `.html` para funcionar también al abrirlo desde
> una carpeta local y en cualquier subdirectorio. Las URLs antiguas de WordPress
> (`/soy-nuevo/`, `/galeria/`, etc.) se redirigen con 301.

---

## 6. PWA y modo offline

- `manifest.webmanifest` permite instalar el sitio como aplicación.
- `sw.js` cachea páginas y recursos. Al publicar cambios importantes, cambia
  `CACHE_VERSION` en `sw.js` (por ejemplo `igracia-v2`) para invalidar la caché.
- El service worker solo se registra en HTTPS y no en `localhost` (para no
  interferir durante el desarrollo).
- Los íconos están en `assets/img/icon-192.png`, `icon-512.png` y
  `apple-touch-icon.png`.

---

## 7. Mantenimiento recomendado

- Revisar enlaces y formularios una vez al mes.
- Actualizar fotos y eventos de la galería.
- Verificar que los enlaces de Wompi y PayPal sigan activos.
- Revisar `MEJORAS.md` para el plan de crecimiento.
- Analizar métricas (GA4, Plausible o Search Console) y accesibilidad.
- Guardar copia de seguridad de esta carpeta antes de cambios grandes.

---

## 8. Créditos y licencias

- Contenido, nombres, logos y fotografías: **Iglesia Gracia Internacional**.
- Tipografías: **Poppins** y **Playfair Display** (Google Fonts, licencia SIL
  Open Font License), autoalojadas en `assets/fonts/`.
- Iconos: SVG propios inspirados en formas estándar.
- Código de la recreación: libre para uso de la iglesia; revisa las licencias de
  las fuentes y de cualquier recurso externo que agregues.

---

## 9. Notas de contenido a validar

Antes de publicar, confirma con la iglesia:

- Número de teléfono correcto (el sitio original mezclaba `311 470 7918` en el
  enlace `tel:` y `+57 300 412 9994` en el texto).
- Testimonios: el sitio original incluía testimonios que parecen de ejemplo;
  conviene reemplazarlos por historias reales con autorización.
- Horarios y direcciones exactas, incluyendo el instituto bíblico.
- Enlaces de donación (Wompi/PayPal) y su vigencia.
- Política de privacidad y tratamiento de datos (Ley 1581 de Colombia) para los
  formularios y el chatbot.

---

## 10. Changelog

- **2026-11-15** — Recreación estática completa, chatbot, formularios, PWA,
  fuentes locales, SEO, redirecciones y documentación.
