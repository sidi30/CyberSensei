-- CyberSensei Seed Script
-- Insère le tenant démo + exercices

-- Variable tenant ID
DO $$
DECLARE
  v_tenant_id uuid;
  v_count int;
BEGIN
  -- Récupérer le tenant démo
  SELECT id INTO v_tenant_id FROM tenants WHERE "activationCode" = 'CS-DEMO2024';

  IF v_tenant_id IS NULL THEN
    RAISE NOTICE 'Tenant CS-DEMO2024 non trouvé, rien à insérer.';
    RETURN;
  END IF;

  -- Vérifier si des exercices existent déjà
  SELECT COUNT(*) INTO v_count FROM exercises WHERE "tenantId" = v_tenant_id;

  IF v_count > 0 THEN
    RAISE NOTICE 'Exercices déjà présents (%), skip.', v_count;
    RETURN;
  END IF;

  -- Exercice 1: Phishing
  INSERT INTO exercises (topic, type, difficulty, description, "payloadJSON", active, "tenantId", version)
  VALUES (
    'Phishing', 'QUIZ', 'BEGINNER',
    'Apprenez à reconnaître les tentatives de phishing.',
    '{"courseIntro":"Le phishing est l''attaque n°1 en entreprise. Saurez-vous déjouer ces pièges ?","questions":[{"id":"q1","text":"Vous recevez un email de votre banque vous demandant de confirmer vos identifiants via un lien. Que faites-vous ?","options":["Je clique sur le lien","Je contacte directement ma banque par téléphone","Je transfère l''email à un collègue","J''ignore l''email"],"correctAnswer":1,"context":"L''email semble authentique avec le logo de votre banque."},{"id":"q2","text":"Quel est le premier réflexe pour vérifier un email suspect ?","options":["Ouvrir les pièces jointes","Vérifier l''adresse email de l''expéditeur","Répondre à l''email","Transférer au service client"],"correctAnswer":1},{"id":"q3","text":"Un collègue vous envoie un lien WeTransfer inattendu. Que faites-vous ?","options":["Je télécharge, c''est un collègue","Je vérifie avec lui par Teams ou téléphone","Je scanne avec l''antivirus","Je clique pour voir le nom du fichier"],"correctAnswer":1}]}'::jsonb,
    true, v_tenant_id, '1.0.0'
  );

  -- Exercice 2: Mots de passe
  INSERT INTO exercises (topic, type, difficulty, description, "payloadJSON", active, "tenantId", version)
  VALUES (
    'Mots de passe', 'QUIZ', 'BEGINNER',
    'Maîtrisez les bonnes pratiques de gestion des mots de passe.',
    '{"courseIntro":"80% des fuites de données sont liées à des mots de passe faibles.","questions":[{"id":"q1","text":"Quel mot de passe est le plus sécurisé ?","options":["Azerty123!","MonChien2024","Kj#8mP!2xLq9$nR","MotDePasse1"],"correctAnswer":2},{"id":"q2","text":"Quelle est la meilleure pratique pour gérer ses mots de passe ?","options":["Le même partout mais complexe","Un fichier Excel protégé","Un gestionnaire de mots de passe (Bitwarden, 1Password)","Un post-it sous le clavier"],"correctAnswer":2},{"id":"q3","text":"Qu''est-ce que le 2FA ?","options":["Deux mots de passe différents","Confirmation par un second moyen (SMS, app)","Changer son mot de passe tous les 2 mois","Deux navigateurs différents"],"correctAnswer":1}]}'::jsonb,
    true, v_tenant_id, '1.0.0'
  );

  -- Exercice 3: Ransomware
  INSERT INTO exercises (topic, type, difficulty, description, "payloadJSON", active, "tenantId", version)
  VALUES (
    'Ransomware', 'QUIZ', 'INTERMEDIATE',
    'Comprenez les ransomwares et apprenez à vous en protéger.',
    '{"courseIntro":"Les ransomwares coûtent des milliards aux entreprises chaque année.","questions":[{"id":"q1","text":"Comment un ransomware pénètre-t-il généralement ?","options":["Par une mise à jour Windows","Par un email avec pièce jointe malveillante","Par le Wi-Fi","Par l''antivirus"],"correctAnswer":1},{"id":"q2","text":"Votre écran affiche une demande de rançon. Que faites-vous ?","options":["Je paie la rançon","Je déconnecte du réseau et j''alerte le IT","Je redémarre","J''attends"],"correctAnswer":1},{"id":"q3","text":"Meilleure protection contre les ransomwares ?","options":["Un antivirus payant","La règle 3-2-1 (3 copies, 2 supports, 1 hors site)","Un pare-feu","Ne jamais ouvrir d''emails"],"correctAnswer":1}]}'::jsonb,
    true, v_tenant_id, '1.0.0'
  );

  -- Exercice 4: Ingénierie sociale
  INSERT INTO exercises (topic, type, difficulty, description, "payloadJSON", active, "tenantId", version)
  VALUES (
    'Ingénierie sociale', 'QUIZ', 'INTERMEDIATE',
    'Déjouez les techniques de manipulation.',
    '{"courseIntro":"L''ingénierie sociale exploite la psychologie humaine.","questions":[{"id":"q1","text":"Le support IT demande votre mot de passe par téléphone. Que faites-vous ?","options":["Je le donne","Je rappelle le support via le numéro officiel","Je donne un faux","Je change et je le donne"],"correctAnswer":1},{"id":"q2","text":"Qu''est-ce que le tailgating ?","options":["Suivre quelqu''un en voiture","Entrer dans un bâtiment en suivant un employé sans badge","Voler des données derrière un écran","Envoyer des emails à la suite d''un légitime"],"correctAnswer":1},{"id":"q3","text":"Un prestataire demande l''accès salle serveur pour maintenance urgente ?","options":["Je l''accompagne","Je vérifie son identité et confirme avec mon responsable","Je demande sa carte de visite","Je refuse tout accès"],"correctAnswer":1}]}'::jsonb,
    true, v_tenant_id, '1.0.0'
  );

  -- Exercice 5: VPN & Wi-Fi
  INSERT INTO exercises (topic, type, difficulty, description, "payloadJSON", active, "tenantId", version)
  VALUES (
    'VPN & Wi-Fi', 'QUIZ', 'BEGINNER',
    'Sécurisez vos connexions en déplacement.',
    '{"courseIntro":"En télétravail, votre connexion est votre première ligne de défense.","questions":[{"id":"q1","text":"Dans un café, vous devez accéder à l''intranet. Que faites-vous ?","options":["Wi-Fi gratuit direct","J''active le VPN avant tout accès","Partage de connexion sans VPN","J''attends le bureau"],"correctAnswer":1},{"id":"q2","text":"Pourquoi le Wi-Fi public est-il risqué ?","options":["Il est plus lent","Un attaquant peut intercepter vos données (man-in-the-middle)","Il consomme plus de batterie","Les fournisseurs vendent vos données"],"correctAnswer":1},{"id":"q3","text":"Que fait un VPN exactement ?","options":["Accélère la connexion","Crée un tunnel chiffré entre votre appareil et le réseau","Bloque les pubs","Remplace l''antivirus"],"correctAnswer":1}]}'::jsonb,
    true, v_tenant_id, '1.0.0'
  );

  RAISE NOTICE '✅ 5 exercices de démo créés pour le tenant CS-DEMO2024';
END $$;
