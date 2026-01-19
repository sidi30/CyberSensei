-- SEED THEME : TELETRAVAIL & MOBILITE
DELETE FROM exercises WHERE topic = 'Télétravail & Mobilité';

INSERT INTO exercises (topic,type,difficulty,payload_json,active) VALUES
('Télétravail & Mobilité','QUIZ','BEGINNER','{
  "courseIntro":"Sécurité en mobilité (café, train).",
  "questions":[{"id":"tm_b_01","text":"Travail sur Wi-Fi public de café.","options":["OK","Risque, préfère 4G/VPN","Sans importance"],"correctAnswer":1,"feedbackCorrect":"Wi-Fi public peut intercepter tes données.","feedbackIncorrect":"Utilise 4G ou VPN.","keyTakeaway":"Évite Wi-Fi public pour travailler."}] }',true),
('Télétravail & Mobilité','QUIZ','BEGINNER','{
  "courseIntro":"Regard indiscret.",
  "questions":[{"id":"tm_b_02","text":"Personne voit ton écran dans le train.","options":["Pas grave","Je mets un filtre/je change de place","Je continue"],"correctAnswer":1,"feedbackCorrect":"Protège ton écran des regards.","feedbackIncorrect":"Attention aux regards indiscrets.","keyTakeaway":"Utilise un filtre de confidentialité en public."}] }',true),
('Télétravail & Mobilité','QUIZ','BEGINNER','{
  "courseIntro":"Documents papier.",
  "questions":[{"id":"tm_b_03","text":"Impression de docs clients à la maison sans rangement.","options":["OK","A ranger/enfermer","Sans effet"],"correctAnswer":1,"feedbackCorrect":"Protège les documents physiques aussi.","feedbackIncorrect":"Les papiers peuvent fuiter chez toi.","keyTakeaway":"Sécurise aussi le papier en télétravail."}] }',true),
('Télétravail & Mobilité','QUIZ','INTERMEDIATE','{
  "courseIntro":"Partage de connexion.",
  "questions":[{"id":"tm_i_01","text":"Partage ton Wi-Fi domestique non mis à jour.","options":["OK","Mettre un mot de passe fort + MAJ box","Inutile"],"correctAnswer":1,"feedbackCorrect":"Sécurise ta box (MDP fort + MAJ).","feedbackIncorrect":"Box faible = porte d''entrée.","keyTakeaway":"Mot de passe box fort + mises à jour."}] }',true),
('Télétravail & Mobilité','QUIZ','INTERMEDIATE','{
  "courseIntro":"Sauvegarde locale.",
  "questions":[{"id":"tm_i_02","text":"Tu stockes des docs pro sur ton PC perso.","options":["OK","Préférer stockage pro (OneDrive/SharePoint)","Sans importance"],"correctAnswer":1,"feedbackCorrect":"Utilise les espaces pro sécurisés.","feedbackIncorrect":"Évite stockage pro sur perso.","keyTakeaway":"Stocke les données pro dans les espaces approuvés."}] }',true),
('Télétravail & Mobilité','QUIZ','INTERMEDIATE','{
  "courseIntro":"Accès distant.",
  "questions":[{"id":"tm_i_03","text":"Connexion RDP ouverte sans VPN.","options":["OK","Risque élevé","Normal"],"correctAnswer":1,"feedbackCorrect":"RDP ouvert est attaqué facilement.","feedbackIncorrect":"Protège par VPN et règles d''accès.","keyTakeaway":"Pas d''accès exposé sans VPN/contrôles."}] }',true),
('Télétravail & Mobilité','QUIZ','ADVANCED','{
  "courseIntro":"Appareils personnels.",
  "questions":[{"id":"tm_a_01","text":"Utilisation d''un PC familial partagé.","options":["OK","Risque, prévoir profil dédié/PC pro","Sans importance"],"correctAnswer":1,"feedbackCorrect":"PC partagé = risque de fuite/virus.","feedbackIncorrect":"Prévois un environnement isolé.","keyTakeaway":"Évite les PC partagés pour le travail pro."}] }',true),
('Télétravail & Mobilité','QUIZ','ADVANCED','{
  "courseIntro":"Sauvegardes locales.",
  "questions":[{"id":"tm_a_02","text":"Backup de fichiers pro sur disque USB non chiffré.","options":["OK","Risque, chiffrer ou stockage pro","Sans effet"],"correctAnswer":1,"feedbackCorrect":"Un disque perdu expose les données.","feedbackIncorrect":"Chiffre ou utilise un stockage approuvé.","keyTakeaway":"Sauvegardes chiffrées ou espaces pro uniquement."}] }',true),
('Télétravail & Mobilité','QUIZ','ADVANCED','{
  "courseIntro":"Imprimante domestique.",
  "questions":[{"id":"tm_a_03","text":"Imprimante Wi-Fi non sécurisée, ouverte sur le réseau.","options":["OK","À sécuriser ou éviter","Pas grave"],"correctAnswer":1,"feedbackCorrect":"Imprimante exposée peut être une porte d''entrée.","feedbackIncorrect":"Sécurise ou isole l''imprimante.","keyTakeaway":"Sécurise les périphériques réseau à domicile."}] }',true),
('Télétravail & Mobilité','QUIZ','ADVANCED','{
  "courseIntro":"Confidentialité orale.",
  "questions":[{"id":"tm_a_04","text":"Call client sensible dans un lieu public.","options":["OK","Chercher un endroit discret","Pas grave"],"correctAnswer":1,"feedbackCorrect":"Protège les conversations confidentielles.","feedbackIncorrect":"Évite les lieux publics pour les discussions sensibles.","keyTakeaway":"Conversations sensibles = lieu discret et casque."}] }',true);



