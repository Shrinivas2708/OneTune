FROM oven/bun:1.3 AS base

WORKDIR /app

ARG JIOSAAVN_API_REF=main

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates git \
    && rm -rf /var/lib/apt/lists/*

RUN git clone --depth 1 --branch ${JIOSAAVN_API_REF} \
    https://github.com/sumitkolhe/jiosaavn-api.git .

FROM base AS build

RUN bun install --frozen-lockfile
RUN bun run build

FROM oven/bun:1.3-alpine AS production

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 3000

CMD ["bun", "run", "start"]
