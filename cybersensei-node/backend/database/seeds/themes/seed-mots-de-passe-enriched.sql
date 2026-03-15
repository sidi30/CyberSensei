-- =====================================================
-- SEED THEME : MOTS DE PASSE - VERSION ENRICHIE
-- Format pédagogique avec médias et conseils structurés
-- =====================================================

DELETE FROM exercises WHERE topic = 'Mots de Passe';

INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES

-- Question 1 : Longueur minimale
('Mots de Passe', 'QUIZ', 'BEGINNER', '{
  "courseIntro": "Aujourd''hui, on parle de la base de la sécurité : les mots de passe ! 🔐 Un bon mot de passe, c''est comme une bonne serrure.",
  "introMedia": {
    "type": "image",
    "url": "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600",
    "alt": "Cadenas sécurisé",
    "caption": "Un bon mot de passe = une serrure inviolable"
  },
  "questions": [
    {
      "id": "mdp_b_01",
      "context": "Tu dois créer un nouveau mot de passe pour ton compte professionnel.",
      "text": "Quelle est la longueur MINIMALE recommandée en 2024 ?",
      "options": [
        "6 caractères",
        "8 caractères",
        "12 caractères minimum",
        "Peu importe, c''est le contenu qui compte"
      ],
      "correctAnswer": 2,
      "feedbackCorrect": "Exactement ! 12 caractères minimum, c''est la nouvelle norme. Plus c''est long, plus c''est dur à casser !",
      "feedbackIncorrect": "Pas tout à fait. 8 caractères, c''était bien en 2010. Aujourd''hui, les hackers les cassent en quelques heures. 12 minimum !",
      "advice": {
        "concept": "Plus un mot de passe est long, plus il faut de temps pour le deviner. Chaque caractère supplémentaire multiplie la difficulté par 100 !",
        "example": "Un mot de passe de 6 caractères se casse en 5 secondes. Un mot de passe de 12 caractères prend des centaines d''années !",
        "advice": [
          "Minimum 12 caractères, idéalement 16",
          "Mélange majuscules, minuscules, chiffres et symboles",
          "Utilise une phrase facile à retenir : ''MonChatMangeA8h!'' "
        ],
        "media": {
          "type": "image",
          "url": "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400",
          "alt": "Comparaison de serrures",
          "caption": "6 caractères = petite serrure / 12 caractères = coffre-fort"
        }
      },
      "keyTakeaway": "12 caractères MINIMUM en 2024"
    }
  ]
}', true),

