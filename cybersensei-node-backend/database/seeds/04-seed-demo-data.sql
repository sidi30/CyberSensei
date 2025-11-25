-- Seed: Demo Data
-- Sample users, results, and metrics for demonstration

\echo 'Seeding demo data...'

-- Additional demo users
INSERT INTO users (name, email, role, department, created_at, active, password_hash) VALUES
('Alice Martin', 'alice.martin@demo.com', 'EMPLOYEE', 'IT', NOW(), true, '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
('Bob Dupont', 'bob.dupont@demo.com', 'EMPLOYEE', 'Marketing', NOW(), true, '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
('Claire Lefebvre', 'claire.lefebvre@demo.com', 'EMPLOYEE', 'Finance', NOW(), true, '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
('David Bernard', 'david.bernard@demo.com', 'EMPLOYEE', 'Operations', NOW(), true, '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
('Emma Rousseau', 'emma.rousseau@demo.com', 'MANAGER', 'HR', NOW(), true, '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
ON CONFLICT (email) DO NOTHING;

-- AI Profiles for demo users
INSERT INTO ai_profiles (user_id, style, weaknesses_json, created_at, updated_at)
SELECT 
    u.id,
    CASE 
        WHEN u.department = 'IT' THEN 'practical'
        WHEN u.department = 'Marketing' THEN 'visual'
        ELSE 'theoretical'
    END,
    '{"phishing": 30, "passwords": 15, "social_engineering": 45}'::jsonb,
    NOW(),
    NOW()
FROM users u
WHERE u.email LIKE '%@demo.com'
ON CONFLICT (user_id) DO NOTHING;

-- Sample exercise results (last 30 days)
DO $$
DECLARE
    v_user_id bigint;
    v_exercise_id bigint;
    v_day_offset int;
    v_score double precision;
BEGIN
    FOR v_user_id IN (SELECT id FROM users WHERE email LIKE '%@demo.com') LOOP
        FOR v_day_offset IN 0..29 LOOP
            -- Random exercise
            SELECT id INTO v_exercise_id 
            FROM exercises 
            WHERE active = true 
            ORDER BY RANDOM() 
            LIMIT 1;
            
            -- Random score (weighted towards success)
            v_score := CASE 
                WHEN RANDOM() < 0.7 THEN 100  -- 70% success
                ELSE 0
            END;
            
            INSERT INTO user_exercise_results (
                user_id, 
                exercise_id, 
                score, 
                success, 
                duration, 
                details_json, 
                date
            ) VALUES (
                v_user_id,
                v_exercise_id,
                v_score,
                v_score = 100,
                (RANDOM() * 120 + 30)::int,  -- 30-150 seconds
                jsonb_build_object(
                    'selectedAnswer', (RANDOM() * 3)::int,
                    'correctAnswer', 1
                ),
                NOW() - (v_day_offset || ' days')::interval - (RANDOM() * 24 || ' hours')::interval
            );
        END LOOP;
    END LOOP;
END $$;

-- Initial company metrics
INSERT INTO company_metrics (
    score, 
    risk_level, 
    updated_at,
    average_quiz_score,
    phishing_click_rate,
    active_users,
    completed_exercises
) VALUES (
    78.5,
    'MEDIUM',
    NOW(),
    76.2,
    22.5,
    8,
    240
);

-- Sample phishing campaign
INSERT INTO phishing_campaigns (template_id, sent_at, total_sent, total_clicked, total_opened, total_reported)
SELECT 
    pt.id,
    NOW() - interval '5 days',
    8,
    2,
    6,
    1
FROM phishing_templates pt
WHERE pt.label = 'Réinitialisation Urgente'
LIMIT 1;

-- Phishing trackers for the campaign
DO $$
DECLARE
    v_campaign_id bigint;
    v_user_id bigint;
    v_clicked boolean;
    v_opened boolean;
BEGIN
    SELECT id INTO v_campaign_id FROM phishing_campaigns LIMIT 1;
    
    FOR v_user_id IN (SELECT id FROM users WHERE email LIKE '%@demo.com') LOOP
        v_opened := RANDOM() < 0.75;  -- 75% open rate
        v_clicked := v_opened AND RANDOM() < 0.3;  -- 30% of opened emails get clicked
        
        INSERT INTO phishing_trackers (
            token,
            user_id,
            campaign_id,
            clicked,
            clicked_at,
            opened,
            opened_at,
            reported,
            reported_at,
            sent_at
        ) VALUES (
            gen_random_uuid()::text,
            v_user_id,
            v_campaign_id,
            v_clicked,
            CASE WHEN v_clicked THEN NOW() - interval '4 days' ELSE NULL END,
            v_opened,
            CASE WHEN v_opened THEN NOW() - interval '5 days' ELSE NULL END,
            false,
            NULL,
            NOW() - interval '5 days'
        );
    END LOOP;
END $$;

-- Sample logs
INSERT INTO logs (timestamp, level, logger, message, user_id, endpoint, method, status_code, duration_ms)
VALUES
(NOW() - interval '1 hour', 'INFO', 'io.cybersensei.api.controller.UserController', 'User retrieved successfully', 1, '/api/user/me', 'GET', 200, 45),
(NOW() - interval '2 hours', 'INFO', 'io.cybersensei.api.controller.QuizController', 'Quiz retrieved successfully', 2, '/api/quiz/today', 'GET', 200, 123),
(NOW() - interval '3 hours', 'WARN', 'io.cybersensei.security.JwtAuthenticationFilter', 'Invalid JWT token', NULL, '/api/user/me', 'GET', 401, 12),
(NOW() - interval '4 hours', 'INFO', 'io.cybersensei.service.PhishingService', 'Phishing campaign sent successfully', NULL, NULL, NULL, NULL, 5432),
(NOW() - interval '5 hours', 'ERROR', 'io.cybersensei.service.AIService', 'AI service timeout', 3, '/api/ai/chat', 'POST', 500, 30000);

\echo 'Demo data seeded successfully.'
\echo '  - 5 additional users created'
\echo '  - 240+ exercise results generated'
\echo '  - 1 phishing campaign with trackers'
\echo '  - Initial metrics calculated'
\echo '  - Sample logs inserted'


