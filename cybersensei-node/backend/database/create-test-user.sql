-- Supprimer l'ancien admin si existe
DELETE FROM users WHERE email = 'admin@cybersensei.io';

-- Créer un utilisateur admin avec mot de passe: test123
-- Hash BCrypt pour "test123"
INSERT INTO users (name, email, role, department, created_at, active, password_hash)
VALUES (
  'Admin Test',
  'admin@cybersensei.io',
  'ADMIN',
  'IT',
  NOW(),
  true,
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
);

-- Créer un utilisateur manager avec mot de passe: test123
INSERT INTO users (name, email, role, department, created_at, active, password_hash)
VALUES (
  'Manager Test',
  'manager@cybersensei.io',
  'MANAGER',
  'Management',
  NOW(),
  true,
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
);

-- Vérifier
SELECT id, name, email, role FROM users;


