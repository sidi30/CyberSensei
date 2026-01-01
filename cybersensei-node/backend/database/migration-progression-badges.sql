-- ============================================================================
-- MIGRATION : Système de Progression et Badges
-- Description : Ajout des tables pour gérer la progression par module et les badges
-- Date : 2026-01-01
-- ============================================================================

-- =======================
-- 1. TABLE : MODULES
-- =======================
-- Définition des modules (thèmes) d'apprentissage
CREATE TABLE IF NOT EXISTS modules (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,              -- Ex: "Phishing Emails", "Mots de Passe"
    display_name VARCHAR(255) NOT NULL,             -- Nom affiché
    description TEXT,                                -- Description du module
    difficulty VARCHAR(50) NOT NULL,                 -- BEGINNER, INTERMEDIATE, ADVANCED
    total_exercises INTEGER NOT NULL DEFAULT 0,      -- Nombre total d'exercices dans ce module
    badge_id BIGINT,                                 -- Badge obtenu à la fin (référence vers badges)
    order_index INTEGER NOT NULL DEFAULT 0,          -- Ordre d'affichage
    icon_url VARCHAR(500),                           -- URL icône du module
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =======================
-- 2. TABLE : USER_MODULES_PROGRESS
-- =======================
-- Progression de chaque utilisateur par module
CREATE TABLE IF NOT EXISTS user_modules_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id BIGINT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    exercises_completed INTEGER NOT NULL DEFAULT 0,       -- Nombre d'exercices complétés
    exercises_success INTEGER NOT NULL DEFAULT 0,         -- Nombre d'exercices réussis
    total_exercises INTEGER NOT NULL DEFAULT 0,           -- Total exercices dans le module
    completion_percentage DOUBLE PRECISION NOT NULL DEFAULT 0.0,  -- 0-100%
    average_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,  -- Score moyen (0-100)
    status VARCHAR(50) NOT NULL DEFAULT 'NOT_STARTED',    -- NOT_STARTED, IN_PROGRESS, COMPLETED
    started_at TIMESTAMP,                                  -- Date de début
    completed_at TIMESTAMP,                                -- Date de complétion
    last_activity_at TIMESTAMP,                            -- Dernière activité
    UNIQUE(user_id, module_id)
);

