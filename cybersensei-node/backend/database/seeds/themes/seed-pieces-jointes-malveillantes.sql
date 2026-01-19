-- SEED THEME : PIECES JOINTES MALVEILLANTES
DELETE FROM exercises WHERE topic = 'Pièces Jointes Malveillantes';

INSERT INTO exercises (topic,type,difficulty,payload_json,active) VALUES
('Pièces Jointes Malveillantes','QUIZ','BEGINNER','{
  "courseIntro":"Repérer les PJ suspectes.",
  "questions":[{"id":"pj_b_01","text":"PJ .zip d''un inconnu.","options":["J''ouvre","Je supprime et signale","Je transfère"],"correctAnswer":1,"feedbackCorrect":"Zip inconnu = risque malware.","feedbackIncorrect":"Ne pas ouvrir un zip inconnu.","keyTakeaway":"Zip inconnu = poubelle + signalement."}] }',true),
('Pièces Jointes Malveillantes','QUIZ','BEGINNER','{
  "courseIntro":"Double extension.",
  "questions":[{"id":"pj_b_02","text":"Facture_Urgente.pdf.exe","options":["C''est un PDF","C''est un exécutable dangereux","Je teste"],"correctAnswer":1,"feedbackCorrect":"Double extension cache un .exe.","feedbackIncorrect":"Ne jamais ouvrir .exe reçu par email.","keyTakeaway":"Double extension = virus probable."}] }',true),
('Pièces Jointes Malveillantes','QUIZ','BEGINNER','{
  "courseIntro":"PJ inattendue d''un contact.",
  "questions":[{"id":"pj_b_03","text":"Collègue envoie PJ inattendue, objet vide.","options":["J''ouvre","Je vérifie avec lui","Je transfère"],"correctAnswer":1,"feedbackCorrect":"Valide avant d''ouvrir, compte peut être compromis.","feedbackIncorrect":"Demande confirmation d''abord.","keyTakeaway":"PJ inattendue = valider avec l''expéditeur."}] }',true),
('Pièces Jointes Malveillantes','QUIZ','INTERMEDIATE','{
  "courseIntro":"Macros.",
  "questions":[{"id":"pj_i_01","text":"Word demande « activer les macros ».","options":["J''active","Je refuse","Je partage"],"correctAnswer":1,"feedbackCorrect":"Macros peuvent lancer du code malveillant.","feedbackIncorrect":"N''active pas de macros d''un email.","keyTakeaway":"N''active jamais les macros d''un fichier reçu."}] }',true),
('Pièces Jointes Malveillantes','QUIZ','INTERMEDIATE','{
  "courseIntro":"Signatures numériques.",
  "questions":[{"id":"pj_i_02","text":"PJ sans signature, lien externe dedans.","options":["OK","Je me méfie","Je clique"],"correctAnswer":1,"feedbackCorrect":"Absence de signature + lien = prudence.","feedbackIncorrect":"Vérifie l''origine avant de cliquer.","keyTakeaway":"PJ non signée + lien = méfiance."}] }',true),
('Pièces Jointes Malveillantes','QUIZ','INTERMEDIATE','{
  "courseIntro":"Faux scanners.",
  "questions":[{"id":"pj_i_03","text":"« Scanner » envoie un PDF douteux.","options":["J''ouvre","Je vérifie l''expéditeur réel","Je clique"],"correctAnswer":1,"feedbackCorrect":"Adresse du scanner doit être connue.","feedbackIncorrect":"Valide l''adresse du copieur/scan.","keyTakeaway":"Scanner inconnu = validation avant ouverture."}] }',true),
('Pièces Jointes Malveillantes','QUIZ','ADVANCED','{
  "courseIntro":"ISO/IMG.",
  "questions":[{"id":"pj_a_01","text":"Fichier .iso reçu par mail.","options":["J''monte l''image","Je supprime","Je partage"],"correctAnswer":1,"feedbackCorrect":"ISO peut contenir un exécutable.","feedbackIncorrect":"Ne monte pas un ISO reçu par email.","keyTakeaway":".iso reçu = très suspect, supprimer."}] }',true),
('Pièces Jointes Malveillantes','QUIZ','ADVANCED','{
  "courseIntro":"Mot de passe joint pour ouvrir la PJ.",
  "questions":[{"id":"pj_a_02","text":"Zip protégé par mot de passe dans l''email.","options":["Je dézippe","Je demande pourquoi","Je partage"],"correctAnswer":1,"feedbackCorrect":"Mot de passe sert à cacher le malware aux antivirus.","feedbackIncorrect":"Ne dézippe pas un mot de passe non sollicité.","keyTakeaway":"Zip protégé non sollicité = danger."}] }',true),
('Pièces Jointes Malveillantes','QUIZ','ADVANCED','{
  "courseIntro":"PDF avec lien incorporé.",
  "questions":[{"id":"pj_a_03","text":"PDF demande de cliquer sur un lien interne.","options":["Je clique","Je vérifie le lien","Je réponds"],"correctAnswer":1,"feedbackCorrect":"Lien interne peut être malveillant.","feedbackIncorrect":"Vérifie le lien avant de cliquer.","keyTakeaway":"Lien dans PDF = même vigilance qu''email."}] }',true),
('Pièces Jointes Malveillantes','QUIZ','ADVANCED','{
  "courseIntro":"Envoi massif de PJ.",
  "questions":[{"id":"pj_a_04","text":"Plusieurs PJ étranges reçues en même temps.","options":["J''ouvre une","Je signale IT","Je télécharge tout"],"correctAnswer":1,"feedbackCorrect":"Signale pour bloquer la campagne.","feedbackIncorrect":"Ne teste pas, signale.","keyTakeaway":"Campagne suspecte = signaler immédiatement."}] }',true);



