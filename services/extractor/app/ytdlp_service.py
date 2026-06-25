from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

import yt_dlp


def _utc_iso(offset_seconds: int = 3600) -> str:
    return (
        datetime.now(timezone.utc) + timedelta(seconds=offset_seconds)
    ).isoformat()


def _base_opts(**extra: Any) -> dict[str, Any]:
    return {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        **extra,
    }


def _map_artists(info: dict[str, Any]) -> list[dict[str, str | None]]:
    artist = info.get("artist") or info.get("uploader") or info.get("channel")
    if artist:
        return [{"id": None, "name": str(artist)}]
    return [{"id": None, "name": "Unknown Artist"}]


def _map_track(info: dict[str, Any]) -> dict[str, Any]:
    video_id = info.get("id") or ""
    webpage_url = info.get("webpage_url") or info.get("original_url") or ""
    thumbnail = info.get("thumbnail")
    duration = info.get("duration")

    return {
        "id": video_id,
        "provider": "youtube",
        "title": info.get("title") or "Unknown Title",
        "artists": _map_artists(info),
        "album": None,
        "artwork_url": thumbnail,
        "duration_ms": int(duration * 1000) if duration else None,
        "is_video": info.get("vcodec") not in (None, "none"),
        "url": webpage_url,
    }


def _pick_format(info: dict[str, Any], prefer_video: bool = False) -> dict[str, Any] | None:
    formats = info.get("formats") or []
    candidates = [f for f in formats if f.get("url")]

    if not candidates and info.get("url"):
        return {"url": info["url"], "ext": info.get("ext"), "abr": None, "vcodec": info.get("vcodec")}

    if prefer_video:
        video_formats = [f for f in candidates if f.get("vcodec") not in (None, "none")]
        if video_formats:
            return sorted(video_formats, key=lambda f: f.get("height") or 0, reverse=True)[0]

    audio_formats = [f for f in candidates if f.get("acodec") not in (None, "none")]
    if audio_formats:
        return sorted(audio_formats, key=lambda f: f.get("abr") or 0, reverse=True)[0]

    return candidates[-1] if candidates else None


def extract_metadata(url: str) -> dict[str, Any]:
    with yt_dlp.YoutubeDL(_base_opts()) as ydl:
        info = ydl.extract_info(url, download=False)
        if info.get("_type") == "playlist":
            raise ValueError("URL is a playlist — use playlist import endpoint")
        return _map_track(info)


def search_tracks(query: str, limit: int) -> list[dict[str, Any]]:
    search_url = f"ytsearch{limit}:{query}"
    with yt_dlp.YoutubeDL(_base_opts(extract_flat=True)) as ydl:
        info = ydl.extract_info(search_url, download=False)

    entries = info.get("entries") or []
    results: list[dict[str, Any]] = []

    for entry in entries:
        if not entry:
            continue
        entry_id = entry.get("id")
        if not entry_id:
            continue
        results.append(
            {
                "id": entry_id,
                "provider": "youtube",
                "title": entry.get("title") or "Unknown Title",
                "artists": _map_artists(entry),
                "album": None,
                "artwork_url": entry.get("thumbnail"),
                "duration_ms": int(entry["duration"] * 1000)
                if entry.get("duration")
                else None,
                "is_video": True,
                "url": entry.get("url")
                or f"https://www.youtube.com/watch?v={entry_id}",
            }
        )

    return results


def resolve_stream(url: str, prefer_video: bool = False) -> dict[str, Any]:
    with yt_dlp.YoutubeDL(_base_opts()) as ydl:
        info = ydl.extract_info(url, download=False)

    chosen = _pick_format(info, prefer_video=prefer_video)
    if not chosen or not chosen.get("url"):
        raise ValueError("No playable stream URL found")

    is_video = chosen.get("vcodec") not in (None, "none")
    abr = chosen.get("abr")

    return {
        "url": chosen["url"],
        "expires_at": _utc_iso(3600),
        "mime_type": None,
        "bitrate": int(abr * 1000) if abr else None,
        "is_video": is_video,
        "headers": None,
    }


def resolve_download(url: str) -> dict[str, Any]:
    with yt_dlp.YoutubeDL(_base_opts()) as ydl:
        info = ydl.extract_info(url, download=False)

    chosen = _pick_format(info, prefer_video=False)
    if not chosen or not chosen.get("url"):
        raise ValueError("No downloadable URL found")

    title = info.get("title") or "track"
    ext = chosen.get("ext") or "m4a"
    safe_title = "".join(c if c.isalnum() or c in "- _" else "_" for c in title)

    return {
        "url": chosen["url"],
        "filename": f"{safe_title}.{ext}",
        "format": ext,
        "size_bytes": chosen.get("filesize") or chosen.get("filesize_approx"),
        "expires_at": _utc_iso(3600),
    }


def import_playlist(url: str, max_tracks: int = 100) -> dict[str, Any]:
    with yt_dlp.YoutubeDL(_base_opts(extract_flat=True)) as ydl:
        info = ydl.extract_info(url, download=False)

    if info.get("_type") != "playlist":
        raise ValueError("URL is not a playlist")

    entries = (info.get("entries") or [])[:max_tracks]
    tracks: list[dict[str, Any]] = []

    for entry in entries:
        if not entry:
            continue
        entry_id = entry.get("id")
        if not entry_id:
            continue
        tracks.append(
            {
                "id": entry_id,
                "provider": "youtube",
                "title": entry.get("title") or "Unknown Title",
                "artists": _map_artists(entry),
                "album": None,
                "artwork_url": entry.get("thumbnail"),
                "duration_ms": int(entry["duration"] * 1000)
                if entry.get("duration")
                else None,
                "is_video": True,
                "url": entry.get("url")
                or f"https://www.youtube.com/watch?v={entry_id}",
            }
        )

    return {
        "id": info.get("id"),
        "name": info.get("title") or "Imported Playlist",
        "description": info.get("description"),
        "artwork_url": info.get("thumbnail"),
        "track_count": len(tracks),
        "owner": info.get("uploader"),
        "source_url": url,
        "tracks": tracks,
    }


def build_youtube_url(external_id: str, url: str | None = None) -> str:
    if url:
        return url
    if external_id.startswith("http"):
        return external_id
    return f"https://www.youtube.com/watch?v={external_id}"
