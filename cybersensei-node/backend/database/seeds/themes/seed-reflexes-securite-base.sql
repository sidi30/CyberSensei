-- SEED THEME : REFLEXES DE SECURITE DE BASE
DELETE FROM exercises WHERE topic = 'Réflexes de Sécurité de Base';

INSERT INTO exercises (topic,type,difficulty,payload_json,active) VALUES
('Réflexes de Sécurité de Base','QUIZ','BEGINNER','{
  "courseIntro":"Gestes quotidiens simples.",
  "questions":[{"id":"rb_b_01","text":"Tu quittes ton poste 5 min.","options":["Je laisse ouvert","Je verrouille (Win+L)","Je ferme l''écran"],"correctAnswer":1,"feedbackCorrect":"Verrouiller protège tes données.","feedbackIncorrect":"Toujours verrouiller, même 5 min.","keyTakeaway":"Verrouille ton poste dès que tu pars."}] }',true),
('Réflexes de Sécurité de Base','QUIZ','BEGINNER','{
  "courseIntro":"Pièces jointes.",
  "questions":[{"id":"rb_b_02","text":"PJ suspecte d''inconnu.","options":["J''ouvre","Je signale IT","Je transfère"],"correctAnswer":1,"feedbackCorrect":"Signaler protège tous les collègues.","feedbackIncorrect":"Ne jamais ouvrir une PJ suspecte.","keyTakeaway":"Signale et supprime les PJ douteuses."}] }',true),
('Réflexes de Sécurité de Base','QUIZ','BEGINNER','{
  "courseIntro":"Clés USB inconnues.",
  "questions":[{"id":"rb_b_03","text":"Clé USB trouvée en salle.","options":["Je branche","Je donne à l''IT","Je garde"],"correctAnswer":1,"feedbackCorrect":"Clé inconnue peut contenir un virus.","feedbackIncorrect":"Ne branche jamais une clé inconnue.","keyTakeaway":"Clé inconnue -> IT, jamais brancher."}] }',true),
('Réflexes de Sécurité de Base','QUIZ','BEGINNER','{
  "courseIntro":"Verrouillage mobile.",
  "questions":[{"id":"rb_b_04","text":"Smartphone pro sans code.","options":["OK","A sécuriser (code/biométrie)","Inutile"],"correctAnswer":1,"feedbackCorrect":"Code/biométrie protègent les données pro.","feedbackIncorrect":"Protège l''appareil pro aussi.","keyTakeaway":"Protège ton mobile pro par code/biométrie."}] }',true),
('Réflexes de Sécurité de Base','QUIZ','INTERMEDIATE','{
  "courseIntro":"Wi-Fi public.",
  "questions":[{"id":"rb_i_01","text":"Travail sur Wi-Fi café.","options":["OK","Risque, préfère 4G/VPN","Sans importance"],"correctAnswer":1,"feedbackCorrect":"Wi-Fi public peut intercepter tes données.","feedbackIncorrect":"Utilise 4G/VPN en mobilité.","keyTakeaway":"Évite le Wi-Fi public pour le travail."}] }',true),
('Réflexes de Sécurité de Base','QUIZ','INTERMEDIATE','{
  "courseIntro":"Mises à jour.",
  "questions":[{"id":"rb_i_02","text":"Ignorer les updates système.","options":["OK","Mauvaise idée","Sans effet"],"correctAnswer":1,"feedbackCorrect":"Updates corrigent des failles.","feedbackIncorrect":"Applique les mises à jour.","keyTakeaway":"Met à jour OS et apps régulièrement."}] }',true),
('Réflexes de Sécurité de Base','QUIZ','INTERMEDIATE','{
  "courseIntro":"Badges et visiteurs.",
  "questions":[{"id":"rb_i_03","text":"Tu laisses entrer quelqu''un sans badge.","options":["Gentillesse","Vérifier badge/accueil","Sans importance"],"correctAnswer":1,"feedbackCorrect":"Contrôle d''accès protège les locaux.","feedbackIncorrect":"Ne fais pas sauter le contrôle d''accès.","keyTakeaway":"Aucun badge = pas d''accès sans validation."}] }',true),
('Réflexes de Sécurité de Base','QUIZ','ADVANCED','{
  "courseIntro":"Partage d''écran.",
  "questions":[{"id":"rb_a_01","text":"Partage d''écran avec emails ouverts.","options":["OK","Fermer données sensibles","Pas grave"],"correctAnswer":1,"feedbackCorrect":"Cache les données sensibles avant de partager.","feedbackIncorrect":"Prépare ton écran avant partage.","keyTakeaway":"Masque données sensibles avant partage écran."}] }',true),
('Réflexes de Sécurité de Base','QUIZ','ADVANCED','{
  "courseIntro":"Impressions oubliées.",
  "questions":[{"id":"rb_a_02","text":"Doc confidentiel laissé à l''imprimante.","options":["OK","Je récupère immédiatement","Je laisse"],"correctAnswer":1,"feedbackCorrect":"Ne laisse rien traîner de sensible.","feedbackIncorrect":"Récupère tout de suite les docs.","keyTakeaway":"Ne laisse pas de documents sensibles à l''imprimante."}] }',true),
('Réflexes de Sécurité de Base','QUIZ','ADVANCED','{
  "courseIntro":"Envoi par email.",
  "questions":[{"id":"rb_a_03","text":"Envoi de doc sensible sans chiffrement.","options":["OK","À éviter, utiliser canal sécurisé","Sans effet"],"correctAnswer":1,"feedbackCorrect":"Utilise partage sécurisé/chiffrement.","feedbackIncorrect":"Email clair = fuite potentielle.","keyTakeaway":"Données sensibles via canal sécurisé/chiffré."}] }',true);

