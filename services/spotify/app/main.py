from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import router as spotify_router

app = FastAPI(
    title="OneTune Spotify Service",
    description="SpotifyScraper wrapper for OneTune",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "spotify"}


app.include_router(spotify_router)
