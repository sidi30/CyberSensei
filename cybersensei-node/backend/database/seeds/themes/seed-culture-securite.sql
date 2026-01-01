-- SEED THEME : CULTURE DE SECURITE & RESPONSABILITE COLLECTIVE
DELETE FROM exercises WHERE topic = 'Culture de Sécurité';

INSERT INTO exercises (topic,type,difficulty,payload_json,active) VALUES
('Culture de Sécurité','QUIZ','BEGINNER','{
  "courseIntro":"La sécurité est l''affaire de tous.",
  "questions":[{"id":"cs_b_01","text":"Tu vois un PC déverrouillé au bureau.","options":["Je m''en fiche","Je rappelle gentiment de verrouiller","Je clique partout"],"correctAnswer":1,"feedbackCorrect":"Un rappel bienveillant évite un incident.","feedbackIncorrect":"Aide ton collègue à adopter le bon réflexe.","keyTakeaway":"Rappelle gentiment les bonnes pratiques."}] }',true),
('Culture de Sécurité','QUIZ','BEGINNER','{
  "courseIntro":"Signaler les doutes.",
  "questions":[{"id":"cs_b_02","text":"Email suspect mais tu n''es pas sûr.","options":["Je supprime sans rien dire","Je signale IT","Je transfère"],"correctAnswer":1,"feedbackCorrect":"Mieux vaut un faux positif que rater une vraie attaque.","feedbackIncorrect":"Signale toujours en cas de doute.","keyTakeaway":"En cas de doute, signale."}] }',true),
('Culture de Sécurité','QUIZ','BEGINNER','{
  "courseIntro":"Formation continue.",
  "questions":[{"id":"cs_b_03","text":"Session de formation planifiée.","options":["Inutile","J''y vais","Je délègue"],"correctAnswer":1,"feedbackCorrect":"Menaces évoluent, formation utile.","feedbackIncorrect":"Reste à jour avec les formations.","keyTakeaway":"La formation est continue pour tous."}] }',true),
('Culture de Sécurité','QUIZ','INTERMEDIATE','{
  "courseIntro":"Partage minimal.",
  "questions":[{"id":"cs_i_01","text":"Partager un accès admin pour aller vite.","options":["OK","Non, demander un accès adapté","Sans effet"],"correctAnswer":1,"feedbackCorrect":"Ne partage pas de comptes/admin.","feedbackIncorrect":"Respecter le moindre privilège.","keyTakeaway":"Pas de partage de comptes/admin."}] }',true),
('Culture de Sécurité','QUIZ','INTERMEDIATE','{
  "courseIntro":"Process de signalement.",
  "questions":[{"id":"cs_i_02","text":"Tu trouves une faille potentielle.","options":["Je garde pour moi","Je signale via canal officiel","Je poste sur réseau social"],"correctAnswer":1,"feedbackCorrect":"Signale via le canal prévu.","feedbackIncorrect":"Partage public est dangereux.","keyTakeaway":"Utilise le canal de signalement interne."}] }',true),
('Culture de Sécurité','QUIZ','INTERMEDIATE','{
  "courseIntro":"Exemplarité des managers.",
  "questions":[{"id":"cs_i_03","text":"Manager demande de contourner une règle.","options":["J''accepte","Je rappelle la politique","Je fais plus tard"],"correctAnswer":1,"feedbackCorrect":"La politique s''applique à tous.","feedbackIncorrect":"Même les managers respectent les règles.","keyTakeaway":"Les règles s''appliquent à tous, sans exception."}] }',true),
('Culture de Sécurité','QUIZ','ADVANCED','{
  "courseIntro":"Mesure et amélioration.",
  "questions":[{"id":"cs_a_01","text":"Pas de suivi des incidents mineurs.","options":["OK","Problème, ils doivent être suivis","Sans effet"],"correctAnswer":1,"feedbackCorrect":"Les petits incidents révèlent des tendances.","feedbackIncorrect":"Mesurer pour améliorer.","keyTakeaway":"Collecte des incidents même mineurs."}] }',true),
('Culture de Sécurité','QUIZ','ADVANCED','{
  "courseIntro":"Collaboration équipes.",
  "questions":[{"id":"cs_a_02","text":"IT ne partage pas les leçons apprises.","options":["Normal","À améliorer, partager les retours","Sans effet"],"correctAnswer":1,"feedbackCorrect":"Partager les leçons évite de répéter les erreurs.","feedbackIncorrect":"La transparence améliore la sécurité.","keyTakeaway":"Partage des retours pour progresser ensemble."}] }',true),
('Culture de Sécurité','QUIZ','ADVANCED','{
  "courseIntro":"Sensibilisation continue.",
  "questions":[{"id":"cs_a_03","text":"Programme de sensibilisation ponctuel uniquement.","options":["Suffisant","Doit être continu et varié","Inutile"],"correctAnswer":1,"feedbackCorrect":"La répétition et la variété ancrent les réflexes.","feedbackIncorrect":"Un one-shot ne suffit pas.","keyTakeaway":"Sensibilisation = continue et variée."}] }',true),
('Culture de Sécurité','QUIZ','ADVANCED','{
  "courseIntro":"Responsabilité partagée.",
  "questions":[{"id":"cs_a_04","text":"« La sécurité c''est le job de l''IT ».","options":["Vrai","Faux, c''est collectif","Je ne sais pas"],"correctAnswer":1,"feedbackCorrect":"Chaque employé est un maillon.","feedbackIncorrect":"La sécurité est l''affaire de tous.","keyTakeaway":"Sécurité = responsabilité collective."}] }',true);

