FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /repo

ARG NEXT_PUBLIC_BASE_PATH=""
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH

ARG NEXT_PUBLIC_PORTAL_URL="https://portal-qa.asafarim.com"
ENV NEXT_PUBLIC_PORTAL_URL=$NEXT_PUBLIC_PORTAL_URL

ARG NEXT_PUBLIC_CONTENT_GENERATOR_URL="https://content-generator-qa.asafarim.com"
ENV NEXT_PUBLIC_CONTENT_GENERATOR_URL=$NEXT_PUBLIC_CONTENT_GENERATOR_URL

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/content-generator ./apps/content-generator
COPY packages/ui ./packages/ui
COPY packages/auth ./packages/auth
COPY packages/db ./packages/db
COPY packages/shared-i18n ./packages/shared-i18n
COPY packages/country-language-selector ./packages/country-language-selector

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @asafarim/db build
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
