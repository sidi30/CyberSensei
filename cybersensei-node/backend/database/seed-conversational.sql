-- ============================================================================
-- CYBERSENSEI - SEED CONVERSATIONNEL COMPLET
-- Format : Cours + Exercices interactifs
-- ============================================================================

DELETE FROM exercises;

-- ============================================================================
-- THÈME 1 : PHISHING (Niveau Débutant)
-- ============================================================================
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Phishing', 
    'QUIZ', 
    'BEGINNER', 
    '{
        "courseIntro": "Salut ! Aujourd''hui, on va parler du Phishing (ou Hameçonnage). 🎣\n\nC''est quand un pirate t''envoie un message en se faisant passer pour une banque, l''IT ou même ton patron pour te voler tes accès.\n\nLe but ? Te faire cliquer sur un lien ou ouvrir une pièce jointe empoisonnée.\n\nC''est l''attaque n°1 dans le monde. Mais avec les bons réflexes, tu peux la repérer facilement !",
        "questions": [
            {
                "id": "p1",
                "text": "Tu reçois un email de ''Support IT'' disant : ''Votre mot de passe expire dans 1h. Cliquez ici pour le garder''.\n\nL''adresse de l''expéditeur est : support@it-dept-security.net\n\nQue fais-tu ?",
                "options": [
                    "Je clique vite pour ne pas perdre mon accès",
                    "Je vérifie l''adresse et je supprime l''email",
                    "Je demande à un collègue s''il a reçu la même chose"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "Bravo ! L''adresse ''it-dept-security.net'' n''est pas le domaine officiel de notre entreprise. C''est un piège classique qui utilise l''urgence pour te faire paniquer.",
                "feedbackIncorrect": "Attention ! L''urgence (''1h'') est faite pour te faire paniquer et cliquer sans réfléchir. L''adresse de l''expéditeur ne correspond pas à notre entreprise. C''est un faux !",
                "keyTakeaway": "Si un message crée une urgence inhabituelle + une adresse bizarre = c''est probablement une attaque."
            },
            {
                "id": "p2",
                "text": "Un email te propose un bon d''achat Amazon de 500€ parce que tu es le ''1000ème visiteur''.\n\nOn te demande de cliquer pour le récupérer. Tu n''as participé à aucun concours.\n\nTa réaction ?",
                "options": [
                    "C''est ma chance ! Je clique",
                    "C''est trop beau pour être vrai, j''ignore",
                    "Je transfère à un ami pour voir si c''est vrai"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "Exactement ! Personne n''offre 500€ comme ça. C''est un appât pour voler tes données ou installer un virus.",
                "feedbackIncorrect": "C''est un piège classique. Les vrais concours sont annoncés officiellement, jamais par email surprise avec un gros montant.",
                "keyTakeaway": "Un cadeau inattendu et énorme = piège garanti."
            },
            {
                "id": "p3",
                "text": "L''email que tu as reçu comporte beaucoup de fautes d''orthographe et s''adresse à toi par ''Cher client'' au lieu de ton prénom.\n\nEst-ce suspect ?",
                "options": [
                    "Oui, c''est typique d''une arnaque",
                    "Non, tout le monde fait des fautes",
                    "Non, les grandes entreprises utilisent toujours ''Cher client''"
                ],
                "correctAnswer": 0,
                "feedbackCorrect": "Bravo ! Les entreprises sérieuses personnalisent leurs messages et soignent leur orthographe. Une langue approximative est souvent signe de fraude.",
                "feedbackIncorrect": "Les vraies entreprises ont des équipes de communication qui vérifient chaque message. Des fautes + texte générique = alerte rouge !",
                "keyTakeaway": "Langue approximative + message générique = fraudeur amateur."
            }
        ]
    }', 
    true
);

