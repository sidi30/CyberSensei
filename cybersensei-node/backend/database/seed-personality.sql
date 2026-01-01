-- ============================================================================
-- CYBERSENSEI - SEED AVEC PERSONNALITÉ DE "POTE"
-- Bot sympathique, blagues, exemples quotidiens, tons variés
-- ============================================================================

DELETE FROM exercises;

-- ============================================================================
-- THÈME 1 : PHISHING - Ton Fun et Pédagogique
-- ============================================================================
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Phishing', 
    'QUIZ', 
    'BEGINNER', 
    '{
        "courseIntro": "Yo ! 👋 Prêt pour ta dose de cyber-coaching ?\n\nAujourd''hui, on attaque le **Phishing** (ou Hameçonnage pour les puristes 🎣).\n\n**C''est quoi le délire ?**\nImagine : un pirate se déguise en ''Support IT'', ''Ta banque'', ou même ''Ton patron'' pour te faire cliquer sur un lien piégé ou ouvrir une pièce jointe malveillante.\n\n**Le but ?** Te voler tes accès, tes données, ton argent... bref, ta vie numérique ! 😱\n\n**Fun fact :** 90% des cyberattaques commencent par un email de phishing. C''est l''arme préférée des pirates parce que... ben, ça marche trop bien ! 🤷‍♂️\n\nMais t''inquiète, avec les bons réflexes, tu deviens __invincible__ !",
        "questions": [
            {
                "id": "p1",
                "text": "Imagine : Lundi matin, 8h30, t''arrives au bureau avec ton café ☕\n\nTu ouvres tes mails et BOOM :\n\n**[SCREENSHOT]**\n```\nDe: support@it-dept-security.net\nObjet: 🚨 URGENT - Ton mot de passe expire dans 1h\n\nSalut,\n\nTon mot de passe arrive à expiration dans 1 heure.\nClique vite ici pour le garder : [Garder mon accès]\n\nL''équipe IT\n```\n\nTon cerveau encore endormi te dit : ''Oh merde, je vais perdre mon accès !'' 😰\n\n**Mais attends... c''est louche non ?**\n\nQue fais-tu ?",
                "context": "☕ **Situation du quotidien** : Lundi matin, premier café, cerveau en mode veille...",
                "options": [
                    "Je clique direct, j''ai pas le temps !",
                    "Je check l''adresse de l''expéditeur et je supprime",
                    "Je demande à mon collègue Bruno s''il a reçu ça aussi"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "**BINGO !** 🎯 T''as capté le piège !\n\nL''adresse ''it-dept-security.net'' c''est pas notre domaine officiel. Les vrais IT utilisent ''@notreentreprise.com''.\n\nEt puis franchement... l''IT qui t''envoie un mail d''urgence un lundi matin ? Ils sont même pas encore arrivés ! 😂",
                "feedbackIncorrect": "**Aïe aïe aïe...** 😬\n\nJe sais, le lundi matin c''est dur. Mais là, t''es tombé dans le piège !\n\nL''adresse ''it-dept-security.net'' c''est pas notre domaine. Et cette urgence (''1h !!''), c''est fait exprès pour te faire paniquer et cliquer sans réfléchir.\n\n**Astuce de pote :** Quand tu reçois un mail qui te stresse, prends 10 secondes pour vérifier l''expéditeur. Ça peut te sauver la vie (numérique) !",
                "concreteExample": "💡 **Exemple concret** :\nEn 2023, une boîte française a perdu __2 millions d''euros__ parce qu''un employé a cliqué sur un faux mail IT. Le pirate a récupéré ses accès et a vidé le compte en 48h.\n\nTout ça pour un clic un lundi matin... ☕💀",
                "keyTakeaway": "Urgence bizarre + adresse louche = PIÈGE ! Toujours vérifier l''expéditeur."
            },
            {
                "id": "p2",
                "text": "**NOUVEAU MAIL** 📧\n\nCette fois c''est plus tentant :\n\n```\nDe: concours@amazon-officiel.com\nObjet: 🎁 FÉLICITATIONS ! Tu as gagné 500€\n\nBonjour,\n\nBonne nouvelle ! Tu es le 1000ème visiteur du jour !\nTu as gagné un bon d''achat Amazon de 500€.\n\nClique ici pour le récupérer : [Récupérer mon cadeau]\n\nL''équipe Amazon\n```\n\n**Ton cerveau :** ''500 balles gratuits ? JACKPOT ! 🤑''\n\nMais attends... t''as participé à un concours toi ?",
                "context": "🎰 **Tentation du quotidien** : Qui refuserait 500€ gratuits ?",
                "options": [
                    "500€ ?! Je clique sans réfléchir !",
                    "C''est trop beau, c''est forcément un piège",
                    "Je transfère à mes potes pour voir si c''est vrai"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "**T''ES UN WARRIOR ! 🛡️**\n\nExactement ! Si c''est trop beau pour être vrai, c''est que... ben c''est pas vrai ! 😅\n\nAucune boîte sérieuse n''offre 500€ comme ça, sans concours, sans rien. C''est un appât classique.\n\n**Fun fact :** Les pirates adorent utiliser les chiffres ronds (100€, 500€, 1000€) parce que ça fait ''officiel''. Alors que les vrais concours c''est plutôt ''347,23€'' avec des centimes bizarres.",
                "feedbackIncorrect": "**Houston, on a un problème... 🚨**\n\nJe sais, 500€ c''est tentant. Moi aussi je craquerais ! Mais là c''est un __piège parfait__.\n\nPersonne n''offre 500€ comme ça. Les vrais concours Amazon, tu dois t''inscrire, valider ton email, etc. Là c''est juste un lien qui va :\n1. Voler tes infos bancaires\n2. Installer un virus\n3. Te revendre à des spammeurs\n\nBref, tu perds plus que 500€ au final ! 💸",
                "concreteExample": "🎯 **Exemple perso** :\nUn de mes potes (on va l''appeler Kevin 😬) a cliqué sur ce genre de lien. Résultat ? 3 jours plus tard, son compte en banque était vide et son PC rempli de virus.\n\nLa banque a remboursé (ouf !), mais il a passé 2 semaines à tout réinstaller. Moral : __500€ gratuits = 500h de galère__.",
                "keyTakeaway": "Cadeau inattendu et énorme = Piège garanti. Si t''as rien fait, t''as rien gagné !"
            },
            {
                "id": "p3",
                "text": "**DERNIER EMAIL** (promis après on passe à autre chose ! 😄)\n\n```\nDe: noreply@servicecompte.fr\nObjet: Verification compte\n\ncher cliant,\n\nvous devait verifer votre compte bancair sinon il sera bloquer.\n\ncliquer ici: [verifer maintenan]\n\nCordialement,\nVotre banque\n```\n\n**Ton cerveau :** ''Hmm... c''est chelou ce message...''\n\nC''est suspect ?",
                "context": "🔍 **Détection du quotidien** : Parfois les indices sont TRÈS visibles...",
                "options": [
                    "Oui, c''est blindé de fautes d''orthographe !",
                    "Non, les banques font parfois des fautes",
                    "Bof, c''est pas grave quelques fautes"
                ],
                "correctAnswer": 0,
                "feedbackCorrect": "**YES ! T''as l''œil ! 👁️**\n\nCe message c''est un festival de fautes :\n- ''cliant'' au lieu de ''client''\n- ''devait verifer'' au lieu de ''devez vérifier''\n- ''maintenan'' au lieu de ''maintenant''\n\nLes vraies banques ont des équipes de communication qui relisent **TOUT**. Un message officiel avec autant de fautes ? __Impossible__ !\n\n**Bonus :** L''adresse générique (''cher client'') au lieu de ton nom. Les banques te connaissent, elles utilisent ton nom !",
                "feedbackIncorrect": "**Attention là ! ⚠️**\n\nCe message c''est Disneyland pour les fautes d''orthographe ! 😂\n\nLes VRAIES banques :\n- Ont des équipes de com qui relisent tout\n- Utilisent ton NOM (pas ''cher client'')\n- Ne mettent JAMAIS de fautes\n\nLà c''est clairement un __pirate amateur__ qui a traduit un email anglais avec Google Translate en 2 minutes.\n\n**Règle d''or :** Fautes + message générique = Fraude à 99%",
                "concreteExample": "😂 **Anecdote drôle** :\nUn pirate a envoyé un faux email de la ''Banqu Postale'' (avec un E en moins). 47 000 personnes l''ont quand même reçu et... 200 ont cliqué !\n\nDes fois je me demande si les gens lisent vraiment leurs mails... 🤦‍♂️",
                "keyTakeaway": "Fautes d''orthographe + message générique = Fraudeur amateur qui se fait choper facilement !"
            }
        ]
    }', 
    true
);

