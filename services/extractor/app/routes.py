from fastapi import APIRouter, HTTPException

from app.schemas import (
    DownloadPayload,
    ExtractUrlRequest,
    PlaylistPayload,
    SearchRequest,
    StreamPayload,
    TrackPayload,
)
from app.ytdlp_service import (
    build_youtube_url,
    extract_metadata,
    import_playlist,
    resolve_download,
    resolve_stream,
    search_tracks,
)

router = APIRouter(prefix="/extract", tags=["extract"])


@router.post("/metadata", response_model=TrackPayload)
def metadata(body: ExtractUrlRequest) -> TrackPayload:
    try:
        return TrackPayload(**extract_metadata(body.url))
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/search")
def search(body: SearchRequest) -> dict[str, list[TrackPayload]]:
    try:
        tracks = [TrackPayload(**t) for t in search_tracks(body.query, body.limit)]
        return {"tracks": tracks}
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/stream", response_model=StreamPayload)
def stream(body: ExtractUrlRequest, prefer_video: bool = False) -> StreamPayload:
    try:
        return StreamPayload(**resolve_stream(body.url, prefer_video=prefer_video))
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/download", response_model=DownloadPayload)
def download(body: ExtractUrlRequest) -> DownloadPayload:
    try:
        return DownloadPayload(**resolve_download(body.url))
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/playlist", response_model=PlaylistPayload)
def playlist(body: ExtractUrlRequest, max_tracks: int = 100) -> PlaylistPayload:
    try:
        return PlaylistPayload(**import_playlist(body.url, max_tracks=max_tracks))
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/resolve-url")
def resolve_url(external_id: str, url: str | None = None) -> dict[str, str]:
    return {"url": build_youtube_url(external_id, url)}
