# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CyberSensei Teams Tabs - Dockerfile
# Multi-stage build for Employee and Manager tabs
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Stage 1: Build Employee Tab
FROM node:20-alpine AS builder-employee

WORKDIR /app/employee

COPY employee/package*.json ./
RUN npm ci

COPY employee/ ./

# Build arguments for environment configuration
ARG VITE_BACKEND_URL=http://localhost:8080
ARG VITE_MICROSOFT_APP_ID=""
ARG VITE_ENABLE_SSO=true

ENV VITE_BACKEND_URL=$VITE_BACKEND_URL \
    VITE_MICROSOFT_APP_ID=$VITE_MICROSOFT_APP_ID \
    VITE_ENABLE_SSO=$VITE_ENABLE_SSO

RUN npm run build

# Stage 2: Build Manager Tab
FROM node:20-alpine AS builder-manager

WORKDIR /app/manager

COPY manager/package*.json ./
RUN npm ci

COPY manager/ ./

ARG VITE_BACKEND_URL=http://localhost:8080
ARG VITE_MICROSOFT_APP_ID=""
ARG VITE_ENABLE_SSO=true

ENV VITE_BACKEND_URL=$VITE_BACKEND_URL \
    VITE_MICROSOFT_APP_ID=$VITE_MICROSOFT_APP_ID \
    VITE_ENABLE_SSO=$VITE_ENABLE_SSO

RUN npm run build

# Stage 3: Production with Nginx
FROM nginx:alpine AS production

LABEL maintainer="CyberSensei Team"
LABEL version="1.0.0"
LABEL description="CyberSensei Teams Tabs - Employee and Manager interfaces"

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built tabs from builder stages
COPY --from=builder-employee /app/employee/dist /usr/share/nginx/html/tabs/employee
COPY --from=builder-manager /app/manager/dist /usr/share/nginx/html/tabs/manager

# Create a simple index page for root
RUN echo '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=/tabs/employee/"></head></html>' > /usr/share/nginx/html/index.html

# Create health check file
RUN echo '{"status":"ok","service":"cybersensei-tabs"}' > /usr/share/nginx/html/health.json

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/health.json || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
