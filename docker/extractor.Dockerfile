FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    ca-certificates \
    unzip \
    && rm -rf /var/lib/apt/lists/* \
    && curl -fsSL https://deno.land/install.sh | DENO_INSTALL=/usr/local sh \
    && deno --version

COPY services/extractor/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY services/extractor/ .

ENV PORT=8001

EXPOSE 8001

HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8001/health')" || exit 1

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8001} --workers 1"]
