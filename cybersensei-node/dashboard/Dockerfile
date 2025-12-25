# Multi-stage build for React Dashboard

# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Build arguments
ARG VITE_API_URL=http://localhost:8080/api
ARG VITE_BYPASS_AUTH=true

# Set as environment variables for Vite
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BYPASS_AUTH=$VITE_BYPASS_AUTH

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for build)
RUN npm install

# Copy source files
COPY . .

# Build application
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]