-- ============================================================================
-- THÈME 2 : MOTS DE PASSE (Niveau Débutant)
-- ============================================================================
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Mots de Passe', 
    'QUIZ', 
    'BEGINNER', 
    '{
        "courseIntro": "Hello ! Aujourd''hui, on parle de tes mots de passe. 🔐\n\nImagine que ton mot de passe est la clé de ton coffre-fort. Si la clé est trop simple (''1234''), n''importe qui peut l''ouvrir.\n\nUn pirate avec ton mot de passe peut :\n- Lire tous tes emails\n- Accéder aux fichiers clients\n- Se faire passer pour toi\n- Bloquer ton accès\n\nBref, c''est la catastrophe. Mais avec les bonnes pratiques, tu es blindé !",
        "questions": [
            {
                "id": "m1",
                "text": "Lequel de ces mots de passe te semble le plus solide ?",
                "options": [
                    "Marseille2024",
                    "Soleil!",
                    "Ch@teau_Bleu_78#Novembre",
                    "12345678"
                ],
                "correctAnswer": 2,
                "feedbackCorrect": "Exact ! Longueur (plus de 12 caractères) + Variété (majuscules, minuscules, chiffres, symboles) = Sécurité maximale. Un pirate mettrait des années à le craquer.",
                "feedbackIncorrect": "Le plus solide est le 3ème. ''Marseille2024'' est trop simple : c''est un mot du dictionnaire + une année courante. Un logiciel de piratage le trouve en quelques secondes.",
                "keyTakeaway": "Un bon mot de passe : 12+ caractères, mélange de tout (A-z, 0-9, @#!), pas de mots courants."
            },
            {
                "id": "m2",
                "text": "Est-ce une bonne idée d''utiliser le MÊME mot de passe pour ton email pro, Facebook et ta banque ?",
                "options": [
                    "Oui, c''est plus facile à retenir",
                    "Non, si un compte est piraté, tous les autres tombent",
                    "Oui, si le mot de passe est très très compliqué"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "Exactement ! L''unicité est la clé. Si Facebook se fait pirater et que ton mot de passe fuite, le pirate va l''essayer sur ton email pro, ta banque, etc. C''est l''effet domino.",
                "feedbackIncorrect": "C''est l''erreur la plus grave ! Même avec un mot de passe ultra-fort, si un seul site se fait pirater, le pirate essaiera ce mot de passe partout.",
                "keyTakeaway": "Un compte = Un mot de passe UNIQUE. Toujours."
            },
            {
                "id": "m3",
                "text": "Tu as 25 comptes différents (email, banque, réseaux sociaux, etc.). Comment retenir 25 mots de passe différents et complexes ?",
                "options": [
                    "Je les écris sur un post-it collé sur mon écran",
                    "J''utilise un gestionnaire de mots de passe (comme Bitwarden ou 1Password)",
                    "J''utilise le même avec une petite variation (ex: Facebook123, Gmail123)"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "Parfait ! Un gestionnaire de mots de passe est un coffre-fort numérique ultra-sécurisé. Tu n''as qu''UN SEUL mot de passe maître à retenir, et il génère tous les autres automatiquement.",
                "feedbackIncorrect": "Un post-it visible = danger total. Les petites variations (Facebook123) sont détectées par les logiciels pirates. La seule solution pro : un gestionnaire de mots de passe.",
                "keyTakeaway": "Gestionnaire de mots de passe = ton meilleur allié sécurité."
            }
        ]
    }', 
    true
);

