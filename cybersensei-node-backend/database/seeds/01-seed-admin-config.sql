-- Seed: Admin Configuration
-- Default admin user and system configuration

\echo 'Seeding admin configuration...'

-- Insert default admin user (password: Admin@123)
-- Password hash generated with BCrypt strength 10
INSERT INTO users (name, email, role, department, created_at, active, password_hash) VALUES
('Admin System', 'admin@cybersensei.io', 'ADMIN', 'IT Security', NOW(), true, '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
('Manager Demo', 'manager@cybersensei.io', 'MANAGER', 'Management', NOW(), true, '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
('Employee Demo', 'employee@cybersensei.io', 'EMPLOYEE', 'Operations', NOW(), true, '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
ON CONFLICT (email) DO NOTHING;

-- Insert system configuration
INSERT INTO configs (config_key, config_value, description, updated_at) VALUES
('company.name', 'CyberSensei Demo', 'Company name displayed in emails and UI', NOW()),
('company.email', 'contact@cybersensei.io', 'Company contact email', NOW()),
('smtp.enabled', 'true', 'Enable/disable email sending', NOW()),
('smtp.from_name', 'CyberSensei Platform', 'Email sender name', NOW()),
('smtp.from_email', 'noreply@cybersensei.io', 'Email sender address', NOW()),
('phishing.enabled', 'true', 'Enable/disable phishing campaigns', NOW()),
('phishing.frequency', '2', 'Phishing emails per week', NOW()),
('phishing.send_time', '09:00', 'Time to send phishing emails (HH:MM)', NOW()),
('training.intensity', 'medium', 'Training intensity: low, medium, high', NOW()),
('training.exercises_per_week', '3', 'Number of exercises per week', NOW()),
('sync.enabled', 'true', 'Enable/disable sync with central server', NOW()),
('sync.central_url', 'https://central.cybersensei.io', 'Central server URL', NOW()),
('sync.tenant_id', 'demo-tenant', 'Tenant identifier', NOW()),
('metrics.calculation_enabled', 'true', 'Enable/disable automatic metrics calculation', NOW()),
('metrics.calculation_interval', '3600', 'Metrics calculation interval in seconds', NOW()),
('security.password_min_length', '8', 'Minimum password length', NOW()),
('security.password_require_special', 'true', 'Require special characters in passwords', NOW()),
('security.session_timeout', '86400', 'Session timeout in seconds (24h)', NOW()),
('security.max_login_attempts', '5', 'Maximum login attempts before lockout', NOW()),
('ui.theme', 'light', 'Default UI theme: light, dark', NOW()),
('ui.language', 'fr', 'Default language: fr, en', NOW())
ON CONFLICT (config_key) DO NOTHING;

\echo 'Admin configuration seeded successfully.'


