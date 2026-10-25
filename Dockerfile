# ============================================================
# QRTrans — Multi-stage Dockerfile for Coolify (project: mov)
# ============================================================

# ── Stage 1: Build ──
FROM node:20-alpine AS builder

ARG CACHEBUST=21

# Install required packages for building
RUN apk add --no-cache git sqlite build-base
RUN npm install -g bun

WORKDIR /app

# Clone the repository
RUN git clone --branch main --depth 1 https://github.com/topmuch/qrtrans.git /app/tmp && \
    cp -r /app/tmp/. /app/ && rm -rf /app/tmp

# Install ALL dependencies (including devDependencies) for build
ENV NODE_ENV=development
RUN bun install

# Generate Prisma Client
RUN npx prisma generate

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=file:/app/data/move.db
RUN bun run build

# ── Stage 2: Production (minimal image) ──
FROM node:20-alpine AS runner

ARG CACHEBUST=21

# Only install runtime essentials
RUN apk add --no-cache sqlite-libs

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL=file:/app/data/move.db
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone server
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy runtime-only node_modules (Prisma client + CLI)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma

# Copy Prisma schema + migration script
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts

# Create data directories
RUN mkdir -p /app/data /app/public/uploads && \
    chown nextjs:nodejs /app/data /app/public/uploads

USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

# Start command
CMD ["sh", "-c", "\
  mkdir -p /app/data /app/public/uploads && \
  echo '>>> [1/3] Syncing database schema...' && \
  (npx prisma db push --skip-generate --accept-data-loss 2>&1 && echo '    ✅ Schema synced' || echo '    ⚠️ Schema sync issue') && \
  echo '>>> [2/3] Running column migrations...' && \
  node scripts/migrate-db.js 2>&1 && \
  echo '>>> [3/3] Starting server...' && \
  exec node server.js \
"]