-- ============================================================================
-- THÈME 2 : MOTS DE PASSE - Ton Sympa de Pote qui Conseille
-- ============================================================================
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Mots de Passe', 
    'QUIZ', 
    'BEGINNER', 
    '{
        "courseIntro": "Salut champion ! 🔐\n\nAujourd''hui on parle de tes **mots de passe**. Ouais je sais, c''est relou, mais c''est __ULTRA important__.\n\n**Imagine ton mot de passe comme la clé de ton appart.**\n\nSi ta clé c''est ''1234'' gravé dessus en gros... ben n''importe qui peut entrer, fouiller dans tes affaires, et repartir avec ta PS5 ! 🎮💀\n\n**Avec un mot de passe faible, un pirate peut :**\n- Lire tous tes emails (même ceux de ton ex 👀)\n- Accéder aux dossiers clients de la boîte\n- Se faire passer pour toi\n- Vider ton compte en banque\n- Bloquer ton accès et demander une rançon\n\nBref, c''est la **catastrophe totale**. 🔥\n\n**Mais !** Avec les bonnes pratiques, t''es __blindé comme Fort Knox__. Et je vais te montrer comment !",
        "questions": [
            {
                "id": "m1",
                "text": "**Mini-jeu : Quel mot de passe est le plus SOLIDE ?**\n\nTu crées un nouveau compte. Lequel tu choisis ?",
                "context": "🎮 **Situation gaming** : Tu t''inscris sur un nouveau site...",
                "options": [
                    "Marseille2024 (ta ville + l''année)",
                    "Soleil! (simple à retenir)",
                    "Ch@teau_Bleu_78#Novembre (long et varié)",
                    "12345678 (facile)"
                ],
                "correctAnswer": 2,
                "feedbackCorrect": "**CHAMPION ! 🏆**\n\nT''as tout compris ! ''Ch@teau_Bleu_78#Novembre'' c''est **LE mot de passe parfait** :\n\n✅ **Plus de 12 caractères** (20 ici !)\n✅ **Majuscules + minuscules** (C, B, N...)\n✅ **Chiffres** (78)\n✅ **Symboles** (@, _, #)\n✅ **Pas de mot courant seul**\n\nAvec ça, un pirate mettrait __847 ans__ pour le craquer ! À ce moment-là, on sera tous en voiture volante... 🚗✈️",
                "feedbackIncorrect": "**Hmmm... on peut faire mieux ! 💪**\n\nLe 3ème (''Ch@teau_Bleu_78#Novembre'') c''est le king !\n\n**Pourquoi les autres sont nuls ?**\n- ''Marseille2024'' → Mot du dico + année courante = __cracké en 2 secondes__\n- ''Soleil!'' → Trop court + mot courant = __cracké en 0.5 seconde__\n- ''12345678'' → C''est le mot de passe le plus utilisé au monde... __cracké instantanément__\n\nUn bon mot de passe c''est comme une recette de cuisine : il faut mélanger plein d''ingrédients différents ! 🍳",
                "concreteExample": "📊 **Stats qui font peur** :\nEn 2023, les 10 mots de passe les plus utilisés étaient :\n1. 123456\n2. password\n3. 123456789\n4. 12345678\n5. 12345\n\n__Tous crackables en moins d''1 seconde.__ 💀\n\nSi ton mot de passe est dans cette liste... change-le MAINTENANT ! 🚨",
                "keyTakeaway": "Mot de passe solide = 12+ caractères, mélange de TOUT (A-z, 0-9, @#!), pas de mots du dico."
            },
            {
                "id": "m2",
                "text": "**Question piège !** 🎯\n\nT''as un mot de passe ULTRA compliqué : ''K9#zL@mP2$qR8!vN''\n\nSuper solide ! Mais tu l''utilises pour :\n- Ton email pro\n- Ta banque\n- Ton Facebook\n- Ton Netflix\n- Ton compte Amazon\n\nC''est safe ?",
                "context": "🤔 **Réflexion du quotidien** : Flemme de retenir 50 mots de passe différents...",
                "options": [
                    "Oui, il est trop compliqué donc c''est bon",
                    "NON ! Si un compte est piraté, tous les autres tombent !",
                    "Oui, tant que je le change tous les 3 mois"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "**T''ES UN GÉNIE ! 🧠**\n\nExactement ! Même avec le mot de passe le plus solide de l''univers, si tu l''utilises partout, c''est __l''effet domino__ ! 🎲\n\n**Scénario cauchemar :**\n1. Facebook se fait pirater (ça arrive)\n2. Ton mot de passe fuite dans une base de données pirate\n3. Le pirate essaie ton mot de passe sur Gmail... __ça marche !__\n4. Il essaie sur ta banque... __ça marche aussi !__\n5. Il vide ton compte et commande 50 pizzas sur ton compte 🍕💀\n\n**Règle d''OR :** Un compte = Un mot de passe UNIQUE. Toujours.",
                "feedbackIncorrect": "**Attention danger ! 🚨**\n\nMême avec un mot de passe ultra-fort, si tu l''utilises partout, c''est la __catastrophe__ !\n\nImagine : Facebook se fait pirater (ça arrive tout le temps). Ton mot de passe fuite. Le pirate va l''essayer sur tous tes autres comptes...\n\n__Résultat :__ Tous tes comptes tombent en 5 minutes. Email, banque, Netflix, tout !\n\nC''est comme si tu avais la même clé pour ton appart, ta voiture, ton bureau, et ton casier à la salle de sport. Si tu perds la clé... c''est fini ! 🔑💀",
                "concreteExample": "🔥 **Histoire vraie** :\nMon collègue Marc utilisait le même mot de passe partout. Un site de jeux vidéo s''est fait pirater.\n\n2 jours plus tard :\n- Son Gmail était bloqué\n- Sa banque avait des virements bizarres\n- Son compte Spotify jouait du hardcore metal non-stop 😂\n\nIl a mis 3 semaines à tout récupérer. Moral : __Ne fais pas comme Marc__ !",
                "keyTakeaway": "Un compte = Un mot de passe UNIQUE. Pas d''exception !"
            }
        ]
    }', 
    true
);

