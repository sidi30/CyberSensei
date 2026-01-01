-- SEED THEME : PHISHING EMAILS
DELETE FROM exercises WHERE topic = 'Phishing Emails';

INSERT INTO exercises (topic, type, difficulty, payload_json, active) VALUES
('Phishing Emails','QUIZ','BEGINNER','{
  "courseIntro":"On repère les hameçonnages classiques : fautes, urgences, cadeaux.",
  "questions":[{"id":"ph_b_01","text":"Email « URGENT » de Microsoft avec adresse bizarre.","options":["Je clique","Je vérifie et je supprime","Je réponds"],"correctAnswer":1,"feedbackCorrect":"Bien vu, l''urgence + l''adresse louche = piège.","feedbackIncorrect":"Regarde l''adresse : si elle est bizarre, ne clique pas.","keyTakeaway":"Urgence + adresse douteuse = poubelle."}] }',true),
('Phishing Emails','QUIZ','BEGINNER','{
  "courseIntro":"Attention aux cadeaux trop beaux.",
  "questions":[{"id":"ph_b_02","text":"Gain Amazon 500€ sans concours.","options":["Je prends","Trop beau, j''ignore","Je transfère"],"correctAnswer":1,"feedbackCorrect":"Exact, cadeau inattendu = appât.","feedbackIncorrect":"Cadeau surprise = hameçon.","keyTakeaway":"Un cadeau inattendu cache souvent un piège."}] }',true),
('Phishing Emails','QUIZ','BEGINNER','{
  "courseIntro":"Les fausses demandes du patron.",
  "questions":[{"id":"ph_b_03","text":"« Achète des cartes cadeaux » signé ton boss.","options":["J''achète","Je vérifie par téléphone","Je réponds à l''email"],"correctAnswer":1,"feedbackCorrect":"Toujours vérifier par un autre canal.","feedbackIncorrect":"Ne valide jamais une demande d''argent par email.","keyTakeaway":"Valide par téléphone toute demande d''achat urgente."}] }',true),
('Phishing Emails','QUIZ','BEGINNER','{
  "courseIntro":"Les pièces jointes inattendues.",
  "questions":[{"id":"ph_b_04","text":"PDF reçu d''un inconnu.","options":["J''ouvre","Je supprime et je signale","Je transfère"],"correctAnswer":1,"feedbackCorrect":"Signaler protège tout le monde.","feedbackIncorrect":"N''ouvre pas une PJ suspecte.","keyTakeaway":"Email suspect = signaler, ne pas ouvrir."}] }',true),
('Phishing Emails','QUIZ','BEGINNER','{
  "courseIntro":"Les fautes d''orthographe sont un indice.",
  "questions":[{"id":"ph_b_05","text":"Email bancaire plein de fautes.","options":["Normal","Suspicious, je supprime","Je demande plus d''infos"],"correctAnswer":1,"feedbackCorrect":"Fautes + urgence = piège.","feedbackIncorrect":"Un vrai service client soigne son français.","keyTakeaway":"Fautes et ton agressif = méfiance."}] }',true),
('Phishing Emails','QUIZ','INTERMEDIATE','{
  "courseIntro":"Emails plus soignés, logos copiés.",
  "questions":[{"id":"ph_i_01","text":"Email PayPal soigné, lien affiche paypal-secure-login.com.","options":["Je clique","Je tape paypal.com moi-même","Je réponds"],"correctAnswer":1,"feedbackCorrect":"Va toujours sur le site en tapant l''URL toi-même.","feedbackIncorrect":"Le lien peut être faux malgré le logo.","keyTakeaway":"Tape l''URL officielle dans ton navigateur."}] }',true),
('Phishing Emails','QUIZ','INTERMEDIATE','{
  "courseIntro":"Liens masqués derrière des boutons.",
  "questions":[{"id":"ph_i_02","text":"Bouton « suivre mon colis » pointe vers dhl-track-24.com.","options":["Je clique","Je me méfie, pas le bon domaine","Je télécharge une PJ"],"correctAnswer":1,"feedbackCorrect":"Le domaine officiel doit être dhl.com ou dhl.fr.","feedbackIncorrect":"Le bouton peut mentir, vérifie le domaine.","keyTakeaway":"Lis le domaine exact avant de cliquer."}] }',true),
('Phishing Emails','QUIZ','INTERMEDIATE','{
  "courseIntro":"Demandes d''infos personnelles.",
  "questions":[{"id":"ph_i_03","text":"Email RH demande N° sécu via formulaire externe.","options":["Je remplis","Je vérifie avec RH","Je réponds"],"correctAnswer":1,"feedbackCorrect":"Vérifie toujours par un canal officiel.","feedbackIncorrect":"Les données perso ne se demandent pas par email inconnu.","keyTakeaway":"Données perso = vérification hors email."}] }',true),
('Phishing Emails','QUIZ','ADVANCED','{
  "courseIntro":"Spear phishing : emails hyper crédibles.",
  "questions":[{"id":"ph_a_01","text":"DRH connue demande mise à jour urgente sur portail lien interne.","options":["Je clique","Je vérifie par Teams/tel","Je réponds"],"correctAnswer":1,"feedbackCorrect":"Même interne, valide par un autre canal.","feedbackIncorrect":"Un compte interne peut être usurpé.","keyTakeaway":"Toujours valider une demande sensible par un canal différent."}] }',true),
('Phishing Emails','QUIZ','ADVANCED','{
  "courseIntro":"Domaines homographes.",
  "questions":[{"id":"ph_a_02","text":"Email LinkedIn avec domaine linkеdin.com (lettre cyrillique).","options":["Je clique","Je vérifie, domaine piégé","Je réponds"],"correctAnswer":1,"feedbackCorrect":"Les homographes piègent l''œil, prudence.","feedbackIncorrect":"Le domaine n''est pas le vrai linkedin.com.","keyTakeaway":"Regarde chaque lettre du domaine, attention aux caractères spéciaux."}] }',true);

