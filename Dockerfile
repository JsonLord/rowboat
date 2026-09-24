FROM node:22-slim AS build
RUN corepack enable
WORKDIR /app/apps/harbor
COPY apps/harbor ./
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM node:22-slim
ENV NODE_ENV=production
ENV PORT=7860
WORKDIR /app/apps/harbor
COPY --from=build /app/apps/harbor ./
EXPOSE 7860
CMD ["node", "packages/server/dist/main.js"]
