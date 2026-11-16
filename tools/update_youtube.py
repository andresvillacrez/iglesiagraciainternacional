#!/usr/bin/env python3
"""Actualiza assets/data/youtube.json con el estado en vivo y las
transmisiones recientes del canal de Iglesia Gracia Internacional.

Uso:
    python tools/update_youtube.py

No requiere API key: lee las páginas públicas de YouTube.
"""
import json
import os
import re
import sys
import urllib.request
from datetime import datetime, timezone
from html import unescape

HANDLE = "@iglesiagraciainternacional"
CHANNEL_ID = "UC2Y10_965PnaAntW5T4u4rg"
CHANNEL_URL = "https://www.youtube.com/" + HANDLE
LIVE_URL = CHANNEL_URL + "/live"
STREAMS_URL = CHANNEL_URL + "/streams"
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE_DIR, "assets", "data", "youtube.json")
OUT_JS = os.path.join(BASE_DIR, "assets", "data", "youtube.js")
MAX_VIDEOS = 12


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "es-CO,es;q=0.9"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8", errors="replace")


def text_of(obj):
    if isinstance(obj, str):
        return obj
    if isinstance(obj, dict):
        if "content" in obj and isinstance(obj["content"], str):
            return obj["content"]
        if "simpleText" in obj:
            return obj["simpleText"]
        if "runs" in obj:
            return "".join(r.get("text", "") for r in obj["runs"])
    return ""


def parse_live(html):
    video_id = None
    title = None

    m = re.search(r'<link rel="canonical" href="https://www\.youtube\.com/watch\?v=([A-Za-z0-9_-]{11})"', html)
    if m:
        video_id = m.group(1)

    m = re.search(r'<meta property="og:title" content="([^"]+)"', html)
    if m:
        title = unescape(m.group(1))

    # isLiveNow solo es true durante una emisión activa. isLive también
    # aparece en repeticiones y transmisiones programadas, por eso no basta.
    m = re.search(r'"isLiveNow":(true|false)', html)
    is_live_now = bool(m and m.group(1) == "true")

    m = re.search(r'"playabilityStatus":\{"status":"([^"]+)"', html)
    status = m.group(1) if m else ""
    live = is_live_now and status not in ("LIVE_STREAM_OFFLINE", "UNPLAYABLE", "ERROR")

    return {
        "live": live,
        "video": {"id": video_id, "title": title, "thumbnail": thumb(video_id)} if video_id and live else None,
    }


def parse_streams(html):
    data = None
    m = re.search(r'<script[^>]*id="yt-initial-data"[^>]*>(.*?)</script>', html, re.S)
    if m:
        data = json.loads(m.group(1))
    if data is None:
        m = re.search(r"var ytInitialData = (\{.*?\});</script>", html, re.S)
        if m:
            data = json.loads(m.group(1))
    if data is None:
        m = re.search(r'ytInitialData"\]\s*=\s*(\{.*?\});', html, re.S)
        if m:
            data = json.loads(m.group(1))
    if data is None:
        raise RuntimeError("No se encontró ytInitialData en la página de transmisiones")

    locks = []

    def walk(node):
        if isinstance(node, dict):
            if "lockupViewModel" in node:
                locks.append(node["lockupViewModel"])
            for v in node.values():
                walk(v)
        elif isinstance(node, list):
            for v in node:
                walk(v)

    walk(data)

    videos = []
    seen = set()
    for lock in locks:
        vid = lock.get("contentId")
        if not vid or vid in seen:
            continue

        meta = lock.get("metadata", {}).get("lockupMetadataViewModel", {})
        title = text_of(meta.get("title", {}))
        if not title:
            continue

        views = ""
        published = ""
        cm = meta.get("metadata", {}).get("contentMetadataViewModel", {})
        for row in cm.get("metadataRows", []):
            for part in row.get("metadataParts", []):
                label = part.get("accessibilityLabel", "")
                content = text_of(part.get("text", {}))
                if "vista" in label.lower():
                    views = label
                elif "transmitido" in label.lower() or "emitido" in label.lower() or "hace" in content.lower():
                    published = label or content

        img = lock.get("contentImage", {}).get("thumbnailViewModel", {})
        duration = ""
        for ov in img.get("overlays", []):
            for vendor in ov.values():
                if not isinstance(vendor, dict):
                    continue
                for badge in vendor.get("badges", []):
                    tb = badge.get("thumbnailBadgeViewModel", {})
                    text = tb.get("text", "")
                    if re.match(r"^\d+:\d+", text):
                        duration = text

        seen.add(vid)
        videos.append(
            {
                "id": vid,
                "title": title,
                "duration": duration,
                "published": published,
                "views": views,
                "thumbnail": thumb(vid),
            }
        )
        if len(videos) >= MAX_VIDEOS:
            break

    return videos


def thumb(video_id):
    return "https://i.ytimg.com/vi/" + video_id + "/mqdefault.jpg"


def main():
    try:
        live_html = fetch(LIVE_URL)
        live_info = parse_live(live_html)
    except Exception as e:
        print("Aviso: no se pudo consultar /live:", e, file=sys.stderr)
        live_info = {"live": False, "video": None}

    try:
        streams_html = fetch(STREAMS_URL)
        videos = parse_streams(streams_html)
    except Exception as e:
        print("Error: no se pudieron leer las transmisiones:", e, file=sys.stderr)
        return 1

    data = {
        "channelId": CHANNEL_ID,
        "channelUrl": CHANNEL_URL,
        "liveUrl": LIVE_URL,
        "streamsUrl": STREAMS_URL,
        "checkedAt": datetime.now(timezone.utc).isoformat(),
        "live": bool(live_info.get("live")),
        "liveVideo": live_info.get("video"),
        "videos": videos,
    }

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    # Copia como JS para que el banner funcione incluso al abrir el HTML
    # directamente (file://), donde fetch() está bloqueado por CORS.
    with open(OUT_JS, "w", encoding="utf-8") as f:
        f.write("window.IGRACIA_YOUTUBE = ")
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    print("OK:", OUT)
    print("OK:", OUT_JS)
    print("live:", data["live"], "| videos:", len(videos))
    if data["liveVideo"]:
        print("live video:", data["liveVideo"]["id"], "-", data["liveVideo"]["title"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
