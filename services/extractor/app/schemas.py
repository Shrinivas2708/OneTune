from pydantic import BaseModel, Field, HttpUrl


class ExtractUrlRequest(BaseModel):
    url: str = Field(min_length=1)


class ArtistPayload(BaseModel):
    id: str | None = None
    name: str


class AlbumPayload(BaseModel):
    id: str | None = None
    name: str | None = None
    artwork_url: str | None = None


class TrackPayload(BaseModel):
    id: str
    provider: str = "youtube"
    title: str
    artists: list[ArtistPayload]
    album: AlbumPayload | None = None
    artwork_url: str | None = None
    duration_ms: int | None = None
    is_video: bool = False
    url: str


class StreamPayload(BaseModel):
    url: str
    expires_at: str
    mime_type: str | None = None
    bitrate: int | None = None
    is_video: bool = False
    headers: dict[str, str] | None = None


class DownloadPayload(BaseModel):
    url: str
    filename: str
    format: str
    size_bytes: int | None = None
    expires_at: str | None = None


class SearchRequest(BaseModel):
    query: str = Field(min_length=1, max_length=200)
    limit: int = Field(default=10, ge=1, le=50)


class PlaylistPayload(BaseModel):
    id: str | None = None
    name: str
    description: str | None = None
    artwork_url: str | None = None
    track_count: int | None = None
    owner: str | None = None
    source_url: str
    tracks: list[TrackPayload]
