FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /repo

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/portal ./apps/portal
COPY packages/auth ./packages/auth
COPY packages/db ./packages/db

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @asafarim/db build
RUN pnpm --filter portal build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /repo/apps/portal/public ./apps/portal/public
COPY --from=builder --chown=nextjs:nodejs /repo/apps/portal/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/portal/.next/static ./apps/portal/.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "apps/portal/server.js"]
