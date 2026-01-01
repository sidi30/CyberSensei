-- SEED THEME : LIENS SUSPECTS & URLs
DELETE FROM exercises WHERE topic = 'Liens Suspects & URLs';

INSERT INTO exercises (topic,type,difficulty,payload_json,active) VALUES
('Liens Suspects & URLs','QUIZ','BEGINNER','{
  "courseIntro":"Repérer les liens louches (bit.ly, fautes, chiffres).",
  "questions":[{"id":"ls_b_01","text":"SMS banque avec lien bit.ly/abc.","options":["Je clique","Je me méfie","Je réponds"],"correctAnswer":1,"feedbackCorrect":"Les banques n''envoient pas de bit.ly.","feedbackIncorrect":"Un lien raccourci cache la vraie adresse.","keyTakeaway":"Lien raccourci + banque = arnaque."}] }',true),
('Liens Suspects & URLs','QUIZ','BEGINNER','{
  "courseIntro":"Regarder l''adresse réelle.",
  "questions":[{"id":"ls_b_02","text":"Bouton « accéder » pointe vers amaz0n-login.com.","options":["Je clique","Je me méfie du 0","Je réponds"],"correctAnswer":1,"feedbackCorrect":"0 à la place de o = faux site.","feedbackIncorrect":"Le domaine est falsifié.","keyTakeaway":"Lis chaque caractère du domaine."}] }',true),
('Liens Suspects & URLs','QUIZ','BEGINNER','{
  "courseIntro":"Ne pas se fier au texte du bouton.",
  "questions":[{"id":"ls_b_03","text":"Bouton « mon espace » mais lien vers http://notsecure.com.","options":["Je clique","Je quitte","Je transfère"],"correctAnswer":1,"feedbackCorrect":"Texte peut mentir, seul l''URL compte.","feedbackIncorrect":"Regarde l''URL réelle avant de cliquer.","keyTakeaway":"Survole et vérifie l''URL réelle."}] }',true),
('Liens Suspects & URLs','QUIZ','INTERMEDIATE','{
  "courseIntro":"Sous-domaines trompeurs.",
  "questions":[{"id":"ls_i_01","text":"https://secure.paypal.com.refund-check.com","options":["C''est PayPal","Faux, domaine est refund-check.com","Je teste"],"correctAnswer":1,"feedbackCorrect":"Le vrai domaine est après le dernier point avant .com.","feedbackIncorrect":"Le vrai domaine n''est pas PayPal ici.","keyTakeaway":"Lis le domaine de droite à gauche."}] }',true),
('Liens Suspects & URLs','QUIZ','INTERMEDIATE','{
  "courseIntro":"Nom de domaine proche.",
  "questions":[{"id":"ls_i_02","text":"https://microsoft.com-login-verify.net","options":["C''est bon","Faux domaine","Je clique"],"correctAnswer":1,"feedbackCorrect":"Le domaine est login-verify.net, pas microsoft.com.","feedbackIncorrect":"Domaine principal n''est pas Microsoft.","keyTakeaway":"Le vrai domaine est juste avant l''extension."}] }',true),
('Liens Suspects & URLs','QUIZ','INTERMEDIATE','{
  "courseIntro":"HTTPS ne suffit pas.",
  "questions":[{"id":"ls_i_03","text":"Site suspect mais avec cadenas HTTPS.","options":["HTTPS = safe","Je reste prudent","Je clique"],"correctAnswer":1,"feedbackCorrect":"Le cadenas ne garantit pas la légitimité.","feedbackIncorrect":"HTTPS ne veut pas dire site honnête.","keyTakeaway":"HTTPS ≠ légitime, vérifie le domaine."}] }',true),
('Liens Suspects & URLs','QUIZ','ADVANCED','{
  "courseIntro":"Homographes (caractères qui se ressemblent).",
  "questions":[{"id":"ls_a_01","text":"microsоft.com avec o cyrillique.","options":["Normal","Piège homographe","Je clique"],"correctAnswer":1,"feedbackCorrect":"Caractère spécial imite un o, c''est un faux.","feedbackIncorrect":"Regarde chaque lettre, attention Unicode.","keyTakeaway":"Homographes piègent l''œil, double-vérifie."}] }',true),
('Liens Suspects & URLs','QUIZ','ADVANCED','{
  "courseIntro":"Redirections multiples.",
  "questions":[{"id":"ls_a_02","text":"Lien passe par 3 redirections avant la page finale.","options":["Normal","Suspect, je ferme","Je patiente"],"correctAnswer":1,"feedbackCorrect":"Redirections multiples servent à cacher le piège.","feedbackIncorrect":"Ferme si trop de redirections.","keyTakeaway":"Trop de redirections = méfiance."}] }',true),
('Liens Suspects & URLs','QUIZ','ADVANCED','{
  "courseIntro":"QR codes piégés.",
  "questions":[{"id":"ls_a_03","text":"QR code posé sur une affiche inconnue.","options":["Je scanne","Je me méfie","Je partage"],"correctAnswer":1,"feedbackCorrect":"QR code peut mener à un site piégé.","feedbackIncorrect":"Ne scanne pas un QR inconnu.","keyTakeaway":"QR inconnu = prudence ou ne pas scanner."}] }',true),
('Liens Suspects & URLs','QUIZ','ADVANCED','{
  "courseIntro":"Liens dans les signatures.",
  "questions":[{"id":"ls_a_04","text":"Signature email contient un lien court non vérifié.","options":["Je clique","Je valide l''expéditeur avant","Je transfère"],"correctAnswer":1,"feedbackCorrect":"Même en signature, un lien doit être vérifié.","feedbackIncorrect":"Ne clique pas sur un lien inconnu en signature.","keyTakeaway":"Toujours vérifier les liens, même en signature."}] }',true);

