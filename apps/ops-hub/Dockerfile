FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /repo

ARG NEXT_PUBLIC_PORTAL_URL="https://portal-qa.asafarim.com"
ENV NEXT_PUBLIC_PORTAL_URL=$NEXT_PUBLIC_PORTAL_URL

ARG NEXT_PUBLIC_CONTENT_GENERATOR_URL="https://content-generator-qa.asafarim.com"
ENV NEXT_PUBLIC_CONTENT_GENERATOR_URL=$NEXT_PUBLIC_CONTENT_GENERATOR_URL

ARG NEXT_PUBLIC_MARKETING_CONTENT_URL="https://marketing-content.asafarim.com"
ENV NEXT_PUBLIC_MARKETING_CONTENT_URL=$NEXT_PUBLIC_MARKETING_CONTENT_URL

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/ops-hub ./apps/ops-hub
COPY packages/auth ./packages/auth
COPY packages/db ./packages/db
COPY packages/ui ./packages/ui

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @asafarim/db build
RUN pnpm --filter ops-hub build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3003
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone app
COPY --from=builder --chown=nextjs:nodejs /repo/apps/ops-hub/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/ops-hub/.next/static ./apps/ops-hub/.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/apps/ops-hub/public ./apps/ops-hub/public

# Copy node_modules and packages needed for Prisma
COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/packages/db ./packages/db

# Regenerate Prisma client for Alpine (musl) runtime
RUN cd packages/db && npx prisma generate

# Copy Prisma client to location expected by Next.js standalone
RUN mkdir -p /app/node_modules/.prisma && \
    cp -r /app/node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client /app/node_modules/.prisma/client && \
    chown -R nextjs:nodejs /app/node_modules/.prisma

USER nextjs
EXPOSE 3003

CMD ["node", "apps/ops-hub/server.js"]
