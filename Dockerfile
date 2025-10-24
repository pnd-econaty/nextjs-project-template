FROM node:24.8-alpine3.21 AS base

# Our development docker image:
FROM base AS development
WORKDIR /home/node/app

# Based on https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
# 1. Stage: Build deps
FROM base AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. Stage: Build app
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Build application
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. Stage: Migration
FROM deps AS migration-runner

# 4. Stage: Runner
FROM base AS runner
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# See https://nextjs.org/docs/pages/api-reference/config/next-config-js/output#automatically-copying-traced-files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
CMD ["node", "server.js"]