# Nexus Enterprise Dockerfile
# Optimized multi-stage build for Next.js standalone deployment on Kubernetes

# 1. Dependencies stage
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# 2. Builder stage
FROM node:18-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate prisma client inside the builder
RUN npx prisma generate
# Build the Next.js standalone output
RUN npm run build

# 3. Production runner stage
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user for K8s security context compliance
USER nextjs

EXPOSE 3006
ENV PORT 3006
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
