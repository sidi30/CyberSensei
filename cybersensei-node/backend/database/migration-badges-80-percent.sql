-- ============================================================================
-- MIGRATION : Modification Attribution Badges à 80%
-- Description : Change le seuil d'attribution des badges de 100% à 80%
-- Date : 2026-01-01
-- ============================================================================

-- Modifier la fonction pour attribuer le badge à 80% au lieu de 100%
CREATE OR REPLACE FUNCTION award_badge_if_earned(
    p_user_id BIGINT,
    p_module_name VARCHAR(255)
) RETURNS VOID AS $$
DECLARE
    v_badge_id BIGINT;
    v_completion_pct DOUBLE PRECISION;
BEGIN
    -- Vérifier si le module est complété à 80% ou plus
    SELECT completion_percentage INTO v_completion_pct
    FROM user_modules_progress ump
    JOIN modules m ON ump.module_id = m.id
    WHERE ump.user_id = p_user_id
      AND m.name = p_module_name;
    
    -- 🎯 CHANGEMENT : 80% au lieu de 100%
    IF v_completion_pct >= 80 THEN
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
            
            -- Log pour debug (optionnel)
            RAISE NOTICE 'Badge % attribué à l''utilisateur % (completion: %)', 
                v_badge_id, p_user_id, v_completion_pct;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Vérification
SELECT 'Fonction award_badge_if_earned mise à jour : badge à 80%' AS status;

COMMIT;

