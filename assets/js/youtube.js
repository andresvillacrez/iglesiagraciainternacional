/* =========================================================
   Iglesia Gracia Internacional — Banner de transmisiones
   Lee assets/data/youtube.json (generado por tools/update_youtube.py)
   ========================================================= */
(function () {
  "use strict";

  var root = document.getElementById("liveBanner");
  if (!root) return;

  var config = window.IGRACIA_CONFIG || {};
  var yt = config.youtube || {};
  var channelId = yt.channelId || "UC2Y10_965PnaAntW5T4u4rg";
  var channelUrl =
    yt.channelUrl || "https://www.youtube.com/@iglesiagraciainternacional";
  var dataUrl = yt.dataUrl || "assets/data/youtube.json";
  var liveUrl = channelUrl + "/live";
  var streamsUrl = channelUrl + "/streams";

  var player = document.getElementById("livePlayer");
  var statusEl = document.getElementById("liveStatus");
  var statusText = document.getElementById("liveStatusText");
  var titleEl = document.getElementById("liveTitle");
  var metaEl = document.getElementById("liveMeta");
  var watchBtn = document.getElementById("liveWatch");
  var joinBtn = document.getElementById("liveJoin");
  var streamsLink = document.getElementById("liveStreams");
  var listEl = document.getElementById("liveList");
  var fallbackEl = document.getElementById("liveFallback");
  var fallbackImg = document.getElementById("liveFallbackImg");
  var prevBtn = document.getElementById("livePrev");
  var nextBtn = document.getElementById("liveNext");

  var canEmbed =
    window.location.protocol === "http:" ||
    window.location.protocol === "https:";
  var dataLive = false;
  var lastSignature = "";

  function thumb(id) {
    return "https://i.ytimg.com/vi/" + id + "/mqdefault.jpg";
  }

  function originParam() {
    var origin = window.location.origin;
    if (!origin || origin === "null" || origin === "file://") return "";
    return "&origin=" + encodeURIComponent(origin);
  }

  function embed(id) {
    return (
      "https://www.youtube.com/embed/" +
      id +
      "?rel=0&modestbranding=1&playsinline=1" +
      originParam()
    );
  }

  function liveEmbed() {
    return (
      "https://www.youtube.com/embed/live_stream?channel=" +
      channelId +
      "&rel=0&modestbranding=1&playsinline=1" +
      originParam()
    );
  }

  function setStatus(state, label) {
    if (statusEl) statusEl.setAttribute("data-state", state);
    if (statusText) statusText.textContent = label;
  }

  function setPlayer(src) {
    if (player) player.src = src;
  }

  function showFallback(video, isLive) {
    if (player) player.style.display = "none";
    if (!fallbackEl) return;
    fallbackEl.hidden = false;
    fallbackEl.href = isLive
      ? liveUrl
      : "https://www.youtube.com/watch?v=" + video.id;
    if (fallbackImg) fallbackImg.src = video.thumbnail || thumb(video.id);
    var label = fallbackEl.querySelector(".live-fallback__label");
    if (label) {
      label.textContent = isLive ? "Ver en vivo en YouTube" : "Ver en YouTube";
    }
  }

  function hideFallback() {
    if (player) player.style.display = "";
    if (fallbackEl) fallbackEl.hidden = true;
  }

  function updateWatch(label, href) {
    if (!watchBtn) return;
    watchBtn.href = href;
    var span = watchBtn.querySelector("[data-label]");
    if (span) span.textContent = label;
  }

  function markActive(id) {
    if (!listEl) return;
    var items = listEl.querySelectorAll(".live-item");
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var active = item.getAttribute("data-id") === id;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", active ? "true" : "false");
    }
  }

  function scrollList(dir) {
    if (!listEl) return;
    var card = listEl.querySelector(".live-item");
    var step = card ? card.getBoundingClientRect().width + 16 : 260;
    var behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
    listEl.scrollBy({ left: dir * step, behavior: behavior });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      scrollList(-1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      scrollList(1);
    });
  }

  function showVideo(video, isLive, isMostRecent) {
    if (!video || !video.id) return;

    if (canEmbed) {
      hideFallback();
      if (player) {
        player.setAttribute(
          "referrerpolicy",
          "strict-origin-when-cross-origin"
        );
      }
      setPlayer(isLive ? liveEmbed() : embed(video.id));
    } else {
      showFallback(video, isLive);
    }

    if (titleEl) {
      titleEl.textContent = video.title || "Transmisión de Iglesia Gracia";
    }

    var meta = [];
    if (isLive) meta.push("En vivo ahora");
    else if (video.published) meta.push(video.published);
    if (video.duration) meta.push(video.duration);

    if (metaEl) {
      metaEl.textContent =
        meta.join(" · ") || "Transmisión de Iglesia Gracia Internacional";
      if (!canEmbed) {
        metaEl.textContent += " · Vista local: abre en YouTube";
      }
    }

    if (isLive) {
      setStatus("live", "En vivo");
      updateWatch("Ver en vivo en YouTube", liveUrl);
    } else {
      setStatus(
        "offline",
        isMostRecent ? "Última transmisión" : "Transmisión anterior"
      );
      updateWatch("Ver en YouTube", "https://www.youtube.com/watch?v=" + video.id);
    }

    markActive(video.id);
  }

  function createItem(video, isLive, isMostRecent) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "live-item";
    button.setAttribute("data-id", video.id);
    button.setAttribute("aria-pressed", "false");
    button.setAttribute(
      "aria-label",
      (isLive ? "Ver en vivo: " : "Ver transmisión: ") + (video.title || "")
    );

    var thumbWrap = document.createElement("span");
    thumbWrap.className = "live-item__thumb";

    var img = document.createElement("img");
    img.src = video.thumbnail || thumb(video.id);
    img.alt = "";
    img.loading = "lazy";
    img.width = 320;
    img.height = 180;
    thumbWrap.appendChild(img);

    if (isLive) {
      var liveBadge = document.createElement("span");
      liveBadge.className = "live-item__live";
      liveBadge.textContent = "EN VIVO";
      thumbWrap.appendChild(liveBadge);
    } else if (video.duration) {
      var dur = document.createElement("span");
      dur.className = "live-item__duration";
      dur.textContent = video.duration;
      thumbWrap.appendChild(dur);
    }

    button.appendChild(thumbWrap);

    var title = document.createElement("span");
    title.className = "live-item__title";
    title.textContent = video.title || "Transmisión";
    button.appendChild(title);

    var meta = document.createElement("span");
    meta.className = "live-item__meta";
    meta.textContent = isLive ? "En vivo ahora" : video.published || "";
    button.appendChild(meta);

    button.addEventListener("click", function () {
      showVideo(video, isLive, isMostRecent);
      var playerWrap = document.querySelector(".live-player");
      if (playerWrap && playerWrap.scrollIntoView) {
        playerWrap.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });

    return button;
  }

  function fallback() {
    setStatus("offline", "YouTube");
    if (titleEl) titleEl.textContent = "Transmisiones de Iglesia Gracia";
    if (metaEl) {
      metaEl.textContent =
        "Visita nuestro canal para ver la transmisión en vivo o la más reciente.";
    }
    if (canEmbed) {
      setPlayer(liveEmbed());
    } else {
      if (player) player.style.display = "none";
      if (fallbackEl) {
        fallbackEl.hidden = false;
        fallbackEl.href = channelUrl;
        if (fallbackImg) fallbackImg.src = "";
        var label = fallbackEl.querySelector(".live-fallback__label");
        if (label) label.textContent = "Abrir canal de YouTube";
      }
    }
    updateWatch("Abrir canal de YouTube", channelUrl);
    if (joinBtn) joinBtn.href = liveUrl;
    if (listEl) listEl.innerHTML = "";
  }

  function render(data) {
    dataLive = !!(data && data.live && data.liveVideo && data.liveVideo.id);
    var videos = data && Array.isArray(data.videos) ? data.videos.slice(0, 8) : [];

    if (data && data.liveUrl) liveUrl = data.liveUrl;
    if (data && data.streamsUrl) streamsUrl = data.streamsUrl;
    if (joinBtn) joinBtn.href = liveUrl;
    if (streamsLink) streamsLink.href = streamsUrl;

    if (dataLive) {
      showVideo(data.liveVideo, true, false);
    } else if (videos.length) {
      showVideo(videos[0], false, true);
    } else {
      fallback();
      return;
    }

    if (!listEl) return;
    listEl.innerHTML = "";

    if (dataLive) {
      listEl.appendChild(createItem(data.liveVideo, true, false));
    }

    videos.forEach(function (video) {
      if (dataLive && video.id === data.liveVideo.id) return;
      var isMostRecent = !dataLive && videos[0] && video.id === videos[0].id;
      listEl.appendChild(createItem(video, false, isMostRecent));
    });
  }

  function signature(data) {
    if (!data) return "";
    var ids = (data.videos || [])
      .map(function (v) {
        return v.id;
      })
      .join(",");
    var liveId = data.live && data.liveVideo ? data.liveVideo.id : "";
    var liveTitle = data.live && data.liveVideo ? data.liveVideo.title : "";
    return (data.live ? "1" : "0") + "|" + liveId + "|" + liveTitle + "|" + ids;
  }

  var initialData = window.IGRACIA_YOUTUBE || null;
  if (initialData) {
    lastSignature = signature(initialData);
    render(initialData);
  }

  if (!window.fetch || !canEmbed) {
    if (!initialData) fallback();
    return;
  }

  function refresh() {
    if (document.hidden) return;
    fetch(dataUrl + "?t=" + Date.now(), { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        if (!data) return;
        var sig = signature(data);
        if (sig === lastSignature) return;
        lastSignature = sig;
        render(data);
      })
      .catch(function () {
        if (!initialData) fallback();
      });
  }

  refresh();
  window.setInterval(refresh, 60000);
})();
