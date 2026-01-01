-- SEED THEME : RANSOMWARE
DELETE FROM exercises WHERE topic = 'Ransomware';

INSERT INTO exercises (topic,type,difficulty,payload_json,active) VALUES
('Ransomware','QUIZ','BEGINNER','{
  "courseIntro":"Ransomware = fichiers chiffrés + rançon.",
  "questions":[{"id":"rw_b_01","text":"Message « vos fichiers sont chiffrés, payez ».","options":["Je paie","Je débranche réseau et j''alerte IT","Je redémarre"],"correctAnswer":1,"feedbackCorrect":"Coupe le réseau et alerte IT, ne paie jamais.","feedbackIncorrect":"Payer n''assure rien, coupe le réseau.","keyTakeaway":"Ransomware = débrancher + alerter, pas payer."}] }',true),
('Ransomware','QUIZ','BEGINNER','{
  "courseIntro":"Origine = emails/pièces jointes.",
  "questions":[{"id":"rw_b_02","text":"PJ .zip inconnue reçue.","options":["J''ouvre","Je supprime","Je clique"],"correctAnswer":1,"feedbackCorrect":"Ne pas ouvrir, source fréquente de ransomware.","feedbackIncorrect":"Une PJ peut lancer un ransomware.","keyTakeaway":"Ne pas ouvrir PJ suspecte."}] }',true),
('Ransomware','QUIZ','BEGINNER','{
  "courseIntro":"Sauvegardes sauvent la situation.",
  "questions":[{"id":"rw_b_03","text":"Pas de sauvegarde récente.","options":["OK","Risque majeur","Sans effet"],"correctAnswer":1,"feedbackCorrect":"Sans backup, récupération difficile.","feedbackIncorrect":"Sauvegardes régulières indispensables.","keyTakeaway":"Sauvegardes régulières = meilleure défense."}] }',true),
('Ransomware','QUIZ','INTERMEDIATE','{
  "courseIntro":"Macros/pièces jointes.",
  "questions":[{"id":"rw_i_01","text":"Word demande activer macros.","options":["J''active","Je refuse","Je partage"],"correctAnswer":1,"feedbackCorrect":"Macro peut installer ransomware.","feedbackIncorrect":"N''active pas les macros.","keyTakeaway":"Pas de macros sur fichiers reçus."}] }',true),
('Ransomware','QUIZ','INTERMEDIATE','{
  "courseIntro":"Sites compromis.",
  "questions":[{"id":"rw_i_02","text":"Téléchargement logiciel depuis site non officiel.","options":["OK","Risque","Sans effet"],"correctAnswer":1,"feedbackCorrect":"Site non officiel peut livrer du malware.","feedbackIncorrect":"Télécharge depuis sources fiables.","keyTakeaway":"Télécharge uniquement sur sites officiels."}] }',true),
('Ransomware','QUIZ','INTERMEDIATE','{
  "courseIntro":"Comportement à tenir.",
  "questions":[{"id":"rw_i_03","text":"PC ralenti + fichiers chiffrés.","options":["Je paie","Je coupe réseau et alerte","J''ignore"],"correctAnswer":1,"feedbackCorrect":"Couper réseau limite la propagation.","feedbackIncorrect":"Alerte IT immédiatement.","keyTakeaway":"Isoler la machine dès suspicion."}] }',true),
('Ransomware','QUIZ','ADVANCED','{
  "courseIntro":"Propagation réseau.",
  "questions":[{"id":"rw_a_01","text":"Partage réseau ouvert à tous.","options":["OK","Risque de propagation","Sans effet"],"correctAnswer":1,"feedbackCorrect":"Ransomware se propage via partages ouverts.","feedbackIncorrect":"Segmenter et limiter les droits.","keyTakeaway":"Moins de droits = moins de propagation."}] }',true),
('Ransomware','QUIZ','ADVANCED','{
  "courseIntro":"Backups isolés.",
  "questions":[{"id":"rw_a_02","text":"Backups stockés sur même réseau.","options":["OK","Risque, ils peuvent être chiffrés","Sans effet"],"correctAnswer":1,"feedbackCorrect":"Backups doivent être isolés/offline.","feedbackIncorrect":"Backups en ligne peuvent être chiffrés aussi.","keyTakeaway":"Isoler/chiffrer les backups critiques."}] }',true),
('Ransomware','QUIZ','ADVANCED','{
  "courseIntro":"Plan de réponse.",
  "questions":[{"id":"rw_a_03","text":"Pas de procédure d''urgence documentée.","options":["OK","À créer d''urgence","Inutile"],"correctAnswer":1,"feedbackCorrect":"Plan clair = réaction rapide.","feedbackIncorrect":"Sans plan, réaction lente et coûteuse.","keyTakeaway":"Avoir un plan de réponse ransomware prêt."}] }',true),
('Ransomware','QUIZ','ADVANCED','{
  "courseIntro":"Rançon et assurance.",
  "questions":[{"id":"rw_a_04","text":"Payer la rançon ?","options":["Toujours","Jamais recommandé","Parfois"],"correctAnswer":1,"feedbackCorrect":"Payer encourage et n''assure rien.","feedbackIncorrect":"Ne pas payer, restaurer et alerter.","keyTakeaway":"Restaure depuis backup, ne paie pas."}] }',true);

