-- SEED THEME : ATTAQUES CIBLEES (SPEAR PHISHING)
DELETE FROM exercises WHERE topic = 'Attaques Ciblées';

INSERT INTO exercises (topic,type,difficulty,payload_json,active) VALUES
('Attaques Ciblées','QUIZ','BEGINNER','{
  "courseIntro":"Spear phishing = phishing très personnalisé.",
  "questions":[{"id":"ac_b_01","text":"Email cite ton nom et projet public.","options":["Je clique","Je vérifie source","Je réponds"],"correctAnswer":1,"feedbackCorrect":"Même personnalisé, vérifier la source.","feedbackIncorrect":"Personnalisation ne garantit rien.","keyTakeaway":"Personnalisation = méfiance, pas confiance."}] }',true),
('Attaques Ciblées','QUIZ','BEGINNER','{
  "courseIntro":"Faux contact LinkedIn.",
  "questions":[{"id":"ac_b_02","text":"Recruteur LinkedIn demande infos perso avant entretien.","options":["Je donne","Je demande un call officiel","Je réponds par mail"],"correctAnswer":1,"feedbackCorrect":"Un vrai recruteur fait un entretien avant les infos sensibles.","feedbackIncorrect":"Ne donne pas de données perso avant un entretien.","keyTakeaway":"Vérifie l''entreprise et demande un call."}] }',true),
('Attaques Ciblées','QUIZ','BEGINNER','{
  "courseIntro":"Pièce jointe « dossier client ».",
  "questions":[{"id":"ac_b_03","text":"PJ soi-disant client VIP.","options":["J''ouvre","Je valide via manager/client","Je transfère"],"correctAnswer":1,"feedbackCorrect":"Valide avant d''ouvrir, même client VIP.","feedbackIncorrect":"VIP ne veut pas dire sûr.","keyTakeaway":"Valide toute PJ sensible via canal officiel."}] }',true),
('Attaques Ciblées','QUIZ','INTERMEDIATE','{
  "courseIntro":"Infos internes réutilisées.",
  "questions":[{"id":"ac_i_01","text":"Email mentionne réunion interne réelle.","options":["Donc c''est fiable","Je reste prudent et vérifie","Je clique direct"],"correctAnswer":1,"feedbackCorrect":"Un pirate peut connaître ces infos.","feedbackIncorrect":"Info vraie ne garantit pas l''authenticité.","keyTakeaway":"Info interne connue ≠ mail authentique."}] }',true),
('Attaques Ciblées','QUIZ','INTERMEDIATE','{
  "courseIntro":"Faux prestataire.",
  "questions":[{"id":"ac_i_02","text":"« Prestataire » demande accès temporaire.","options":["J''accepte","Je valide via contrat/IT","Je réponds"],"correctAnswer":1,"feedbackCorrect":"Valide via IT/contrat avant un accès.","feedbackIncorrect":"Accès prestataire = processus clair.","keyTakeaway":"Accès prestataire = validation IT/contrat."}] }',true),
('Attaques Ciblées','QUIZ','INTERMEDIATE','{
  "courseIntro":"Cadeaux personnalisés.",
  "questions":[{"id":"ac_i_03","text":"Colis cadeau mentionnant ton hobby.","options":["J''ouvre","Je vérifie l''expéditeur","Je garde"],"correctAnswer":1,"feedbackCorrect":"Peut contenir un lien/piège, vérifie l''expéditeur.","feedbackIncorrect":"Ne te laisse pas appâter par la personnalisation.","keyTakeaway":"Cadeau personnalisé peut être un appât."}] }',true),
('Attaques Ciblées','QUIZ','ADVANCED','{
  "courseIntro":"Domaines look-alike avancés.",
  "questions":[{"id":"ac_a_01","text":"Domaine very-close-company.fr au lieu de company.fr.","options":["C''est OK","C''est un look-alike","Je clique"],"correctAnswer":1,"feedbackCorrect":"Domaine proche sert à tromper.","feedbackIncorrect":"Regarde bien le domaine exact.","keyTakeaway":"Les look-alike sont faits pour te piéger."}] }',true),
('Attaques Ciblées','QUIZ','ADVANCED','{
  "courseIntro":"Calendrier ciblé.",
  "questions":[{"id":"ac_a_02","text":"Invitation meeting copie le vrai créneau d''une réunion.","options":["J''accepte","Je vérifie l''organisateur","Je clique"],"correctAnswer":1,"feedbackCorrect":"Valide l''organisateur par canal interne.","feedbackIncorrect":"Une invitation peut être falsifiée.","keyTakeaway":"Vérifie l''organisateur avant d''accepter."}] }',true),
('Attaques Ciblées','QUIZ','ADVANCED','{
  "courseIntro":"Pièces jointes password-protected.",
  "questions":[{"id":"ac_a_03","text":"ZIP protégé envoyé par un « partenaire ».","options":["Je l''ouvre","Je demande confirmation via canal officiel","Je réponds"],"correctAnswer":1,"feedbackCorrect":"Demande confirmation avant d''ouvrir.","feedbackIncorrect":"Zip protégé peut cacher un malware.","keyTakeaway":"Protégé par mot de passe ≠ sûr, valide d''abord."}] }',true),
('Attaques Ciblées','QUIZ','ADVANCED','{
  "courseIntro":"Chaînes d''approbation falsifiées.",
  "questions":[{"id":"ac_a_04","text":"Mail inclut faux « approuvé par » d''un directeur.","options":["Je fais confiance","Je valide avec le directeur","Je clique"],"correctAnswer":1,"feedbackCorrect":"Valide l''approbation auprès de la personne réelle.","feedbackIncorrect":"Les mentions d''approbation peuvent être falsifiées.","keyTakeaway":"Approbation par écrit ≠ vérifiée, appelle la personne."}] }',true);



