-- SEED THEME : FAUSSES FACTURES & FRAUDE AU PAIEMENT
DELETE FROM exercises WHERE topic = 'Fausses Factures & Fraude';

INSERT INTO exercises (topic,type,difficulty,payload_json,active) VALUES
('Fausses Factures & Fraude','QUIZ','BEGINNER','{
  "courseIntro":"Repérer les fausses factures simples.",
  "questions":[{"id":"ff_b_01","text":"Facture d''un fournisseur inconnu.","options":["Je paie","Je vérifie la commande","Je transfère"],"correctAnswer":1,"feedbackCorrect":"Vérifie qu''une commande existe.","feedbackIncorrect":"Ne paie pas une facture non commandée.","keyTakeaway":"Pas de commande = pas de paiement."}] }',true),
('Fausses Factures & Fraude','QUIZ','BEGINNER','{
  "courseIntro":"Montant cohérent mais expéditeur différent.",
  "questions":[{"id":"ff_b_02","text":"Adresse compta@fournisseur-services.com au lieu de fournisseur.com.","options":["Normal","Suspect","Je paie"],"correctAnswer":1,"feedbackCorrect":"Domaine différent = possible fraude.","feedbackIncorrect":"Vérifie le domaine exact avant de payer.","keyTakeaway":"Domaine d''expéditeur doit être exact."}] }',true),
('Fausses Factures & Fraude','QUIZ','BEGINNER','{
  "courseIntro":"Urgence dans le sujet.",
  "questions":[{"id":"ff_b_03","text":"« URGENT régler aujourd''hui » sur facture surprise.","options":["Je paie vite","Je vérifie via téléphone officiel","Je réponds"],"correctAnswer":1,"feedbackCorrect":"Urgence est un levier de fraude.","feedbackIncorrect":"Valide par appel officiel.","keyTakeaway":"Urgence + paiement = vérifier par téléphone."}] }',true),
('Fausses Factures & Fraude','QUIZ','INTERMEDIATE','{
  "courseIntro":"Changement de RIB.",
  "questions":[{"id":"ff_i_01","text":"Mail annonce nouveau RIB.","options":["Je mets à jour","Je valide via numéro officiel","Je réponds"],"correctAnswer":1,"feedbackCorrect":"Toujours valider un RIB par téléphone officiel.","feedbackIncorrect":"Changement RIB par email = méfiance.","keyTakeaway":"RIB : validation hors email obligatoire."}] }',true),
('Fausses Factures & Fraude','QUIZ','INTERMEDIATE','{
  "courseIntro":"Détournement du workflow interne.",
  "questions":[{"id":"ff_i_02","text":"On te demande de contourner l''outil achat pour payer.","options":["J''accepte","Je refuse et alerte achat","Je paie puis je dis"],"correctAnswer":1,"feedbackCorrect":"Suivre le process évite les fraudes.","feedbackIncorrect":"Ne contourne pas les outils officiels.","keyTakeaway":"Respecte le process achat pour chaque paiement."}] }',true),
('Fausses Factures & Fraude','QUIZ','INTERMEDIATE','{
  "courseIntro":"Facture avec référence proche.",
  "questions":[{"id":"ff_i_03","text":"Numéro de facture quasi identique à une vraie.","options":["Normal","Je vérifie dans l''ERP","Je paie"],"correctAnswer":1,"feedbackCorrect":"Vérifie dans l''outil interne avant de payer.","feedbackIncorrect":"Ne te fie pas qu'au PDF.","keyTakeaway":"Vérifie les factures dans l''ERP."}] }',true),
('Fausses Factures & Fraude','QUIZ','ADVANCED','{
  "courseIntro":"CEO fraud (BEC).",
  "questions":[{"id":"ff_a_01","text":"Mail du CEO demande virement discret.","options":["J''exécute","Je valide via téléphone","Je réponds"],"correctAnswer":1,"feedbackCorrect":"Valider toute demande de virement avec un appel.","feedbackIncorrect":"Demande secrète = red flag.","keyTakeaway":"Virement inhabituel = appel direct."}] }',true),
('Fausses Factures & Fraude','QUIZ','ADVANCED','{
  "courseIntro":"Montage multi-étapes.",
  "questions":[{"id":"ff_a_02","text":"Un faux fournisseur + faux auditeur pressent un paiement.","options":["Je paie","Je bloque et j''alerte","Je demande un mail"],"correctAnswer":1,"feedbackCorrect":"Bloque et alerte finance/IT.","feedbackIncorrect":"Ne cède pas à la pression combinée.","keyTakeaway":"Pression coordonnée = signaler immédiatement."}] }',true),
('Fausses Factures & Fraude','QUIZ','ADVANCED','{
  "courseIntro":"Faux IBAN dans PDF.",
  "questions":[{"id":"ff_a_03","text":"IBAN différent de la fiche fournisseur.","options":["Je paie","Je compare et appelle","Je réponds"],"correctAnswer":1,"feedbackCorrect":"Compare aux infos officielles et appelle.","feedbackIncorrect":"Toujours vérifier IBAN officiel.","keyTakeaway":"Compare IBAN avec fiche officielle + appel."}] }',true),
('Fausses Factures & Fraude','QUIZ','ADVANCED','{
  "courseIntro":"Langage juridique agressif.",
  "questions":[{"id":"ff_a_04","text":"« Mise en demeure de payer » inattendue.","options":["Je paie","Je vérifie la légitimité","Je réponds"],"correctAnswer":1,"feedbackCorrect":"Vérifie avec juridique/finance.","feedbackIncorrect":"Ne paie pas sous menace sans vérifier.","keyTakeaway":"Lettre agressive inattendue = vérification juridique."}] }',true);




