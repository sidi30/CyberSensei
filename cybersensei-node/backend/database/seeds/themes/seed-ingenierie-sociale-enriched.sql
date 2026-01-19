-- =====================================================
-- SEED THEME : INGÉNIERIE SOCIALE - VERSION ENRICHIE
-- Format pédagogique avec médias et conseils structurés
-- =====================================================

DELETE FROM exercises WHERE topic = 'Ingénierie Sociale';

INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES

-- Question 1 : Appel téléphonique suspect
('Ingénierie Sociale', 'QUIZ', 'BEGINNER', '{
  "courseIntro": "L''ingénierie sociale, c''est l''art de manipuler les gens pour obtenir des informations. 🎭 Pas besoin de hacker un ordinateur quand on peut hacker un humain !",
  "introMedia": {
    "type": "image",
    "url": "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=600",
    "alt": "Personne au téléphone soucieuse",
    "caption": "Les arnaqueurs sont des experts en manipulation"
  },
  "questions": [
    {
      "id": "is_b_01",
      "context": "Tu reçois un appel : ''Bonjour, je suis du support Microsoft. Nous avons détecté un virus sur votre ordinateur. Je vais vous aider à le supprimer, pouvez-vous me donner accès à votre écran ?''",
      "text": "Que fais-tu ?",
      "options": [
        "Je les laisse accéder à mon PC, ils veulent m''aider",
        "Je raccroche immédiatement, c''est une arnaque",
        "Je leur donne mon numéro de PC pour vérifier"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Excellent réflexe ! Microsoft ne t''appellera JAMAIS spontanément. C''est une arnaque ultra-classique.",
      "feedbackIncorrect": "Attention ! Microsoft, Apple, ta banque... aucune entreprise ne t''appelle spontanément pour te ''dépanner''. C''est toujours une arnaque !",
      "advice": {
        "concept": "Les vraies entreprises tech n''appellent JAMAIS spontanément. Si quelqu''un appelle pour ''t''aider'' sans que tu l''aies demandé, c''est une arnaque.",
        "example": "C''est comme si un ''serrurier'' sonnait chez toi en disant ''J''ai vu que votre serrure était abîmée, donnez-moi vos clés pour la réparer''.",
        "advice": [
          "Raccroche immédiatement aux appels de ''support technique''",
          "Ne donne JAMAIS accès à ton PC par téléphone",
          "Si tu as un doute, appelle TOI-MÊME le vrai support"
        ],
        "media": {
          "type": "image",
          "url": "https://images.unsplash.com/photo-1523966211575-eb4a01e7dd51?w=400",
          "alt": "Téléphone avec appel suspect",
          "caption": "Appel spontané de ''support'' = ARNAQUE"
        }
      },
      "keyTakeaway": "Appel spontané de support = ARNAQUE à 100%"
    }
  ]
}', true),

-- Question 2 : USB trouvée
('Ingénierie Sociale', 'QUIZ', 'INTERMEDIATE', '{
  "courseIntro": "La curiosité est parfois un piège... 🎁",
  "questions": [
    {
      "id": "is_i_01",
      "context": "Tu trouves une clé USB sur le parking de ton entreprise avec une étiquette ''Photos RH - Confidentiel''.",
      "text": "Que fais-tu ?",
      "options": [
        "Je la branche sur mon PC pour voir ce qu''il y a",
        "Je l''apporte au service IT sans la brancher",
        "Je la branche sur un vieux PC pour être prudent",
        "Je la jette à la poubelle"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Parfait ! C''est peut-être un piège (''USB dropping''). Le service IT a les outils pour l''analyser en toute sécurité.",
      "feedbackIncorrect": "Danger ! Les pirates laissent exprès des clés USB piégées. Dès que tu la branches, un malware s''installe automatiquement.",
      "advice": {
        "concept": "Le ''USB dropping'' consiste à abandonner des clés USB piégées. La curiosité pousse les gens à les brancher et le malware s''installe instantanément.",
        "example": "C''est comme manger un bonbon trouvé par terre : ça a l''air appétissant mais qui sait ce qu''il contient ?",
        "advice": [
          "Ne JAMAIS brancher une clé USB trouvée",
          "Apporte-la au service IT",
          "Même un ''vieux PC'' peut propager un virus sur le réseau"
        ]
      },
      "keyTakeaway": "Clé USB trouvée = NE JAMAIS la brancher"
    }
  ]
}', true),

-- Question 3 : Tailgating
('Ingénierie Sociale', 'QUIZ', 'BEGINNER', '{
  "courseIntro": "La sécurité physique, ça compte aussi ! 🚪",
  "questions": [
    {
      "id": "is_b_02",
      "context": "Tu entres dans ton bureau avec ton badge. Un homme en costume avec un carton dans les bras te dit ''Excusez-moi, je suis le nouveau du 3ème, j''ai oublié mon badge, vous pouvez me tenir la porte ?''",
      "text": "Comment réagis-tu ?",
      "options": [
        "Je lui tiens la porte, il a l''air professionnel",
        "Je lui demande de contacter l''accueil pour avoir un badge visiteur",
        "Je le laisse entrer mais je préviens l''accueil après"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Bravo ! Le ''tailgating'' (suivre quelqu''un) est une technique classique. Même si c''est gênant, la sécurité passe avant la politesse.",
      "feedbackIncorrect": "Attention ! Le ''tailgating'' est une technique d''intrusion très efficace. Un badge, c''est personnel. Sans badge = pas d''entrée, peu importe l''excuse.",
      "advice": {
        "concept": "Le ''tailgating'' consiste à profiter de la politesse des gens pour entrer dans un bâtiment sécurisé sans badge.",
        "example": "C''est comme si quelqu''un te demandait les clés de chez toi parce qu''il ''a oublié les siennes''. Tu ne les donnerais pas !",
        "advice": [
          "Chaque personne doit badger individuellement",
          "Renvoie poliment vers l''accueil ou le gardien",
          "Ce n''est pas être méchant, c''est protéger tout le monde"
        ]
      },
      "keyTakeaway": "Sans badge = pas d''entrée (peu importe l''excuse)"
    }
  ]
}', true),

-- Question 4 : Shoulder surfing
('Ingénierie Sociale', 'QUIZ', 'BEGINNER', '{
  "courseIntro": "Parfois, le danger est juste derrière toi... 👀",
  "questions": [
    {
      "id": "is_b_03",
      "context": "Tu es au café en train de te connecter à ton espace bancaire sur ton laptop. Quelqu''un s''assoit à la table juste derrière toi.",
      "text": "Quel risque principal cours-tu ?",
      "options": [
        "Aucun, mes données sont chiffrées",
        "On peut voir mon mot de passe en regardant par-dessus mon épaule",
        "Mon PC peut être piraté via le Wi-Fi"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Exactement ! Le ''shoulder surfing'' (regarder par-dessus l''épaule) est une technique simple mais très efficace.",
      "feedbackIncorrect": "Le risque principal ici est physique : quelqu''un peut tout simplement REGARDER ce que tu tapes. Pas besoin de hacking sophistiqué !",
      "advice": {
        "concept": "Le ''shoulder surfing'' consiste à espionner quelqu''un en regardant son écran ou son clavier. Simple mais redoutablement efficace.",
        "example": "Comme un pickpocket qui regarde ton code de carte bleue au distributeur pour te la voler après.",
        "advice": [
          "Tourne-toi de façon à cacher ton écran",
          "Utilise un filtre de confidentialité sur ton écran",
          "Évite de saisir des mots de passe dans les lieux publics"
        ]
      },
      "keyTakeaway": "En public, protège ton écran des regards"
    }
  ]
}', true),

-- Question 5 : Pretexting
('Ingénierie Sociale', 'QUIZ', 'ADVANCED', '{
  "courseIntro": "Les meilleurs escrocs inventent des scénarios très crédibles... 🎬",
  "questions": [
    {
      "id": "is_a_01",
      "context": "Quelqu''un t''appelle en se présentant comme un auditeur externe mandaté par la direction. Il connaît le nom du DG et demande l''accès à certains fichiers ''pour l''audit annuel''.",
      "text": "Comment réagis-tu ?",
      "options": [
        "Je lui donne accès, il connaît bien l''entreprise",
        "Je vérifie auprès de mon manager ou de la direction",
        "Je lui envoie les fichiers par email pour aller plus vite"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Parfait ! Le ''pretexting'' utilise des scénarios crédibles. Toujours vérifier par un canal DIFFÉRENT avant de donner quoi que ce soit.",
      "feedbackIncorrect": "Attention ! Connaître des noms ne prouve rien (LinkedIn existe !). Le ''pretexting'' repose sur des scénarios inventés très crédibles.",
      "advice": {
        "concept": "Le ''pretexting'' consiste à créer un scénario crédible (prétexte) pour manipuler quelqu''un. Plus le scénario est détaillé, plus il semble vrai.",
        "example": "C''est comme un faux policier avec un uniforme parfait : il a l''air officiel mais c''est un escroc.",
        "advice": [
          "Vérifie TOUJOURS par un canal différent (appel direct)",
          "Connaître des noms internes ne prouve rien",
          "Les vrais auditeurs passent par la direction, pas par toi"
        ]
      },
      "keyTakeaway": "Scénario crédible = vérification obligatoire"
    }
  ]
}', true),

-- Question 6 : Quid pro quo
('Ingénierie Sociale', 'QUIZ', 'INTERMEDIATE', '{
  "courseIntro": "''Je te donne ça, tu me donnes ça''... méfiance ! 🎁↔️",
  "questions": [
    {
      "id": "is_i_02",
      "context": "Tu reçois un appel : ''Bonjour, nous offrons un audit de sécurité GRATUIT à votre entreprise. Il me faudrait juste vos identifiants VPN pour tester vos défenses.''",
      "text": "Comment réagis-tu ?",
      "options": [
        "Super, un audit gratuit ! Je donne mes identifiants",
        "Je refuse et je signale cet appel",
        "Je demande à recevoir une offre par email d''abord"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Excellent ! Le ''quid pro quo'' offre quelque chose en échange d''informations. Un vrai audit passe par la direction, pas par tes identifiants.",
      "feedbackIncorrect": "Attention ! C''est du ''quid pro quo'' : offrir un service contre tes informations. Un vrai audit ne demande JAMAIS tes identifiants personnels.",
      "advice": {
        "concept": "Le ''quid pro quo'' propose un avantage (cadeau, service gratuit) en échange d''informations confidentielles. C''est un troc piégé.",
        "example": "C''est comme quelqu''un qui te propose un ''bilan de santé gratuit'' contre tes coordonnées bancaires.",
        "advice": [
          "Un cadeau spontané cache souvent une arnaque",
          "Les audits légitimes passent par la hiérarchie",
          "Ne donne JAMAIS tes identifiants pour un ''test''"
        ]
      },
      "keyTakeaway": "Cadeau contre infos = ARNAQUE"
    }
  ]
}', true);

\echo 'Seed enrichi Ingénierie Sociale appliqué avec succès (6 exercices)';

