from __future__ import annotations

from typing import Any

from spotify_scraper import SpotifyClient


def _track_url(track_id: str) -> str:
    return f"https://open.spotify.com/track/{track_id}"


def _playlist_url(playlist_id: str) -> str:
    return f"https://open.spotify.com/playlist/{playlist_id}"


def _map_artist(artist: Any) -> dict[str, str | None]:
    name = getattr(artist, "name", None) or str(artist)
    artist_id = getattr(artist, "id", None)
    return {"id": artist_id, "name": name}


def _map_track(track: Any) -> dict[str, Any]:
    track_id = getattr(track, "id", None) or ""
    title = getattr(track, "name", None) or "Unknown Title"
    artists = getattr(track, "artists", None) or []
    album = getattr(track, "album", None)
    album_name = getattr(album, "name", None) if album else None
    artwork = None
    if album is not None:
        images = getattr(album, "images", None) or getattr(album, "cover", None)
        if isinstance(images, list) and images:
            artwork = getattr(images[0], "url", None) or images[0].get("url")
        elif hasattr(album, "cover_url"):
            artwork = album.cover_url

    duration_ms = getattr(track, "duration_ms", None)
    if duration_ms is None:
        duration = getattr(track, "duration", None)
        if duration is not None:
            duration_ms = int(duration * 1000) if duration < 10000 else int(duration)

    return {
        "id": track_id,
        "provider": "spotify",
        "title": title,
        "artists": [_map_artist(a) for a in artists] or [{"id": None, "name": "Unknown Artist"}],
        "album": album_name,
        "artwork_url": artwork,
        "duration_ms": duration_ms,
        "url": _track_url(track_id),
    }


def search_tracks(query: str, limit: int) -> list[dict[str, Any]]:
    with SpotifyClient() as client:
        results = client.search(query, types=("track",), limit=limit)
        tracks = getattr(results, "tracks", None) or []
        return [_map_track(track) for track in tracks[:limit]]


def get_track(track_id: str) -> dict[str, Any]:
    url = track_id if track_id.startswith("http") else _track_url(track_id)
    with SpotifyClient() as client:
        track = client.get_track(url)
        return _map_track(track)


def import_playlist(url: str, max_tracks: int = 100) -> dict[str, Any]:
    with SpotifyClient() as client:
        playlist = client.get_playlist(url, max_tracks=max_tracks)

    playlist_id = getattr(playlist, "id", None)
    tracks_raw = getattr(playlist, "tracks", None) or []
    tracks = [_map_track(t) for t in tracks_raw[:max_tracks]]

    images = getattr(playlist, "images", None) or getattr(playlist, "cover", None)
    artwork = None
    if isinstance(images, list) and images:
        artwork = getattr(images[0], "url", None)

    owner = getattr(playlist, "owner", None)
    owner_name = getattr(owner, "display_name", None) if owner else None

    return {
        "id": playlist_id,
        "name": getattr(playlist, "name", None) or "Spotify Playlist",
        "description": getattr(playlist, "description", None),
        "artwork_url": artwork,
        "track_count": len(tracks),
        "owner": owner_name,
        "source_url": url,
        "tracks": tracks,
    }
