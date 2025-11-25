-- Seed: Sample Exercises
-- Comprehensive quiz database covering various cybersecurity topics

\echo 'Seeding sample exercises...'

-- Phishing Recognition Exercises (BEGINNER)
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES
('Reconnaissance du Phishing', 'QUIZ', 'BEGINNER', 
'{
  "question": "Quel est le signe le plus courant d''un email de phishing ?",
  "options": [
    "Une adresse email professionnelle",
    "Un langage urgent demandant une action immédiate",
    "Une signature complète",
    "Un français parfait"
  ],
  "correctAnswer": 1,
  "explanation": "Les emails de phishing utilisent souvent un langage urgent pour créer un sentiment de panique et pousser à l''action sans réflexion."
}', true),

('Liens Suspects', 'QUIZ', 'BEGINNER',
'{
  "question": "Comment vérifier la destination réelle d''un lien dans un email ?",
  "options": [
    "Cliquer directement dessus",
    "Survoler le lien avec la souris sans cliquer",
    "Faire confiance au texte affiché",
    "Demander à un collègue"
  ],
  "correctAnswer": 1,
  "explanation": "En survolant un lien, vous pouvez voir l''URL réelle dans la barre de statut de votre navigateur, révélant souvent des domaines suspects."
}', true),

('Pièces Jointes', 'QUIZ', 'BEGINNER',
'{
  "question": "Quelle extension de fichier est la PLUS dangereuse à ouvrir ?",
  "options": [
    ".pdf",
    ".txt",
    ".exe",
    ".jpg"
  ],
  "correctAnswer": 2,
  "explanation": "Les fichiers .exe sont des exécutables qui peuvent installer des malwares. Méfiez-vous particulièrement des pièces jointes .exe, .bat, .scr, et .js."
}', true),

-- Password Security Exercises (INTERMEDIATE)
('Sécurité des Mots de Passe', 'QUIZ', 'INTERMEDIATE',
'{
  "question": "Quelle est la longueur MINIMALE recommandée pour un mot de passe sécurisé en 2024 ?",
  "options": [
    "6 caractères",
    "8 caractères",
    "12 caractères",
    "16 caractères"
  ],
  "correctAnswer": 2,
  "explanation": "Les experts recommandent au minimum 12 caractères, avec un mélange de majuscules, minuscules, chiffres et symboles."
}', true),

('Authentification Multi-Facteurs', 'QUIZ', 'INTERMEDIATE',
'{
  "question": "Quel type d''authentification à deux facteurs (2FA) est le PLUS sécurisé ?",
  "options": [
    "SMS avec code",
    "Email avec code",
    "Application d''authentification (Google Authenticator, Authy)",
    "Questions de sécurité"
  ],
  "correctAnswer": 2,
  "explanation": "Les applications d''authentification génèrent des codes temporaires basés sur le temps (TOTP) et ne peuvent pas être interceptés comme les SMS."
}', true),

('Gestionnaires de Mots de Passe', 'QUIZ', 'INTERMEDIATE',
'{
  "question": "Pourquoi est-il recommandé d''utiliser un gestionnaire de mots de passe ?",
  "options": [
    "Pour n''avoir qu''un seul mot de passe à retenir",
    "Pour générer et stocker des mots de passe uniques et complexes",
    "Pour partager ses mots de passe facilement",
    "Pour ne jamais avoir à changer ses mots de passe"
  ],
  "correctAnswer": 1,
  "explanation": "Un gestionnaire de mots de passe permet de créer des mots de passe uniques et très complexes pour chaque service, sans avoir à les mémoriser."
}', true),

-- Social Engineering (ADVANCED)
('Ingénierie Sociale', 'QUIZ', 'ADVANCED',
'{
  "question": "Un collègue vous appelle en se présentant du service IT et demande votre mot de passe pour résoudre un problème urgent. Que faites-vous ?",
  "options": [
    "Je donne mon mot de passe car c''est urgent",
    "Je refuse et contacte le service IT par un canal officiel",
    "Je donne un ancien mot de passe",
    "Je demande son nom et je rappelle plus tard"
  ],
  "correctAnswer": 1,
  "explanation": "Le service IT ne demandera JAMAIS votre mot de passe. C''est une tentative classique d''ingénierie sociale. Vérifiez toujours l''identité par un canal officiel."
}', true),

