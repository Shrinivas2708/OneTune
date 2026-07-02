from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import router as extract_router

app = FastAPI(
    title="OneTune Extractor",
    description="yt-dlp extraction service for OneTune",
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
    return {"status": "ok", "service": "extractor"}


app.include_router(extract_router)
