FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /repo

ARG NEXT_PUBLIC_BASE_PATH=""
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/content-generator ./apps/content-generator
COPY packages/ui ./packages/ui
COPY packages/auth ./packages/auth
COPY packages/db ./packages/db

RUN pnpm install --frozen-lockfile
RUN pnpm --filter content-generator build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /repo/apps/content-generator/public ./apps/content-generator/public
COPY --from=builder --chown=nextjs:nodejs /repo/apps/content-generator/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/content-generator/.next/static ./apps/content-generator/.next/static

USER nextjs
EXPOSE 3001

CMD ["node", "apps/content-generator/server.js"]
