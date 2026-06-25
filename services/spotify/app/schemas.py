from pydantic import BaseModel, Field


class ArtistPayload(BaseModel):
    id: str | None = None
    name: str


class TrackPayload(BaseModel):
    id: str
    provider: str = "spotify"
    title: str
    artists: list[ArtistPayload]
    album: str | None = None
    artwork_url: str | None = None
    duration_ms: int | None = None
    url: str


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