('Tailgating', 'QUIZ', 'ADVANCED',
'{
  "question": "Qu''est-ce que le ''tailgating'' en sécurité physique ?",
  "options": [
    "Suivre quelqu''un de trop près en voiture",
    "Entrer dans un bâtiment sécurisé en suivant une personne autorisée",
    "Voler des données en regardant par-dessus l''épaule",
    "Intercepter des communications"
  ],
  "correctAnswer": 1,
  "explanation": "Le tailgating consiste à suivre une personne autorisée pour entrer dans une zone sécurisée sans badge. Toujours vérifier que la porte se referme et ne laissez pas entrer d''inconnus."
}', true),

('Pretexting', 'QUIZ', 'ADVANCED',
'{
  "question": "Un attaquant se fait passer pour un auditeur externe et demande l''accès aux serveurs. C''est un exemple de :",
  "options": [
    "Phishing",
    "Pretexting",
    "Baiting",
    "Quid pro quo"
  ],
  "correctAnswer": 1,
  "explanation": "Le pretexting consiste à créer un scénario inventé (prétexte) pour manipuler quelqu''un et obtenir des informations ou des accès."
}', true),

-- Data Protection (INTERMEDIATE)
('Protection des Données', 'QUIZ', 'INTERMEDIATE',
'{
  "question": "Vous devez envoyer des données confidentielles par email. Quelle est la MEILLEURE pratique ?",
  "options": [
    "Envoyer directement le fichier",
    "Protéger le fichier par mot de passe et envoyer le mot de passe par un canal différent",
    "Renommer le fichier avec un nom neutre",
    "Envoyer en plusieurs fois"
  ],
  "correctAnswer": 1,
  "explanation": "Toujours chiffrer les données sensibles et transmettre le mot de passe par un canal séparé (SMS, appel, messagerie instantanée)."
}', true),

('RGPD', 'QUIZ', 'INTERMEDIATE',
'{
  "question": "Selon le RGPD, quel est le délai maximum pour notifier une violation de données personnelles ?",
  "options": [
    "24 heures",
    "48 heures",
    "72 heures",
    "7 jours"
  ],
  "correctAnswer": 2,
  "explanation": "Le RGPD impose de notifier les autorités de contrôle dans les 72 heures après avoir pris connaissance d''une violation de données."
}', true),

-- Network Security (EXPERT)
('Sécurité Réseau', 'QUIZ', 'EXPERT',
'{
  "question": "Quel protocole cryptographique est recommandé pour les connexions VPN en 2024 ?",
  "options": [
    "PPTP",
    "L2TP/IPSec",
    "WireGuard",
    "SSL VPN"
  ],
  "correctAnswer": 2,
  "explanation": "WireGuard est le protocole VPN moderne le plus sécurisé et performant, utilisant une cryptographie de pointe avec une base de code réduite."
}', true),

('Zero Trust', 'QUIZ', 'EXPERT',
'{
  "question": "Le modèle de sécurité ''Zero Trust'' repose sur quel principe fondamental ?",
  "options": [
    "Faire confiance mais vérifier",
    "Ne jamais faire confiance, toujours vérifier",
    "Faire confiance au réseau interne",
    "Vérifier uniquement les connexions externes"
  ],
  "correctAnswer": 1,
  "explanation": "Zero Trust part du principe qu''aucune connexion n''est fiable par défaut, qu''elle vienne de l''intérieur ou de l''extérieur du réseau."
}', true),

-- Ransomware (ADVANCED)
('Ransomware', 'QUIZ', 'ADVANCED',
'{
  "question": "Votre écran affiche un message indiquant que vos fichiers sont chiffrés et demandant une rançon. Quelle est la PREMIÈRE action à effectuer ?",
  "options": [
    "Payer la rançon immédiatement",
    "Déconnecter la machine du réseau",
    "Redémarrer l''ordinateur",
    "Supprimer tous les fichiers"
  ],
  "correctAnswer": 1,
  "explanation": "Déconnectez immédiatement du réseau pour empêcher la propagation. Puis contactez l''équipe IT. Ne payez JAMAIS la rançon sans consulter les experts."
}', true),

-- Cloud Security (EXPERT)
('Sécurité Cloud', 'QUIZ', 'EXPERT',
'{
  "question": "Dans le modèle de responsabilité partagée du cloud, qui est responsable de la sécurité DES données ?",
  "options": [
    "Le fournisseur cloud uniquement",
    "Le client uniquement",
    "Les deux, selon le service",
    "Personne en particulier"
  ],
  "correctAnswer": 1,
  "explanation": "Le client est TOUJOURS responsable de la sécurité de SES données (chiffrement, contrôle d''accès, classification), quel que soit le modèle (IaaS, PaaS, SaaS)."
}', true)
ON CONFLICT DO NOTHING;

\echo 'Sample exercises seeded successfully (15 exercises created).'


