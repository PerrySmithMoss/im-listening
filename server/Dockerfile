FROM node:26.13.0-trixie-slim@sha256:5adad64f9a1fca2d51972caa65983634c8a774eb300d72b20f7f2a0f60368072 AS base
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS build
COPY package.json package-lock.json ./
RUN npm ci
COPY prisma7.config.ts tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
COPY utils ./utils
RUN npm run build && npm prune --omit=dev

FROM base
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY prisma7.config.ts ./
COPY public ./public
COPY --chmod=755 docker-entrypoint.sh /app/docker-entrypoint.sh
USER node
EXPOSE 5050
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["serve"]
