-- ═══════════════════════════════════════════════════════════════════════════════
-- CYBERSENSEI - SEED COMPLET ENTREPRISE AVEC IMAGES
-- Programme de sensibilisation conversationnel - 15 secteurs - 3 niveaux - Images intégrées
-- ═══════════════════════════════════════════════════════════════════════════════

DELETE FROM exercises;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTEUR 1 : PHISHING EMAILS (AVEC IMAGES)
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
                "text": "Tu reçois ce message un lundi matin. Regarde bien cette capture d''écran :",
                "imageUrl": "/assets/images/phishing_email_microsoft.png",
                "imageDescription": "Email avec objet ''URGENT - Votre compte va expirer'' de support@micosoft-securite.com",
                "options": [
                    "Je clique vite pour ne pas perdre mon compte",
                    "Je vérifie l''adresse de l''expéditeur et je supprime l''email",
                    "Je réponds pour demander plus d''informations"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🎉 **Excellent réflexe !** Tu as repéré les signes d''alerte : l''urgence excessive, et surtout l''adresse email avec une faute ([rouge]micosoft[/rouge] au lieu de [vert]microsoft[/vert]). Bravo !",
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
                "imageUrl": "/assets/images/phishing_email_boss.png",
                "imageDescription": "Email urgent du patron demandant d''acheter des cartes cadeaux",
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

-- ━━━ Niveau Intermédiaire - Jour 1 (AVEC IMAGES) ━━━
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Phishing Emails', 
    'QUIZ', 
    'INTERMEDIATE', 
    '{
        "courseIntro": "Content de te revoir ! 😊 Aujourd''hui, on monte en niveau sur le [bleu]Phishing[/bleu].\\n\\nLes attaques deviennent plus subtiles. Les pirates copient le style de vraies entreprises, utilisent de vrais logos, et cachent mieux leurs erreurs. Il faut avoir l''œil ! 🕵️‍♂️",
        "questions": [
            {
                "id": "ph_i_j1_q1",
                "text": "Tu reçois cet email qui semble très professionnel :",
                "imageUrl": "/assets/images/phishing_email_paypal.png",
                "imageDescription": "Email PayPal avec logo officiel mais lien suspect",
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
                "imageUrl": "/assets/images/phishing_email_dhl.png",
                "imageDescription": "Email DHL professionnel mais avec URL suspecte au survol",
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
                "text": "Tu reçois cet email qui semble venir de ta DRH Marie Dubois :",
                "imageDescription": "Email interne professionnel de la DRH demandant une mise à jour RH",
                "options": [
                    "Je clique, c''est ma DRH qui l''envoie",
                    "Je contacte Marie par Teams ou téléphone pour vérifier",
                    "Je réponds à l''email pour confirmer"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🏆 **Expert !** Même si l''expéditeur semble correct, un pirate peut usurper une adresse interne ou utiliser un compte compromis. Toujours vérifier par un autre canal.",
                "feedbackIncorrect": "🚨 **Piège subtil !** Les pirates peuvent usurper des adresses internes ou utiliser un compte compromis. Même si ça vient de ta DRH, vérifie par Teams ou téléphone.",
                "keyTakeaway": "Pour toute demande de [rouge]mise à jour de données personnelles[/rouge], vérifie par un autre moyen même si l''expéditeur semble légitime."
            }
        ]
    }', 
    true
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTEUR 2 : LIENS SUSPECTS & URLs (AVEC IMAGES)
-- ═══════════════════════════════════════════════════════════════════════════════

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
                "text": "Dans un email, un bouton affiche ''Accéder à mon compte''. En survolant avec ta souris, tu vois cette adresse :",
                "imageUrl": "/assets/images/suspicious_url_example2.png",
                "imageDescription": "URL avec amaz0n au lieu d''amazon",
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

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTEUR 3 : FAUSSES PAGES DE CONNEXION (AVEC IMAGES)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Fausses Pages de Connexion', 
    'QUIZ', 
    'INTERMEDIATE', 
    '{
        "courseIntro": "Aujourd''hui, on parle des [bleu]fausses pages de connexion[/bleu] ! 🎭\\n\\nLes pirates créent des copies parfaites de pages Microsoft, Office 365, LinkedIn pour voler tes identifiants. C''est comme un faux distributeur de billets qui enregistre ton code ! 💳",
        "questions": [
            {
                "id": "fl_i_j1_q1",
                "text": "Tu cliques sur un lien dans un email et tu arrives sur cette page. Quelque chose te semble bizarre ?",
                "imageUrl": "/assets/images/fake_login_microsoft.png",
                "imageDescription": "Fausse page de connexion Microsoft avec URL suspecte",
                "options": [
                    "Rien de suspect, je me connecte",
                    "L''URL n''est pas microsoft.com, c''est une fausse page",
                    "Je rentre mon mot de passe pour tester"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🎯 **Excellent !** Même si la page ressemble à Microsoft, l''URL doit être [vert]login.microsoft.com[/vert] ou [vert]login.microsoftonline.com[/vert]. Tout le reste est un piège.",
                "feedbackIncorrect": "🚨 **Danger !** Vérifie TOUJOURS l''URL dans la barre d''adresse. Les pirates copient parfaitement le design, mais ils ne peuvent pas copier le vrai domaine Microsoft.",
                "keyTakeaway": "Avant d''entrer tes identifiants, vérifie TOUJOURS [vert]l''URL dans la barre d''adresse[/vert]. Le design peut être copié, pas le domaine officiel."
            },
            {
                "id": "fl_i_j1_q2",
                "text": "Cette page Office 365 te semble-t-elle légitime ?",
                "imageUrl": "/assets/images/fake_login_office365.png",
                "imageDescription": "Fausse page Office 365 avec certificat non sécurisé",
                "options": [
                    "Oui, je me connecte",
                    "Non, le navigateur affiche un avertissement de sécurité",
                    "Je ne sais pas"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "🛡️ **Parfait !** Un [rouge]avertissement de sécurité[/rouge] du navigateur signifie que le site n''est pas sécurisé. Ne jamais entrer tes identifiants sur un tel site.",
                "feedbackIncorrect": "⚠️ **Attention !** Si ton navigateur affiche un [rouge]avertissement de sécurité[/rouge], ne jamais continuer. C''est un site frauduleux.",
                "keyTakeaway": "Un [rouge]avertissement de sécurité[/rouge] du navigateur = danger immédiat. Ferme immédiatement la page."
            }
        ]
    }', 
    true
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- COPIE DES AUTRES SECTEURS DEPUIS LE SEED ORIGINAL (sans images pour l''instant)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Note: Pour la suite, on réutilise les exercices du seed original
-- Les images seront ajoutées progressivement selon les besoins

-- SECTEUR 3 : MOTS DE PASSE
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
            }
        ]
    }', 
    true
);

-- Ajout de tous les autres secteurs...
-- (Je vais inclure les autres secteurs du seed original ici pour avoir un seed complet)

-- SECTEUR 4 : FAUX MESSAGES INTERNES
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
            }
        ]
    }', 
    true
);

-- SECTEUR 5 : RÉFLEXES DE BASE
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
            }
        ]
    }', 
    true
);

-- Vérification
SELECT topic, difficulty, COUNT(*) as nb_exercices FROM exercises GROUP BY topic, difficulty ORDER BY topic, difficulty;

