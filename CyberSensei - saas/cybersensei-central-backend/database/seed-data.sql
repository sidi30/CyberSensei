-- ============================================
-- SEED DATA for CyberSensei Central Backend
-- ============================================
-- This file contains sample data for development and testing
-- DO NOT use in production!

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ADMIN USERS
-- ============================================
-- Default password for all users: Admin@123456
-- Hash: $2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36O9cN2vXgP6J0u8tqfXlCm

INSERT INTO admin_users (id, name, email, "passwordHash", role, active, "createdAt", "updatedAt")
VALUES 
  (
    uuid_generate_v4(),
    'Super Admin',
    'admin@cybersensei.com',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36O9cN2vXgP6J0u8tqfXlCm',
    'SUPERADMIN',
    true,
    NOW(),
    NOW()
  ),
  (
    uuid_generate_v4(),
    'John Support',
    'support@cybersensei.com',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36O9cN2vXgP6J0u8tqfXlCm',
    'SUPPORT',
    true,
    NOW(),
    NOW()
  ),
  (
    uuid_generate_v4(),
    'Jane Manager',
    'manager@cybersensei.com',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36O9cN2vXgP6J0u8tqfXlCm',
    'SUPPORT',
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 2. TENANTS
-- ============================================

INSERT INTO tenants (id, name, "contactEmail", "licenseKey", active, "companyName", address, phone, "createdAt", "updatedAt")
VALUES 
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'acme-corp',
    'admin@acme.com',
    'A1B2C3D4-E5F6G7H8-I9J0K1L2-M3N4O5P6',
    true,
    'Acme Corporation',
    '123 Cyber Street, Tech City, CA 94000',
    '+1-555-0100',
    NOW() - INTERVAL '90 days',
    NOW()
  ),
  (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'tech-solutions',
    'contact@techsolutions.com',
    'Q7R8S9T0-U1V2W3X4-Y5Z6A7B8-C9D0E1F2',
    true,
    'Tech Solutions Ltd',
    '456 Innovation Ave, Silicon Valley, CA 94025',
    '+1-555-0200',
    NOW() - INTERVAL '60 days',
    NOW()
  ),
  (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'cyber-defense',
    'security@cyberdefense.io',
    'G3H4I5J6-K7L8M9N0-O1P2Q3R4-S5T6U7V8',
    true,
    'CyberDefense Inc',
    '789 Security Blvd, Washington DC 20001',
    '+1-555-0300',
    NOW() - INTERVAL '30 days',
    NOW()
  ),
  (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'global-training',
    'admin@globaltraining.com',
    'W9X0Y1Z2-A3B4C5D6-E7F8G9H0-I1J2K3L4',
    true,
    'Global Training Systems',
    '321 Education Lane, Boston, MA 02101',
    '+1-555-0400',
    NOW() - INTERVAL '15 days',
    NOW()
  ),
  (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'inactive-tenant',
    'old@inactive.com',
    'M5N6O7P8-Q9R0S1T2-U3V4W5X6-Y7Z8A9B0',
    false,
    'Inactive Company',
    '999 Old Street, Legacy City',
    '+1-555-9999',
    NOW() - INTERVAL '180 days',
    NOW()
  )
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 3. LICENSES
-- ============================================

