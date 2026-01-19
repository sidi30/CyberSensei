-- SEED THEME : SHADOW IT & OUTILS NON AUTORISES
DELETE FROM exercises WHERE topic = 'Shadow IT & Outils non Autorisés';

INSERT INTO exercises (topic,type,difficulty,payload_json,active) VALUES
('Shadow IT & Outils non Autorisés','QUIZ','BEGINNER','{
  "courseIntro":"Outils non approuvés = risques.",
  "questions":[{"id":"sh_b_01","text":"Stocker docs pro sur Dropbox perso.","options":["OK","Risque, utiliser espace pro","Sans effet"],"correctAnswer":1,"feedbackCorrect":"Utilise SharePoint/OneDrive pro.","feedbackIncorrect":"Outils perso = pas contrôlés.","keyTakeaway":"Pas d''outils perso pour les données pro."}] }',true),
('Shadow IT & Outils non Autorisés','QUIZ','BEGINNER','{
  "courseIntro":"Apps de messagerie.",
  "questions":[{"id":"sh_b_02","text":"Créer un groupe WhatsApp pour projet client.","options":["OK","Risque, préférer Teams","Sans importance"],"correctAnswer":1,"feedbackCorrect":"Teams est audité, WhatsApp non.","feedbackIncorrect":"Utilise l''outil approuvé.","keyTakeaway":"Communication pro sur outils approuvés."}] }',true),
('Shadow IT & Outils non Autorisés','QUIZ','BEGINNER','{
  "courseIntro":"Extensions navigateur inconnues.",
  "questions":[{"id":"sh_b_03","text":"Installer une extension « gratuite » non validée.","options":["OK","Risque, demander à IT","Sans effet"],"correctAnswer":1,"feedbackCorrect":"Peut lire tes données, valide avec IT.","feedbackIncorrect":"Ne pas installer sans validation.","keyTakeaway":"Valider toute extension/app avec IT."}] }',true),
('Shadow IT & Outils non Autorisés','QUIZ','INTERMEDIATE','{
  "courseIntro":"Services en ligne pratiques.",
  "questions":[{"id":"sh_i_01","text":"Convertisseur PDF en ligne pour doc client.","options":["OK","Risque de fuite, utiliser outil interne","Sans effet"],"correctAnswer":1,"feedbackCorrect":"Upload expose les données au site tiers.","feedbackIncorrect":"Utilise outils internes sécurisés.","keyTakeaway":"Ne pas uploader de données pro sur sites tiers non validés."}] }',true),
('Shadow IT & Outils non Autorisés','QUIZ','INTERMEDIATE','{
  "courseIntro":"Licences.",
  "questions":[{"id":"sh_i_02","text":"Utiliser un logiciel sans licence approuvée.","options":["OK","Risque légal/sécurité","Sans effet"],"correctAnswer":1,"feedbackCorrect":"Risque juridique et sécurité.","feedbackIncorrect":"Utilise logiciels licenciés par l''entreprise.","keyTakeaway":"Logiciels doivent être licenciés et validés."}] }',true),
('Shadow IT & Outils non Autorisés','QUIZ','INTERMEDIATE','{
  "courseIntro":"Sauvegarde personnelle.",
  "questions":[{"id":"sh_i_03","text":"Copie de docs pro sur clé perso pour travailler chez soi.","options":["OK","Risque, préférer accès distant sécurisé","Sans effet"],"correctAnswer":1,"feedbackCorrect":"Clé perso peut être perdue/volée.","feedbackIncorrect":"Utilise accès distant ou cloud pro.","keyTakeaway":"Pas de copies perso de données pro."}] }',true),
('Shadow IT & Outils non Autorisés','QUIZ','ADVANCED','{
  "courseIntro":"API non validées.",
  "questions":[{"id":"sh_a_01","text":"Connecter un service externe à nos données sans revue sécurité.","options":["OK","Risque majeur","Sans effet"],"correctAnswer":1,"feedbackCorrect":"API non revue peut exposer les données.","feedbackIncorrect":"Demande une revue sécurité avant intégration.","keyTakeaway":"Toute intégration doit être validée sécurité/legal."}] }',true),
('Shadow IT & Outils non Autorisés','QUIZ','ADVANCED','{
  "courseIntro":"Bring Your Own Device (BYOD) non maîtrisé.",
  "questions":[{"id":"sh_a_02","text":"Utiliser son PC perso sans MDM.","options":["OK","Risque, besoin MDM/antivirus","Sans effet"],"correctAnswer":1,"feedbackCorrect":"PC perso doit être géré/antivirus/MDM.","feedbackIncorrect":"Pas de données pro sur appareil non géré.","keyTakeaway":"BYOD = contrôle (MDM) ou interdit pour données pro."}] }',true),
('Shadow IT & Outils non Autorisés','QUIZ','ADVANCED','{
  "courseIntro":"Partage de clés API.",
  "questions":[{"id":"sh_a_03","text":"Clé API envoyée par email.","options":["OK","Risque, stocker secret de façon sécurisée","Sans effet"],"correctAnswer":1,"feedbackCorrect":"Les secrets ne se partagent pas en clair.","feedbackIncorrect":"Utilise coffre/secret manager.","keyTakeaway":"Clés/Secrets via coffre, jamais email."}] }',true),
('Shadow IT & Outils non Autorisés','QUIZ','ADVANCED','{
  "courseIntro":"Audits et logs.",
  "questions":[{"id":"sh_a_04","text":"Outil perso non loggé utilisé pour données pro.","options":["OK","Problème de traçabilité","Sans effet"],"correctAnswer":1,"feedbackCorrect":"Pas de logs = pas d''audit ni de détection.","feedbackIncorrect":"Utilise outils avec logging et audit.","keyTakeaway":"Outil sans logs = interdit pour données pro."}] }',true);



