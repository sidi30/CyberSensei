-- =====================================================
-- SEED THEME : FAUX MESSAGES INTERNES - VERSION ENRICHIE
-- Format commercial : 3-4 questions par session, ~5 minutes
-- Conseils structurés (concept, exemple, advice)
-- =====================================================

DELETE FROM exercises WHERE topic = 'Faux Messages Internes';

-- SESSION 1 : Reconnaître les faux messages IT/RH (BEGINNER)
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES
('Faux Messages Internes', 'QUIZ', 'BEGINNER', '{
  "courseIntro": "Aujourd''hui, on apprend à repérer les faux messages qui semblent venir de l''IT, des RH ou de ton chef ! 🎭 C''est l''arnaque préférée des pirates.",
  "introMedia": {
    "type": "image",
    "url": "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=600",
    "alt": "Personne au téléphone soucieuse",
    "caption": "Les pirates se font passer pour des collègues"
  },
  "questions": [
    {
      "id": "fm_s1_q1",
      "context": "Tu reçois un message Teams de ''IT Support'' : ''Votre session expire. Cliquez ici pour réinitialiser votre mot de passe immédiatement.''",
      "text": "Comment réagis-tu ?",
      "options": [
        "Je clique, c''est le support IT",
        "J''appelle le vrai numéro IT pour vérifier",
        "Je réponds au message pour demander"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Parfait ! Le vrai service IT ne demande JAMAIS de cliquer sur un lien pour réinitialiser un mot de passe. Toujours vérifier par téléphone.",
      "feedbackIncorrect": "Attention ! L''IT ne demande jamais de réinitialisation via un lien Teams. C''est une technique classique d''arnaque. Appelle le VRAI numéro IT.",
      "advice": {
        "concept": "Le service IT ne te demande JAMAIS de cliquer sur un lien pour changer ton mot de passe. Ils ont d''autres moyens de gérer ça.",
        "example": "C''est comme si un ''policier'' t''envoyait un SMS pour te demander ta carte d''identité. Un vrai policier vient en personne.",
        "advice": [
          "L''IT ne demande JAMAIS de mdp par message",
          "Appelle le numéro officiel (pas celui du message)",
          "En cas de doute, va directement au bureau IT"
        ]
      },
      "keyTakeaway": "IT ne demande JAMAIS de cliquer"
    },
    {
      "id": "fm_s1_q2",
      "context": "Un email des ''RH'' te demande de remplir un formulaire Google avec ton numéro de sécurité sociale pour une ''mise à jour administrative urgente''.",
      "text": "Dois-tu remplir ce formulaire ?",
      "options": [
        "Oui, c''est les RH et c''est urgent",
        "Non, je vérifie d''abord avec les vrais RH",
        "Oui, Google Forms c''est sécurisé"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Exactement ! Les RH n''utilisent pas Google Forms pour des données sensibles. Et elles ne demandent JAMAIS le numéro de sécu par email.",
      "feedbackIncorrect": "Danger ! Des données comme le numéro de sécu ne se demandent JAMAIS par email ou formulaire externe. Appelle les RH directement.",
      "advice": {
        "concept": "Les données personnelles sensibles (sécu, bancaires) ne se transmettent JAMAIS par email ou formulaire externe. C''est un piège classique.",
        "example": "C''est comme si quelqu''un sonnait chez toi en disant ''Je suis de la banque, donnez-moi votre code de carte bleue''. Absurde !",
        "advice": [
          "Données sensibles = jamais par email",
          "Les RH ont des procédures officielles internes",
          "Appelle les RH au numéro connu"
        ]
      },
      "keyTakeaway": "Données sensibles = JAMAIS par email"
    },
    {
      "id": "fm_s1_q3",
      "context": "Tu reçois un email de ''ton directeur'' : ''C''est urgent et confidentiel. J''ai besoin que tu achètes 500€ de cartes cadeaux iTunes et que tu m''envoies les codes. Je suis en réunion, ne m''appelle pas.''",
      "text": "Que fais-tu ?",
      "options": [
        "J''achète les cartes, c''est le directeur",
        "J''appelle le directeur pour vérifier (malgré le ''ne m''appelle pas'')",
        "Je demande par email pourquoi il a besoin de ça"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Bravo ! ''Ne m''appelle pas'' est le signal d''alarme numéro 1. Un vrai directeur comprendrait que tu vérifies. TOUJOURS appeler.",
      "feedbackIncorrect": "C''est l''arnaque ''au président'' ! Le ''ne m''appelle pas'' est justement pour t''empêcher de vérifier. APPELLE TOUJOURS, peu importe ce que dit l''email.",
      "advice": {
        "concept": "L''arnaque au président utilise l''autorité et l''urgence pour te faire agir sans réfléchir. Le ''ne m''appelle pas'' est le piège.",
        "example": "C''est comme si quelqu''un te disait ''Donne-moi 500€ et surtout ne vérifie pas pourquoi''. Plus il insiste pour que tu ne vérifies pas, plus c''est suspect.",
        "advice": [
          "Demande d''argent par email = TOUJOURS vérifier",
          "''Ne m''appelle pas'' = APPELLE !",
          "Aucun chef ne demande des cartes cadeaux"
        ]
      },
      "keyTakeaway": "Argent demandé par email = APPELER"
    },
    {
      "id": "fm_s1_q4",
      "context": "Un collègue en vacances t''envoie un lien Teams : ''Regarde cette vidéo de la dernière soirée d''équipe ! bit.ly/xyz''",
      "text": "Cliques-tu sur le lien ?",
      "options": [
        "Oui, c''est mon collègue",
        "Non, son compte est peut-être piraté",
        "Oui car c''est Teams donc sécurisé"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Parfait ! Un compte de collègue peut être compromis. Surtout s''il est en vacances et que le message est inhabituel.",
      "feedbackIncorrect": "Même un collègue peut être piraté ! Son compte Teams peut être utilisé pour propager des liens malveillants. Vérifie par un autre canal.",
      "advice": {
        "concept": "Quand un compte est piraté, le pirate envoie des messages à tous les contacts. Le message semble venir d''un ami mais c''est un piège.",
        "example": "C''est comme si quelqu''un volait le téléphone de ton ami et t''envoyait des messages en se faisant passer pour lui.",
        "advice": [
          "Message inhabituel = vérifier par téléphone",
          "Collègue absent qui envoie des liens = suspect",
          "Lien raccourci (bit.ly) = méfiance doublée"
        ]
      },
      "keyTakeaway": "Compte de collègue peut être PIRATÉ"
    }
  ]
}', true),

-- SESSION 2 : Techniques avancées (INTERMEDIATE)
('Faux Messages Internes', 'QUIZ', 'INTERMEDIATE', '{
  "courseIntro": "Niveau 2 ! 🎯 Les pirates utilisent des informations internes réelles pour être plus crédibles.",
  "questions": [
    {
      "id": "fm_s2_q1",
      "context": "Tu reçois un email de ''finance@entreprise-support.com'' qui te demande de valider un virement. Ton entreprise est ''entreprise.com''.",
      "text": "Ce domaine est-il légitime ?",
      "options": [
        "Oui, c''est notre nom d''entreprise",
        "Non, le domaine n''est pas le bon",
        "Je ne sais pas vérifier"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Exact ! ''entreprise-support.com'' n''est PAS ''entreprise.com''. C''est un domaine différent créé par les pirates.",
      "feedbackIncorrect": "Le domaine légitime serait ''finance@entreprise.com''. Ici c''est ''entreprise-SUPPORT.com'' - un domaine complètement différent appartenant aux pirates.",
      "advice": {
        "concept": "Les pirates créent des domaines ressemblants mais différents. ''entreprise.com'' et ''entreprise-support.com'' sont deux domaines distincts.",
        "example": "C''est comme ''Banque de France'' vs ''Banque de France Support''. Ça ressemble mais c''est pas pareil.",
        "advice": [
          "Vérifie le domaine EXACT de l''email",
          "Le vrai domaine est après le @ et avant .com",
          "entreprise-xxx.com ≠ entreprise.com"
        ]
      },
      "keyTakeaway": "Vérifie le domaine EXACT"
    },
    {
      "id": "fm_s2_q2",
      "context": "Un email mentionne un vrai projet interne que tu connais et demande d''ouvrir une pièce jointe ''mise à jour budget projet Alpha''.",
      "text": "Le fait qu''il mentionne un vrai projet rend-il l''email légitime ?",
      "options": [
        "Oui, seuls les internes connaissent ce projet",
        "Non, ces infos peuvent être trouvées ou volées",
        "Je clique car c''est crédible"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Exactement ! Les pirates font des recherches (LinkedIn, fuites, etc.) pour personnaliser leurs attaques. C''est le ''spear phishing''.",
      "feedbackIncorrect": "Attention au spear phishing ! Les pirates recherchent des infos internes (LinkedIn, réseaux, fuites) pour rendre leurs emails crédibles.",
      "advice": {
        "concept": "Le spear phishing utilise des informations réelles (noms de projets, collègues) pour sembler légitime. Plus c''est personnalisé, plus c''est dangereux.",
        "example": "C''est comme un escroc qui connaît ton nom, ton adresse, ta banque... ça ne veut pas dire qu''il travaille pour ta banque.",
        "advice": [
          "Info vraie ≠ email légitime",
          "Vérifie TOUJOURS l''expéditeur par un autre canal",
          "LinkedIn expose beaucoup d''infos exploitables"
        ]
      },
      "keyTakeaway": "Info vraie ≠ email légitime"
    },
    {
      "id": "fm_s2_q3",
      "context": "Tu reçois une invitation calendrier Teams d''un ''partenaire externe'' pour une ''réunion urgente demain'' avec un lien de connexion inconnu.",
      "text": "Acceptes-tu l''invitation ?",
      "options": [
        "Oui, je mets dans mon agenda",
        "Non, je vérifie d''abord si cette réunion est attendue",
        "Oui car c''est Teams donc sécurisé"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Parfait ! Les invitations calendrier peuvent contenir des liens malveillants. Vérifie toujours si la réunion était prévue.",
      "feedbackIncorrect": "Les pirates utilisent aussi les invitations calendrier ! Le lien de ''connexion'' peut mener à un site de phishing.",
      "advice": {
        "concept": "Les invitations calendrier sont un nouveau vecteur d''attaque. L''invitation s''affiche automatiquement et le lien semble officiel.",
        "example": "C''est comme une fausse convocation qui arrive dans ta boîte aux lettres. Le format officiel ne garantit rien.",
        "advice": [
          "Vérifie avec l''organisateur réel",
          "Invitation surprise + lien externe = suspect",
          "Ne clique pas sur les liens dans les invitations douteuses"
        ]
      },
      "keyTakeaway": "Invitation surprise = vérifier"
    }
  ]
}', true),

-- SESSION 3 : Vishing et manipulation (ADVANCED)
('Faux Messages Internes', 'QUIZ', 'ADVANCED', '{
  "courseIntro": "Niveau expert ! 🏆 Les pirates passent aussi par le téléphone et les messages vocaux.",
  "questions": [
    {
      "id": "fm_s3_q1",
      "context": "Tu reçois un appel du ''support Microsoft'' qui dit avoir détecté un virus sur ton PC et te demande d''installer un logiciel de contrôle à distance.",
      "text": "Est-ce légitime ?",
      "options": [
        "Oui, Microsoft surveille les virus",
        "Non, Microsoft n''appelle JAMAIS spontanément",
        "Je les laisse vérifier par précaution"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Exact ! Microsoft, Apple, et autres ne t''appelleront JAMAIS pour te signaler un virus. C''est TOUJOURS une arnaque.",
      "feedbackIncorrect": "C''est l''arnaque au faux support ! Aucune entreprise tech n''appelle spontanément. Ils n''ont aucun moyen de ''détecter'' un virus sur TON PC.",
      "advice": {
        "concept": "Les grandes entreprises (Microsoft, Apple, banques) n''appellent JAMAIS spontanément pour signaler des problèmes. C''est toujours une arnaque.",
        "example": "C''est comme si la police t''appelait pour te dire qu''un voleur est chez toi et te demandait tes clés pour ''vérifier''.",
        "advice": [
          "Microsoft n''appelle JAMAIS spontanément",
          "Raccroche immédiatement",
          "Ne donne JAMAIS accès à ton PC par téléphone"
        ]
      },
      "keyTakeaway": "Appel spontané de support = ARNAQUE"
    },
    {
      "id": "fm_s3_q2",
      "context": "Quelqu''un t''appelle en se présentant comme un auditeur mandaté par la direction. Il connaît le nom du DG et demande l''accès à certains fichiers ''pour l''audit''.",
      "text": "Lui donnes-tu accès ?",
      "options": [
        "Oui, il connaît le nom du DG",
        "Non, je vérifie auprès de mon manager ou de la direction",
        "Oui, les audits sont obligatoires"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Parfait ! Connaître le nom du DG ne prouve rien (LinkedIn existe !). Un vrai auditeur passe par les voies officielles.",
      "feedbackIncorrect": "Le nom du DG est public (LinkedIn, site web). Les vrais auditeurs sont annoncés officiellement et passent par la hiérarchie.",
      "advice": {
        "concept": "Le ''pretexting'' crée un scénario crédible (auditeur, inspecteur) pour obtenir des accès. Les infos publiques renforcent l''illusion.",
        "example": "C''est comme un faux livreur qui connaît ton nom et ton adresse. Ces infos sont faciles à trouver, ça ne prouve pas qu''il est vrai.",
        "advice": [
          "Connaître des noms ne prouve rien",
          "Les vrais auditeurs passent par la direction",
          "Vérifie TOUJOURS par un canal officiel"
        ]
      },
      "keyTakeaway": "Vérifier par un AUTRE canal"
    },
    {
      "id": "fm_s3_q3",
      "context": "Un message vocal interne te demande de rappeler un numéro pour ''valider ton code OTP de sécurité''.",
      "text": "Rappelles-tu ce numéro ?",
      "options": [
        "Oui, c''est pour la sécurité",
        "Non, un OTP ne se partage JAMAIS",
        "Oui car c''est un message interne"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Exactement ! Un code OTP (One Time Password) est PERSONNEL et ne doit JAMAIS être partagé, même avec l''IT.",
      "feedbackIncorrect": "STOP ! Un OTP est comme une clé temporaire personnelle. Le service IT n''en a JAMAIS besoin. C''est une arnaque pour accéder à ton compte.",
      "advice": {
        "concept": "Un OTP (code à usage unique) prouve que C''EST TOI qui te connectes. Le partager revient à donner accès à ton compte.",
        "example": "C''est comme donner le code de ta carte bleue à quelqu''un ''pour vérifier que ta carte marche''. Absurde et dangereux.",
        "advice": [
          "OTP = JAMAIS partagé, avec personne",
          "L''IT n''a pas besoin de ton OTP",
          "Message demandant un OTP = arnaque"
        ]
      },
      "keyTakeaway": "OTP = JAMAIS partagé"
    }
  ]
}', true);

\echo 'Seed enrichi Faux Messages Internes appliqué avec succès (3 sessions, 10 questions)';