INSERT INTO licenses (id, key, "tenantId", "expiresAt", status, "usageCount", "maxUsageCount", notes, "createdAt", "updatedAt")
VALUES 
  (
    uuid_generate_v4(),
    'A1B2C3D4-E5F6G7H8-I9J0K1L2-M3N4O5P6',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    NOW() + INTERVAL '365 days',
    'ACTIVE',
    245,
    10000,
    'Production license - Annual contract',
    NOW() - INTERVAL '90 days',
    NOW()
  ),
  (
    uuid_generate_v4(),
    'Q7R8S9T0-U1V2W3X4-Y5Z6A7B8-C9D0E1F2',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    NOW() + INTERVAL '180 days',
    'ACTIVE',
    187,
    5000,
    'Production license - Semi-annual contract',
    NOW() - INTERVAL '60 days',
    NOW()
  ),
  (
    uuid_generate_v4(),
    'G3H4I5J6-K7L8M9N0-O1P2Q3R4-S5T6U7V8',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    NOW() + INTERVAL '90 days',
    'ACTIVE',
    92,
    NULL,
    'Production license - Quarterly contract',
    NOW() - INTERVAL '30 days',
    NOW()
  ),
  (
    uuid_generate_v4(),
    'W9X0Y1Z2-A3B4C5D6-E7F8G9H0-I1J2K3L4',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    NOW() + INTERVAL '30 days',
    'ACTIVE',
    45,
    1000,
    'Trial license - Expires soon',
    NOW() - INTERVAL '15 days',
    NOW()
  ),
  (
    uuid_generate_v4(),
    'X1Y2Z3A4-B5C6D7E8-F9G0H1I2-J3K4L5M6',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    NOW() - INTERVAL '30 days',
    'EXPIRED',
    998,
    1000,
    'Old license - Expired',
    NOW() - INTERVAL '180 days',
    NOW()
  )
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 4. TENANT METRICS (Sample data for last 7 days)
-- ============================================

DO $$
DECLARE
  tenant_id UUID;
  day_offset INTEGER;
BEGIN
  FOR tenant_id IN 
    SELECT id FROM tenants WHERE active = true
  LOOP
    FOR day_offset IN 0..6 LOOP
      -- Insert 4 metrics per day (every 6 hours)
      FOR hour_offset IN 0..3 LOOP
        INSERT INTO tenant_metrics (
          id, "tenantId", uptime, "activeUsers", "exercisesCompletedToday", 
          "aiLatency", version, "additionalData", timestamp
        )
        VALUES (
          uuid_generate_v4(),
          tenant_id,
          3600 * (24 - day_offset + hour_offset * 6), -- Uptime increases
          (RANDOM() * 50 + 10)::INTEGER, -- 10-60 active users
          (RANDOM() * 100 + 20)::INTEGER, -- 20-120 exercises
          (RANDOM() * 500 + 200)::NUMERIC(10,2), -- 200-700ms latency
          '1.0.0',
          jsonb_build_object(
            'cpuUsage', (RANDOM() * 50 + 30)::NUMERIC(5,2),
            'memoryUsage', (RANDOM() * 40 + 40)::NUMERIC(5,2),
            'diskUsage', (RANDOM() * 30 + 20)::NUMERIC(5,2)
          ),
          NOW() - (day_offset || ' days')::INTERVAL + (hour_offset * 6 || ' hours')::INTERVAL
        );
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- ============================================
-- 5. UPDATES METADATA (Sample versions)
-- ============================================

INSERT INTO updates_metadata (id, version, changelog, filename, "fileSize", "mongoFileId", checksum, active, metadata, "createdAt")
VALUES 
  (
    uuid_generate_v4(),
    '1.0.0',
    E'Initial Release\n- Core functionality\n- Basic security features\n- User management',
    'cybersensei-1.0.0.zip',
    52428800, -- 50 MB
    '507f1f77bcf86cd799439011',
    'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    false,
    '{"platform": "linux", "architecture": "x64"}',
    NOW() - INTERVAL '120 days'
  ),
  (
    uuid_generate_v4(),
    '1.1.0',
    E'Feature Update\n- New exercise modules\n- Performance improvements\n- Bug fixes',
    'cybersensei-1.1.0.zip',
    55574528, -- 53 MB
    '507f1f77bcf86cd799439022',
    'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef234567',
    false,
    '{"platform": "linux", "architecture": "x64"}',
    NOW() - INTERVAL '60 days'
  ),
  (
    uuid_generate_v4(),
    '1.2.0',
    E'Major Update\n- AI improvements (30% faster)\n- New dashboard\n- Security patches\n- Multi-language support',
    'cybersensei-1.2.0.zip',
    58720256, -- 56 MB
    '507f1f77bcf86cd799439033',
    'c3d4e5f6789012345678901234567890abcdef1234567890abcdef345678',
    true,
    '{"platform": "linux", "architecture": "x64", "minNodeVersion": "14.0.0"}',
    NOW() - INTERVAL '7 days'
  )
ON CONFLICT (version) DO NOTHING;

-- ============================================
-- 6. ERROR LOGS (Sample error scenarios)
-- ============================================

