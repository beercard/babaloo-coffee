# Payload CMS — production image (Next.js standalone output).
# Build from the repository root:
#   docker build -f apps/cms/Dockerfile -t babaloo-cms .
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ---------- deps ----------
FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/cms/package.json ./apps/cms/package.json
COPY apps/web/package.json ./apps/web/package.json
RUN npm ci --workspace apps/cms --include-workspace-root

# ---------- build ----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/cms/node_modules ./apps/cms/node_modules
COPY . .
WORKDIR /app/apps/cms
ENV NEXT_TELEMETRY_DISABLED=1
ENV PAYLOAD_SECRET=build-time-placeholder
ENV DATABASE_URL=file:./build.db
RUN npm run build

# ---------- runtime ----------
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
WORKDIR /app
COPY --from=builder --chown=nextjs:nodejs /app/apps/cms/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/cms/.next/static ./apps/cms/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/cms/public ./apps/cms/public
RUN mkdir -p /app/apps/cms/media /app/apps/cms/data && chown -R nextjs:nodejs /app/apps/cms/media /app/apps/cms/data
USER nextjs
EXPOSE 3000
WORKDIR /app/apps/cms
CMD ["node", "server.js"]
