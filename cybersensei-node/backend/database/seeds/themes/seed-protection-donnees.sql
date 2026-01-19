-- SEED THEME : PROTECTION DES DONNEES & CONFIDENTIALITE
DELETE FROM exercises WHERE topic = 'Protection des Données';

INSERT INTO exercises (topic,type,difficulty,payload_json,active) VALUES
('Protection des Données','QUIZ','BEGINNER','{
  "courseIntro":"Données sensibles = à protéger.",
  "questions":[{"id":"pd_b_01","text":"Envoi d''un fichier client sans mot de passe.","options":["OK","Je protège et j''utilise canal sécurisé","Sans effet"],"correctAnswer":1,"feedbackCorrect":"Protège par mot de passe/canal sécurisé.","feedbackIncorrect":"Ne pas envoyer en clair.","keyTakeaway":"Données sensibles via canal sécurisé/chiffré."}] }',true),
('Protection des Données','QUIZ','BEGINNER','{
  "courseIntro":"Partage minimal.",
  "questions":[{"id":"pd_b_02","text":"Partage d''un tableau complet alors que seul un onglet est utile.","options":["OK","Je partage seulement le nécessaire","Je transfère tout"],"correctAnswer":1,"feedbackCorrect":"Partage le minimum nécessaire.","feedbackIncorrect":"Moins on partage, mieux c''est.","keyTakeaway":"Principe du moindre privilège aussi dans le partage."}] }',true),
('Protection des Données','QUIZ','BEGINNER','{
  "courseIntro":"Poste verrouillé.",
  "questions":[{"id":"pd_b_03","text":"Tu laisses écran avec données clients ouvert.","options":["OK","Je verrouille","Sans effet"],"correctAnswer":1,"feedbackCorrect":"Protège les données affichées.","feedbackIncorrect":"Toujours verrouiller.","keyTakeaway":"Verrouille quand données sensibles affichées."}] }',true),
('Protection des Données','QUIZ','INTERMEDIATE','{
  "courseIntro":"Principe du besoin d''en connaître.",
  "questions":[{"id":"pd_i_01","text":"Un collègue hors projet demande accès complet.","options":["Je donne","Je limite ou je refuse","Je partage tout"],"correctAnswer":1,"feedbackCorrect":"Accès seulement pour ceux qui en ont besoin.","feedbackIncorrect":"Évite les accès larges.","keyTakeaway":"Accès = besoin métier réel."}] }',true),
('Protection des Données','QUIZ','INTERMEDIATE','{
  "courseIntro":"Transfert externe.",
  "questions":[{"id":"pd_i_02","text":"Envoi de données perso à un partenaire sans NDA.","options":["OK","Risque, vérifier NDA/process","Sans effet"],"correctAnswer":1,"feedbackCorrect":"Vérifie le cadre légal (NDA).","feedbackIncorrect":"Pas de NDA = pas de données sensibles.","keyTakeaway":"Vérifie le cadre avant tout partage externe."}] }',true),
('Protection des Données','QUIZ','INTERMEDIATE','{
  "courseIntro":"Nettoyage des anciens fichiers.",
  "questions":[{"id":"pd_i_03","text":"Ancien export client traîne sur poste.","options":["OK","À supprimer/archiver","Sans importance"],"correctAnswer":1,"feedbackCorrect":"Moins de copies = moins de fuite.","feedbackIncorrect":"Nettoie les anciens exports.","keyTakeaway":"Supprime/archivage des données inutiles."}] }',true),
('Protection des Données','QUIZ','ADVANCED','{
  "courseIntro":"Chiffrement.",
  "questions":[{"id":"pd_a_01","text":"Disque dur non chiffré avec données sensibles.","options":["OK","Activer le chiffrement","Inutile"],"correctAnswer":1,"feedbackCorrect":"Chiffrement protège en cas de vol/perte.","feedbackIncorrect":"Sans chiffrement, données lisibles.","keyTakeaway":"Chiffre les supports contenant du sensible."}] }',true),
('Protection des Données','QUIZ','ADVANCED','{
  "courseIntro":"Logs et données perso.",
  "questions":[{"id":"pd_a_02","text":"Logs applicatifs contiennent des données perso.","options":["OK","Anonymiser/masquer","Pas grave"],"correctAnswer":1,"feedbackCorrect":"Évite données perso dans les logs.","feedbackIncorrect":"Conformité et confidentialité en jeu.","keyTakeaway":"Pas de données perso en clair dans les logs."}] }',true),
('Protection des Données','QUIZ','ADVANCED','{
  "courseIntro":"Gestion des départs.",
  "questions":[{"id":"pd_a_03","text":"Un employé part, garde des fichiers pro.","options":["OK","Doit rendre/supprimer","Sans effet"],"correctAnswer":1,"feedbackCorrect":"Les données appartiennent à l''entreprise.","feedbackIncorrect":"Récupère et supprime des devices perso.","keyTakeaway":"Au départ, retirer accès et récupérer les données."}] }',true),
('Protection des Données','QUIZ','ADVANCED','{
  "courseIntro":"Sauvegardes chiffrées.",
  "questions":[{"id":"pd_a_04","text":"Backups sensibles non chiffrés.","options":["OK","À chiffrer","Sans effet"],"correctAnswer":1,"feedbackCorrect":"Backups doivent être chiffrés et isolés.","feedbackIncorrect":"Backups non chiffrés = fuite potentielle.","keyTakeaway":"Chiffre et isole les sauvegardes sensibles."}] }',true);