INSERT INTO error_logs (
  id, "tenantId", level, source, message, stack, endpoint, method, 
  "statusCode", "userId", "ipAddress", "userAgent", metadata, context, 
  timestamp, resolved, "resolvedAt", "resolvedBy", "resolutionNotes"
)
VALUES 
  (
    uuid_generate_v4(),
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'ERROR',
    'NODE',
    'Failed to connect to AI service',
    'Error: ECONNREFUSED 127.0.0.1:5000\n    at TCPConnectWrap.afterConnect [as oncomplete]',
    '/api/ai/analyze',
    'POST',
    503,
    'user123',
    '192.168.1.100',
    'Mozilla/5.0 (X11; Linux x86_64)',
    '{"retries": 3, "timeout": 5000}',
    '{"requestId": "req-001"}',
    NOW() - INTERVAL '2 hours',
    true,
    NOW() - INTERVAL '1 hour',
    'support@cybersensei.com',
    'Restarted AI service container'
  ),
  (
    uuid_generate_v4(),
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'WARNING',
    'BACKEND',
    'High latency detected on telemetry endpoint',
    NULL,
    '/telemetry',
    'POST',
    200,
    NULL,
    '10.0.0.45',
    'Node.js/16.0.0',
    '{"latency": 1250, "threshold": 1000}',
    '{"endpoint": "/telemetry"}',
    NOW() - INTERVAL '5 hours',
    false,
    NULL,
    NULL,
    NULL
  ),
  (
    uuid_generate_v4(),
    NULL,
    'CRITICAL',
    'SYSTEM',
    'Database connection pool exhausted',
    'Error: Too many connections\n    at Connection.connect',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '{"maxConnections": 100, "activeConnections": 100}',
    '{"database": "postgresql"}',
    NOW() - INTERVAL '12 hours',
    true,
    NOW() - INTERVAL '11 hours',
    'admin@cybersensei.com',
    'Increased max_connections to 200'
  ),
  (
    uuid_generate_v4(),
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'INFO',
    'NODE',
    'Exercise completion rate below threshold',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '172.16.0.55',
    'CyberSensei-Node/1.0.0',
    '{"completionRate": 0.45, "threshold": 0.5}',
    '{"exerciseId": "ex-001"}',
    NOW() - INTERVAL '1 day',
    false,
    NULL,
    NULL,
    NULL
  ),
  (
    uuid_generate_v4(),
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'ERROR',
    'NODE',
    'License validation failed',
    NULL,
    '/api/license/validate',
    'GET',
    400,
    NULL,
    '192.168.100.50',
    'CyberSensei-Node/1.0.0',
    '{"licenseKey": "XXXX-XXXX-XXXX-XXXX", "reason": "expired"}',
    NULL,
    NOW() - INTERVAL '3 days',
    false,
    NULL,
    NULL,
    NULL
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count all records
DO $$
BEGIN
  RAISE NOTICE 'Admin Users: %', (SELECT COUNT(*) FROM admin_users);
  RAISE NOTICE 'Tenants: %', (SELECT COUNT(*) FROM tenants);
  RAISE NOTICE 'Licenses: %', (SELECT COUNT(*) FROM licenses);
  RAISE NOTICE 'Tenant Metrics: %', (SELECT COUNT(*) FROM tenant_metrics);
  RAISE NOTICE 'Updates Metadata: %', (SELECT COUNT(*) FROM updates_metadata);
  RAISE NOTICE 'Error Logs: %', (SELECT COUNT(*) FROM error_logs);
END $$;

-- Display sample data
SELECT '=== SAMPLE TENANTS ===' as info;
SELECT name, "companyName", active, "createdAt" FROM tenants ORDER BY "createdAt" DESC LIMIT 5;

SELECT '=== SAMPLE LICENSES ===' as info;
SELECT key, status, "expiresAt", "usageCount" FROM licenses ORDER BY "createdAt" DESC LIMIT 5;

SELECT '=== LATEST METRICS ===' as info;
SELECT t.name, tm."activeUsers", tm."aiLatency", tm.timestamp 
FROM tenant_metrics tm
JOIN tenants t ON tm."tenantId" = t.id
ORDER BY tm.timestamp DESC LIMIT 10;