-- Question 2 : Réutilisation
('Mots de Passe', 'QUIZ', 'BEGINNER', '{
  "courseIntro": "Parlons d''une erreur très courante... 🔄",
  "questions": [
    {
      "id": "mdp_b_02",
      "context": "Tu as un super mot de passe que tu trouves parfait. Tu l''utilises pour tous tes comptes : email, banque, réseaux sociaux, shopping...",
      "text": "Est-ce une bonne pratique ?",
      "options": [
        "Oui, c''est plus simple à retenir",
        "Non, si un site est piraté, tous mes comptes sont compromis",
        "Oui, tant que le mot de passe est compliqué"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Exact ! Si un seul site se fait pirater (et ça arrive souvent !), les hackers testent ton mot de passe partout ailleurs.",
      "feedbackIncorrect": "Attention ! Chaque semaine, des sites web se font pirater. Si tu utilises le même mot de passe partout, un seul vol = tous tes comptes en danger.",
      "advice": {
        "concept": "Quand un site se fait pirater, les hackers récupèrent les mots de passe et les testent automatiquement sur tous les autres sites. C''est le ''credential stuffing''.",
        "example": "Imagine : ta clé de voiture ouvre aussi ta maison, ton bureau et ton coffre-fort. Si on te la vole, tout est compromis !",
        "advice": [
          "1 compte = 1 mot de passe UNIQUE",
          "Utilise un gestionnaire de mots de passe (Bitwarden, 1Password)",
          "Au minimum, des mots de passe différents pour banque, email et travail"
        ]
      },
      "keyTakeaway": "1 compte = 1 mot de passe UNIQUE"
    }
  ]
}', true),

-- Question 3 : Gestionnaire de mots de passe
('Mots de Passe', 'QUIZ', 'BEGINNER', '{
  "courseIntro": "Comment retenir 50 mots de passe différents ? La solution existe ! 🗝️",
  "questions": [
    {
      "id": "mdp_b_03",
      "context": "Un collègue te recommande d''utiliser un gestionnaire de mots de passe comme Bitwarden ou 1Password.",
      "text": "Pourquoi est-ce une bonne idée ?",
      "options": [
        "Pour ne retenir qu''un seul mot de passe maître",
        "Pour générer et stocker des mots de passe uniques et complexes",
        "Pour pouvoir partager ses mots de passe facilement",
        "Les deux premières réponses"
      ],
      "correctAnswer": 3,
      "feedbackCorrect": "Parfait ! Un gestionnaire génère des mots de passe super complexes et tu n''as qu''à retenir un seul mot de passe maître.",
      "feedbackIncorrect": "Presque ! Un gestionnaire fait les deux : il génère des mots de passe impossibles à retenir ET il les stocke de façon sécurisée.",
      "advice": {
        "concept": "Un gestionnaire de mots de passe est un coffre-fort numérique qui crée et stocke tous tes mots de passe. Tu n''as besoin que d''un seul mot de passe maître très fort.",
        "example": "C''est comme avoir un majordome qui retient toutes tes clés et ne les donne qu''à toi quand tu dis le mot secret.",
        "advice": [
          "Installe Bitwarden (gratuit) ou 1Password",
          "Crée un mot de passe maître très fort (16+ caractères)",
          "Active la double authentification sur ton gestionnaire"
        ]
      },
      "keyTakeaway": "Un gestionnaire de mots de passe = la solution"
    }
  ]
}', true),

-- Question 4 : Double authentification
('Mots de Passe', 'QUIZ', 'INTERMEDIATE', '{
  "courseIntro": "Le mot de passe seul ne suffit plus ! Découvrons le 2FA. 📱",
  "questions": [
    {
      "id": "mdp_i_01",
      "context": "Ton entreprise te demande d''activer la ''double authentification'' (2FA) sur tous tes comptes importants.",
      "text": "Quel type de 2FA est le PLUS sécurisé ?",
      "options": [
        "Code par SMS",
        "Code par email",
        "Application authenticator (Google/Microsoft Authenticator)",
        "Questions secrètes (nom de ton animal, etc.)"
      ],
      "correctAnswer": 2,
      "feedbackCorrect": "Bravo ! Les apps authenticator génèrent des codes toutes les 30 secondes, impossibles à intercepter contrairement aux SMS.",
      "feedbackIncorrect": "Pas tout à fait. Les SMS peuvent être interceptés (SIM swap), les emails piratés. Les apps authenticator sont locales et changent toutes les 30 secondes.",
      "advice": {
        "concept": "La double authentification ajoute une deuxième couche : même si on vole ton mot de passe, il faut aussi ton téléphone pour entrer.",
        "example": "C''est comme une porte avec deux serrures : une clé (mot de passe) + un code qui change toutes les 30 secondes (ton téléphone).",
        "advice": [
          "Installe Microsoft Authenticator ou Google Authenticator",
          "Active le 2FA sur : email, banque, réseaux sociaux",
          "Garde tes codes de récupération en lieu sûr"
        ],
        "media": {
          "type": "image",
          "url": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400",
          "alt": "Smartphone avec code 2FA",
          "caption": "Ton téléphone devient ta deuxième clé"
        }
      },
      "keyTakeaway": "2FA par app > SMS > rien du tout"
    }
  ]
}', true),

-- Question 5 : Phrase de passe
('Mots de Passe', 'QUIZ', 'INTERMEDIATE', '{
  "courseIntro": "Une technique simple pour créer des mots de passe mémorisables ET sécurisés ! 💡",
  "questions": [
    {
      "id": "mdp_i_02",
      "context": "Tu dois créer un mot de passe que tu peux retenir sans l''écrire.",
      "text": "Quelle méthode est la plus efficace ?",
      "options": [
        "Azerty123!",
        "MonChienMangeDes3Croquettes!",
        "P@ssw0rd2024",
        "123456789"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Excellent ! Une phrase complète est facile à retenir, longue, et très difficile à deviner. 27 caractères ici !",
      "feedbackIncorrect": "Les mots de passe classiques comme ''Azerty'' ou ''P@ssword'' sont dans toutes les listes de hackers. Une vraie phrase personnelle est bien meilleure.",
      "advice": {
        "concept": "Une ''passphrase'' (phrase de passe) est plus longue qu''un mot de passe classique, donc plus sécurisée, tout en étant facile à retenir car c''est une vraie phrase.",
        "example": "''J''aiMeManger2CroissantsLeMatin!'' = 32 caractères, facile à retenir, quasi impossible à casser.",
        "advice": [
          "Utilise une phrase personnelle et unique",
          "Ajoute des chiffres et des symboles naturellement",
          "Évite les citations célèbres ou paroles de chansons"
        ]
      },
      "keyTakeaway": "Une phrase > un mot compliqué"
    }
  ]
}', true),

-- Question 6 : Partage de mot de passe
('Mots de Passe', 'QUIZ', 'BEGINNER', '{
  "courseIntro": "On te demande ton mot de passe... Que faire ? 🤔",
  "questions": [
    {
      "id": "mdp_b_04",
      "context": "Tu reçois un email du ''service informatique'' te demandant ton mot de passe pour une ''vérification de sécurité urgente''.",
      "text": "Comment réagis-tu ?",
      "options": [
        "Je donne mon mot de passe, c''est le service IT",
        "Je refuse et je signale cet email au vrai service IT",
        "Je donne un ancien mot de passe",
        "Je réponds pour demander plus d''informations"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Parfait ! Le vrai service IT ne te demandera JAMAIS ton mot de passe. C''est la règle d''or !",
      "feedbackIncorrect": "Attention ! AUCUN service légitime ne te demandera JAMAIS ton mot de passe. C''est TOUJOURS une arnaque.",
      "advice": {
        "concept": "Un mot de passe est comme une brosse à dents : personnel et ne se partage JAMAIS. Les vrais services IT n''en ont pas besoin.",
        "example": "Ta banque ne t''appelle jamais pour te demander le code de ta carte bleue. C''est pareil pour tous les mots de passe.",
        "advice": [
          "Ne JAMAIS donner son mot de passe, même au ''chef''",
          "Le vrai IT peut réinitialiser ton compte sans ton mot de passe",
          "En cas de doute, appelle directement le service IT"
        ]
      },
      "keyTakeaway": "Mot de passe = JAMAIS partagé, même avec IT"
    }
  ]
}', true);

\echo 'Seed enrichi Mots de Passe appliqué avec succès (6 exercices)';

