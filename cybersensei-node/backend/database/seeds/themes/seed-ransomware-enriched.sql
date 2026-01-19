-- =====================================================
-- SEED THEME : RANSOMWARE - VERSION ENRICHIE
-- Format commercial : 3-4 questions par session, ~5 minutes
-- Conseils structurés (concept, exemple, advice)
-- =====================================================

DELETE FROM exercises WHERE topic = 'Ransomware';

-- SESSION 1 : Qu'est-ce qu'un ransomware ? (BEGINNER)
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES
('Ransomware', 'QUIZ', 'BEGINNER', '{
  "courseIntro": "Aujourd''hui, on parle du ransomware ! 💀 C''est l''une des menaces les plus redoutées, mais avec les bons réflexes, tu peux l''éviter.",
  "introMedia": {
    "type": "image",
    "url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600",
    "alt": "Code informatique menaçant",
    "caption": "Le ransomware chiffre tes fichiers et demande une rançon"
  },
  "questions": [
    {
      "id": "rw_s1_q1",
      "context": "Tu allumes ton PC le matin et un message s''affiche : ''Vos fichiers sont chiffrés. Payez 500€ en Bitcoin pour les récupérer.''",
      "text": "Quelle est la PREMIÈRE chose à faire ?",
      "options": [
        "Payer immédiatement pour récupérer mes fichiers",
        "Débrancher le câble réseau et alerter l''IT",
        "Redémarrer l''ordinateur"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Parfait ! Déconnecter du réseau empêche le ransomware de se propager aux autres ordinateurs. Ensuite, on alerte l''IT.",
      "feedbackIncorrect": "Surtout ne paie pas ! Et ne redémarre pas (ça peut aggraver). La priorité : DÉCONNECTER du réseau pour éviter la propagation.",
      "advice": {
        "concept": "Un ransomware chiffre tes fichiers et demande de l''argent pour les débloquer. Il peut se propager à tous les PC du réseau en quelques minutes.",
        "example": "C''est comme si quelqu''un changeait les serrures de ton bureau et te demandait de l''argent pour les nouvelles clés. Et il fait pareil chez tes voisins !",
        "advice": [
          "DÉBRANCHE le câble réseau immédiatement",
          "Appelle le service IT, même la nuit",
          "Ne redémarre PAS l''ordinateur"
        ]
      },
      "keyTakeaway": "1️⃣ Débrancher 2️⃣ Alerter IT"
    },
    {
      "id": "rw_s1_q2",
      "context": "Tu reçois un email avec une pièce jointe : ''Facture_Urgente.zip'' d''un expéditeur inconnu.",
      "text": "Cette pièce jointe peut-elle contenir un ransomware ?",
      "options": [
        "Non, c''est juste un fichier ZIP",
        "Oui, les ZIP sont un vecteur classique d''infection",
        "Je l''ouvre pour vérifier ce que c''est"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Exactement ! Les fichiers ZIP cachent souvent des programmes malveillants. C''est l''un des moyens préférés des pirates.",
      "feedbackIncorrect": "Attention ! Un ZIP peut contenir un exécutable malveillant (.exe) qui installe le ransomware dès que tu l''ouvres.",
      "advice": {
        "concept": "Les ransomwares arrivent souvent par email, cachés dans des pièces jointes (ZIP, documents avec macros, fausses factures).",
        "example": "C''est comme un colis piégé : l''emballage a l''air normal mais l''intérieur est dangereux.",
        "advice": [
          "N''ouvre JAMAIS un ZIP d''un inconnu",
          "Méfie-toi des ''factures urgentes'' non attendues",
          "Signale au service IT avant d''ouvrir en cas de doute"
        ]
      },
      "keyTakeaway": "ZIP inconnu = POUBELLE"
    },
    {
      "id": "rw_s1_q3",
      "context": "On te demande : ''Mais pourquoi on ne paie pas simplement pour récupérer les fichiers ?''",
      "text": "Pourquoi est-il déconseillé de payer la rançon ?",
      "options": [
        "Parce que c''est cher",
        "Parce qu''on encourage les pirates et on n''est pas sûr de récupérer ses fichiers",
        "Parce que c''est interdit par la loi"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Exactement ! Payer finance les criminels et ne garantit rien. Dans 40% des cas, les pirates ne donnent pas la clé même après paiement.",
      "feedbackIncorrect": "Le vrai problème : payer encourage les pirates à continuer. Et dans beaucoup de cas, même après paiement, tu ne récupères rien !",
      "advice": {
        "concept": "Payer la rançon finance le crime organisé et ne garantit pas la récupération des données. C''est pourquoi les sauvegardes sont cruciales.",
        "example": "C''est comme payer un voleur pour qu''il te rende ton sac : tu n''es pas sûr qu''il le fera, et tu l''encourages à recommencer.",
        "advice": [
          "Ne JAMAIS payer sans consulter les experts",
          "La meilleure défense = des sauvegardes régulières",
          "Les autorités recommandent de ne pas payer"
        ]
      },
      "keyTakeaway": "Ne JAMAIS payer la rançon"
    },
    {
      "id": "rw_s1_q4",
      "context": "Ton entreprise n''a pas de sauvegarde récente de ses fichiers.",
      "text": "Quel est le risque en cas de ransomware ?",
      "options": [
        "Aucun, on peut toujours payer",
        "Perte définitive des données",
        "On peut appeler Microsoft pour récupérer"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Exactement ! Sans sauvegarde, les données chiffrées sont perdues pour toujours (ou il faut payer sans garantie).",
      "feedbackIncorrect": "Sans backup, c''est la catastrophe. Microsoft ne peut pas aider. La seule solution serait de payer (sans garantie) ou d''accepter la perte.",
      "advice": {
        "concept": "Les sauvegardes sont la SEULE vraie protection contre les ransomwares. Si tes fichiers sont sauvegardés ailleurs, tu peux tout restaurer.",
        "example": "C''est comme avoir une copie de tes clés chez un ami : si on change tes serrures, tu peux quand même rentrer.",
        "advice": [
          "Sauvegarde régulière = meilleure défense",
          "Les backups doivent être ISOLÉS du réseau",
          "Vérifie que ton entreprise a un plan de backup"
        ]
      },
      "keyTakeaway": "Pas de backup = catastrophe"
    }
  ]
}', true),

-- SESSION 2 : Comment le ransomware arrive (INTERMEDIATE)
('Ransomware', 'QUIZ', 'INTERMEDIATE', '{
  "courseIntro": "Niveau 2 ! 🎯 Voyons comment les ransomwares arrivent sur ton PC pour mieux les bloquer.",
  "questions": [
    {
      "id": "rw_s2_q1",
      "context": "Un document Word reçu par email affiche : ''Activez les macros pour voir le contenu''.",
      "text": "Dois-tu activer les macros ?",
      "options": [
        "Oui, sinon je ne peux pas lire le document",
        "Non, les macros peuvent installer un ransomware",
        "Je demande à l''expéditeur d''abord"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Parfait ! Les macros sont des mini-programmes qui peuvent télécharger et installer un ransomware automatiquement.",
      "feedbackIncorrect": "Danger ! Une macro peut exécuter n''importe quel code, y compris télécharger un ransomware. Ne les active JAMAIS sur un fichier reçu.",
      "advice": {
        "concept": "Les macros sont de petits programmes intégrés aux documents Office. Les pirates les utilisent pour télécharger des malwares dès que tu les actives.",
        "example": "C''est comme un bouton qui déclenche une alarme dès que tu appuies dessus. Le document te dit ''appuie'' mais le résultat est mauvais.",
        "advice": [
          "N''active JAMAIS les macros sur un fichier reçu",
          "Si le contenu est légitime, l''expéditeur peut envoyer un PDF",
          "Signale les fichiers demandant des macros"
        ]
      },
      "keyTakeaway": "Macros = JAMAIS activer"
    },
    {
      "id": "rw_s2_q2",
      "context": "Tu télécharges un logiciel ''gratuit'' depuis un site non officiel pour travailler plus vite.",
      "text": "Y a-t-il un risque ?",
      "options": [
        "Non, c''est gratuit donc pas de souci",
        "Oui, les logiciels piratés contiennent souvent des malwares",
        "Je fais confiance au site"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Exact ! Les sites de téléchargement non officiels injectent souvent des ransomwares ou autres malwares dans les logiciels.",
      "feedbackIncorrect": "Grosse erreur ! Les logiciels ''gratuits'' des sites douteux sont souvent piégés. Ils fonctionnent normalement mais installent un malware en arrière-plan.",
      "advice": {
        "concept": "Les sites de téléchargement non officiels modifient les logiciels pour y ajouter des malwares. Tu installes le programme voulu... plus un virus.",
        "example": "C''est comme acheter un téléphone ''pas cher'' dans la rue : il marche, mais quelqu''un a peut-être installé une caméra espion dedans.",
        "advice": [
          "Télécharge UNIQUEMENT depuis les sites officiels",
          "Un logiciel gratuit illégal = probablement piégé",
          "En entreprise, demande au service IT d''installer"
        ]
      },
      "keyTakeaway": "Téléchargement hors site officiel = DANGER"
    },
    {
      "id": "rw_s2_q3",
      "context": "Ton PC devient très lent et tu remarques que des fichiers ont une extension bizarre (.encrypted, .locked).",
      "text": "Que se passe-t-il probablement ?",
      "options": [
        "C''est juste un bug Windows",
        "Un ransomware est peut-être en train de chiffrer mes fichiers",
        "Je redémarre pour résoudre le problème"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Exactement ! Ces signes indiquent un ransomware en action. Chaque seconde compte : DÉCONNECTE-TOI du réseau !",
      "feedbackIncorrect": "Attention ! Fichiers renommés + PC lent = probable ransomware en cours. DÉBRANCHE le réseau immédiatement et alerte IT !",
      "advice": {
        "concept": "Pendant le chiffrement, le ransomware renomme les fichiers et utilise beaucoup de ressources. Plus tu réagis vite, moins de fichiers sont perdus.",
        "example": "C''est comme un cambrioleur en train de vider ta maison : chaque minute compte. Plus tu agis vite, plus tu sauves de choses.",
        "advice": [
          "PC lent + fichiers renommés = ALERTE",
          "Débranche IMMÉDIATEMENT le réseau",
          "Ne redémarre pas (ça peut aggraver)"
        ]
      },
      "keyTakeaway": "Fichiers bizarres = débrancher MAINTENANT"
    }
  ]
}', true),

-- SESSION 3 : Protéger l'entreprise (ADVANCED)
('Ransomware', 'QUIZ', 'ADVANCED', '{
  "courseIntro": "Niveau expert ! 🏆 Comment protéger toute l''entreprise contre les ransomwares.",
  "questions": [
    {
      "id": "rw_s3_q1",
      "context": "Les sauvegardes de l''entreprise sont stockées sur un serveur connecté au réseau principal.",
      "text": "Y a-t-il un problème avec cette configuration ?",
      "options": [
        "Non, les backups sont automatiques",
        "Oui, un ransomware peut chiffrer les backups aussi",
        "C''est la méthode standard"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Exactement ! Un ransomware moderne cherche les sauvegardes et les chiffre aussi. Les backups doivent être ISOLÉS du réseau.",
      "feedbackIncorrect": "Gros risque ! Les ransomwares avancés ciblent spécifiquement les sauvegardes pour empêcher la récupération. Elles doivent être offline ou isolées.",
      "advice": {
        "concept": "Les ransomwares modernes scannent le réseau pour trouver et chiffrer les sauvegardes. Des backups connectés = pas de plan B.",
        "example": "C''est comme garder la clé de secours de ta maison DANS la maison. Si un voleur entre, il prend aussi la clé de secours.",
        "advice": [
          "Sauvegardes hors-ligne (disques déconnectés)",
          "Règle 3-2-1 : 3 copies, 2 supports, 1 hors-site",
          "Tester régulièrement la restauration"
        ]
      },
      "keyTakeaway": "Backups ISOLÉS du réseau"
    },
    {
      "id": "rw_s3_q2",
      "context": "Tout le monde au bureau a accès en lecture/écriture à tous les dossiers partagés.",
      "text": "Quel est le risque ?",
      "options": [
        "Aucun, c''est pratique pour collaborer",
        "Un ransomware sur 1 PC peut chiffrer TOUS les dossiers",
        "C''est mieux pour la productivité"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Exact ! Si tout le monde a accès à tout, un seul PC infecté suffit pour chiffrer tous les fichiers de l''entreprise.",
      "feedbackIncorrect": "C''est le pire scénario ! Le ransomware hérite des droits de l''utilisateur. Si tu as accès à tout, il chiffre tout.",
      "advice": {
        "concept": "Le ransomware chiffre tout ce que l''utilisateur peut modifier. Moins de droits = moins de dégâts en cas d''infection.",
        "example": "C''est comme donner les clés de TOUTES les pièces à chaque employé. Si un voleur prend les clés d''un seul employé, il peut tout cambrioler.",
        "advice": [
          "Principe du moindre privilège",
          "Chaque personne = accès uniquement au nécessaire",
          "Séparer les droits par équipe/projet"
        ]
      },
      "keyTakeaway": "Moins de droits = moins de dégâts"
    },
    {
      "id": "rw_s3_q3",
      "context": "L''entreprise n''a pas de procédure documentée en cas de ransomware.",
      "text": "Pourquoi est-ce un problème ?",
      "options": [
        "Ce n''est pas grave, on improvisera",
        "Sans plan, la réaction sera lente et coûteuse",
        "Le service IT saura quoi faire"
      ],
      "correctAnswer": 1,
      "feedbackCorrect": "Exactement ! Chaque minute compte lors d''une attaque. Sans procédure claire, c''est la panique et les erreurs s''accumulent.",
      "feedbackIncorrect": "En situation de crise, sans plan, c''est le chaos. Qui appeler ? Qui déconnecte quoi ? Où sont les backups ? Chaque minute de confusion = plus de fichiers perdus.",
      "advice": {
        "concept": "Une procédure d''urgence documentée permet de réagir vite et bien. Pendant une attaque, il n''y a pas de temps pour réfléchir.",
        "example": "C''est comme un exercice incendie : si tu ne connais pas la sortie de secours, tu perds du temps précieux en cas de vrai incendie.",
        "advice": [
          "Avoir un plan écrit et accessible",
          "Définir les rôles (qui fait quoi)",
          "Faire des exercices de simulation"
        ]
      },
      "keyTakeaway": "Un plan AVANT l''attaque"
    }
  ]
}', true);

\echo 'Seed enrichi Ransomware appliqué avec succès (3 sessions, 10 questions)';

