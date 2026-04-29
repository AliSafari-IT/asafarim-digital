FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /repo

ARG NEXT_PUBLIC_PORTAL_URL="https://portal-qa.asafarim.com"
ENV NEXT_PUBLIC_PORTAL_URL=$NEXT_PUBLIC_PORTAL_URL
ARG NEXT_PUBLIC_EDUMATCH_URL="https://edumatch.asafarim.com"
ENV NEXT_PUBLIC_EDUMATCH_URL=$NEXT_PUBLIC_EDUMATCH_URL
ARG NEXT_PUBLIC_CONTENT_GENERATOR_URL="https://content-generator-qa.asafarim.com"
ENV NEXT_PUBLIC_CONTENT_GENERATOR_URL=$NEXT_PUBLIC_CONTENT_GENERATOR_URL
ARG NEXT_PUBLIC_MARKETING_CONTENT_URL="https://marketing-content.asafarim.com"
ENV NEXT_PUBLIC_MARKETING_CONTENT_URL=$NEXT_PUBLIC_MARKETING_CONTENT_URL
ARG NEXT_PUBLIC_EDUMATCH_URL="https://edumatch.asafarim.com"
ENV NEXT_PUBLIC_EDUMATCH_URL=$NEXT_PUBLIC_EDUMATCH_URL
ARG NEXT_PUBLIC_OPS_HUB_URL="https://ops-hub.asafarim.com"
ENV NEXT_PUBLIC_OPS_HUB_URL=$NEXT_PUBLIC_OPS_HUB_URL

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/edumatch ./apps/edumatch
COPY packages/auth ./packages/auth
COPY packages/db ./packages/db
COPY packages/ui ./packages/ui
COPY packages/shared-i18n ./packages/shared-i18n
COPY packages/country-language-selector ./packages/country-language-selector

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @asafarim/db build
RUN pnpm --filter @asafarim/ui build
RUN pnpm --filter edumatch build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3005
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone app
COPY --from=builder --chown=nextjs:nodejs /repo/apps/edumatch/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/edumatch/.next/static ./apps/edumatch/.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/apps/edumatch/public ./apps/edumatch/public

# Copy node_modules and packages needed for Prisma
COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/packages/db ./packages/db

# Regenerate Prisma client for Alpine (musl) runtime
RUN cd packages/db && npx prisma generate

# Copy Prisma client to location expected by Next.js standalone
RUN mkdir -p /app/node_modules/.prisma && \
    find /app/node_modules/.pnpm -type d -name ".prisma" -exec cp -r {}/client /app/node_modules/.prisma/ \; && \
    chown -R nextjs:nodejs /app/node_modules/.prisma

USER nextjs
EXPOSE 3005

CMD ["node", "apps/edumatch/server.js"]
