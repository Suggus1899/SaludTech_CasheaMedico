FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web-admin/package.json apps/web-admin/
COPY apps/web-landing/package.json apps/web-landing/
COPY apps/web-merchant/package.json apps/web-merchant/
COPY apps/web-patient/package.json apps/web-patient/
COPY packages/i18n/package.json packages/i18n/
COPY packages/shared/package.json packages/shared/
COPY packages/ui/package.json packages/ui/
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
COPY --from=deps /app/ ./
COPY . .
RUN sed -i 's/const nextConfig = {/const nextConfig = { output: "standalone",/' apps/web-patient/next.config.js
RUN pnpm --filter web-patient build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-patient/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-patient/.next/static ./apps/web-patient/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-patient/public ./apps/web-patient/public
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1
CMD ["node", "apps/web-patient/server.js"]