-- ============================================================================
-- THÈME 3 : INGÉNIERIE SOCIALE (Niveau Débutant)
-- ============================================================================
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Ingénierie Sociale', 
    'QUIZ', 
    'BEGINNER', 
    '{
        "courseIntro": "Salut ! Aujourd''hui, on parle de l''Ingénierie Sociale. 🎭\n\nC''est l''art de manipuler les gens pour qu''ils fassent une erreur de sécurité.\n\nPlutôt que de pirater un ordinateur (difficile), les pirates piratent l''HUMAIN (plus facile).\n\nIls utilisent tes émotions :\n- La peur (''Ton compte est bloqué !'')\n- L''urgence (''Dans 1h c''est trop tard'')\n- La curiosité (''Regarde cette vidéo choquante'')\n- La gentillesse (''Peux-tu m''aider ?'')\n\nAvec les bons réflexes, tu peux les démasquer !",
        "questions": [
            {
                "id": "is1",
                "text": "Un livreur arrive à l''accueil de l''entreprise. Il dit qu''il doit accéder à la zone sécurisée mais qu''il a ''oublié son badge dans le camion''.\n\nIl a l''air pressé et sympa.\n\nQue fais-tu ?",
                "options": [
                    "Je lui ouvre par gentillesse, il a l''air honnête",
                    "Je lui dis d''attendre et j''appelle la sécurité pour validation",
                    "Je lui demande juste son nom et je le laisse entrer"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "C''est le bon réflexe ! La gentillesse et l''urgence sont souvent exploitées. AUCUNE exception : badge obligatoire, sinon validation par la sécurité.",
                "feedbackIncorrect": "Attention ! Même s''il a l''air sympa ou pressé, c''est peut-être un pirate qui veut accéder à nos locaux. La sécurité physique est la base : pas de badge = pas d''accès.",
                "keyTakeaway": "La sécurité physique = base de tout. Ne laisse JAMAIS ta gentillesse créer une faille."
            },
            {
                "id": "is2",
                "text": "Quelqu''un t''appelle en se présentant comme le ''Support IT''. Il dit qu''il y a une faille critique sur ton PC et il a besoin de ton mot de passe TOUT DE SUITE pour la corriger.\n\nIl a l''air stressé et connaît ton prénom.\n\nTa réaction ?",
                "options": [
                    "Je lui donne, c''est l''IT donc c''est bon",
                    "Je refuse et je raccroche. L''IT ne demande JAMAIS de mot de passe par téléphone",
                    "Je lui donne un faux mot de passe pour le tester"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "Bravo ! Règle d''or : l''IT ne demande JAMAIS ton mot de passe. Jamais par téléphone, jamais par email, jamais par Teams. C''est un piège classique d''ingénierie sociale.",
                "feedbackIncorrect": "C''est un piège ! Même si la personne connaît ton prénom (facile à trouver sur LinkedIn), l''IT ne demande JAMAIS de mot de passe. Si tu as un doute, raccroche et rappelle l''IT sur le numéro officiel.",
                "keyTakeaway": "L''IT ne demande JAMAIS ton mot de passe. Point final."
            },
            {
                "id": "is3",
                "text": "Tu trouves une clé USB sur le parking de l''entreprise. Elle a une étiquette ''SALAIRES 2024 CONFIDENTIEL''.\n\nTa curiosité te pique...\n\nQue fais-tu ?",
                "options": [
                    "Je la branche sur mon PC juste 2 minutes pour voir",
                    "Je la donne directement à la sécurité/IT SANS la brancher",
                    "Je la jette à la poubelle"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "Parfait ! C''est un piège classique appelé ''USB drop attack''. La clé contient probablement un virus qui s''installe automatiquement dès qu''on la branche. La sécurité/IT saura la tester en toute sécurité.",
                "feedbackIncorrect": "Grosse erreur ! Les pirates laissent volontairement des clés USB piégées avec des étiquettes alléchantes (''Salaires'', ''Confidentiel'') pour exploiter ta curiosité. Brancher cette clé pourrait infecter tout le réseau de l''entreprise.",
                "keyTakeaway": "Clé USB trouvée = Clé empoisonnée. Toujours la donner à l''IT sans la brancher."
            }
        ]
    }', 
    true
);

-- ============================================================================
-- THÈME 4 : LIENS SUSPECTS (Niveau Débutant)
-- ============================================================================
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Liens Suspects', 
    'QUIZ', 
    'BEGINNER', 
    '{
        "courseIntro": "Aujourd''hui, on décortique les liens douteux ! 🔗\n\nUn lien peut MENTIR. Le texte que tu vois (''Accéder à ma banque'') peut cacher une adresse piégée (''pirate.com'').\n\nLes pirates utilisent :\n- Des liens courts (bit.ly) pour cacher la vraie adresse\n- Des fautes d''orthographe (micr0soft avec un zéro)\n- Des domaines qui ressemblent (google-security.net)\n\nAvec ces astuces, tu repères les pièges en 2 secondes !",
        "questions": [
            {
                "id": "l1",
                "text": "Un email contient un bouton ''Accéder à mon espace bancaire''.\n\nQuand tu laisses ta souris DESSUS (sans cliquer), tu vois en bas à gauche : http://bit.ly/3kXy2z\n\nQue fais-tu ?",
                "options": [
                    "Je clique, le texte du bouton est clair",
                    "Je me méfie : l''adresse réelle est cachée derrière un lien court",
                    "Je clique car bit.ly est un service connu"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "Parfait ! Règle d''or : TOUJOURS survoler un lien avec la souris AVANT de cliquer pour voir la vraie destination. Les liens courts (bit.ly, tinyurl) cachent souvent des pièges.",
                "feedbackIncorrect": "Le texte d''un bouton peut mentir. Seule l''adresse réelle (que tu vois en survolant avec la souris) compte. Les liens courts sont pratiques... pour les pirates qui veulent cacher leur vraie adresse piégée.",
                "keyTakeaway": "Survole TOUJOURS un lien avec la souris pour voir sa vraie destination avant de cliquer."
            },
            {
                "id": "l2",
                "text": "Quelle adresse te semble la plus sûre pour accéder au site de ta banque ?",
                "options": [
                    "http://ma-banque-securise.com",
                    "https://www.mabanque.fr",
                    "https://mabanque-verif-identity.net"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "Oui ! Le vrai domaine de ta banque est simple et officiel (.fr). Il commence par HTTPS (le S = sécurisé). Méfie-toi des noms à rallonge qui essaient de te rassurer avec des mots comme ''securise'' ou ''verif''.",
                "feedbackIncorrect": "Les pirates créent des noms de domaine qui RESSEMBLENT à l''original en ajoutant des mots rassurants (''securise'', ''verif'', ''official''). Le vrai domaine est toujours court et simple.",
                "keyTakeaway": "Le vrai nom de domaine est court et simple. Le HTTPS (S = sécurisé) est obligatoire."
            },
            {
                "id": "l3",
                "text": "Tu reçois un lien : https://www.paypa1.com/verify\n\nC''est le vrai site de PayPal ?",
                "options": [
                    "Oui, ça ressemble",
                    "Non, il y a un ''1'' au lieu d''un ''l'' dans PayPal",
                    "Oui, il y a le HTTPS donc c''est sécurisé"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "Bravo, œil de lynx ! C''est ''paypa1'' (avec le chiffre 1) au lieu de ''paypal'' (avec la lettre L). C''est une technique appelée ''typosquatting'' : acheter un domaine avec une faute pour piéger les gens. Le HTTPS ne garantit PAS que le site est légitime, juste que la connexion est chiffrée.",
                "feedbackIncorrect": "Regarde bien : ''paypa1'' avec le CHIFFRE 1 au lieu de ''paypal'' avec la LETTRE L. Les pirates achètent des domaines avec des fautes subtiles pour te piéger. Le HTTPS ne prouve rien : même un site piégé peut avoir le HTTPS.",
                "keyTakeaway": "Vérifie l''orthographe EXACTE du domaine lettre par lettre. HTTPS ne garantit PAS la légitimité."
            }
        ]
    }', 
    true
);

-- ============================================================================
-- THÈME 5 : BRUTE FORCE & ATTAQUES AUTOMATISÉES (Niveau Intermédiaire)
-- ============================================================================
INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES (
    'Brute Force', 
    'QUIZ', 
    'INTERMEDIATE', 
    '{
        "courseIntro": "Aujourd''hui, on parle des attaques par Force Brute. 💥\n\nImagine un pirate qui essaye TOUS les mots de passe possibles sur ton compte.\n\nAvec un ordinateur puissant, il peut tester des MILLIONS de combinaisons par seconde :\n- ''123456'' → cracké en 0.001 seconde\n- ''Password123'' → cracké en 2 minutes\n- ''Ch@teau_Bleu_78#'' → cracké en... 127 ans !\n\nC''est pour ça que la longueur et la complexité comptent autant.",
        "questions": [
            {
                "id": "bf1",
                "text": "Un pirate essaie de forcer ton mot de passe. Il peut tester 10 milliards de combinaisons par seconde.\n\nCombien de temps pour craquer ''Soleil2024'' (12 caractères, mots du dictionnaire) ?",
                "options": [
                    "127 ans",
                    "Environ 3 minutes",
                    "Moins d''1 seconde"
                ],
                "correctAnswer": 2,
                "feedbackCorrect": "Exact ! Les mots du dictionnaire (''Soleil'') + une année courante (''2024'') sont dans les listes de mots les plus testés. Même avec 12 caractères, c''est cracké instantanément.",
                "feedbackIncorrect": "C''est cracké en moins d''1 seconde ! Les pirates ont des listes de milliards de mots courants + années + chiffres courants. ''Soleil2024'' est dedans. Il faut utiliser des mots ALÉATOIRES ou des phrases longues.",
                "keyTakeaway": "Mots du dictionnaire + infos publiques (année, ville) = cracké instantanément."
            },
            {
                "id": "bf2",
                "text": "Pour se protéger du brute force, beaucoup de sites bloquent ton compte après X tentatives ratées.\n\nC''est suffisant pour te protéger totalement ?",
                "options": [
                    "Oui, si le pirate ne peut pas essayer, il ne peut pas craquer",
                    "Non, il peut quand même obtenir ton mot de passe par phishing ou fuite de données",
                    "Oui, tant que le nombre de tentatives est limité à 3"
                ],
                "correctAnswer": 1,
                "feedbackCorrect": "Exactement ! Le blocage après X tentatives protège CONTRE le brute force direct. Mais le pirate peut utiliser d''autres méthodes : phishing (te faire donner ton mot de passe), fuite de données (obtenir ton mot de passe depuis un autre site piraté), keylogger (logiciel espion qui enregistre ce que tu tapes).",
                "feedbackIncorrect": "Le blocage aide, mais ne suffit pas. Les pirates utilisent d''autres techniques : phishing, fuites de données d''autres sites, logiciels espions. Un mot de passe fort + unique par compte + double authentification = vraie protection.",
                "keyTakeaway": "Limiter les tentatives aide, mais ne remplace pas un mot de passe fort et unique."
            }
        ]
    }', 
    true
);

SELECT 'Seed conversationnel appliqué avec succès !' as message;
SELECT COUNT(*) as total_exercises FROM exercises;

