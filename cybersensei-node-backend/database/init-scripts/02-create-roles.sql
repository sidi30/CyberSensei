-- Create database roles for CyberSensei
-- This script runs automatically on first container startup

\echo 'Creating database roles...'

-- Read-only role for reporting and analytics
CREATE ROLE cybersensei_readonly;
GRANT CONNECT ON DATABASE cybersensei TO cybersensei_readonly;
GRANT USAGE ON SCHEMA public TO cybersensei_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO cybersensei_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO cybersensei_readonly;

-- Application role (already exists as POSTGRES_USER, but ensure permissions)
GRANT ALL PRIVILEGES ON DATABASE cybersensei TO cybersensei;
GRANT ALL PRIVILEGES ON SCHEMA public TO cybersensei;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cybersensei;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cybersensei;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO cybersensei;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO cybersensei;

\echo 'Database roles created successfully.'


