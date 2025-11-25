-- ============================================
-- MAINTENANCE SCRIPTS for CyberSensei Central
-- ============================================
-- Run these scripts periodically for database health

-- ============================================
-- 1. CLEANUP OLD METRICS (Keep last 90 days)
-- ============================================

-- Archive old metrics before deletion (optional)
CREATE TABLE IF NOT EXISTS tenant_metrics_archive (LIKE tenant_metrics INCLUDING ALL);

-- Move old metrics to archive
INSERT INTO tenant_metrics_archive
SELECT * FROM tenant_metrics
WHERE timestamp < NOW() - INTERVAL '90 days'
ON CONFLICT DO NOTHING;

-- Delete old metrics
DELETE FROM tenant_metrics
WHERE timestamp < NOW() - INTERVAL '90 days';

SELECT 'Cleaned ' || ROW_COUNT() || ' old metric records' AS result;

-- ============================================
-- 2. CLEANUP RESOLVED ERROR LOGS (Keep last 30 days)
-- ============================================

-- Archive resolved errors
CREATE TABLE IF NOT EXISTS error_logs_archive (LIKE error_logs INCLUDING ALL);

INSERT INTO error_logs_archive
SELECT * FROM error_logs
WHERE resolved = true 
  AND "resolvedAt" < NOW() - INTERVAL '30 days'
ON CONFLICT DO NOTHING;

-- Delete old resolved errors
DELETE FROM error_logs
WHERE resolved = true 
  AND "resolvedAt" < NOW() - INTERVAL '30 days';

SELECT 'Cleaned ' || ROW_COUNT() || ' resolved error logs' AS result;

-- ============================================
-- 3. UPDATE EXPIRED LICENSES
-- ============================================

UPDATE licenses
SET status = 'EXPIRED'
WHERE status = 'ACTIVE'
  AND "expiresAt" IS NOT NULL
  AND "expiresAt" < NOW();

SELECT 'Updated ' || ROW_COUNT() || ' expired licenses' AS result;

-- ============================================
-- 4. VACUUM AND ANALYZE
-- ============================================

-- Vacuum tables to reclaim space
VACUUM ANALYZE tenant_metrics;
VACUUM ANALYZE error_logs;
VACUUM ANALYZE licenses;
VACUUM ANALYZE tenants;
VACUUM ANALYZE admin_users;
VACUUM ANALYZE updates_metadata;

SELECT 'Vacuum completed' AS result;

-- ============================================
-- 5. REINDEX FOR PERFORMANCE
-- ============================================

REINDEX TABLE tenant_metrics;
REINDEX TABLE error_logs;
REINDEX TABLE licenses;

SELECT 'Reindex completed' AS result;

-- ============================================
-- 6. UPDATE STATISTICS
-- ============================================

ANALYZE tenant_metrics;
ANALYZE error_logs;
ANALYZE licenses;
ANALYZE tenants;

SELECT 'Statistics updated' AS result;

-- ============================================
-- 7. CHECK FOR ORPHANED RECORDS
-- ============================================

-- Licenses without tenants
SELECT 'Orphaned licenses: ' || COUNT(*) AS result
FROM licenses l
LEFT JOIN tenants t ON l."tenantId" = t.id
WHERE t.id IS NULL;

-- Metrics without tenants
SELECT 'Orphaned metrics: ' || COUNT(*) AS result
FROM tenant_metrics tm
LEFT JOIN tenants t ON tm."tenantId" = t.id
WHERE t.id IS NULL;

-- ============================================
-- 8. DATABASE SIZE REPORT
-- ============================================

SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================
-- 9. INDEX USAGE REPORT
-- ============================================

SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- ============================================
-- 10. SLOW QUERY CANDIDATES
-- ============================================

-- Find tables with sequential scans
SELECT 
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  seq_tup_read / seq_scan as avg_seq_tup_read
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 20;

-- ============================================
-- 11. TENANT HEALTH CHECK
-- ============================================

-- Tenants without recent metrics
SELECT 
  t.id,
  t.name,
  t."companyName",
  t.active,
  MAX(tm.timestamp) as last_metric,
  EXTRACT(EPOCH FROM (NOW() - MAX(tm.timestamp)))/3600 as hours_since_last_metric
FROM tenants t
LEFT JOIN tenant_metrics tm ON t.id = tm."tenantId"
WHERE t.active = true
GROUP BY t.id, t.name, t."companyName", t.active
HAVING MAX(tm.timestamp) < NOW() - INTERVAL '1 hour' OR MAX(tm.timestamp) IS NULL
ORDER BY last_metric ASC NULLS FIRST;

-- ============================================
-- 12. LICENSE EXPIRATION REPORT
-- ============================================

-- Licenses expiring in next 30 days
SELECT 
  l.key,
  l.status,
  l."expiresAt",
  t.name as tenant_name,
  t."contactEmail",
  EXTRACT(DAY FROM (l."expiresAt" - NOW())) as days_remaining
FROM licenses l
JOIN tenants t ON l."tenantId" = t.id
WHERE l.status = 'ACTIVE'
  AND l."expiresAt" IS NOT NULL
  AND l."expiresAt" BETWEEN NOW() AND NOW() + INTERVAL '30 days'
ORDER BY l."expiresAt" ASC;

-- ============================================
-- 13. ERROR LOG SUMMARY
-- ============================================

-- Error summary by level
SELECT 
  level,
  source,
  COUNT(*) as count,
  COUNT(CASE WHEN resolved = false THEN 1 END) as unresolved_count
FROM error_logs
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY level, source
ORDER BY level, source;

-- Recent critical errors
SELECT 
  timestamp,
  "tenantId",
  level,
  source,
  message,
  resolved
FROM error_logs
WHERE level = 'CRITICAL'
  AND timestamp >= NOW() - INTERVAL '7 days'
ORDER BY timestamp DESC;

-- ============================================
-- 14. PERFORMANCE METRICS
-- ============================================

-- Average metrics by tenant (last 24 hours)
SELECT 
  t.name,
  COUNT(tm.id) as metric_count,
  ROUND(AVG(tm."activeUsers"), 2) as avg_users,
  ROUND(AVG(tm."exercisesCompletedToday"), 2) as avg_exercises,
  ROUND(AVG(tm."aiLatency"), 2) as avg_latency_ms
FROM tenants t
LEFT JOIN tenant_metrics tm ON t.id = tm."tenantId"
WHERE tm.timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY t.id, t.name
ORDER BY avg_latency_ms DESC;

-- ============================================
-- 15. BACKUP RECOMMENDATIONS
-- ============================================

DO $$
DECLARE
  db_size TEXT;
  last_backup_age INTERVAL;
BEGIN
  SELECT pg_size_pretty(pg_database_size(current_database())) INTO db_size;
  
  RAISE NOTICE '====================================';
  RAISE NOTICE 'BACKUP RECOMMENDATIONS';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Database Size: %', db_size;
  RAISE NOTICE '';
  RAISE NOTICE 'Recommended backup commands:';
  RAISE NOTICE '1. Full backup:';
  RAISE NOTICE '   pg_dump -U cybersensei cybersensei_central > backup_$(date +%%Y%%m%%d).sql';
  RAISE NOTICE '';
  RAISE NOTICE '2. Compressed backup:';
  RAISE NOTICE '   pg_dump -U cybersensei cybersensei_central | gzip > backup_$(date +%%Y%%m%%d).sql.gz';
  RAISE NOTICE '';
  RAISE NOTICE '3. MongoDB backup:';
  RAISE NOTICE '   mongodump --db cybersensei_updates --out /backup/$(date +%%Y%%m%%d)';
END $$;

