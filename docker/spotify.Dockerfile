FROM python:3.12-slim

WORKDIR /app

COPY services/spotify/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY services/spotify/ .

ENV PORT=8003

EXPOSE 8003

HEALTHCHECK --interval=15s --timeout=10s --retries=5 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8003/health')" || exit 1

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8003}"]
