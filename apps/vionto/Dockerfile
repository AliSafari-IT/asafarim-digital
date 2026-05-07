FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /repo

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/vionto ./apps/vionto

RUN pnpm install --frozen-lockfile
RUN pnpm --filter vionto build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3006
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /repo/apps/vionto/public ./apps/vionto/public
COPY --from=builder --chown=nextjs:nodejs /repo/apps/vionto/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/vionto/.next/static ./apps/vionto/.next/static

USER nextjs
EXPOSE 3006

CMD ["node", "apps/vionto/server.js"]
