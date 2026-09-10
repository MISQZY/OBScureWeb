# syntax=docker/dockerfile:1

FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# fumadocs-mdx generates .source/ (aliased in next.config.mjs), then next
# build produces the standalone server (see output: 'standalone').
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
# .next/standalone already contains only the production deps this app
# actually needs — .next/static and public aren't included in it by design
# and have to be copied in separately (documented Next.js Docker pattern).
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Pre-create and chown the templates volume mount point so Docker seeds a
# fresh named volume (see docker-compose.yml) with nextjs ownership instead
# of root — the app runs as nextjs and mkdir()s subfolders under this path
# at runtime (see src/lib/templates/store.ts).
RUN mkdir -p /data/templates && chown -R nextjs:nodejs /data/templates
VOLUME /data/templates

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
