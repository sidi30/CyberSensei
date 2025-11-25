-- Initialize PostgreSQL extensions for CyberSensei
-- This script runs automatically on first container startup

\echo 'Installing PostgreSQL extensions...'

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable cryptographic functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enable trigram similarity search (useful for fuzzy search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable full-text search enhancements
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Enable btree_gin for better indexing
CREATE EXTENSION IF NOT EXISTS btree_gin;

\echo 'PostgreSQL extensions installed successfully.'


