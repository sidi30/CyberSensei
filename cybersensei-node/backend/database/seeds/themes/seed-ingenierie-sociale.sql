-- SEED THEME : INGENIERIE SOCIALE
DELETE FROM exercises WHERE topic = 'Ingénierie Sociale';

INSERT INTO exercises (topic,type,difficulty,payload_json,active) VALUES
('Ingénierie Sociale','QUIZ','BEGINNER','{
  "courseIntro":"Les attaquants jouent sur les émotions (peur, urgence).",
  "questions":[{"id":"is_b_01","text":"Livreur sans badge veut entrer en zone sécurisée.","options":["Je laisse entrer","J''appelle la sécurité","Je note son nom"],"correctAnswer":1,"feedbackCorrect":"Urgence + pas de badge = non.","feedbackIncorrect":"Pas de badge = pas d''entrée.","keyTakeaway":"Sans badge, on n''entre pas."}] }',true),
('Ingénierie Sociale','QUIZ','BEGINNER','{
  "courseIntro":"Autorité factice.",
  "questions":[{"id":"is_b_02","text":"Appel « nouveau IT » demande ton mot de passe.","options":["Je donne","Je refuse","Je partage plus tard"],"correctAnswer":1,"feedbackCorrect":"IT ne demande jamais ton mot de passe.","feedbackIncorrect":"Mot de passe ne se donne jamais.","keyTakeaway":"Mot de passe = jamais communiqué."}] }',true),
('Ingénierie Sociale','QUIZ','BEGINNER','{
  "courseIntro":"Curiosité.",
  "questions":[{"id":"is_b_03","text":"Email « liste des salaires » en PJ.","options":["J''ouvre","Je supprime","Je transfère"],"correctAnswer":1,"feedbackCorrect":"Curiosité exploitée pour piéger.","feedbackIncorrect":"Ne cède pas à la curiosité.","keyTakeaway":"Curiosité est un levier d''attaque."}] }',true),
('Ingénierie Sociale','QUIZ','INTERMEDIATE','{
  "courseIntro":"Prétextes crédibles.",
  "questions":[{"id":"is_i_01","text":"Appel d''un « auditeur » demande accès réseau.","options":["J''accorde","Je redirige vers IT","Je réponds plus tard"],"correctAnswer":1,"feedbackCorrect":"Passe toujours par IT pour accès.","feedbackIncorrect":"Valide via IT avant tout accès.","keyTakeaway":"Accès réseau = validation IT obligatoire."}] }',true),
('Ingénierie Sociale','QUIZ','INTERMEDIATE','{
  "courseIntro":"Appât financier.",
  "questions":[{"id":"is_i_02","text":"Email promet prime si tu cliques avant 1h.","options":["Je clique","Trop beau, je vérifie","Je transfère"],"correctAnswer":1,"feedbackCorrect":"Appât urgent = phishing.","feedbackIncorrect":"Prime surprise = vérification officielle.","keyTakeaway":"Offre trop belle + urgence = piège."}] }',true),
('Ingénierie Sociale','QUIZ','INTERMEDIATE','{
  "courseIntro":"Confiance et humour.",
  "questions":[{"id":"is_i_03","text":"Un faux collègue plaisante et demande un code OTP.","options":["Je donne","Je refuse","Je partage plus tard"],"correctAnswer":1,"feedbackCorrect":"Même en plaisantant, un OTP ne se partage pas.","feedbackIncorrect":"OTP est secret, toujours.","keyTakeaway":"OTP jamais partagé, même en blague."}] }',true),
('Ingénierie Sociale','QUIZ','ADVANCED','{
  "courseIntro":"Vishing/voix.",
  "questions":[{"id":"is_a_01","text":"Voix « banquier » demande validation via code SMS.","options":["Je donne","Je refuse","Je réponds"],"correctAnswer":1,"feedbackCorrect":"Code SMS = perso, ne le donne pas.","feedbackIncorrect":"Ne donne jamais un code par téléphone.","keyTakeaway":"Code SMS = strictement personnel."}] }',true),
('Ingénierie Sociale','QUIZ','ADVANCED','{
  "courseIntro":"Deepfake/visio.",
  "questions":[{"id":"is_a_02","text":"Visio avec visage mal synchronisé demande accès.","options":["Je donne","Je vérifie identité","Je clique"],"correctAnswer":1,"feedbackCorrect":"Un deepfake peut usurper quelqu''un.","feedbackIncorrect":"Valide l''identité via canal sûr.","keyTakeaway":"Si doute visio, valide par téléphone/2FA humain."}] }',true),
('Ingénierie Sociale','QUIZ','ADVANCED','{
  "courseIntro":"Scénarios multi-étapes.",
  "questions":[{"id":"is_a_03","text":"Email + appel + SMS pour presser une action.","options":["Je cède","Je stoppe et je valide avec un responsable","Je réponds vite"],"correctAnswer":1,"feedbackCorrect":"Multiplication des canaux pour te presser.","feedbackIncorrect":"Stoppe et valide avec un responsable.","keyTakeaway":"Pression multi-canaux = alerte rouge."}] }',true),
('Ingénierie Sociale','QUIZ','ADVANCED','{
  "courseIntro":"Collecte d''infos.",
  "questions":[{"id":"is_a_04","text":"Quelqu''un te pose des questions légères sur projets/clients.","options":["Je réponds","Je reste vague","Je détaille tout"],"correctAnswer":1,"feedbackCorrect":"Partager trop donne des munitions à l''attaquant.","feedbackIncorrect":"Limite les infos partagées aux inconnus.","keyTakeaway":"Partage minimal avec inconnus, même informel."}] }',true);

