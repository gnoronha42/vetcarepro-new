# syntax=docker/dockerfile:1

FROM node:20-alpine AS build

WORKDIR /app

# better-sqlite3 compila bindings nativos no Alpine
RUN apk add --no-cache python3 make g++

COPY package.json ./

RUN npm install

COPY . .

RUN npm run build \
  && npm prune --omit=dev

FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN addgroup -S app \
  && adduser -S app -G app \
  && chmod +x docker-entrypoint.sh \
  && chown -R app:app /app

USER app

# Render injeta PORT em runtime; main.ts escuta em 0.0.0.0
EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 10000) + '/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["./docker-entrypoint.sh"]
