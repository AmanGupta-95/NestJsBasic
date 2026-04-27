###############################################
# Base Stage - Common dependencies
###############################################
FROM node:24.15.0-alpine AS base

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

###############################################
# Dependencies Stage - Install all dependencies
###############################################
FROM base AS dependencies

# Install all dependencies (including dev dependencies)
RUN pnpm install --frozen-lockfile

###############################################
# Builder Stage - Build the application
###############################################
FROM base AS builder

# Copy node_modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN pnpm prisma generate

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

###############################################
# Development Stage
###############################################
FROM base AS development

# Copy node_modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN pnpm prisma generate

# Copy source code
COPY . .

# Expose application port
EXPOSE 3000

# Start in development mode
CMD ["pnpm", "start:dev"]

###############################################
# Production Stage - Final lightweight image
###############################################
FROM base AS production

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY --chown=nestjs:nodejs package.json pnpm-lock.yaml ./

# Copy production dependencies from builder
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Copy prisma schema and generated client
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# Switch to non-root user
USER nestjs

# Expose application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["sh", "-c", "node dist/main"]
