# PostgreSQL 15 Dockerfile for CyberSensei
FROM postgres:15-alpine

LABEL maintainer="CyberSensei Team"
LABEL version="1.0.0"
LABEL description="PostgreSQL 15 database for CyberSensei platform"

# Environment variables
ENV POSTGRES_DB=cybersensei
ENV POSTGRES_USER=cybersensei
ENV POSTGRES_PASSWORD=cybersensei123
ENV PGDATA=/var/lib/postgresql/data/pgdata

# Install extensions
RUN apk add --no-cache \
    postgresql-contrib

# Copy initialization scripts
COPY ./init-scripts/ /docker-entrypoint-initdb.d/

# Copy seed data
COPY ./seeds/ /docker-entrypoint-initdb.d/seeds/

# Create directory for backups
RUN mkdir -p /backups && \
    chown -R postgres:postgres /backups

# Custom PostgreSQL configuration
COPY ./postgresql.conf /etc/postgresql/postgresql.conf

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD pg_isready -U $POSTGRES_USER -d $POSTGRES_DB || exit 1

# Expose PostgreSQL port
EXPOSE 5432

# Volume for persistent data
VOLUME ["/var/lib/postgresql/data"]


