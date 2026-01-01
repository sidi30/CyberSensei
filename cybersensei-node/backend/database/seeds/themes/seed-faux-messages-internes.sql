-- SEED THEME : FAUX MESSAGES INTERNES (Teams / IT / RH)
DELETE FROM exercises WHERE topic = 'Faux Messages Internes';

INSERT INTO exercises (topic,type,difficulty,payload_json,active) VALUES
('Faux Messages Internes','QUIZ','BEGINNER','{
  "courseIntro":"Reconnaître les faux messages IT/RH internes.",
  "questions":[{"id":"fm_b_01","text":"Message Teams IT : « reset ton mot de passe ici »","options":["Je clique","J''appelle l''IT","Je réponds"],"correctAnswer":1,"feedbackCorrect":"L''IT ne demande pas un lien Teams pour reset.","feedbackIncorrect":"Vérifie par téléphone.","keyTakeaway":"IT ne demande jamais un reset via lien inconnu."}] }',true),
('Faux Messages Internes','QUIZ','BEGINNER','{
  "courseIntro":"RH et données perso.",
  "questions":[{"id":"fm_b_02","text":"Email RH demande N° sécu via Google Form.","options":["Je remplis","Je vérifie avec RH","Je réponds"],"correctAnswer":1,"feedbackCorrect":"Demande sensible = vérifier hors email.","feedbackIncorrect":"Ne partage pas de données perso via form non officiel.","keyTakeaway":"Données perso = validation directe avec RH."}] }',true),
('Faux Messages Internes','QUIZ','BEGINNER','{
  "courseIntro":"Usurpation du patron.",
  "questions":[{"id":"fm_b_03","text":"Mail du boss : « Achète des cartes cadeaux »","options":["J''achète","Je vérifie par tel","Je réponds"],"correctAnswer":1,"feedbackCorrect":"Valide toujours par un autre canal.","feedbackIncorrect":"Demande d''argent = vérifier en direct.","keyTakeaway":"Urgence d''achat = vérifier par téléphone."}] }',true),
('Faux Messages Internes','QUIZ','INTERMEDIATE','{
  "courseIntro":"Comptes compromis.",
  "questions":[{"id":"fm_i_01","text":"Collègue envoie un lien suspect, style inhabituel.","options":["Je clique","Je l''appelle","Je réponds"],"correctAnswer":1,"feedbackCorrect":"Style bizarre = compte peut être compromis.","feedbackIncorrect":"Vérifie en direct si le compte est sain.","keyTakeaway":"Message inhabituel = valider via appel."}] }',true),
('Faux Messages Internes','QUIZ','INTERMEDIATE','{
  "courseIntro":"Domaines proches.",
  "questions":[{"id":"fm_i_02","text":"Email interne depuis it-security@entreprise-support.com","options":["Normal","Domaine louche","Je clique"],"correctAnswer":1,"feedbackCorrect":"Domaine diffère du vrai domaine interne.","feedbackIncorrect":"Domaine non officiel = méfiance.","keyTakeaway":"Vérifie le domaine exact de l''entreprise."}] }',true),
('Faux Messages Internes','QUIZ','INTERMEDIATE','{
  "courseIntro":"Calendrier/invitations.",
  "questions":[{"id":"fm_i_03","text":"Invitation Teams avec lien externe inconnu.","options":["J''accepte","Je vérifie l''organisateur","Je clique"],"correctAnswer":1,"feedbackCorrect":"Vérifie qui invite et le lien réel.","feedbackIncorrect":"Invitation peut cacher un lien malveillant.","keyTakeaway":"Valide l''organisateur avant d''accepter un lien."}] }',true),
('Faux Messages Internes','QUIZ','ADVANCED','{
  "courseIntro":"Spear phishing interne.",
  "questions":[{"id":"fm_a_01","text":"Mail mentionnant un projet interne réel, demande PJ.","options":["Je clique","Je vérifie par canal direct","Je réponds"],"correctAnswer":1,"feedbackCorrect":"Même info interne, vérifier la source.","feedbackIncorrect":"Un compte interne peut être piraté.","keyTakeaway":"Info interne réelle ≠ email légitime, valide ailleurs."}] }',true),
('Faux Messages Internes','QUIZ','ADVANCED','{
  "courseIntro":"Instructions financières internes.",
  "questions":[{"id":"fm_a_02","text":"Mail finance demande de changer un RIB fournisseur.","options":["Je change","Je valide via téléphone officiel","Je réponds"],"correctAnswer":1,"feedbackCorrect":"RIB = vérifier par canal officiel.","feedbackIncorrect":"Changement RIB par email = arnaque possible.","keyTakeaway":"Changement RIB se valide toujours par appel officiel."}] }',true),
('Faux Messages Internes','QUIZ','ADVANCED','{
  "courseIntro":"Faux support sécurité.",
  "questions":[{"id":"fm_a_03","text":"« Sécurité » demande un export de logs par email.","options":["J''envoie","Je confirme avec IT","Je réponds"],"correctAnswer":1,"feedbackCorrect":"Demande inhabituelle = valider avec IT.","feedbackIncorrect":"Ne fournis pas de logs sans validation.","keyTakeaway":"Toute demande inhabituelle = validation IT."}] }',true),
('Faux Messages Internes','QUIZ','ADVANCED','{
  "courseIntro":"Messages audio/voix (vishing).",
  "questions":[{"id":"fm_a_04","text":"Message vocal interne demande un code OTP.","options":["Je donne","Je refuse","Je partage"],"correctAnswer":1,"feedbackCorrect":"Code OTP ne se partage jamais.","feedbackIncorrect":"Un OTP est personnel, ne le donne pas.","keyTakeaway":"Ne partage jamais un OTP, même en interne."}] }',true);

