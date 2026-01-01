-- SEED THEME : USURPATION D'IDENTITE / COMPTES COMPROMIS
DELETE FROM exercises WHERE topic = 'Usurpation d\'Identité';

INSERT INTO exercises (topic,type,difficulty,payload_json,active) VALUES
('Usurpation d\'Identité','QUIZ','BEGINNER','{
  "courseIntro":"Détecter un compte compromis.",
  "questions":[{"id":"ui_b_01","text":"Collègue en vacances envoie un lien suspect.","options":["Je clique","Je l''appelle","Je réponds"],"correctAnswer":1,"feedbackCorrect":"Compte peut être piraté, appelle-le.","feedbackIncorrect":"Valide hors mail.","keyTakeaway":"Message bizarre d''un absent = appel direct."}] }',true),
('Usurpation d\'Identité','QUIZ','BEGINNER','{
  "courseIntro":"Style inhabituel.",
  "questions":[{"id":"ui_b_02","text":"Ton boss écrit avec des emojis inhabituels et demande un doc.","options":["Normal","Je vérifie avec lui","Je réponds"],"correctAnswer":1,"feedbackCorrect":"Style inhabituel = suspicion.","feedbackIncorrect":"Valide via canal direct.","keyTakeaway":"Incohérence de style = alerte."}] }',true),
('Usurpation d\'Identité','QUIZ','BEGINNER','{
  "courseIntro":"Demande d''identifiants.",
  "questions":[{"id":"ui_b_03","text":"Un collègue demande ton mot de passe Teams.","options":["Je donne","Je refuse","Je change"],"correctAnswer":1,"feedbackCorrect":"Mot de passe ne se partage jamais.","feedbackIncorrect":"Même collègue, jamais de mot de passe.","keyTakeaway":"Personne ne doit connaître ton mot de passe."}] }',true),
('Usurpation d\'Identité','QUIZ','INTERMEDIATE','{
  "courseIntro":"Emails internes usurpés.",
  "questions":[{"id":"ui_i_01","text":"Email interne avec domaine légerement différent.","options":["Normal","Domaine altéré, je me méfie","Je clique"],"correctAnswer":1,"feedbackCorrect":"Domaine modifié = usurpation possible.","feedbackIncorrect":"Vérifie le domaine exact.","keyTakeaway":"Domaine interne doit être exact, sinon alerte."}] }',true),
('Usurpation d\'Identité','QUIZ','INTERMEDIATE','{
  "courseIntro":"Signatures copiées.",
  "questions":[{"id":"ui_i_02","text":"Signature correcte mais ton prénom mal orthographié.","options":["Normal","Suspect","Je réponds"],"correctAnswer":1,"feedbackCorrect":"Petit détail peut trahir l''usurpation.","feedbackIncorrect":"Les faux mails copient mal certains détails.","keyTakeaway":"Détails incohérents = suspicion."}] }',true),
('Usurpation d\'Identité','QUIZ','INTERMEDIATE','{
  "courseIntro":"Délégation d''urgence.",
  "questions":[{"id":"ui_i_03","text":"On te dit « j''ai perdu l''accès, fais-le pour moi »","options":["J''accepte","Je valide via manager/IT","Je réponds"],"correctAnswer":1,"feedbackCorrect":"Valide l''identité via manager/IT.","feedbackIncorrect":"Ne fais pas d''action sensible sans validation.","keyTakeaway":"Valide toute action sensible avec une source fiable."}] }',true),
('Usurpation d\'Identité','QUIZ','ADVANCED','{
  "courseIntro":"Attackers utilisent données publiques.",
  "questions":[{"id":"ui_a_01","text":"Email mentionne un projet LinkedIn et demande accès.","options":["Je donne","Je vérifie via canal direct","Je réponds"],"correctAnswer":1,"feedbackCorrect":"Même info vraie peut être utilisée pour piéger.","feedbackIncorrect":"Valide via appel/Teams.","keyTakeaway":"Infos publiques peuvent être recyclées pour usurper."}] }',true),
('Usurpation d\'Identité','QUIZ','ADVANCED','{
  "courseIntro":"Chaîne multi-contacts.",
  "questions":[{"id":"ui_a_02","text":"Deux « collègues » différents te pressent pour un accès.","options":["Je donne","Je bloque et j''alerte","Je réponds"],"correctAnswer":1,"feedbackCorrect":"Pression coordonnée = alerte sécurité.","feedbackIncorrect":"Stoppe et alerte la sécurité.","keyTakeaway":"Pression coordonnée = signaler immédiatement."}] }',true),
('Usurpation d\'Identité','QUIZ','ADVANCED','{
  "courseIntro":"Faux support MFA.",
  "questions":[{"id":"ui_a_03","text":"Support demande ton code MFA par email.","options":["Je donne","Je refuse","Je partage plus tard"],"correctAnswer":1,"feedbackCorrect":"Code MFA ne se partage jamais.","feedbackIncorrect":"Ne donne pas de code MFA.","keyTakeaway":"MFA/OTP = jamais partagé."}] }',true),
('Usurpation d\'Identité','QUIZ','ADVANCED','{
  "courseIntro":"Compte Teams compromis.",
  "questions":[{"id":"ui_a_04","text":"Un collègue envoie massivement des liens, nie les avoir envoyés.","options":["Bug","Compte compromis, j''alerte IT","Je clique"],"correctAnswer":1,"feedbackCorrect":"Signale rapidement pour bloquer la propagation.","feedbackIncorrect":"Un compte compromis doit être bloqué.","keyTakeaway":"Signale immédiatement un compte suspect."}] }',true);

