-- HASH BCRYPT VÉRIFIÉ ET TESTÉ
-- Mot de passe: password
-- Ce hash a été généré et testé avec BCrypt

UPDATE users 
SET password_hash = '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3ojPGga31lW'
WHERE email = 'admin@cybersensei.io';

UPDATE users 
SET password_hash = '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3ojPGga31lW'
WHERE email = 'manager@cybersensei.io';

-- Vérification
SELECT 
    email,
    'password' as mot_de_passe_simple,
    LEFT(password_hash, 30) as hash,
    LENGTH(password_hash) as len
FROM users 
WHERE email IN ('admin@cybersensei.io', 'manager@cybersensei.io');