-- =======================
-- 3. TABLE : BADGES
-- =======================
-- Définition des badges disponibles
CREATE TABLE IF NOT EXISTS badges (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,               -- Ex: "Badge Phishing Master"
    display_name VARCHAR(255) NOT NULL,              -- Nom affiché
    description TEXT NOT NULL,                       -- Description du badge
    icon_url VARCHAR(500),                           -- URL de l'icône
    badge_type VARCHAR(50) NOT NULL,                 -- MODULE, LEVEL, STREAK, SPECIAL
    requirement_type VARCHAR(50),                    -- MODULE_COMPLETE, SCORE_THRESHOLD, etc.
    requirement_value VARCHAR(255),                  -- Valeur requise (ex: module_id, score minimum)
    rarity VARCHAR(50) NOT NULL DEFAULT 'COMMON',    -- COMMON, RARE, EPIC, LEGENDARY
    points INTEGER NOT NULL DEFAULT 0,               -- Points accordés
    order_index INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =======================
-- 4. TABLE : USER_BADGES
-- =======================
-- Badges obtenus par les utilisateurs
CREATE TABLE IF NOT EXISTS user_badges (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id BIGINT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    progress_details JSONB,                          -- Détails supplémentaires
    UNIQUE(user_id, badge_id)
);

-- =======================
-- 5. TABLE : USER_LEVEL
-- =======================
-- Niveau global de l'utilisateur
CREATE TABLE IF NOT EXISTS user_level (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    current_level INTEGER NOT NULL DEFAULT 1,        -- Niveau actuel
    total_xp INTEGER NOT NULL DEFAULT 0,             -- XP total
    xp_to_next_level INTEGER NOT NULL DEFAULT 100,   -- XP requis pour level up
    modules_completed INTEGER NOT NULL DEFAULT 0,     -- Nombre de modules complétés
    total_badges INTEGER NOT NULL DEFAULT 0,         -- Nombre total de badges
    streak_days INTEGER NOT NULL DEFAULT 0,          -- Jours consécutifs
    last_activity_date DATE,                         -- Dernière activité (pour streak)
    rank VARCHAR(50) NOT NULL DEFAULT 'DÉBUTANT',   -- DÉBUTANT, INTERMÉDIAIRE, AVANCÉ, EXPERT
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =======================
-- INDEX
-- =======================
CREATE INDEX idx_user_modules_progress_user ON user_modules_progress(user_id);
CREATE INDEX idx_user_modules_progress_module ON user_modules_progress(module_id);
CREATE INDEX idx_user_modules_progress_status ON user_modules_progress(status);
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge ON user_badges(badge_id);
CREATE INDEX idx_user_level_user ON user_level(user_id);
CREATE INDEX idx_modules_difficulty ON modules(difficulty);
CREATE INDEX idx_modules_active ON modules(active);

-- =======================
-- SEED INITIAL : MODULES
-- =======================
-- Insertion des 15 modules correspondant aux thèmes
INSERT INTO modules (name, display_name, description, difficulty, total_exercises, order_index, active) VALUES
-- Niveau Débutant
('phishing-emails', 'Phishing Emails', 'Apprenez à identifier les emails de phishing et à protéger vos informations', 'BEGINNER', 10, 1, true),
('liens-suspects', 'Liens Suspects', 'Détectez les liens malveillants et les tentatives d''hameçonnage', 'BEGINNER', 10, 2, true),
('mots-de-passe', 'Mots de Passe', 'Créez et gérez des mots de passe sécurisés', 'BEGINNER', 12, 3, true),
('faux-messages-internes', 'Faux Messages Internes', 'Identifiez les faux messages qui semblent venir de votre entreprise', 'BEGINNER', 10, 4, true),
('reflexes-securite-base', 'Réflexes Sécurité de Base', 'Adoptez les bons réflexes de sécurité au quotidien', 'BEGINNER', 10, 5, true),

-- Niveau Intermédiaire
('ingenierie-sociale', 'Ingénierie Sociale', 'Reconnaissez les techniques de manipulation psychologique', 'INTERMEDIATE', 12, 6, true),
('pieces-jointes-malveillantes', 'Pièces Jointes Malveillantes', 'Identifiez les pièces jointes dangereuses', 'INTERMEDIATE', 10, 7, true),
('fausse-facture-fraude', 'Fausse Facture & Fraude', 'Détectez les tentatives de fraude financière', 'INTERMEDIATE', 10, 8, true),
('usurpation-identite', 'Usurpation d''Identité', 'Protégez-vous contre l''usurpation d''identité', 'INTERMEDIATE', 10, 9, true),
('teletravail-mobilite', 'Télétravail & Mobilité', 'Sécurisez votre travail à distance', 'INTERMEDIATE', 10, 10, true),

-- Niveau Avancé
('attaques-ciblees', 'Attaques Ciblées', 'Comprenez les attaques ciblées sophistiquées', 'ADVANCED', 12, 11, true),
('ransomware', 'Ransomware', 'Protégez-vous contre les ransomwares', 'ADVANCED', 10, 12, true),
('protection-donnees', 'Protection des Données', 'Maîtrisez la protection et la confidentialité des données', 'ADVANCED', 10, 13, true),
('shadow-it', 'Shadow IT', 'Comprenez les risques du Shadow IT', 'ADVANCED', 10, 14, true),
('culture-securite', 'Culture Sécurité', 'Devenez un ambassadeur de la cybersécurité', 'ADVANCED', 12, 15, true);

-- =======================
-- SEED INITIAL : BADGES
-- =======================
-- Badges par module (15 badges)
INSERT INTO badges (name, display_name, description, icon_url, badge_type, requirement_type, requirement_value, rarity, points, order_index) VALUES
-- Badges Débutant
('badge-phishing-master', 'Phishing Master 🎣', 'Vous avez complété tous les exercices sur le phishing', NULL, 'MODULE', 'MODULE_COMPLETE', 'phishing-emails', 'COMMON', 10, 1),
('badge-link-detective', 'Détective de Liens 🔍', 'Expert en détection de liens suspects', NULL, 'MODULE', 'MODULE_COMPLETE', 'liens-suspects', 'COMMON', 10, 2),
('badge-password-guru', 'Guru des Mots de Passe 🔐', 'Maître de la sécurité des mots de passe', NULL, 'MODULE', 'MODULE_COMPLETE', 'mots-de-passe', 'COMMON', 15, 3),
('badge-internal-guardian', 'Gardien Interne 🛡️', 'Protecteur contre les faux messages internes', NULL, 'MODULE', 'MODULE_COMPLETE', 'faux-messages-internes', 'COMMON', 10, 4),
('badge-security-reflex', 'Réflexe Sécurité ⚡', 'Les bons réflexes sont votre seconde nature', NULL, 'MODULE', 'MODULE_COMPLETE', 'reflexes-securite-base', 'COMMON', 10, 5),

-- Badges Intermédiaire
('badge-social-engineer-hunter', 'Chasseur d''Ingénierie Sociale 🎭', 'Expert en détection de manipulation', NULL, 'MODULE', 'MODULE_COMPLETE', 'ingenierie-sociale', 'RARE', 15, 6),
('badge-attachment-defender', 'Défenseur des PJ 📎', 'Protégé contre les pièces jointes malveillantes', NULL, 'MODULE', 'MODULE_COMPLETE', 'pieces-jointes-malveillantes', 'RARE', 15, 7),
('badge-fraud-stopper', 'Stop Fraude 💰', 'Expert en détection de fraudes financières', NULL, 'MODULE', 'MODULE_COMPLETE', 'fausse-facture-fraude', 'RARE', 15, 8),
('badge-identity-protector', 'Protecteur d''Identité 👤', 'Gardien de votre identité numérique', NULL, 'MODULE', 'MODULE_COMPLETE', 'usurpation-identite', 'RARE', 15, 9),
('badge-remote-secure', 'Télétravailleur Sécurisé 🏡', 'Maître du télétravail sécurisé', NULL, 'MODULE', 'MODULE_COMPLETE', 'teletravail-mobilite', 'RARE', 15, 10),

-- Badges Avancé
('badge-apt-defender', 'Défenseur APT 🎯', 'Expert en détection d''attaques ciblées', NULL, 'MODULE', 'MODULE_COMPLETE', 'attaques-ciblees', 'EPIC', 20, 11),
('badge-ransomware-warrior', 'Guerrier Anti-Ransomware 🦠', 'Protecteur contre les ransomwares', NULL, 'MODULE', 'MODULE_COMPLETE', 'ransomware', 'EPIC', 20, 12),
('badge-data-guardian', 'Gardien des Données 🔒', 'Expert en protection des données', NULL, 'MODULE', 'MODULE_COMPLETE', 'protection-donnees', 'EPIC', 20, 13),
('badge-shadow-hunter', 'Chasseur de Shadow IT 👻', 'Expert en détection du Shadow IT', NULL, 'MODULE', 'MODULE_COMPLETE', 'shadow-it', 'EPIC', 20, 14),
('badge-security-champion', 'Champion de la Sécurité 🏆', 'Ambassadeur de la culture sécurité', NULL, 'MODULE', 'MODULE_COMPLETE', 'culture-securite', 'LEGENDARY', 25, 15),

-- Badges de niveau global
('badge-beginner-complete', 'Débutant Accompli 🌟', 'Tous les modules débutants complétés', NULL, 'LEVEL', 'MODULES_COMPLETE', '5', 'RARE', 50, 16),
('badge-intermediate-complete', 'Intermédiaire Maîtrisé 💎', 'Tous les modules intermédiaires complétés', NULL, 'LEVEL', 'MODULES_COMPLETE', '10', 'EPIC', 75, 17),
('badge-advanced-complete', 'Expert Avancé 👑', 'Tous les modules avancés complétés', NULL, 'LEVEL', 'MODULES_COMPLETE', '15', 'LEGENDARY', 100, 18),

-- Badges spéciaux
('badge-perfect-score', 'Score Parfait 💯', 'Score de 100% sur 10 exercices consécutifs', NULL, 'SPECIAL', 'PERFECT_STREAK', '10', 'EPIC', 30, 19),
('badge-week-streak', 'Série de 7 Jours 🔥', 'Connexion et exercices 7 jours consécutifs', NULL, 'STREAK', 'CONSECUTIVE_DAYS', '7', 'RARE', 25, 20);

-- =======================
-- FONCTION : Calculer progression module
-- =======================
CREATE OR REPLACE FUNCTION update_user_module_progress(
    p_user_id BIGINT,
    p_module_name VARCHAR(255)
) RETURNS VOID AS $$
DECLARE
    v_module_id BIGINT;
    v_total_exercises INTEGER;
    v_completed INTEGER;
    v_success INTEGER;
    v_avg_score DOUBLE PRECISION;
    v_completion_pct DOUBLE PRECISION;
    v_status VARCHAR(50);
BEGIN
    -- Récupérer l'ID et le total d'exercices du module
    SELECT id, total_exercises INTO v_module_id, v_total_exercises
    FROM modules
    WHERE name = p_module_name AND active = true;
    
    IF v_module_id IS NULL THEN
        RETURN;
    END IF;
    
    -- Compter les exercices complétés et réussis
    SELECT 
        COUNT(DISTINCT uer.exercise_id),
        SUM(CASE WHEN uer.success THEN 1 ELSE 0 END),
        COALESCE(AVG(uer.score), 0)
    INTO v_completed, v_success, v_avg_score
    FROM user_exercise_results uer
    JOIN exercises e ON uer.exercise_id = e.id
    WHERE uer.user_id = p_user_id
      AND LOWER(e.topic) = LOWER(REPLACE(p_module_name, '-', ' '));
    
    -- Calculer pourcentage de complétion
    v_completion_pct := (v_completed::DOUBLE PRECISION / NULLIF(v_total_exercises, 0)::DOUBLE PRECISION) * 100;
    
    -- Déterminer le statut
    IF v_completion_pct = 0 THEN
        v_status := 'NOT_STARTED';
    ELSIF v_completion_pct >= 100 THEN
        v_status := 'COMPLETED';
    ELSE
        v_status := 'IN_PROGRESS';
    END IF;
    
    -- Insérer ou mettre à jour la progression
    INSERT INTO user_modules_progress (
        user_id, module_id, exercises_completed, exercises_success, 
        total_exercises, completion_percentage, average_score, status, 
        started_at, completed_at, last_activity_at
    ) VALUES (
        p_user_id, v_module_id, v_completed, v_success,
        v_total_exercises, v_completion_pct, v_avg_score, v_status,
        CASE WHEN v_completed > 0 THEN NOW() ELSE NULL END,
        CASE WHEN v_status = 'COMPLETED' THEN NOW() ELSE NULL END,
        NOW()
    )
    ON CONFLICT (user_id, module_id) DO UPDATE SET
        exercises_completed = v_completed,
        exercises_success = v_success,
        completion_percentage = v_completion_pct,
        average_score = v_avg_score,
        status = v_status,
        completed_at = CASE WHEN v_status = 'COMPLETED' AND user_modules_progress.status != 'COMPLETED' 
                           THEN NOW() 
                           ELSE user_modules_progress.completed_at 
                      END,
        last_activity_at = NOW();
        
END;
$$ LANGUAGE plpgsql;

-- =======================
-- FONCTION : Attribuer badge automatiquement
-- =======================
CREATE OR REPLACE FUNCTION award_badge_if_earned(
    p_user_id BIGINT,
    p_module_name VARCHAR(255)
) RETURNS VOID AS $$
DECLARE
    v_badge_id BIGINT;
    v_completion_pct DOUBLE PRECISION;
BEGIN
    -- Vérifier si le module est complété à 100%
    SELECT completion_percentage INTO v_completion_pct
    FROM user_modules_progress ump
    JOIN modules m ON ump.module_id = m.id
    WHERE ump.user_id = p_user_id
      AND m.name = p_module_name;
    
    IF v_completion_pct >= 100 THEN
        -- Récupérer le badge correspondant
        SELECT id INTO v_badge_id
        FROM badges
        WHERE requirement_type = 'MODULE_COMPLETE'
          AND requirement_value = p_module_name
          AND active = true;
        
        IF v_badge_id IS NOT NULL THEN
            -- Attribuer le badge (si pas déjà obtenu)
            INSERT INTO user_badges (user_id, badge_id, earned_at)
            VALUES (p_user_id, v_badge_id, NOW())
            ON CONFLICT (user_id, badge_id) DO NOTHING;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =======================
-- FONCTION : Mettre à jour niveau utilisateur
-- =======================
CREATE OR REPLACE FUNCTION update_user_level(p_user_id BIGINT) RETURNS VOID AS $$
DECLARE
    v_modules_completed INTEGER;
    v_total_badges INTEGER;
    v_total_xp INTEGER;
    v_current_level INTEGER;
    v_rank VARCHAR(50);
BEGIN
    -- Compter modules complétés
    SELECT COUNT(*) INTO v_modules_completed
    FROM user_modules_progress
    WHERE user_id = p_user_id
      AND status = 'COMPLETED';
    
    -- Compter badges obtenus
    SELECT COUNT(*) INTO v_total_badges
    FROM user_badges
    WHERE user_id = p_user_id;
    
    -- Calculer XP total (10 XP par module + points des badges)
    SELECT 
        (v_modules_completed * 10) + COALESCE(SUM(b.points), 0)
    INTO v_total_xp
    FROM user_badges ub
    JOIN badges b ON ub.badge_id = b.id
    WHERE ub.user_id = p_user_id;
    
    -- Calculer niveau (1 niveau tous les 100 XP)
    v_current_level := GREATEST(1, (v_total_xp / 100) + 1);
    
    -- Déterminer le rang
    IF v_modules_completed < 5 THEN
        v_rank := 'DÉBUTANT';
    ELSIF v_modules_completed < 10 THEN
        v_rank := 'INTERMÉDIAIRE';
    ELSIF v_modules_completed < 15 THEN
        v_rank := 'AVANCÉ';
    ELSE
        v_rank := 'EXPERT';
    END IF;
    
    -- Insérer ou mettre à jour
    INSERT INTO user_level (
        user_id, current_level, total_xp, xp_to_next_level,
        modules_completed, total_badges, rank, updated_at, last_activity_date
    ) VALUES (
        p_user_id, v_current_level, v_total_xp, (v_current_level * 100),
        v_modules_completed, v_total_badges, v_rank, NOW(), CURRENT_DATE
    )
    ON CONFLICT (user_id) DO UPDATE SET
        current_level = v_current_level,
        total_xp = v_total_xp,
        xp_to_next_level = (v_current_level * 100),
        modules_completed = v_modules_completed,
        total_badges = v_total_badges,
        rank = v_rank,
        updated_at = NOW(),
        last_activity_date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- =======================
-- TRIGGER : Mise à jour automatique après exercice
-- =======================
CREATE OR REPLACE FUNCTION trigger_update_progress() RETURNS TRIGGER AS $$
DECLARE
    v_module_name VARCHAR(255);
    v_topic VARCHAR(255);
BEGIN
    -- Récupérer le topic de l'exercice
    SELECT topic INTO v_topic
    FROM exercises
    WHERE id = NEW.exercise_id;
    
    -- Convertir topic en module_name (ex: "Phishing Emails" -> "phishing-emails")
    v_module_name := LOWER(REPLACE(v_topic, ' ', '-'));
    
    -- Mettre à jour la progression du module
    PERFORM update_user_module_progress(NEW.user_id, v_module_name);
    
    -- Attribuer badge si mérité
    PERFORM award_badge_if_earned(NEW.user_id, v_module_name);
    
    -- Mettre à jour le niveau utilisateur
    PERFORM update_user_level(NEW.user_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_exercise_result_insert
AFTER INSERT ON user_exercise_results
FOR EACH ROW
EXECUTE FUNCTION trigger_update_progress();

-- =======================
-- VUE : Dashboard Utilisateur
-- =======================
CREATE OR REPLACE VIEW v_user_dashboard AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    ul.current_level,
    ul.total_xp,
    ul.xp_to_next_level,
    ul.modules_completed,
    ul.total_badges,
    ul.rank,
    ul.streak_days,
    ul.last_activity_date,
    (
        SELECT json_agg(json_build_object(
            'module_name', m.display_name,
            'completion', ump.completion_percentage,
            'status', ump.status,
            'average_score', ump.average_score,
            'difficulty', m.difficulty
        ) ORDER BY m.order_index)
        FROM user_modules_progress ump
        JOIN modules m ON ump.module_id = m.id
        WHERE ump.user_id = u.id
    ) as modules_progress,
    (
        SELECT json_agg(json_build_object(
            'badge_name', b.display_name,
            'description', b.description,
            'rarity', b.rarity,
            'earned_at', ub.earned_at
        ) ORDER BY ub.earned_at DESC)
        FROM user_badges ub
        JOIN badges b ON ub.badge_id = b.id
        WHERE ub.user_id = u.id
    ) as badges_earned
FROM users u
LEFT JOIN user_level ul ON u.id = ul.user_id;

-- =======================
-- FIN DE LA MIGRATION
-- =======================
COMMENT ON TABLE modules IS 'Définition des modules d''apprentissage (thèmes)';
COMMENT ON TABLE user_modules_progress IS 'Progression utilisateur par module';
COMMENT ON TABLE badges IS 'Définition des badges disponibles';
COMMENT ON TABLE user_badges IS 'Badges obtenus par les utilisateurs';
COMMENT ON TABLE user_level IS 'Niveau et progression globale de l''utilisateur';

COMMIT;

