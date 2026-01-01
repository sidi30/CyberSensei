-- ═══════════════════════════════════════════════════════════════════════════════
-- CYBERSENSEI - SEED COMPLET ENTREPRISE
-- Programme de sensibilisation conversationnel - 15 secteurs - 3 niveaux
-- ═══════════════════════════════════════════════════════════════════════════════

DELETE FROM exercises;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTEUR 1 : PHISHING EMAILS
-- ═══════════════════════════════════════════════════════════════════════════════

-- ━━━ Niveau Débutant - Jour 1 ━━━
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Phishing Emails', 
    'QUIZ', 
    'BEGINNER', 
    '{
        "courseIntro": "Salut ! 👋 Bienvenue dans ton premier cours de cybersécurité.\\n\\nAujourd''hui, on parle du [bleu]Phishing[/bleu] (hameçonnage en français). C''est l''attaque la plus courante en entreprise ! 🎣\\n\\nUn pirate t''envoie un email qui a l''air légitime pour te faire cliquer sur un lien dangereux ou voler tes identifiants. C''est comme un pêcheur qui jette un appât pour attraper un poisson.",
        "questions": [
            {
                "id": "ph_b_j1_q1",
                "text": "Tu reçois ce message un lundi matin :\\n\\n[jaune]━━━━━━━━━━━━━━━━━━━━[/jaune]\\n**De :** support@micosoft-securite.com\\n**Objet :** [rouge]URGENT - Votre compte va expirer[/rouge]\\n\\nVotre compte Microsoft expire dans 2 heures. Cliquez ici immédiatement pour le réactiver.\\n[jaune]━━━━━━━━━━━━━━━━━━━━[/jaune]\\n\\nQue fais-tu ?",
                "options": [
                    "Je clique vite pour ne pas perdre mon compte",
                    "Je vérifie l''adresse de l''expéditeur et je supprime l''email",
                    "Je réponds pour demander plus d''informations"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🎉 **Excellent réflexe !** Tu as repéré les signes d''alerte : l''urgence excessive, et surtout l''adresse email avec une faute (micosoft au lieu de microsoft). Bravo !",
                "feedbackIncorrect": "😕 **Attention !** Regarde bien l''adresse : ''micosoft-securite.com'' n''est pas une adresse Microsoft officielle. L''urgence est là pour te faire paniquer et cliquer sans réfléchir.",
                "keyTakeaway": "Vérifie toujours [vert]l''adresse de l''expéditeur[/vert] avant de cliquer. Une [rouge]urgence inhabituelle[/rouge] est souvent un piège."
            },
            {
                "id": "ph_b_j1_q2",
                "text": "Tu reçois un email te proposant un bon d''achat de 500€ chez Amazon. Tu n''as participé à aucun concours. Que fais-tu ?",
                "options": [
                    "Je clique pour récupérer mon cadeau",
                    "C''est trop beau pour être vrai, j''ignore",
                    "Je transfère à un collègue pour vérifier"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "👍 **Parfait !** Si tu n''as rien demandé, c''est suspect. Les pirates utilisent la gourmandise comme appât.",
                "feedbackIncorrect": "⚠️ **Prudence !** Personne n''offre 500€ sans raison. C''est un piège classique pour voler tes données ou installer un virus.",
                "keyTakeaway": "Si c''est [vert]trop beau pour être vrai[/vert], c''est probablement un piège. Ne clique jamais sur des cadeaux inattendus."
            },
            {
                "id": "ph_b_j1_q3",
                "text": "Tu reçois un email de ton ''patron'' te demandant d''acheter des cartes cadeaux iTunes pour un client important. L''email dit : ''Je suis en réunion, fais vite''. Que fais-tu ?",
                "options": [
                    "J''achète les cartes immédiatement",
                    "Je vérifie avec mon patron par un autre canal (téléphone, Teams)",
                    "Je réponds à l''email pour confirmer"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🛡️ **Excellent !** Vérifier par un autre moyen (téléphone, Teams) est la règle d''or. Les pirates adorent usurper l''identité de tes supérieurs.",
                "feedbackIncorrect": "🚨 **Danger !** C''est une arnaque classique. Ton patron ne te demandera jamais d''acheter des cartes cadeaux par email. Toujours vérifier par téléphone ou en personne.",
                "keyTakeaway": "Pour toute [rouge]demande urgente d''argent ou d''achat[/rouge], vérifie TOUJOURS par un autre canal. Ne te fie jamais à un seul email."
            }
        ]
    }', 
    true
);

-- ━━━ Niveau Intermédiaire - Jour 1 ━━━
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Phishing Emails', 
    'QUIZ', 
    'INTERMEDIATE', 
    '{
        "courseIntro": "Content de te revoir ! 😊 Aujourd''hui, on monte en niveau sur le [bleu]Phishing[/bleu].\\n\\nLes attaques deviennent plus subtiles. Les pirates copient le style de vraies entreprises, utilisent de vrais logos, et cachent mieux leurs erreurs. Il faut avoir l''œil ! 🕵️‍♂️",
        "questions": [
            {
                "id": "ph_i_j1_q1",
                "text": "Tu reçois cet email :\\n\\n[jaune]━━━━━━━━━━━━━━━━━━━━[/jaune]\\n**De :** noreply@paypal-services.com\\n**Objet :** Activité inhabituelle détectée\\n\\nBonjour,\\n\\nNous avons détecté une connexion depuis un nouvel appareil. Si ce n''était pas vous, veuillez vérifier votre compte en cliquant ici.\\n\\nCordialement,\\nL''équipe PayPal\\n[jaune]━━━━━━━━━━━━━━━━━━━━[/jaune]\\n\\nQue fais-tu ?",
                "options": [
                    "Je clique sur le lien pour vérifier",
                    "Je vais directement sur le site PayPal via mon navigateur",
                    "Je réponds à l''email pour demander des détails"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🎯 **Très bien !** Ne jamais cliquer sur un lien dans un email suspect. Va toujours directement sur le site officiel en tapant l''adresse dans ton navigateur.",
                "feedbackIncorrect": "⚠️ **Attention !** Même si l''email semble légitime, le lien peut te rediriger vers une fausse page. Va toujours sur le site officiel directement.",
                "keyTakeaway": "Ne clique JAMAIS sur un lien dans un email de sécurité. Va [vert]directement sur le site officiel[/vert] en tapant l''adresse toi-même."
            },
            {
                "id": "ph_i_j1_q2",
                "text": "Tu reçois un email de ''DHL'' disant qu''un colis est en attente. L''email est bien écrit, avec le logo DHL. Le bouton dit ''Suivre mon colis''. En survolant le bouton avec ta souris, tu vois : [jaune]http://dhl-tracking-2024.com[/jaune]. Que fais-tu ?",
                "options": [
                    "Je clique, le logo est officiel",
                    "Je me méfie, l''adresse du lien n''est pas dhl.com",
                    "Je télécharge la pièce jointe pour plus d''infos"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🦅 **Œil de lynx !** Le vrai site DHL est ''dhl.com'' ou ''dhl.fr'', pas ''dhl-tracking-2024.com''. Les pirates achètent des noms de domaine similaires.",
                "feedbackIncorrect": "🚨 **Prudence !** Un logo peut être copié. Seul le [vert]nom de domaine réel[/vert] compte. ''dhl-tracking-2024.com'' n''est pas un site officiel.",
                "keyTakeaway": "Survole toujours un lien avec ta souris [vert]avant de cliquer[/vert]. Vérifie que le nom de domaine est bien l''officiel."
            }
        ]
    }', 
    true
);

-- ━━━ Niveau Avancé - Jour 1 ━━━
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Phishing Emails', 
    'QUIZ', 
    'ADVANCED', 
    '{
        "courseIntro": "Bienvenue dans le niveau expert ! 🎓 Ici, les attaques sont [rouge]très réalistes[/rouge].\\n\\nLes pirates font des recherches sur toi, connaissent ton entreprise, tes collègues, et créent des emails quasi-parfaits. On appelle ça du [bleu]Spear Phishing[/bleu] (hameçonnage ciblé). C''est le moment de mobiliser toute ta vigilance ! 🔍",
        "questions": [
            {
                "id": "ph_a_j1_q1",
                "text": "Tu reçois cet email :\\n\\n[jaune]━━━━━━━━━━━━━━━━━━━━[/jaune]\\n**De :** marie.dubois@ton-entreprise.com\\n**Objet :** Mise à jour du système RH\\n\\nBonjour,\\n\\nSuite à la migration de notre système RH, tous les employés doivent mettre à jour leurs informations personnelles avant vendredi.\\n\\nMerci de cliquer ici pour accéder au portail sécurisé.\\n\\nBien cordialement,\\nMarie Dubois - DRH\\n[jaune]━━━━━━━━━━━━━━━━━━━━[/jaune]\\n\\nMarie Dubois est bien ta DRH. Que fais-tu ?",
                "options": [
                    "Je clique, c''est ma DRH qui l''envoie",
                    "Je contacte Marie par Teams ou téléphone pour vérifier",
                    "Je réponds à l''email pour confirmer"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🏆 **Expert !** Même si l''expéditeur semble correct, un pirate peut usurper une adresse interne ou utiliser un compte compromis. Toujours vérifier par un autre canal.",
                "feedbackIncorrect": "🚨 **Piège subtil !** Les pirates peuvent usurper des adresses internes ou utiliser un compte compromis. Même si ça vient de ta DRH, vérifie par Teams ou téléphone.",
                "keyTakeaway": "Pour toute demande de [rouge]mise à jour de données personnelles[/rouge], vérifie par un autre moyen même si l''expéditeur semble légitime."
            },
            {
                "id": "ph_a_j1_q2",
                "text": "Tu reçois un email de ''LinkedIn'' disant que quelqu''un a consulté ton profil. L''email est parfaitement formaté, avec le logo, les couleurs, et ton nom. Le lien dans l''email pointe vers [jaune]https://linkedin-profile-view.com[/jaune]. Que remarques-tu ?",
                "options": [
                    "Rien de suspect, je clique",
                    "Le domaine devrait être linkedin.com, c''est un faux",
                    "Je vérifie d''abord ma boîte LinkedIn"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🎖️ **Parfait !** Le vrai LinkedIn utilise uniquement ''linkedin.com''. Les pirates créent des domaines qui ressemblent à l''original.",
                "feedbackIncorrect": "⚠️ **Attention au détail !** ''linkedin-profile-view.com'' n''est pas le domaine officiel de LinkedIn. Seul ''linkedin.com'' est légitime.",
                "keyTakeaway": "Vérifie toujours le [vert]domaine exact[/vert]. Les pirates utilisent des noms similaires pour tromper. Seul le domaine officiel compte."
            }
        ]
    }', 
    true
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTEUR 2 : LIENS SUSPECTS & URLs
-- ═══════════════════════════════════════════════════════════════════════════════

-- ━━━ Niveau Débutant - Jour 1 ━━━
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Liens Suspects & URLs', 
    'QUIZ', 
    'BEGINNER', 
    '{
        "courseIntro": "Aujourd''hui, on apprend à détecter les [bleu]liens suspects[/bleu] ! 🔗\\n\\nUn lien peut te rediriger vers un faux site pour voler tes identifiants ou installer un virus. C''est comme un panneau de direction qui t''envoie dans la mauvaise rue. Soyons vigilants ! 🚧",
        "questions": [
            {
                "id": "ls_b_j1_q1",
                "text": "Tu reçois un SMS de ''ta banque'' avec ce lien :\\n[jaune]bit.ly/3kXy2z[/jaune]\\n\\nLe message dit : ''Votre compte est bloqué, cliquez ici''. Que fais-tu ?",
                "options": [
                    "Je clique pour débloquer mon compte",
                    "Je me méfie, ma banque ne m''enverrait pas un lien raccourci",
                    "Je réponds au SMS pour vérifier"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "✅ **Bien joué !** Les banques n''utilisent jamais de liens raccourcis (bit.ly, tinyurl, etc.). C''est un signe d''arnaque évident.",
                "feedbackIncorrect": "🚨 **Danger !** Les [rouge]liens raccourcis[/rouge] cachent la vraie destination. Ta banque ne t''enverra JAMAIS un lien par SMS. Appelle-la directement.",
                "keyTakeaway": "Ta banque ne t''enverra [rouge]jamais de lien par SMS[/rouge]. Si tu reçois un tel message, c''est une arnaque."
            },
            {
                "id": "ls_b_j1_q2",
                "text": "Dans un email, un bouton affiche ''Accéder à mon compte''. En survolant avec ta souris, tu vois cette adresse :\\n[jaune]http://amaz0n-login.com[/jaune]\\n\\nQue remarques-tu ?",
                "options": [
                    "C''est amazon, je clique",
                    "Le ''0'' à la place du ''o'' est suspect, c''est un faux site",
                    "Rien d''anormal"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🎯 **Excellent !** Les pirates remplacent des lettres par des chiffres qui ressemblent (0 pour o, 1 pour l). C''est une technique classique.",
                "feedbackIncorrect": "⚠️ **Attention !** ''amaz0n'' avec un zéro n''est pas ''amazon''. Les pirates achètent des noms de domaine très similaires pour tromper.",
                "keyTakeaway": "Lis [vert]lettre par lettre[/vert] les noms de domaine. Les pirates remplacent des lettres par des chiffres similaires."
            }
        ]
    }', 
    true
);

-- ━━━ Niveau Intermédiaire - Jour 1 ━━━
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Liens Suspects & URLs', 
    'QUIZ', 
    'INTERMEDIATE', 
    '{
        "courseIntro": "On monte en niveau sur les [bleu]liens suspects[/bleu] ! 🔍\\n\\nAujourd''hui, tu vas apprendre à analyser des URLs plus complexes. Les pirates deviennent créatifs pour cacher leurs pièges. Aiguise ton regard ! 👀",
        "questions": [
            {
                "id": "ls_i_j1_q1",
                "text": "Tu reçois un email d''un ''collègue'' avec ce lien :\\n[jaune]https://sharepoint-documents.company-files.net[/jaune]\\n\\nLe message dit : ''Voici le document que tu as demandé''. Que remarques-tu ?",
                "options": [
                    "C''est SharePoint, je clique",
                    "Le domaine n''est pas celui de mon entreprise, c''est suspect",
                    "Je télécharge sans vérifier"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🎯 **Bien vu !** Ton entreprise a un domaine SharePoint officiel (ex: ton-entreprise.sharepoint.com). Ce lien est un faux.",
                "feedbackIncorrect": "🚨 **Attention !** ''company-files.net'' n''est pas le vrai domaine SharePoint de ton entreprise. Les pirates créent des noms qui sonnent professionnels.",
                "keyTakeaway": "Vérifie que le lien pointe vers le [vert]domaine officiel de ton entreprise[/vert]. En cas de doute, demande au service IT."
            },
            {
                "id": "ls_i_j1_q2",
                "text": "Tu reçois un email avec ce lien :\\n[jaune]https://microsoft.com-login-verify.net[/jaune]\\n\\nQue remarques-tu ?",
                "options": [
                    "C''est microsoft.com, je clique",
                    "Le vrai domaine se termine après le premier point, c''est un faux",
                    "Rien de suspect"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🏆 **Expert !** Le vrai domaine est ''com-login-verify.net''. Tout ce qui est AVANT le dernier point est un sous-domaine. Ici, c''est un piège.",
                "feedbackIncorrect": "⚠️ **Piège subtil !** Le vrai nom de domaine se lit [vert]de droite à gauche[/vert] : ''.net'' est le domaine principal, pas ''.com''.",
                "keyTakeaway": "Lis le domaine [vert]de droite à gauche[/vert]. Le vrai domaine est ce qui précède le dernier point avant l''extension (.com, .fr, .net)."
            }
        ]
    }', 
    true
);

-- ━━━ Niveau Avancé - Jour 1 ━━━
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Liens Suspects & URLs', 
    'QUIZ', 
    'ADVANCED', 
    '{
        "courseIntro": "Niveau expert sur les [bleu]URLs[/bleu] ! 🎓\\n\\nLes pirates utilisent des techniques avancées : homographes (lettres qui se ressemblent), sous-domaines trompeurs, redirections cachées. C''est le moment de devenir un vrai expert ! 🔬",
        "questions": [
            {
                "id": "ls_a_j1_q1",
                "text": "Tu reçois un lien qui semble parfait :\\n[jaune]https://www.microsоft.com/security[/jaune]\\n\\nPourtant, quelque chose cloche. Que remarques-tu ?",
                "options": [
                    "Rien, c''est Microsoft officiel",
                    "Il y a peut-être un caractère Unicode qui ressemble à ''o''",
                    "Le ''https'' est louche"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🎖️ **Incroyable !** Tu as détecté une attaque par [bleu]homographe[/bleu]. Certaines lettres cyrilliques ou grecques ressemblent à nos lettres latines.",
                "feedbackIncorrect": "🚨 **Piège ultra-subtil !** Le ''о'' dans ''microsоft'' n''est pas un ''o'' latin, mais un caractère cyrillique. C''est une attaque par homographe.",
                "keyTakeaway": "Les pirates utilisent des [rouge]caractères Unicode[/rouge] qui ressemblent à nos lettres. Copie l''URL dans un éditeur de texte pour vérifier."
            },
            {
                "id": "ls_a_j1_q2",
                "text": "Tu cliques sur un lien qui affiche rapidement plusieurs redirections :\\n1. [jaune]secure-link.com[/jaune]\\n2. [jaune]verify-portal.net[/jaune]\\n3. [jaune]final-destination.org[/jaune]\\n\\nQue penses-tu ?",
                "options": [
                    "C''est normal pour certains sites",
                    "Des redirections multiples sont suspectes, je ferme la page",
                    "J''attends de voir la page finale"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🛡️ **Réflexe expert !** Les redirections multiples sont utilisées pour contourner les filtres de sécurité et cacher la vraie destination.",
                "feedbackIncorrect": "⚠️ **Méfiance !** Les [rouge]redirections multiples[/rouge] sont une technique pour masquer la destination finale et éviter la détection.",
                "keyTakeaway": "Des [rouge]redirections multiples[/rouge] sont un signe d''alerte. Ferme la page et signale le lien."
            }
        ]
    }', 
    true
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTEUR 3 : MOTS DE PASSE & PROTECTION DES IDENTIFIANTS
-- ═══════════════════════════════════════════════════════════════════════════════

-- ━━━ Niveau Débutant - Jour 1 ━━━
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Mots de Passe & Protection', 
    'QUIZ', 
    'BEGINNER', 
    '{
        "courseIntro": "Parlons [bleu]mots de passe[/bleu] ! 🔐\\n\\nTon mot de passe est la clé de ton royaume numérique. Si un pirate le trouve, il peut lire tes emails, accéder aux fichiers clients, et même usurper ton identité. C''est aussi important que la clé de ta maison ! 🏠",
        "questions": [
            {
                "id": "mp_b_j1_q1",
                "text": "Lequel de ces mots de passe est le plus solide ?",
                "options": [
                    "Marseille2024",
                    "Password123!",
                    "J''aim3L3Ch0c0lat!",
                    "Tr@in$Bl3u_1998#"
                ],
                "correctAnswer": 3,
                "feedbackCorrect": "🏆 **Excellent choix !** Long (15+ caractères), varié (majuscules, minuscules, chiffres, symboles), et pas un mot du dictionnaire.",
                "feedbackIncorrect": "⚠️ **Trop simple !** Les mots du dictionnaire, les dates, et les suites logiques sont craqués en quelques secondes par les pirates.",
                "keyTakeaway": "Un bon mot de passe : [vert]12+ caractères, varié, pas de mot du dictionnaire[/vert]."
            },
            {
                "id": "mp_b_j1_q2",
                "text": "Est-ce une bonne idée d''utiliser le même mot de passe pour ton email pro et ton compte personnel ?",
                "options": [
                    "Oui, c''est plus facile à retenir",
                    "Non, si un compte est piraté, tous les autres le sont aussi",
                    "Oui, si le mot de passe est très compliqué"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "✅ **Exactement !** C''est l''effet domino. Un pirate qui trouve un mot de passe l''essaie partout. Un compte = un mot de passe unique.",
                "feedbackIncorrect": "🚨 **Danger !** Si un site est piraté et que tu utilises le même mot de passe partout, TOUS tes comptes sont compromis.",
                "keyTakeaway": "Un compte = [rouge]un mot de passe unique[/rouge]. Utilise un gestionnaire de mots de passe pour t''aider."
            },
            {
                "id": "mp_b_j1_q3",
                "text": "Ton collègue te demande ton mot de passe pour accéder à un dossier partagé pendant que tu es absent. Que fais-tu ?",
                "options": [
                    "Je lui donne, c''est mon collègue",
                    "Je refuse, je ne partage JAMAIS mon mot de passe",
                    "Je lui donne mais je le change après"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🛡️ **Parfait !** Ton mot de passe est personnel. Même ton patron ou l''IT ne doivent JAMAIS le demander. S''il y a un besoin, il y a d''autres solutions.",
                "feedbackIncorrect": "⚠️ **Non !** Ton mot de passe est [rouge]strictement personnel[/rouge]. Même un collègue de confiance ne doit pas le connaître. Demande au service IT pour une solution.",
                "keyTakeaway": "[rouge]Ne partage JAMAIS ton mot de passe[/rouge], même avec un collègue. Personne ne doit le connaître sauf toi."
            }
        ]
    }', 
    true
);

-- ━━━ Niveau Intermédiaire - Jour 1 ━━━
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Mots de Passe & Protection', 
    'QUIZ', 
    'INTERMEDIATE', 
    '{
        "courseIntro": "On approfondit la [bleu]protection des identifiants[/bleu] ! 🔒\\n\\nAujourd''hui, on parle de l''authentification à deux facteurs (2FA), des gestionnaires de mots de passe, et des pièges à éviter. Tu vas devenir un pro de la sécurité ! 💪",
        "questions": [
            {
                "id": "mp_i_j1_q1",
                "text": "L''IT de ton entreprise propose d''activer l''[bleu]authentification à deux facteurs[/bleu] (2FA) sur ton compte. Que fais-tu ?",
                "options": [
                    "Je refuse, c''est contraignant",
                    "J''active, c''est une couche de sécurité essentielle",
                    "J''attends que ce soit obligatoire"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🎯 **Excellent réflexe !** La 2FA rend le piratage quasi impossible, même si ton mot de passe est volé. C''est la meilleure protection.",
                "feedbackIncorrect": "⚠️ **Dommage !** La [vert]2FA[/vert] est la protection la plus efficace. Même si un pirate a ton mot de passe, il ne peut pas se connecter sans le second facteur.",
                "keyTakeaway": "Active la [vert]2FA[/vert] partout où c''est possible. C''est la meilleure protection contre le vol d''identifiants."
            },
            {
                "id": "mp_i_j1_q2",
                "text": "Tu reçois un SMS d''un numéro inconnu avec un code de vérification que tu n''as pas demandé. Que fais-tu ?",
                "options": [
                    "J''ignore, c''est une erreur",
                    "Je signale au service IT, quelqu''un essaie peut-être de se connecter à mon compte",
                    "Je partage le code avec un collègue pour voir"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🛡️ **Parfait !** Un code que tu n''as pas demandé signifie que quelqu''un essaie d''accéder à ton compte. Signale-le immédiatement.",
                "feedbackIncorrect": "🚨 **Attention !** Un [rouge]code non sollicité[/rouge] est un signe qu''un pirate tente de se connecter à ton compte. Change ton mot de passe et préviens l''IT.",
                "keyTakeaway": "Un [rouge]code de vérification non sollicité[/rouge] = quelqu''un essaie d''accéder à ton compte. Signale-le immédiatement."
            }
        ]
    }', 
    true
);

-- ━━━ Niveau Avancé - Jour 1 ━━━
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Mots de Passe & Protection', 
    'QUIZ', 
    'ADVANCED', 
    '{
        "courseIntro": "Niveau expert sur la [bleu]sécurité des identifiants[/bleu] ! 🎓\\n\\nOn va parler de credential stuffing, de fuites de données, et de comment protéger tes comptes même quand un site est piraté. Prêt pour le niveau pro ? 🚀",
        "questions": [
            {
                "id": "mp_a_j1_q1",
                "text": "Tu lis dans les news qu''un site où tu as un compte (ex: un forum) a été piraté et que des millions de mots de passe ont été volés. Que fais-tu ?",
                "options": [
                    "Je ne fais rien, je n''utilise pas ce site",
                    "Je change immédiatement le mot de passe de CE site ET de tous les sites où j''ai utilisé le même",
                    "Je change juste le mot de passe du site piraté"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🎖️ **Réflexe expert !** Les pirates vont tester ce mot de passe sur tous les autres sites (Gmail, Facebook, etc.). C''est le [bleu]credential stuffing[/bleu].",
                "feedbackIncorrect": "🚨 **Danger !** Si tu as utilisé ce mot de passe ailleurs, les pirates vont le tester partout. Change-le sur TOUS les sites concernés.",
                "keyTakeaway": "En cas de fuite, change le mot de passe [rouge]sur TOUS les sites où tu l''as utilisé[/rouge]. Les pirates font du credential stuffing."
            },
            {
                "id": "mp_a_j1_q2",
                "text": "Ton gestionnaire de mots de passe te signale qu''un de tes mots de passe apparaît dans une [rouge]base de données de mots de passe volés[/rouge]. Que fais-tu ?",
                "options": [
                    "J''ignore, c''est juste un avertissement",
                    "Je change immédiatement ce mot de passe",
                    "J''attends de voir si je me fais pirater"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🛡️ **Excellent !** Si ton mot de passe est dans une base publique, les pirates l''utilisent pour des attaques automatisées. Change-le immédiatement.",
                "feedbackIncorrect": "⚠️ **Agis vite !** Un mot de passe dans une base de données volées est un [rouge]danger immédiat[/rouge]. Change-le avant qu''un pirate ne l''utilise.",
                "keyTakeaway": "Si un mot de passe apparaît dans une [rouge]base de données volées[/rouge], change-le immédiatement. Ne prends aucun risque."
            }
        ]
    }', 
    true
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTEUR 4 : FAUX MESSAGES INTERNES (Teams / IT / RH)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ━━━ Niveau Débutant - Jour 1 ━━━
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Faux Messages Internes', 
    'QUIZ', 
    'BEGINNER', 
    '{
        "courseIntro": "Aujourd''hui, on parle des [bleu]faux messages internes[/bleu] ! 💬\\n\\nLes pirates se font passer pour l''IT, la RH ou même ton patron pour te piéger. Ils connaissent les noms de tes collègues et le fonctionnement de ton entreprise. Soyons vigilants ! 🕵️",
        "questions": [
            {
                "id": "fm_b_j1_q1",
                "text": "Tu reçois ce message Teams :\\n\\n[jaune]━━━━━━━━━━━━━━━━━━━━[/jaune]\\n**Support IT**\\nVotre mot de passe expire aujourd''hui. Merci de le réinitialiser ici : [lien]\\n[jaune]━━━━━━━━━━━━━━━━━━━━[/jaune]\\n\\nQue fais-tu ?",
                "options": [
                    "Je clique pour réinitialiser",
                    "Je contacte l''IT par téléphone, ils ne demandent jamais ça par Teams",
                    "Je réponds au message pour vérifier"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "✅ **Parfait !** L''IT ne demande JAMAIS de réinitialiser un mot de passe via un lien dans Teams. C''est une arnaque classique.",
                "feedbackIncorrect": "🚨 **Attention !** L''[vert]IT légitime[/vert] ne te demandera jamais de cliquer sur un lien pour changer ton mot de passe. Appelle-les directement.",
                "keyTakeaway": "L''IT ne demande [rouge]JAMAIS[/rouge] de cliquer sur un lien pour réinitialiser un mot de passe. Appelle-les pour vérifier."
            },
            {
                "id": "fm_b_j1_q2",
                "text": "Tu reçois un email de la ''RH'' te demandant de remplir un formulaire avec tes informations personnelles (adresse, numéro de sécu, etc.). L''email dit : ''Mise à jour annuelle obligatoire''. Que fais-tu ?",
                "options": [
                    "Je remplis le formulaire",
                    "Je vérifie avec la RH par téléphone ou en personne",
                    "Je réponds à l''email pour confirmer"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🛡️ **Excellent réflexe !** Pour toute demande de données personnelles, vérifie TOUJOURS par un autre canal. Les pirates adorent se faire passer pour la RH.",
                "feedbackIncorrect": "⚠️ **Prudence !** Les [rouge]demandes de données personnelles[/rouge] par email sont souvent des arnaques. Vérifie avec la RH directement.",
                "keyTakeaway": "Pour toute demande de [rouge]données personnelles[/rouge], vérifie par téléphone ou en personne. Ne te fie pas à un email."
            }
        ]
    }', 
    true
);

-- ━━━ Niveau Intermédiaire - Jour 1 ━━━
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Faux Messages Internes', 
    'QUIZ', 
    'INTERMEDIATE', 
    '{
        "courseIntro": "On monte en niveau sur les [bleu]faux messages internes[/bleu] ! 🎭\\n\\nLes pirates deviennent plus subtils : ils imitent le style de tes collègues, connaissent les projets en cours, et utilisent des comptes compromis. Il faut être encore plus vigilant ! 🔍",
        "questions": [
            {
                "id": "fm_i_j1_q1",
                "text": "Tu reçois un message Teams d''un collègue que tu connais bien : ''Hey, j''ai besoin que tu valides cette facture urgente pour un client. Merci de cliquer ici''. Le style est inhabituel pour lui. Que fais-tu ?",
                "options": [
                    "Je clique, c''est mon collègue",
                    "Je lui demande par téléphone ou vidéo, son compte est peut-être compromis",
                    "Je réponds sur Teams pour confirmer"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🎯 **Excellent !** Un [bleu]compte compromis[/bleu] peut envoyer des messages malveillants. Si le style est inhabituel, vérifie par un autre moyen.",
                "feedbackIncorrect": "🚨 **Attention !** Les pirates utilisent des [rouge]comptes compromis[/rouge] pour envoyer des messages malveillants. Un style inhabituel = alerte.",
                "keyTakeaway": "Si un message d''un collègue semble [jaune]inhabituel[/jaune] (style, urgence), vérifie par téléphone. Son compte est peut-être compromis."
            },
            {
                "id": "fm_i_j1_q2",
                "text": "Tu reçois un email ''interne'' avec l''objet : ''Nouvelle politique de sécurité - Action requise''. L''email demande de cliquer sur un lien pour ''confirmer ta lecture''. L''adresse de l''expéditeur est : [jaune]it-security@ton-entreprise-info.com[/jaune]. Que remarques-tu ?",
                "options": [
                    "Rien de suspect, je clique",
                    "Le domaine n''est pas celui de mon entreprise, c''est un faux",
                    "Je télécharge la pièce jointe"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🏆 **Bien vu !** Le vrai domaine de ton entreprise est probablement ''ton-entreprise.com'', pas ''ton-entreprise-info.com''. Les pirates achètent des domaines similaires.",
                "feedbackIncorrect": "⚠️ **Piège !** Vérifie toujours le [vert]domaine exact[/vert] de ton entreprise. ''ton-entreprise-info.com'' n''est pas légitime.",
                "keyTakeaway": "Vérifie que l''email vient du [vert]domaine officiel de ton entreprise[/vert]. Les pirates utilisent des domaines similaires."
            }
        ]
    }', 
    true
);

-- ━━━ Niveau Avancé - Jour 1 ━━━
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Faux Messages Internes', 
    'QUIZ', 
    'ADVANCED', 
    '{
        "courseIntro": "Niveau expert sur les [bleu]faux messages internes[/bleu] ! 🎓\\n\\nIci, les attaques sont ultra-réalistes. Les pirates ont étudié ton entreprise, connaissent tes projets, et utilisent des comptes compromis. C''est le moment de mobiliser toute ta vigilance ! 🔬",
        "questions": [
            {
                "id": "fm_a_j1_q1",
                "text": "Tu reçois un message Teams de ton patron (adresse vérifiée) te demandant d''envoyer le fichier confidentiel du ''Projet Titan'' à un cabinet d''audit externe. Le message dit : ''Urgent, ils en ont besoin pour ce soir''. Que fais-tu ?",
                "options": [
                    "J''envoie, c''est mon patron qui le demande",
                    "Je le contacte par téléphone ou vidéo pour confirmer, son compte est peut-être compromis",
                    "Je réponds sur Teams pour confirmer"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🎖️ **Réflexe expert !** Même si l''adresse est correcte, un [rouge]compte compromis[/rouge] peut envoyer des messages. Pour des données confidentielles, vérifie TOUJOURS par téléphone.",
                "feedbackIncorrect": "🚨 **Danger !** Pour toute demande de [rouge]transfert de données confidentielles[/rouge], vérifie par téléphone, même si ça vient de ton patron.",
                "keyTakeaway": "Pour toute demande de [rouge]transfert de données confidentielles[/rouge], vérifie par téléphone ou vidéo, même si l''expéditeur semble légitime."
            },
            {
                "id": "fm_a_j1_q2",
                "text": "Tu reçois un email ''interne'' annonçant un nouveau ''Programme de Prime Exceptionnelle''. L''email contient un lien pour ''s''inscrire avant vendredi''. Le style est très professionnel. Que fais-tu ?",
                "options": [
                    "Je clique pour m''inscrire",
                    "Je vérifie avec la RH ou sur l''intranet officiel, c''est trop beau pour être vrai",
                    "Je transfère à mes collègues"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🛡️ **Parfait !** Les pirates utilisent [bleu]l''appât de l''argent[/bleu] pour te faire cliquer. Vérifie toujours les annonces importantes sur l''intranet ou avec la RH.",
                "feedbackIncorrect": "⚠️ **Attention !** Les annonces importantes (primes, augmentations) sont toujours communiquées officiellement. Vérifie sur l''intranet ou avec la RH.",
                "keyTakeaway": "Les annonces importantes (primes, avantages) sont toujours sur [vert]l''intranet officiel[/vert]. Ne te fie pas à un email non vérifié."
            }
        ]
    }', 
    true
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTEUR 5 : RÉFLEXES DE SÉCURITÉ DE BASE
-- ═══════════════════════════════════════════════════════════════════════════════

-- ━━━ Niveau Débutant - Jour 1 ━━━
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Réflexes de Sécurité de Base', 
    'QUIZ', 
    'BEGINNER', 
    '{
        "courseIntro": "Aujourd''hui, on va parler des [bleu]réflexes de base[/bleu] en cybersécurité ! 🛡️\\n\\nCe sont les gestes simples du quotidien qui te protègent. C''est comme verrouiller ta porte en partant : ça prend 2 secondes et ça évite beaucoup de problèmes ! 🚪",
        "questions": [
            {
                "id": "rs_b_j1_q1",
                "text": "Tu quittes ton bureau pour aller déjeuner. Ton ordinateur est allumé avec des emails ouverts. Que fais-tu ?",
                "options": [
                    "Je laisse tout ouvert, c''est juste pour 1h",
                    "Je verrouille mon ordinateur (Windows + L)",
                    "Je ferme juste les fenêtres sensibles"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "✅ **Parfait !** Verrouiller ton PC (Windows + L) est le réflexe de base. Ça évite que quelqu''un accède à tes données en ton absence.",
                "feedbackIncorrect": "⚠️ **Non !** Même pour 5 minutes, [rouge]verrouille TOUJOURS ton ordinateur[/rouge]. Un collègue mal intentionné ou un visiteur peut accéder à tes données.",
                "keyTakeaway": "[vert]Verrouille ton ordinateur[/vert] dès que tu quittes ton poste, même pour 5 minutes. C''est le geste de base."
            },
            {
                "id": "rs_b_j1_q2",
                "text": "Tu reçois un email suspect avec une pièce jointe bizarre. Que fais-tu ?",
                "options": [
                    "Je l''ouvre pour voir ce que c''est",
                    "Je le signale au service IT et je le supprime",
                    "Je le transfère à un collègue pour qu''il vérifie"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🛡️ **Excellent !** Signaler au service IT permet de protéger toute l''entreprise. Tu es un héros de la cybersécurité ! 🦸",
                "feedbackIncorrect": "🚨 **Attention !** [rouge]N''ouvre JAMAIS une pièce jointe suspecte[/rouge]. Signale-la au service IT pour protéger tout le monde.",
                "keyTakeaway": "Face à un email suspect : [vert]signale, ne clique pas, supprime[/vert]. Tu protèges toute l''entreprise."
            },
            {
                "id": "rs_b_j1_q3",
                "text": "Tu trouves une clé USB dans la salle de réunion. Que fais-tu ?",
                "options": [
                    "Je la branche pour voir à qui elle appartient",
                    "Je la donne au service IT sans la brancher",
                    "Je la mets à la poubelle"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🎯 **Parfait !** Une clé USB trouvée peut contenir un virus. Ne la branche JAMAIS. C''est un piège classique des pirates.",
                "feedbackIncorrect": "⚠️ **Danger !** Une [rouge]clé USB inconnue[/rouge] peut contenir un virus qui s''installe automatiquement. Ne la branche jamais. Donne-la à l''IT.",
                "keyTakeaway": "[rouge]Ne branche JAMAIS une clé USB trouvée[/rouge]. C''est un piège classique. Donne-la au service IT."
            }
        ]
    }', 
    true
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTEUR 6 : INGÉNIERIE SOCIALE (TECHNIQUES D''ATTAQUE)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ━━━ Niveau Intermédiaire - Jour 1 ━━━
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Ingénierie Sociale', 
    'QUIZ', 
    'INTERMEDIATE', 
    '{
        "courseIntro": "Aujourd''hui, on parle de l''[bleu]ingénierie sociale[/bleu] ! 🎭\\n\\nC''est l''art de manipuler les humains plutôt que les machines. Les pirates utilisent tes émotions (peur, urgence, curiosité, autorité) pour te faire faire une erreur. C''est du piratage psychologique ! 🧠",
        "questions": [
            {
                "id": "is_i_j1_q1",
                "text": "Un livreur arrive à l''accueil. Il dit qu''il doit livrer un colis urgent dans la zone sécurisée, mais il a ''oublié son badge''. Il insiste : ''Je suis pressé, ça prendra 2 minutes''. Que fais-tu ?",
                "options": [
                    "Je lui ouvre par gentillesse",
                    "Je refuse poliment et j''appelle la sécurité pour valider",
                    "Je lui demande juste son nom"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🛡️ **Excellent !** Les pirates exploitent ta [bleu]gentillesse[/bleu] et l''[bleu]urgence[/bleu]. La sécurité doit valider chaque entrée, sans exception.",
                "feedbackIncorrect": "🚨 **Attention !** Les pirates utilisent [rouge]l''urgence et la pression sociale[/rouge] pour contourner la sécurité. Ne laisse jamais entrer quelqu''un sans validation.",
                "keyTakeaway": "Ne laisse [rouge]JAMAIS[/rouge] entrer quelqu''un sans validation, même s''il insiste. L''urgence est souvent un piège."
            },
            {
                "id": "is_i_j1_q2",
                "text": "Tu reçois un appel de quelqu''un se présentant comme ''le nouveau du service IT''. Il te demande ton mot de passe pour ''finaliser ta migration de compte''. Il a l''air gentil et professionnel. Que fais-tu ?",
                "options": [
                    "Je lui donne, il est de l''IT",
                    "Je refuse catégoriquement et je raccroche. L''IT ne demande JAMAIS un mot de passe",
                    "Je lui demande son numéro de badge"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🎖️ **Parfait !** L''IT ne demande [rouge]JAMAIS[/rouge] ton mot de passe, même au téléphone. C''est une tentative d''[bleu]ingénierie sociale[/bleu] classique.",
                "feedbackIncorrect": "🚨 **Danger !** L''IT ne demande [rouge]JAMAIS[/rouge] un mot de passe, même par téléphone. C''est un pirate qui utilise l''autorité pour te manipuler.",
                "keyTakeaway": "L''IT ne demande [rouge]JAMAIS[/rouge] ton mot de passe. Si quelqu''un le demande, c''est une arnaque. Raccroche et signale."
            }
        ]
    }', 
    true
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTEUR 7 : PIÈCES JOINTES MALVEILLANTES
-- ═══════════════════════════════════════════════════════════════════════════════

-- ━━━ Niveau Intermédiaire - Jour 1 ━━━
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Pièces Jointes Malveillantes', 
    'QUIZ', 
    'INTERMEDIATE', 
    '{
        "courseIntro": "Aujourd''hui, on parle des [bleu]pièces jointes dangereuses[/bleu] ! 📎💣\\n\\nUne pièce jointe peut contenir un virus, un ransomware, ou un logiciel espion. Certaines s''activent juste en ouvrant le fichier. Soyons vigilants ! 🔍",
        "questions": [
            {
                "id": "pj_i_j1_q1",
                "text": "Tu reçois un email avec une pièce jointe nommée : [jaune]Facture_Urgente.pdf.exe[/jaune]. Que remarques-tu ?",
                "options": [
                    "Rien de suspect, c''est un PDF",
                    "La double extension ''.pdf.exe'' est louche, c''est un virus déguisé",
                    "Je l''ouvre pour vérifier"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🎯 **Excellent !** Les pirates utilisent des [bleu]doubles extensions[/bleu] pour déguiser des virus en documents. ''.exe'' est un programme, pas un PDF.",
                "feedbackIncorrect": "🚨 **Danger !** ''.exe'' est un fichier exécutable (programme). Les pirates ajoutent ''.pdf'' avant pour te tromper. [rouge]N''ouvre JAMAIS[/rouge] ce type de fichier.",
                "keyTakeaway": "Méfie-toi des [rouge]doubles extensions[/rouge] (ex: .pdf.exe). C''est souvent un virus déguisé. Signale-le à l''IT."
            },
            {
                "id": "pj_i_j1_q2",
                "text": "Tu reçois un email d''un ''client'' avec un fichier Word [jaune]Contrat_Final.doc[/jaune]. L''email dit : ''Merci de signer le contrat en activant les macros''. Que fais-tu ?",
                "options": [
                    "J''ouvre et j''active les macros comme demandé",
                    "Je me méfie, les macros peuvent contenir du code malveillant",
                    "Je transfère à mon manager"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🛡️ **Parfait !** Les [bleu]macros[/bleu] sont du code qui s''exécute dans Word/Excel. Les pirates les utilisent pour installer des virus.",
                "feedbackIncorrect": "⚠️ **Attention !** Les [rouge]macros[/rouge] peuvent exécuter du code malveillant. Ne les active jamais sans vérification avec l''IT.",
                "keyTakeaway": "[rouge]N''active JAMAIS les macros[/rouge] dans un fichier provenant d''un email. Vérifie avec l''IT d''abord."
            }
        ]
    }', 
    true
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTEUR 8 : FAUSSES FACTURES & FRAUDE AU PAIEMENT
-- ═══════════════════════════════════════════════════════════════════════════════

-- ━━━ Niveau Intermédiaire - Jour 1 ━━━
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Fausses Factures & Fraude', 
    'QUIZ', 
    'INTERMEDIATE', 
    '{
        "courseIntro": "Aujourd''hui, on parle de la [bleu]fraude au paiement[/bleu] ! 💸\\n\\nLes pirates envoient de fausses factures ou se font passer pour des fournisseurs pour te faire virer de l''argent. C''est une des arnaques les plus coûteuses pour les entreprises ! 💰🚨",
        "questions": [
            {
                "id": "ff_i_j1_q1",
                "text": "Tu reçois un email d''un ''fournisseur habituel'' disant : ''Nous avons changé de RIB bancaire. Merci d''utiliser ce nouveau compte pour la prochaine facture''. Que fais-tu ?",
                "options": [
                    "Je mets à jour le RIB dans notre système",
                    "Je vérifie par téléphone avec le fournisseur (numéro officiel, pas celui de l''email)",
                    "Je réponds à l''email pour confirmer"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🎯 **Excellent !** Les pirates se font passer pour des fournisseurs pour détourner des paiements. Vérifie TOUJOURS par téléphone (numéro officiel).",
                "feedbackIncorrect": "🚨 **Danger !** [rouge]Un changement de RIB[/rouge] par email est une arnaque classique. Appelle le fournisseur sur son numéro officiel pour vérifier.",
                "keyTakeaway": "Pour tout [rouge]changement de RIB[/rouge], vérifie par téléphone avec le fournisseur (numéro officiel). Ne te fie jamais à un email."
            },
            {
                "id": "ff_i_j1_q2",
                "text": "Tu reçois une facture par email qui semble provenir d''un fournisseur connu. Le montant est correct, mais l''adresse email de l''expéditeur est légèrement différente (ex: [jaune]comptabilite@fournisseur-services.com[/jaune] au lieu de [jaune]comptabilite@fournisseur.com[/jaune]). Que fais-tu ?",
                "options": [
                    "Je paie, le montant est correct",
                    "Je vérifie l''adresse email et je contacte le fournisseur sur son numéro officiel",
                    "Je réponds à l''email pour confirmer"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🛡️ **Parfait !** Une légère différence dans l''adresse email est un signe d''arnaque. Les pirates achètent des domaines très similaires.",
                "feedbackIncorrect": "⚠️ **Attention !** Vérifie TOUJOURS [vert]l''adresse email exacte[/vert]. ''fournisseur-services.com'' n''est pas ''fournisseur.com''.",
                "keyTakeaway": "Vérifie [vert]l''adresse email exacte[/vert] de chaque facture. Les pirates utilisent des domaines très similaires pour te tromper."
            }
        ]
    }', 
    true
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTEUR 9 : USURPATION D''IDENTITÉ (COMPTES COMPROMIS)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ━━━ Niveau Intermédiaire - Jour 1 ━━━
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Usurpation d''Identité', 
    'QUIZ', 
    'INTERMEDIATE', 
    '{
        "courseIntro": "Aujourd''hui, on parle de l''[bleu]usurpation d''identité[/bleu] ! 🎭\\n\\nQuand un pirate accède au compte d''un collègue, il peut envoyer des messages malveillants en son nom. Comment détecter un compte compromis ? C''est ce qu''on va voir ! 🕵️",
        "questions": [
            {
                "id": "ui_i_j1_q1",
                "text": "Tu reçois un message Teams d''un collègue en vacances te demandant d''envoyer des informations confidentielles à un ''client urgent''. Le style du message ne lui ressemble pas. Que fais-tu ?",
                "options": [
                    "J''envoie, c''est peut-être vraiment urgent",
                    "Je l''appelle sur son portable pour vérifier, son compte est peut-être compromis",
                    "Je réponds sur Teams pour confirmer"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🎯 **Excellent !** Un collègue en vacances + style inhabituel + demande de données = [rouge]alerte rouge[/rouge]. Son compte est probablement compromis.",
                "feedbackIncorrect": "🚨 **Attention !** Un [bleu]style inhabituel[/bleu] + demande de données sensibles = compte probablement compromis. Appelle-le pour vérifier.",
                "keyTakeaway": "Si un message d''un collègue semble [jaune]inhabituel[/jaune] (style, timing, demande), appelle-le. Son compte est peut-être piraté."
            },
            {
                "id": "ui_i_j1_q2",
                "text": "Tu remarques que ton collègue Paul envoie des messages bizarres à tout le monde sur Teams. Il nie les avoir envoyés. Que penses-tu ?",
                "options": [
                    "Il ment",
                    "Son compte Teams est compromis, il faut signaler à l''IT immédiatement",
                    "C''est une blague"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🛡️ **Parfait !** Un [bleu]compte compromis[/bleu] envoie des messages malveillants à l''insu de son propriétaire. Signale immédiatement à l''IT.",
                "feedbackIncorrect": "⚠️ **Urgence !** Si quelqu''un nie avoir envoyé des messages, son [rouge]compte est probablement compromis[/rouge]. Signale à l''IT immédiatement.",
                "keyTakeaway": "Si un collègue nie avoir envoyé des messages, son [rouge]compte est compromis[/rouge]. Signale immédiatement à l''IT."
            }
        ]
    }', 
    true
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTEUR 10 : RISQUES LIÉS AU TÉLÉTRAVAIL & MOBILITÉ
-- ═══════════════════════════════════════════════════════════════════════════════

-- ━━━ Niveau Intermédiaire - Jour 1 ━━━
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Télétravail & Mobilité', 
    'QUIZ', 
    'INTERMEDIATE', 
    '{
        "courseIntro": "Aujourd''hui, on parle des [bleu]risques du télétravail[/bleu] ! 🏠💻\\n\\nTravailler hors du bureau, c''est pratique, mais ça comporte des risques : Wi-Fi public, écran visible, appareil perdu... Voyons comment se protéger ! 🔒",
        "questions": [
            {
                "id": "tm_i_j1_q1",
                "text": "Tu travailles dans un café. Tu te connectes au Wi-Fi public ''Cafe_Gratuit''. Est-ce une bonne idée ?",
                "options": [
                    "Oui, c''est pratique",
                    "Non, les Wi-Fi publics ne sont pas sécurisés. J''utilise mon partage de connexion 4G",
                    "Oui, si j''ai un antivirus"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🎯 **Excellent !** Les [bleu]Wi-Fi publics[/bleu] ne sont pas sécurisés. Un pirate peut intercepter tes données. Utilise ton partage de connexion 4G ou un VPN.",
                "feedbackIncorrect": "🚨 **Danger !** Sur un [rouge]Wi-Fi public[/rouge], un pirate peut voir tout ce que tu fais. Utilise ton partage de connexion 4G.",
                "keyTakeaway": "[rouge]Ne te connecte jamais à un Wi-Fi public[/rouge] pour travailler. Utilise ton partage de connexion 4G."
            },
            {
                "id": "tm_i_j1_q2",
                "text": "Tu travailles dans le train. La personne à côté de toi peut voir ton écran. Tu as des emails clients ouverts. Que fais-tu ?",
                "options": [
                    "Je laisse, elle ne s''intéresse pas",
                    "Je mets un filtre de confidentialité ou je change de place",
                    "Je ferme juste les emails sensibles"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "✅ **Parfait !** Un [bleu]filtre de confidentialité[/bleu] empêche les regards indiscrets. Dans les lieux publics, protège toujours ton écran.",
                "feedbackIncorrect": "⚠️ **Attention !** Même dans le train, quelqu''un peut lire tes emails. Utilise un [vert]filtre de confidentialité[/vert] ou change de place.",
                "keyTakeaway": "Dans les lieux publics, utilise un [vert]filtre de confidentialité[/vert] pour protéger ton écran des regards indiscrets."
            }
        ]
    }', 
    true
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTEUR 11 : ATTAQUES CIBLÉES (SPEAR PHISHING)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ━━━ Niveau Avancé - Jour 1 ━━━
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Attaques Ciblées', 
    'QUIZ', 
    'ADVANCED', 
    '{
        "courseIntro": "Bienvenue dans le monde des [bleu]attaques ciblées[/bleu] ! 🎯\\n\\nIci, les pirates te visent personnellement. Ils ont étudié ton profil LinkedIn, connaissent tes projets, et créent des emails sur-mesure. C''est du haut niveau ! 🔬",
        "questions": [
            {
                "id": "at_a_j1_q1",
                "text": "Tu reçois un email d''un ''partenaire'' mentionnant le nom exact d''un projet confidentiel sur lequel tu travailles. L''email demande de valider un document joint. Comment le pirate pourrait-il connaître ce nom de projet ?",
                "options": [
                    "C''est forcément un vrai partenaire",
                    "Il a pu trouver l''info sur LinkedIn, dans une fuite de données, ou via un autre employé piraté",
                    "C''est de la chance"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🎖️ **Excellent !** Les pirates font des [bleu]recherches approfondies[/bleu] : LinkedIn, fuites de données, réseaux sociaux, comptes compromis. Ils reconstituent ton environnement.",
                "feedbackIncorrect": "⚠️ **Attention !** Les pirates utilisent [rouge]LinkedIn, fuites de données, réseaux sociaux[/rouge] pour personnaliser leurs attaques. Vérifie TOUJOURS l''expéditeur.",
                "keyTakeaway": "Les pirates font des [rouge]recherches approfondies[/rouge] pour personnaliser leurs attaques. Ne te fie jamais à la mention d''infos que tu connais."
            },
            {
                "id": "at_a_j1_q2",
                "text": "Tu reçois un message LinkedIn d''un ''recruteur'' pour un poste intéressant. Il te demande de remplir un formulaire avec tes infos personnelles (adresse, date de naissance, etc.) pour ''accélérer le processus''. Que fais-tu ?",
                "options": [
                    "Je remplis, c''est une belle opportunité",
                    "Je me méfie, je vérifie l''entreprise et je demande un entretien d''abord",
                    "Je demande plus de détails par message"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🛡️ **Parfait !** Les pirates utilisent [bleu]l''appât du poste de rêve[/bleu] pour voler tes données personnelles. Vérifie TOUJOURS l''entreprise et demande un vrai entretien.",
                "feedbackIncorrect": "🚨 **Attention !** Un vrai recruteur ne te demande pas d''infos personnelles avant un entretien. Vérifie l''entreprise et demande un appel.",
                "keyTakeaway": "Un vrai recruteur ne demande [rouge]jamais d''infos personnelles[/rouge] avant un entretien. Vérifie l''entreprise et demande un appel."
            }
        ]
    }', 
    true
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTEUR 12 : RANSOMWARE (PERSPECTIVE UTILISATEUR)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ━━━ Niveau Avancé - Jour 1 ━━━
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Ransomware', 
    'QUIZ', 
    'ADVANCED', 
    '{
        "courseIntro": "Aujourd''hui, on parle du [bleu]Ransomware[/bleu] ! 🔐💸\\n\\nC''est un virus qui chiffre tous tes fichiers et demande une rançon pour les débloquer. C''est la pire des attaques pour une entreprise. Voyons comment l''éviter ! 🚨",
        "questions": [
            {
                "id": "rw_a_j1_q1",
                "text": "Ton ordinateur affiche soudain un message en plein écran : [rouge]''Vos fichiers sont chiffrés. Payez 5000€ en Bitcoin pour les récupérer''[/rouge]. Que fais-tu ?",
                "options": [
                    "Je paie immédiatement pour récupérer mes fichiers",
                    "Je débranche immédiatement le câble réseau et j''appelle l''IT en urgence",
                    "Je redémarre l''ordinateur"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🎖️ **Réflexe parfait !** Débrancher le réseau empêche le virus de se propager. Appelle l''IT immédiatement. [rouge]Ne paie JAMAIS la rançon[/rouge].",
                "feedbackIncorrect": "🚨 **Urgence !** [rouge]Ne paie JAMAIS[/rouge]. Débranche le réseau pour éviter la propagation et appelle l''IT. Les sauvegardes permettront de restaurer.",
                "keyTakeaway": "En cas de ransomware : [vert]débranche le réseau, appelle l''IT, ne paie jamais[/vert]. Les sauvegardes sont la seule solution."
            },
            {
                "id": "rw_a_j1_q2",
                "text": "Comment un ransomware arrive-t-il sur ton ordinateur ?",
                "options": [
                    "Par magie",
                    "Via un email avec pièce jointe infectée, un lien malveillant, ou un site compromis",
                    "Uniquement si je télécharge des films pirates"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "✅ **Exactement !** Le [bleu]ransomware[/bleu] arrive principalement par email (pièce jointe, lien). C''est pour ça qu''on répète : ne clique pas, ne télécharge pas !",
                "feedbackIncorrect": "⚠️ **Info importante !** Le ransomware arrive par [rouge]email infecté, lien malveillant, ou site compromis[/rouge]. D''où l''importance de la vigilance.",
                "keyTakeaway": "Le ransomware arrive par [rouge]email infecté ou lien malveillant[/rouge]. Ta vigilance est la première ligne de défense."
            }
        ]
    }', 
    true
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTEUR 13 : PROTECTION DES DONNÉES & CONFIDENTIALITÉ
-- ═══════════════════════════════════════════════════════════════════════════════

-- ━━━ Niveau Avancé - Jour 1 ━━━
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Protection des Données', 
    'QUIZ', 
    'ADVANCED', 
    '{
        "courseIntro": "Aujourd''hui, on parle de la [bleu]protection des données[/bleu] ! 🗂️🔒\\n\\nLes données de ton entreprise (clients, projets, finances) sont précieuses. Une fuite peut coûter très cher. Voyons comment les protéger ! 💎",
        "questions": [
            {
                "id": "pd_a_j1_q1",
                "text": "Tu dois envoyer un fichier Excel contenant des données clients à un collègue externe. Que fais-tu ?",
                "options": [
                    "Je l''envoie par email classique",
                    "Je le protège par mot de passe et j''utilise le canal sécurisé de l''entreprise",
                    "Je le mets sur mon Drive perso et je partage le lien"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🎯 **Parfait !** Les [bleu]données sensibles[/bleu] doivent être protégées (mot de passe) et envoyées par canal sécurisé (SharePoint, plateforme approuvée).",
                "feedbackIncorrect": "🚨 **Attention !** Les données clients doivent être [vert]protégées et envoyées par canal sécurisé[/vert] (SharePoint, plateforme approuvée), jamais par email classique.",
                "keyTakeaway": "Les [rouge]données sensibles[/rouge] doivent être protégées par mot de passe et envoyées par canal sécurisé (SharePoint, plateforme approuvée)."
            },
            {
                "id": "pd_a_j1_q2",
                "text": "Tu quittes l''entreprise. Que fais-tu de tes accès et fichiers professionnels ?",
                "options": [
                    "Je garde mes accès au cas où",
                    "Je remets tout au service IT et je supprime tous les fichiers de mes appareils personnels",
                    "Je garde une copie des fichiers intéressants"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🛡️ **Excellent !** Les données de l''entreprise doivent rester dans l''entreprise. [rouge]Ne garde aucune copie[/rouge] sur tes appareils personnels.",
                "feedbackIncorrect": "⚠️ **Attention !** Les données de l''entreprise lui appartiennent. [rouge]Ne garde aucune copie[/rouge]. Remets tout à l''IT et supprime tout de tes appareils.",
                "keyTakeaway": "Les données de l''entreprise [rouge]lui appartiennent[/rouge]. En partant, remets tout à l''IT et supprime tout de tes appareils personnels."
            }
        ]
    }', 
    true
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTEUR 14 : SHADOW IT & OUTILS NON AUTORISÉS
-- ═══════════════════════════════════════════════════════════════════════════════

-- ━━━ Niveau Avancé - Jour 1 ━━━
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Shadow IT & Outils non Autorisés', 
    'QUIZ', 
    'ADVANCED', 
    '{
        "courseIntro": "Aujourd''hui, on parle du [bleu]Shadow IT[/bleu] ! 🌑💻\\n\\nC''est quand tu utilises des outils non approuvés par l''entreprise (Dropbox perso, WhatsApp, apps non validées). Ça semble pratique, mais c''est très risqué ! ⚠️",
        "questions": [
            {
                "id": "sh_a_j1_q1",
                "text": "Tu trouves un super outil en ligne pour convertir des PDF. Tu veux l''utiliser pour un document client. Est-ce une bonne idée ?",
                "options": [
                    "Oui, c''est pratique",
                    "Non, je ne sais pas où vont les données. J''utilise l''outil approuvé par l''entreprise",
                    "Oui, si le site a l''air sérieux"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🎯 **Excellent !** Quand tu uploades un document sur un site inconnu, tu ne sais pas où vont les données. Utilise [vert]les outils approuvés[/vert] par l''IT.",
                "feedbackIncorrect": "🚨 **Danger !** Un site ''gratuit'' peut stocker tes documents, les revendre, ou être compromis. Utilise [vert]les outils approuvés[/vert] par l''IT.",
                "keyTakeaway": "[rouge]N''utilise jamais d''outil non approuvé[/rouge] avec des données professionnelles. Demande à l''IT les outils validés."
            },
            {
                "id": "sh_a_j1_q2",
                "text": "Un collègue te propose de partager des fichiers clients via Dropbox personnel. Que fais-tu ?",
                "options": [
                    "J''accepte, c''est plus rapide",
                    "Je refuse et je propose d''utiliser SharePoint ou OneDrive de l''entreprise",
                    "J''accepte si c''est juste une fois"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🛡️ **Parfait !** Un [bleu]Dropbox personnel[/bleu] n''est pas sécurisé pour les données professionnelles. Utilise les outils de l''entreprise (SharePoint, OneDrive).",
                "feedbackIncorrect": "⚠️ **Attention !** Les outils personnels (Dropbox, Google Drive perso) ne sont [rouge]pas approuvés[/rouge] pour les données pro. Utilise SharePoint ou OneDrive.",
                "keyTakeaway": "[rouge]Ne partage jamais de données pro[/rouge] via des outils personnels. Utilise les plateformes approuvées (SharePoint, OneDrive)."
            }
        ]
    }', 
    true
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTEUR 15 : CULTURE DE SÉCURITÉ & RESPONSABILITÉ COLLECTIVE
-- ═══════════════════════════════════════════════════════════════════════════════

-- ━━━ Niveau Avancé - Jour 1 ━━━
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Culture de Sécurité', 
    'QUIZ', 
    'ADVANCED', 
    '{
        "courseIntro": "Aujourd''hui, on parle de la [bleu]culture de sécurité[/bleu] ! 🤝🛡️\\n\\nLa cybersécurité, ce n''est pas que l''affaire de l''IT. C''est l''affaire de tous. Chaque employé est un maillon de la chaîne. Ensemble, on est plus forts ! 💪",
        "questions": [
            {
                "id": "cs_a_j1_q1",
                "text": "Tu remarques qu''un collègue laisse toujours son ordinateur déverrouillé quand il part en pause. Que fais-tu ?",
                "options": [
                    "Ce n''est pas mon problème",
                    "Je lui en parle gentiment et je lui rappelle l''importance de verrouiller son PC",
                    "Je le signale à son manager"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🎯 **Excellent !** La [bleu]culture de sécurité[/bleu], c''est s''entraider. Un rappel amical peut éviter un incident grave. On est tous dans le même bateau ! 🚢",
                "feedbackIncorrect": "⚠️ **Meilleure approche !** La sécurité est [vert]l''affaire de tous[/vert]. Un rappel gentil peut éviter un incident. On se protège mutuellement.",
                "keyTakeaway": "La sécurité est [vert]l''affaire de tous[/vert]. N''hésite pas à rappeler gentiment les bonnes pratiques à tes collègues."
            },
            {
                "id": "cs_a_j1_q2",
                "text": "Tu reçois un email suspect. Tu penses que ce n''est rien, mais tu n''es pas sûr. Que fais-tu ?",
                "options": [
                    "Je supprime et je n''en parle pas",
                    "Je le signale au service IT, même si je ne suis pas certain. Mieux vaut prévenir",
                    "Je demande à un collègue"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🛡️ **Parfait !** [vert]Mieux vaut signaler[/vert] un faux positif que laisser passer une vraie attaque. L''IT préfère 10 fausses alertes qu''une vraie attaque non signalée.",
                "feedbackIncorrect": "⚠️ **Meilleure approche !** En cas de doute, [vert]signale toujours[/vert]. L''IT préfère recevoir 10 fausses alertes qu''une vraie attaque non signalée.",
                "keyTakeaway": "En cas de doute, [vert]signale toujours[/vert]. Mieux vaut une fausse alerte qu''une vraie attaque non signalée."
            },
            {
                "id": "cs_a_j1_q3",
                "text": "Ton entreprise organise une formation cybersécurité. Tu penses déjà tout savoir. Que fais-tu ?",
                "options": [
                    "Je n''y vais pas, je connais déjà",
                    "J''y vais, les menaces évoluent constamment et je peux toujours apprendre",
                    "J''envoie quelqu''un d''autre"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🎖️ **Mentalité de champion !** Les [bleu]menaces évoluent constamment[/bleu]. Même les experts continuent à se former. C''est une question de responsabilité collective ! 🚀",
                "feedbackIncorrect": "⚠️ **Attention !** Les [rouge]menaces évoluent constamment[/rouge]. Même si tu es vigilant, une formation peut t''apprendre de nouvelles techniques d''attaque.",
                "keyTakeaway": "Les [rouge]menaces évoluent constamment[/rouge]. La formation continue est essentielle pour tous, même les plus vigilants."
            }
        ]
    }', 
    true
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- FIN DU SEED COMPLET ENTREPRISE
-- ═══════════════════════════════════════════════════════════════════════════════

-- Vérification du nombre d'exercices insérés
-- SELECT topic, difficulty, COUNT(*) as nb_exercices FROM exercises GROUP BY topic, difficulty ORDER BY topic, difficulty;

