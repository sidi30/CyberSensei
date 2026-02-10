# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CyberSensei Teams Bot - Dockerfile
# Multi-stage build for production-ready deployment
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

LABEL maintainer="CyberSensei Team"
LABEL version="1.0.0"
LABEL description="CyberSensei Teams Bot - Microsoft Bot Framework"

# Create non-root user for security
RUN addgroup -g 1001 cybersensei && \
    adduser -D -u 1001 -G cybersensei cybersensei

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create logs directory
RUN mkdir -p /app/logs && \
    chown -R cybersensei:cybersensei /app

# Switch to non-root user
USER cybersensei

# Expose bot port
EXPOSE 5175

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5175/health || exit 1

# Environment variables with defaults
ENV NODE_ENV=production \
    PORT=5175 \
    BOT_ID="" \
    BOT_PASSWORD="" \
    BACKEND_BASE_URL="http://localhost:8080"

# Start the bot
CMD ["node", "dist/index.js"]
