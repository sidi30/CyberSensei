-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE admin_role_enum AS ENUM('SUPERADMIN', 'SUPPORT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE license_status_enum AS ENUM('ACTIVE', 'EXPIRED', 'REVOKED', 'PENDING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE error_level_enum AS ENUM('INFO', 'WARNING', 'ERROR', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE error_source_enum AS ENUM('NODE', 'BACKEND', 'SYSTEM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE cybersensei_central TO cybersensei;

