-- =====================================================
-- SEED THEME : LIENS SUSPECTS - VERSION ENRICHIE
-- Format commercial : 3-5 questions par session, ~5 minutes
-- Conseils structurés (concept, exemple, advice)
-- =====================================================

DELETE FROM exercises WHERE topic = 'Liens Suspects';

-- SESSION 1 : Les bases des liens suspects (BEGINNER)
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES
('Liens Suspects', 'QUIZ', 'BEGINNER', '{
  "courseIntro": "Aujourd''hui, on apprend à repérer les liens piégés ! 🔗 C''est plus facile que tu ne le penses : quelques réflexes simples te protègent de 90% des arnaques.",
  "introMedia": {
    "type": "image",
    "url": "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600",
    "alt": "Lien suspect",
    "caption": "Un lien peut cacher un piège..."
  },
  "questions": [
    {
      "id": "ls_s1_q1",
      "context": "Tu reçois un SMS de ta ''banque'' : ''Votre compte sera bloqué. Cliquez ici : bit.ly/abc123''",
      "text": "Ce lien te semble-t-il sûr ?",
      "options": [
        "Oui, c''est ma banque",
        "Non, une vraie banque n''utilise pas bit.ly",
        "Je clique pour vérifier"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Exactement ! Les banques n''utilisent JAMAIS de liens raccourcis comme bit.ly. C''est le premier signal d''arnaque.",
      "feedbackIncorrect": "Attention ! Les liens raccourcis (bit.ly, tinyurl) cachent la vraie destination. Une banque utilise toujours son propre domaine.",
      "advice": {
        "concept": "Les liens raccourcis masquent la vraie adresse. Les arnaqueurs les adorent car tu ne vois pas où tu vas vraiment atterrir.",
        "example": "C''est comme si quelqu''un te disait ''Suis-moi'' sans te dire où il t''emmène. Tu suivrais un inconnu les yeux bandés ?",
        "advice": [
          "Jamais cliquer sur bit.ly, tinyurl ou liens courts",
          "Une vraie banque utilise son domaine officiel (ex: mabanque.fr)",
          "En cas de doute, tape toi-même l''adresse du site"
        ]
      },
      "keyTakeaway": "Lien raccourci = DANGER"
    },
    {
      "id": "ls_s1_q2",
      "context": "Tu survoles un lien avec ta souris. Le texte dit ''Accéder à Amazon'' mais l''URL affiche : amaz0n-login.com",
      "text": "Que remarques-tu ?",
      "options": [
        "Rien de spécial, c''est Amazon",
        "Le 0 au lieu du o = faux site !",
        "Je clique pour voir"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Bien vu ! Le ''0'' à la place du ''o'' est un piège classique. Les pirates utilisent des caractères qui se ressemblent.",
      "feedbackIncorrect": "Regarde bien : ''amaz0n'' n''est pas ''amazon''. Le chiffre 0 remplace la lettre o. C''est un faux site !",
      "advice": {
        "concept": "Les pirates créent des domaines qui ressemblent aux vrais en changeant une seule lettre. À l''œil nu, c''est presque invisible.",
        "example": "C''est comme un faux billet de 50€ avec un ''E'' mal dessiné : si tu ne regardes pas de près, tu ne le vois pas.",
        "advice": [
          "Survole TOUJOURS le lien avant de cliquer",
          "Lis chaque caractère du domaine",
          "Attention aux 0 (zéro) qui remplacent les o (lettre)"
        ]
      },
      "keyTakeaway": "SURVOLE pour voir la vraie URL"
    },
    {
      "id": "ls_s1_q3",
      "context": "Un bouton dit ''Accéder à mon compte'' mais l''URL derrière est : http://monespace-securise.xyz",
      "text": "Ce lien est-il fiable ?",
      "options": [
        "Oui, le bouton dit ''mon compte''",
        "Non, le texte du bouton peut mentir",
        "Oui car il y a ''securise'' dans l''URL"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Parfait ! Le texte d''un bouton peut dire n''importe quoi. Seule l''URL réelle compte, et ici c''est un domaine inconnu.",
      "feedbackIncorrect": "Le texte visible sur un bouton n''a aucune valeur. N''importe qui peut écrire ''Accéder à mon compte'' sur un bouton qui mène à un site pirate.",
      "advice": {
        "concept": "Le texte d''un lien ou d''un bouton est juste du maquillage. La vraie destination se trouve dans l''URL, pas dans le texte affiché.",
        "example": "C''est comme une pancarte ''Restaurant 5 étoiles'' accrochée devant une ruelle sombre. Le panneau ment, c''est l''adresse qui compte.",
        "advice": [
          "Ne te fie JAMAIS au texte du bouton",
          "Regarde l''URL qui s''affiche en bas de l''écran",
          "Les vrais sites ont des domaines connus (.fr, .com de la marque)"
        ]
      },
      "keyTakeaway": "Le texte du bouton peut MENTIR"
    },
    {
      "id": "ls_s1_q4",
      "context": "Tu reçois un lien vers ''https://secure.paypal.com.verify-account.net''",
      "text": "Ce lien appartient-il vraiment à PayPal ?",
      "options": [
        "Oui, je vois paypal.com dedans",
        "Non, le vrai domaine est verify-account.net",
        "Je ne sais pas comment vérifier"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Excellent ! Le vrai domaine est ce qui est juste avant le .net (ou .com, .fr). Ici c''est ''verify-account.net'', pas PayPal.",
      "feedbackIncorrect": "Piège classique ! Le domaine réel est la dernière partie avant l''extension. Ici c''est ''verify-account.net'', le ''paypal.com'' est juste un sous-domaine trompeur.",
      "advice": {
        "concept": "Le vrai domaine est toujours juste avant l''extension (.com, .fr, .net). Tout ce qui est avant est un sous-domaine et peut être inventé.",
        "example": "''mabanque.arnaque.com'' appartient à arnaque.com, pas à mabanque. Le propriétaire d''arnaque.com peut mettre ce qu''il veut devant.",
        "advice": [
          "Lis le domaine de DROITE À GAUCHE",
          "Le vrai nom est juste avant .com/.fr/.net",
          "secure.paypal.XXXX.net = faux PayPal"
        ]
      },
      "keyTakeaway": "Lis le domaine de DROITE À GAUCHE"
    }
  ],
  "summary": {
    "keyPoints": [
      "Les liens raccourcis (bit.ly) cachent la destination",
      "Survole toujours avant de cliquer",
      "Le texte du bouton peut mentir, seule l''URL compte",
      "Le vrai domaine est juste avant .com/.fr"
    ]
  }
}', true),

-- SESSION 2 : Liens avancés (INTERMEDIATE)
('Liens Suspects', 'QUIZ', 'INTERMEDIATE', '{
  "courseIntro": "Niveau 2 ! 🎯 Les pirates deviennent plus malins. On va voir leurs techniques avancées pour t''avoir.",
  "questions": [
    {
      "id": "ls_s2_q1",
      "context": "Tu vois un site avec un cadenas HTTPS et le nom ''paypa1-secure.com'' (avec un 1 à la place du l)",
      "text": "Le cadenas HTTPS garantit-il que ce site est légitime ?",
      "options": [
        "Oui, HTTPS = site sûr",
        "Non, HTTPS ne garantit que le chiffrement, pas la légitimité",
        "Je fais confiance au cadenas"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Exactement ! HTTPS signifie que la connexion est chiffrée, pas que le site est honnête. Un escroc peut très bien avoir un cadenas.",
      "feedbackIncorrect": "Attention ! HTTPS veut juste dire que personne ne peut espionner ta connexion. Mais le site lui-même peut être une arnaque !",
      "advice": {
        "concept": "HTTPS garantit le chiffrement, pas l''honnêteté. C''est comme un coffre-fort : il protège ce qu''il y a dedans, mais ça peut être n''importe quoi.",
        "example": "Un voleur peut mettre un cadenas sur son coffre aussi. Le cadenas ne dit pas si le propriétaire est honnête.",
        "advice": [
          "HTTPS ≠ site légitime",
          "Vérifie toujours le NOM du domaine",
          "paypa1 (avec un 1) n''est pas paypal (avec un l)"
        ]
      },
      "keyTakeaway": "Cadenas HTTPS ≠ site honnête"
    },
    {
      "id": "ls_s2_q2",
      "context": "Un email LinkedIn t''invite à te connecter via ''www.linkedіn.com'' (avec un і cyrillique invisible à l''œil nu)",
      "text": "Peux-tu faire confiance à ce lien ?",
      "options": [
        "Oui, c''est bien LinkedIn",
        "Non, il peut y avoir des caractères piégés invisibles",
        "Je clique pour vérifier"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Bravo ! Les attaques ''homographes'' utilisent des caractères d''alphabets différents (cyrillique, grec) qui ressemblent aux nôtres.",
      "feedbackIncorrect": "Piège invisible ! Le ''і'' cyrillique ressemble exactement au ''i'' latin mais c''est un caractère différent. Le domaine mène ailleurs.",
      "advice": {
        "concept": "Certains caractères d''alphabets étrangers sont visuellement identiques aux nôtres. Les pirates créent des domaines ''jumeaux'' impossibles à distinguer.",
        "example": "C''est comme deux faux billets avec des numéros de série différents mais la même apparence. Impossible à voir sans loupe.",
        "advice": [
          "Tape toi-même l''adresse au lieu de cliquer",
          "Utilise tes favoris pour les sites importants",
          "Ne fais pas confiance à un lien reçu par email"
        ]
      },
      "keyTakeaway": "Utilise tes FAVORIS, pas les liens emails"
    },
    {
      "id": "ls_s2_q3",
      "context": "Tu cliques sur un lien et tu vois 3 redirections successives avant d''arriver sur la page finale.",
      "text": "Est-ce normal ?",
      "options": [
        "Oui, c''est technique",
        "Non, trop de redirections = suspect",
        "Je continue quand même"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Bien vu ! Les redirections multiples servent souvent à cacher la vraie destination et à échapper aux protections.",
      "feedbackIncorrect": "Les sites légitimes n''ont pas besoin de 3 redirections. C''est une technique pour brouiller les pistes et cacher l''arnaque.",
      "advice": {
        "concept": "Les redirections multiples permettent de masquer la vraie destination finale. Plus il y en a, plus c''est suspect.",
        "example": "C''est comme quelqu''un qui te fait passer par 5 ruelles différentes avant d''arriver quelque part. Pourquoi tant de détours ?",
        "advice": [
          "1-2 redirections = normal (tracking marketing)",
          "3+ redirections = très suspect",
          "Ferme immédiatement si tu vois des URL bizarres défiler"
        ]
      },
      "keyTakeaway": "Trop de redirections = FERMER"
    }
  ]
}', true),

-- SESSION 3 : QR Codes et nouveaux pièges (ADVANCED)
('Liens Suspects', 'QUIZ', 'ADVANCED', '{
  "courseIntro": "Niveau expert ! 🏆 Les pirates s''adaptent : QR codes, signatures email, liens dans les documents...",
  "questions": [
    {
      "id": "ls_s3_q1",
      "context": "Tu trouves un QR code collé sur une affiche dans la rue avec écrit ''Wi-Fi gratuit, scannez !''",
      "text": "Dois-tu le scanner ?",
      "options": [
        "Oui, c''est pratique le Wi-Fi gratuit",
        "Non, un QR code inconnu peut mener à un site piégé",
        "Je scanne pour voir"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Parfait ! Un QR code peut contenir n''importe quelle URL. Un autocollant piégé peut être collé par-dessus un vrai QR code.",
      "feedbackIncorrect": "Un QR code n''est qu''un lien déguisé. N''importe qui peut imprimer un QR code qui mène à un site malveillant.",
      "advice": {
        "concept": "Un QR code est juste une URL en image. Les pirates collent leurs propres QR codes par-dessus les vrais dans les lieux publics.",
        "example": "C''est comme si quelqu''un changeait les panneaux de direction sur l''autoroute. Tu suis le panneau mais tu arrives au mauvais endroit.",
        "advice": [
          "Ne scanne pas de QR code dans la rue",
          "Vérifie que le QR code est officiel (pas un autocollant)",
          "Après scan, vérifie l''URL AVANT d''aller plus loin"
        ]
      },
      "keyTakeaway": "QR code inconnu = ne pas scanner"
    },
    {
      "id": "ls_s3_q2",
      "context": "Tu reçois un PDF professionnel qui contient un bouton ''Cliquez ici pour valider''. L''email vient d''un contact connu.",
      "text": "Peux-tu cliquer en confiance ?",
      "options": [
        "Oui, le contact est connu",
        "Non, même un PDF peut contenir des liens piégés",
        "Le PDF semble officiel donc oui"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Bravo ! Un PDF peut contenir des liens comme un email. Et le contact peut être usurpé ou son compte compromis.",
      "feedbackIncorrect": "Même dans un PDF, un lien reste un lien ! Il peut mener n''importe où. Et le compte de ton contact peut avoir été piraté.",
      "advice": {
        "concept": "Les PDF peuvent contenir des liens cliquables comme un email. Le format ''professionnel'' ne garantit rien.",
        "example": "C''est comme une belle lettre avec un beau papier : ça ne garantit pas que le contenu est honnête.",
        "advice": [
          "Survole les liens DANS les PDF aussi",
          "Un contact ''connu'' peut être compromis",
          "Vérifie par téléphone si une action sensible est demandée"
        ]
      },
      "keyTakeaway": "Liens dans PDF = même vigilance"
    },
    {
      "id": "ls_s3_q3",
      "context": "La signature email d''un collègue contient un lien vers son profil LinkedIn raccourci (ln.run/xyz).",
      "text": "Ce lien dans la signature est-il sûr ?",
      "options": [
        "Oui, c''est sa signature habituelle",
        "Pas forcément, les signatures peuvent être modifiées",
        "Je clique pour voir son profil"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Exact ! Si le compte email a été compromis, la signature peut être modifiée. Un lien raccourci dans une signature est suspect.",
      "feedbackIncorrect": "Même les signatures email peuvent être modifiées par un pirate qui a accès au compte. Et un lien raccourci cache toujours la vraie destination.",
      "advice": {
        "concept": "Une signature email est modifiable. Si le compte est compromis, le pirate peut changer les liens dans la signature pour piéger les contacts.",
        "example": "C''est comme changer le numéro de téléphone sur la carte de visite de quelqu''un. Les gens appellent en confiance... mais c''est le mauvais numéro.",
        "advice": [
          "Évite les liens raccourcis même en signature",
          "Si un lien de signature semble nouveau, vérifie",
          "Tape toi-même linkedin.com au lieu de cliquer"
        ]
      },
      "keyTakeaway": "Même les signatures peuvent être piégées"
    }
  ]
}', true);

\echo 'Seed enrichi Liens Suspects appliqué avec succès (3 sessions, 10 questions)';

