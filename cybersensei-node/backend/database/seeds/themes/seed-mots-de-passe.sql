-- SEED THEME : MOTS DE PASSE & PROTECTION
DELETE FROM exercises WHERE topic = 'Mots de Passe & Protection';

INSERT INTO exercises (topic,type,difficulty,payload_json,active) VALUES
('Mots de Passe & Protection','QUIZ','BEGINNER','{
  "courseIntro":"Bases : longueur, variété, pas de mots du dictionnaire.",
  "questions":[{"id":"mp_b_01","text":"Quel est le plus solide ?","options":["Password123","Marseille2024","Tr@in_Bleu_78#","Soleil"],"correctAnswer":2,"feedbackCorrect":"Long et varié = solide.","feedbackIncorrect":"Ajoute longueur + symboles.","keyTakeaway":"12+ caractères, variété, pas de mots courants."}] }',true),
('Mots de Passe & Protection','QUIZ','BEGINNER','{
  "courseIntro":"Un compte = un mot de passe.",
  "questions":[{"id":"mp_b_02","text":"Même mot de passe pour email pro et perso ?","options":["Oui","Non","Oui si complexe"],"correctAnswer":1,"feedbackCorrect":"Sinon effet domino.","feedbackIncorrect":"Un seul mot de passe = risques partout.","keyTakeaway":"Jamais de réutilisation de mot de passe."}] }',true),
('Mots de Passe & Protection','QUIZ','BEGINNER','{
  "courseIntro":"Ne jamais partager.",
  "questions":[{"id":"mp_b_03","text":"Un collègue demande ton mot de passe.","options":["Je donne","Je refuse","Je donne puis je change"],"correctAnswer":1,"feedbackCorrect":"Ne partage jamais.","feedbackIncorrect":"Mot de passe = personnel.","keyTakeaway":"Un mot de passe ne se partage jamais."}] }',true),
('Mots de Passe & Protection','QUIZ','BEGINNER','{
  "courseIntro":"Gestionnaire de mots de passe.",
  "questions":[{"id":"mp_b_04","text":"Pourquoi utiliser un gestionnaire ?","options":["Pour tout mémoriser","Inutile","Pour partager facilement"],"correctAnswer":0,"feedbackCorrect":"Il stocke et crée des mots forts.","feedbackIncorrect":"Un gestionnaire augmente ta sécurité.","keyTakeaway":"Un gestionnaire aide à créer/stoquer des mots forts."}] }',true),
('Mots de Passe & Protection','QUIZ','INTERMEDIATE','{
  "courseIntro":"2FA protège même si le mot est volé.",
  "questions":[{"id":"mp_i_01","text":"Activer la 2FA ?","options":["Oui","Non","Plus tard"],"correctAnswer":0,"feedbackCorrect":"2FA bloque l''intrus sans le second facteur.","feedbackIncorrect":"2FA est une couche essentielle.","keyTakeaway":"Active la 2FA partout où possible."}] }',true),
('Mots de Passe & Protection','QUIZ','INTERMEDIATE','{
  "courseIntro":"Codes reçus sans demande.",
  "questions":[{"id":"mp_i_02","text":"Tu reçois un code de connexion non demandé.","options":["J''ignore","Je signale et je change le mot de passe","Je partage"],"correctAnswer":1,"feedbackCorrect":"Quelqu''un tente d''entrer, change le mot de passe.","feedbackIncorrect":"Alerte IT et change ton mot de passe.","keyTakeaway":"Code non sollicité = tentative d''intrusion."}] }',true),
('Mots de Passe & Protection','QUIZ','INTERMEDIATE','{
  "courseIntro":"Fuites de données.",
  "questions":[{"id":"mp_i_03","text":"Ton mot de passe apparaît dans une fuite.","options":["J''ignore","Je change partout où il est utilisé","J''attends"],"correctAnswer":1,"feedbackCorrect":"Change-le partout pour bloquer l''effet domino.","feedbackIncorrect":"Réagis immédiatement après une fuite.","keyTakeaway":"Mot dans une fuite = changement immédiat partout."}] }',true),
('Mots de Passe & Protection','QUIZ','ADVANCED','{
  "courseIntro":"Credential stuffing.",
  "questions":[{"id":"mp_a_01","text":"Pourquoi réutiliser est dangereux ?","options":["Pas trop","Credential stuffing","Aucun risque"],"correctAnswer":1,"feedbackCorrect":"Les pirates testent tes mots partout.","feedbackIncorrect":"Les attaquants automatisent les tests.","keyTakeaway":"Réutilisation = credential stuffing assuré."}] }',true),
('Mots de Passe & Protection','QUIZ','ADVANCED','{
  "courseIntro":"Attaques par dictionnaire/brute force.",
  "questions":[{"id":"mp_a_02","text":"Mot de passe court et commun ?","options":["OK","Craqué vite","Sûr"],"correctAnswer":1,"feedbackCorrect":"Court/commun se craque en secondes.","feedbackIncorrect":"Longueur protège de la brute force.","keyTakeaway":"Longueur + variété rendent la brute force difficile."}] }',true),
('Mots de Passe & Protection','QUIZ','ADVANCED','{
  "courseIntro":"Post-it et captures d''écran.",
  "questions":[{"id":"mp_a_03","text":"Photo d''écran avec mots de passe dans la galerie.","options":["OK","Très risqué","Sans importance"],"correctAnswer":1,"feedbackCorrect":"Photos peuvent être volées/piratées.","feedbackIncorrect":"Ne stocke pas de mots de passe en clair.","keyTakeaway":"Jamais de mots de passe en clair (photos, notes, post-it)."}] }',true);

