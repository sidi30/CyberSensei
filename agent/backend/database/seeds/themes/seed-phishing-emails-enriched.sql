-- =====================================================
-- SEED THEME : PHISHING EMAILS - VERSION ENRICHIE
-- Format pédagogique avec médias et conseils structurés
-- =====================================================

DELETE FROM exercises WHERE topic = 'Phishing Emails' AND difficulty = 'BEGINNER';

INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES

-- Question 1 : Email urgent suspect
('Phishing Emails', 'QUIZ', 'BEGINNER', '{
  "courseIntro": "Aujourd''hui, on va apprendre à repérer les emails piégés ! 🎣 C''est simple : quelques réflexes suffisent pour éviter 90% des pièges.",
  "introMedia": {
    "type": "image",
    "url": "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600",
    "alt": "Email avec hameçon",
    "caption": "Le phishing, c''est comme un hameçon caché dans un email"
  },
  "questions": [
    {
      "id": "ph_b_01",
      "context": "Tu reçois un email avec comme objet : « URGENT ! Votre compte sera supprimé dans 24h ». L''adresse de l''expéditeur est : microsoft-security@outlook-verify.com",
      "contextMedia": {
        "type": "image",
        "url": "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400",
        "alt": "Email suspect sur écran",
        "caption": "Un email qui met la pression... méfiance !"
      },
      "text": "Que fais-tu ?",
      "options": [
        "Je clique sur le lien pour vérifier",
        "Je vérifie l''adresse, c''est suspect → poubelle",
        "Je réponds pour demander plus d''infos"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Parfait ! Tu as repéré les 2 signaux d''alarme : l''urgence et l''adresse bizarre.",
      "feedbackIncorrect": "Attention ! L''adresse ''outlook-verify.com'' n''est pas Microsoft. Et l''urgence est un piège classique pour te faire agir sans réfléchir.",
      "advice": {
        "concept": "Les emails de phishing utilisent l''urgence pour te faire paniquer. Une vraie entreprise ne te menacera jamais de supprimer ton compte en 24h.",
        "example": "C''est comme si quelqu''un sonnait chez toi en criant ''Police ! Ouvrez immédiatement !'' - tu vérifierais par le judas avant d''ouvrir, non ?",
        "advice": [
          "Vérifie TOUJOURS l''adresse email de l''expéditeur",
          "Si c''est urgent, va directement sur le site officiel (tape l''URL toi-même)",
          "En cas de doute, appelle le service client officiel"
        ],
        "media": {
          "type": "image",
          "url": "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400",
          "alt": "Cadenas sécurité",
          "caption": "Prends le temps de vérifier = tu es protégé"
        }
      },
      "keyTakeaway": "URGENCE + adresse bizarre = PIÈGE"
    }
  ]
}', true),

-- Question 2 : Cadeau inattendu
('Phishing Emails', 'QUIZ', 'BEGINNER', '{
  "courseIntro": "Les arnaqueurs adorent nous appâter avec des cadeaux ! 🎁 Voyons comment ne pas tomber dans le panneau.",
  "questions": [
    {
      "id": "ph_b_02",
      "context": "Tu reçois un email : ''Félicitations ! Vous avez gagné une carte cadeau Amazon de 500€. Cliquez ici pour réclamer votre prix !'' Tu n''as participé à aucun concours.",
      "text": "Quelle est ta réaction ?",
      "options": [
        "Génial ! Je clique pour récupérer mon cadeau",
        "Trop beau pour être vrai → je supprime",
        "Je transfère à mes collègues pour qu''ils en profitent"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Excellent réflexe ! Si tu n''as rien fait pour gagner, c''est forcément un piège.",
      "feedbackIncorrect": "Attention ! On ne gagne rien sans avoir joué. C''est un appât pour te faire cliquer.",
      "advice": {
        "concept": "Un cadeau surprise sans raison = un appât. Les vrais concours te demandent de participer AVANT de gagner.",
        "example": "C''est comme trouver un billet de 500€ par terre avec écrit ''Scannez ce QR code pour le récupérer'' - ça sent l''arnaque !",
        "advice": [
          "Pas de concours = pas de gain possible",
          "Ne clique jamais pour ''réclamer'' quelque chose",
          "Amazon/Netflix ne contactent jamais par email pour des cadeaux"
        ]
      },
      "keyTakeaway": "Cadeau inattendu = PIÈGE garanti"
    }
  ]
}', true),

-- Question 3 : Faux message du patron
('Phishing Emails', 'QUIZ', 'BEGINNER', '{
  "courseIntro": "Les pirates adorent se faire passer pour ton chef ! 👔 C''est ce qu''on appelle la ''fraude au président''.",
  "questions": [
    {
      "id": "ph_b_03",
      "context": "Email de ''ton directeur'' : ''C''est urgent et confidentiel. J''ai besoin que tu achètes 5 cartes cadeaux iTunes de 100€ chacune et que tu m''envoies les codes. Je suis en réunion, ne m''appelle pas.''",
      "text": "Comment réagis-tu ?",
      "options": [
        "C''est le boss, j''obéis et j''achète les cartes",
        "Je l''appelle quand même pour vérifier",
        "Je réponds à l''email pour confirmer"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Bravo ! Un vrai patron comprendrait que tu vérifies. Et aucun patron sérieux ne demande des cartes cadeaux par email !",
      "feedbackIncorrect": "Stop ! Un vrai patron ne demandera JAMAIS d''acheter des cartes cadeaux. Et ''ne m''appelle pas'' est un énorme signal d''alarme.",
      "advice": {
        "concept": "Les vrais chefs n''ont pas besoin de cartes cadeaux urgentes. Et ils ne t''interdisent jamais de les appeler.",
        "example": "C''est comme si quelqu''un t''envoyait un SMS ''C''est maman, j''ai changé de numéro, envoie-moi 500€ vite vite''. Tu appellerais ta vraie maman d''abord !",
        "advice": [
          "TOUJOURS vérifier par téléphone (appelle le VRAI numéro)",
          "Aucune urgence ne justifie de contourner les procédures",
          "Les demandes d''argent par email = suspect à 99%"
        ]
      },
      "keyTakeaway": "Demande d''argent urgente par email = ARNAQUE"
    }
  ]
}', true),

-- Question 4 : Pièce jointe suspecte
('Phishing Emails', 'QUIZ', 'BEGINNER', '{
  "courseIntro": "Les pièces jointes peuvent cacher des virus ! 📎 Apprenons à les identifier.",
  "questions": [
    {
      "id": "ph_b_04",
      "context": "Tu reçois un email d''un expéditeur inconnu avec un fichier ''Facture_Urgente.pdf.exe'' en pièce jointe.",
      "text": "Que fais-tu ?",
      "options": [
        "J''ouvre le fichier pour voir la facture",
        "Je supprime l''email et je le signale",
        "Je transfère à mon collègue pour avoir son avis"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Excellent ! L''extension .exe cachée après .pdf est un piège classique. C''est un virus déguisé !",
      "feedbackIncorrect": "Danger ! Un fichier qui finit par .exe est un programme qui peut infecter ton PC. Ici, le ''.pdf'' est juste un leurre.",
      "advice": {
        "concept": "Les extensions à risque (.exe, .bat, .js, .vbs) peuvent installer des virus. Les pirates les cachent souvent avec une fausse extension visible.",
        "example": "C''est comme un loup déguisé en mouton : il a l''air gentil (PDF) mais c''est un programme dangereux (EXE).",
        "advice": [
          "Ne JAMAIS ouvrir un .exe reçu par email",
          "Méfie-toi des doubles extensions (facture.pdf.exe)",
          "Signale les emails suspects au service IT"
        ]
      },
      "keyTakeaway": "Fichier .exe par email = VIRUS"
    }
  ]
}', true),

-- Question 5 : Fautes d'orthographe
('Phishing Emails', 'QUIZ', 'BEGINNER', '{
  "courseIntro": "Les fautes d''orthographe sont un indice précieux ! 📝",
  "questions": [
    {
      "id": "ph_b_05",
      "context": "Email reçu : ''Cher client, votre compte bancaire as été bloqué. Cliquez sur le lien pour le débloquer immédiatement. Cordialement, Votre Banc''",
      "text": "Cet email te semble-t-il légitime ?",
      "options": [
        "Oui, c''est normal qu''une banque fasse des fautes",
        "Non, les fautes + l''urgence = c''est du phishing",
        "Je clique pour vérifier si c''est vrai"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Bien vu ! Une vraie banque ne ferait jamais autant de fautes. Et elle ne demande jamais tes identifiants par email.",
      "feedbackIncorrect": "Attention ! Une banque emploie des professionnels pour sa communication. Fautes + urgence + demande de clic = phishing garanti.",
      "advice": {
        "concept": "Les vrais emails professionnels sont relus et corrigés. Les pirates, souvent étrangers, font des fautes de grammaire.",
        "example": "Si tu reçois une lettre officielle des impôts avec des fautes, tu te douterais que c''est un faux. Pareil pour les emails !",
        "advice": [
          "Les fautes de grammaire = signal d''alerte",
          "Une vraie banque t''appelle ou t''envoie un courrier officiel",
          "Ne clique jamais, tape l''adresse du site toi-même"
        ]
      },
      "keyTakeaway": "Fautes + urgence = ARNAQUE"
    }
  ]
}', true);

-- =====================================================
-- NIVEAU INTERMÉDIAIRE
-- =====================================================

DELETE FROM exercises WHERE topic = 'Phishing Emails' AND difficulty = 'INTERMEDIATE';

INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES

-- Question Intermédiaire 1 : Lien masqué
('Phishing Emails', 'QUIZ', 'INTERMEDIATE', '{
  "courseIntro": "Les pirates deviennent plus malins ! 🎭 Voyons des techniques plus sophistiquées.",
  "questions": [
    {
      "id": "ph_i_01",
      "context": "Tu reçois un email de PayPal bien présenté, avec le logo officiel. Le bouton dit ''Connectez-vous'', mais quand tu survoles le lien avec ta souris, tu vois : paypal-secure-login.malicious-site.com",
      "text": "Que fais-tu ?",
      "options": [
        "Je clique, le logo PayPal est bon",
        "Je vais sur paypal.com en tapant l''URL moi-même",
        "Je réponds pour demander si c''est légitime"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Parfait ! Le domaine réel est ''malicious-site.com'', pas PayPal. Toujours vérifier l''URL au survol !",
      "feedbackIncorrect": "Attention ! Le vrai domaine est ce qui est juste avant le .com. Ici c''est ''malicious-site.com'', pas PayPal.",
      "advice": {
        "concept": "Le texte d''un lien peut mentir, mais l''URL réelle ne ment pas. Survole TOUJOURS avant de cliquer.",
        "example": "C''est comme une fausse enseigne de restaurant : elle dit ''Restaurant 5 étoiles'' mais l''adresse t''envoie dans une ruelle louche.",
        "advice": [
          "Survole le lien pour voir la VRAIE destination",
          "Le domaine réel est juste avant le .com/.fr",
          "En cas de doute, tape l''URL officielle toi-même"
        ]
      },
      "keyTakeaway": "SURVOLE avant de cliquer"
    }
  ]
}', true),

-- Question Intermédiaire 2 : Homographe
('Phishing Emails', 'QUIZ', 'INTERMEDIATE', '{
  "courseIntro": "Connais-tu les attaques par homographes ? Les pirates utilisent des caractères qui se ressemblent ! 🔍",
  "questions": [
    {
      "id": "ph_i_02",
      "context": "Tu reçois un email de LinkedIn avec le lien : www.linkedіn.com. Ça semble normal, non ?",
      "text": "Ce lien est-il sûr ?",
      "options": [
        "Oui, c''est bien LinkedIn",
        "Non, il y a peut-être un caractère piégé",
        "Je clique pour vérifier"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Excellent œil ! Le ''i'' de ''linkedіn'' est en fait un caractère cyrillique qui ressemble au ''i'' latin. C''est un piège !",
      "feedbackIncorrect": "Piégé ! Le ''і'' dans ce lien n''est pas un vrai ''i'' mais un caractère cyrillique identique visuellement. L''URL mène ailleurs.",
      "advice": {
        "concept": "Certains caractères d''alphabets différents sont visuellement identiques. Les pirates les utilisent pour créer des faux domaines.",
        "example": "C''est comme un billet de banque avec un ''O'' légèrement différent : à l''œil nu, impossible à voir, mais c''est un faux.",
        "advice": [
          "Utilise tes favoris pour les sites importants",
          "Tape l''URL toi-même au lieu de cliquer",
          "Installe une extension anti-phishing"
        ]
      },
      "keyTakeaway": "Les yeux peuvent tromper - utilise tes favoris"
    }
  ]
}', true);

\echo 'Seed enrichi Phishing Emails appliqué avec succès (7 exercices)';

