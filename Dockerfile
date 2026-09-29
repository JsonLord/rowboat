FROM node:22-slim AS build
RUN corepack enable
WORKDIR /app
COPY . .
RUN cd apps/harbor && pnpm install --frozen-lockfile && pnpm -r build
RUN cd apps/x && pnpm install --frozen-lockfile && npm run deps && cd apps/server && npm run build:headless

FROM node:22-slim
RUN apt-get update && apt-get install -y python3 build-essential && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
ENV PORT=7860
ENV HOST=0.0.0.0
ENV ROWBOAT_WORKDIR=/data
ENV ROWBOAT_ALLOWED_HOSTS=*
WORKDIR /app/apps/server
COPY --from=build /app/apps/x/apps/server/dist-headless ./
RUN npm install --omit=dev
EXPOSE 7860
CMD ["node", "rowboat-server.cjs"]
