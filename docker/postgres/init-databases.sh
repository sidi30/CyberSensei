#!/bin/bash
set -e

# Create additional databases for microservices
# The main database is already created by POSTGRES_DB env var

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'CREATE DATABASE cybersensei_ai_security OWNER $POSTGRES_USER'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'cybersensei_ai_security')\gexec

    SELECT 'CREATE DATABASE cybersensei_central OWNER $POSTGRES_USER'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'cybersensei_central')\gexec
EOSQL
