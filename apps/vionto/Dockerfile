FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /repo

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/vionto ./apps/vionto
COPY packages/auth ./packages/auth
COPY packages/db ./packages/db
COPY packages/types ./packages/types
COPY packages/navigation ./packages/navigation
COPY packages/ui ./packages/ui

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @asafarim/db build
RUN pnpm --filter @asafarim/ui build
RUN pnpm --filter vionto build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3006
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/packages/db ./packages/db
COPY --from=builder /repo/apps/vionto/public ./apps/vionto/public
COPY --from=builder --chown=nextjs:nodejs /repo/apps/vionto/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/vionto/.next/static ./apps/vionto/.next/static

# Regenerate Prisma client for Alpine (musl) runtime
RUN cd packages/db && npx prisma generate

# Copy Prisma client to location expected by Next.js standalone
RUN mkdir -p /app/node_modules/.prisma && \
    find /app/node_modules/.pnpm -type d -name ".prisma" -exec cp -r {}/client /app/node_modules/.prisma/ \; && \
    chown -R nextjs:nodejs /app/node_modules/.prisma

USER nextjs
EXPOSE 3006

CMD ["node", "apps/vionto/server.js"]
