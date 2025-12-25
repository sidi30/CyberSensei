-- Correction : Donner des hash BCrypt uniques à chaque utilisateur
-- Tous ont le même mot de passe (Admin@123) mais des hash différents

-- Admin : Hash 1 pour Admin@123
UPDATE users 
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE email = 'admin@cybersensei.io';

-- Manager : Hash 2 pour Admin@123 (différent grâce au salt)
UPDATE users 
SET password_hash = '$2a$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5kosgX8Bw.WQy'
WHERE email = 'manager@cybersensei.io';

-- Employee : Hash 3 pour Admin@123 (différent aussi)
UPDATE users 
SET password_hash = '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3ojPGga31lW'
WHERE email = 'employee@cybersensei.io';

-- Vérification : tous les hash doivent être différents
SELECT 
    id,
    email, 
    LEFT(password_hash, 30) as hash_preview,
    LENGTH(password_hash) as hash_length
FROM users 
WHERE email IN ('admin@cybersensei.io', 'manager@cybersensei.io', 'employee@cybersensei.io')
ORDER BY id;

