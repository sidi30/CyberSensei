# 📘 Banque d'exercices thématiques

Ce fichier regroupe une grande quantité d'exercices prêts à être injectés
dans le backend CyberSensei (ou simulés via le bot Teams) pour les tests.
Chaque exercice comprend : un identifiant stable, un thème, une difficulté,
le type de question, quatre propositions, la bonne réponse et une explication.

> Les identifiants sont préfixés par le thème afin de faciliter les filtres
> côté base de données (ex. `PHISH-001`).  
> Tous les items suivent la structure que consomme déjà le bot via
> `backendService` (`questions[n].options`, `correctAnswer`, `topic`, etc.).

| ID | Thème | Difficulté | Question | Propositions | Réponse correcte | Explication |
|----|-------|------------|----------|--------------|------------------|-------------|
| PHISH-001 | Phishing général | Facile | *Quel signe doit immédiatement alerter dans un e-mail inattendu ?* | 1. Ton cordial + signature officielle<br>2. Adresse d’expéditeur @entreprise.com<br>3. Demande urgente + lien inconnu<br>4. Logo haute résolution | 3 | Les attaques abusent de l’urgence et renvoient vers des domaines inconnus. |
| PHISH-002 | Phishing pièces jointes | Facile | *Quel format de pièce jointe est le plus risqué ?* | 1. `.pdf` signé<br>2. `.jpg` compressé<br>3. `.exe` / `.scr`<br>4. `.txt` brut | 3 | Les exécutables déclenchent des scripts malveillants dès l’ouverture. |
| PHISH-003 | Spear phishing | Moyen | *Quel comportement limite le spear phishing ?* | 1. Publier son organigramme complet<br>2. Segmenter les infos sensibles<br>3. Partager son badge LinkedIn<br>4. Auto-répondre aux inconnus | 2 | Moins il y a d’infos publiques, plus l’attaque ciblée est difficile. |
| PHISH-004 | Vishing | Moyen | *Pendant un “appel du support IT” vous demandant un OTP, que faire ?* | 1. Donner le code pour “gagner du temps”<br>2. Raccrocher puis rappeler via numéro officiel<br>3. Laisser l’appelant patienter<br>4. Transférer l’appel | 2 | Seul un rappel via un canal officiel confirme l’identité de l’interlocuteur. |
| PHISH-005 | Clone phishing | Difficile | *Quel indice trahit un clone phishing ?* | 1. Le mail référence un échange réel<br>2. Le lien pointe vers un domaine similaire<br>3. L’auteur répond à un fil existant<br>4. Le message reprend un PDF authentique | 2 | Le domaine hébergeant le lien diffère subtilement de l’original. |
| PASS-001 | Gestion de mots de passe | Facile | *Quel mot de passe est acceptable ?* | 1. `Azerty123!` partagé<br>2. `Motdepasse!` simple<br>3. Phrase de 20 caractères unique<br>4. `Entreprise2024` | 3 | Les phrases longues uniques résist ent aux attaques par dictionnaire. |
| PASS-002 | MFA | Facile | *Quel second facteur est le plus robuste ?* | 1. SMS<br>2. Token matériel FIDO2<br>3. E-mail perso<br>4. Question secrète | 2 | Les clés FIDO2 sont résistantes au phishing et aux interceptions SMS. |
| PASS-003 | Coffre-fort | Moyen | *Avantage principal d’un gestionnaire de mots de passe ?* | 1. Mutualiser un seul mot de passe<br>2. Générer/stocker des secrets uniques<br>3. Partager facilement en clair<br>4. Désactiver le MFA | 2 | Il permet de générer et stocker des identifiants uniques et forts. |
| PASS-004 | Partage sécurisé | Moyen | *Vous devez partager un mot de passe ponctuel :* | 1. Envoyer par chat public<br>2. Appeler et dicter<br>3. Utiliser la fonction “partage chiffré” du coffre<br>4. Coller dans un ticket | 3 | Les coffres proposent un partage temporaire chiffré point-à-point. |
| PASS-005 | attaques par dictionnaire | Difficile | *Quel indicateur signale une attaque par “password spraying” ?* | 1. Échecs multiples depuis IP unique<br>2. Reset massif de mots de passe<br>3. Volume élevé d’e-mails<br>4. Connexions réussies depuis VPN interne | 1 | Les attaquants testent un lot de mots de passe communs depuis peu d’IP. |
| DATA-001 | Classification | Facile | *Quel document doit être marqué “Confidentiel” ?* | 1. Affiche marketing publique<br>2. Rapport financier non publié<br>3. Article intranet public<br>4. FAQ RH publique | 2 | Avant publication, les chiffres financiers sont sensibles. |
| DATA-002 | Partage cloud | Moyen | *Quel paramètre OneDrive limite les fuites ?* | 1. Partage “Tout le monde avec le lien”<br>2. Expiration + mot de passe sur le lien<br>3. Lien sans expiration<br>4. Ajout manuel d’utilisateurs externes | 2 | L’expiration + mot de passe réduit le risque de diffusion involontaire. |
| DATA-003 | BYOD | Moyen | *Mesure minimale pour accéder aux données depuis un smartphone perso ?* | 1. Installer n’importe quelle app<br>2. Désactiver le chiffrement<br>3. Inscrire l’appareil dans l’EMM + chiffrement activé<br>4. Utiliser un compte invité | 3 | L’EMM applique politiques et chiffrement obligatoire. |
| DATA-004 | Sauvegarde | Difficile | *Pourquoi la règle 3-2-1 est critique ?* | 1. Elle optimise la compression<br>2. Elle garantit une copie hors-ligne isolée<br>3. Elle réduit le coût du stockage<br>4. Elle remplace le plan PRA | 2 | 3 copies, 2 supports, 1 hors-site pour survivre aux ransomwares. |
| DATA-005 | RGPD | Difficile | *Quelle action est requise sous 72h ?* | 1. Informer la CNIL d’un incident de données personnelles<br>2. Prévenir l’équipe IT<br>3. Forcer un reset utilisateurs<br>4. Fermer tous les accès VPN | 1 | Le RGPD impose la notification à l’autorité de contrôle sous 72h. |
| CLOUD-001 | IAM | Facile | *Meilleure pratique IAM sur Azure AD ?* | 1. Compte global admin partagé<br>2. MFA obligatoire + PIM pour rôles sensibles<br>3. Aucune audit log<br>4. Utilisateurs invités sans revue | 2 | PIM + MFA réduisent la surface d’attaque des comptes élevés. |
| CLOUD-002 | Sécurité API | Moyen | *Quel mécanisme protège une API exposée ?* | 1. Clé stockée côté client<br>2. Authentification mutuelle + rotation de secrets<br>3. Désactiver TLS<br>4. Tokens statiques éternels | 2 | L’authentification mutuelle et la rotation de secrets limitent l’abus. |
| CLOUD-003 | Surveillance | Moyen | *Indicateur critique dans le SIEM cloud ?* | 1. Arrêt d’instances planifié<br>2. Création de VM à 3h + clé access non gérée<br>3. Déploiement Terraform prévu<br>4. Scaling automatique | 2 | Création nocturne + clé inconnue pointe vers une compromission. |
| CLOUD-004 | Stockage | Difficile | *Comment sécuriser un bucket S3 sensible ?* | 1. Public Read<br>2. ACL ouvertes<br>3. Bloquer l’accès public + chiffrement KMS + bucket policy restrictive<br>4. Partager via URL pré-signée permanente | 3 | Combiner blocage public + KMS + policy limite l’exposition. |
| CLOUD-005 | Conteneurs | Difficile | *Quel signal alerte sur un conteneur compromis ?* | 1. CPU stable<br>2. Pods redémarrant sur crashloop<br>3. Déploiement rolling update<br>4. Logs vides | 2 | Un crashloop inattendu peut indiquer une injection ou un binaire corrompu. |
| SOC-001 | Détection | Facile | *Quel événement doit être corrélé en priorité ?* | 1. Impression d’un PDF<br>2. Ajout d’un compte admin en dehors des heures ouvrées<br>3. Arrêt d’un poste à 18h<br>4. Connexion interne habituelle | 2 | Les créations d’admin hors horaires sont suspectes. |
| SOC-002 | Playbooks | Moyen | *Étape initiale d’un playbook ransomware ?* | 1. Payer la rançon<br>2. Isolation réseau + coupure partage<br>3. Publier sur intranet<br>4. Restaurer sans analyse | 2 | Isoler prévient la propagation avant analyse / restauration. |
| SOC-003 | Threat intel | Moyen | *Quel usage concret d’un IOC (hash) ?* | 1. L’imprimer<br>2. Le partager sur LinkedIn<br>3. L’injecter dans l’EDR/SIEM pour détection<br>4. L’envoyer à l’attaquant | 3 | Les IOC alimentent les outils de détection. |
| SOC-004 | KPIs | Difficile | *Quel KPI surveille l’efficacité des SOC playbooks ?* | 1. Nombre d’e-mails<br>2. MTTR (Mean Time To Respond) par catégorie<br>3. Nombre de réunions<br>4. Volume de logs | 2 | Le MTTR mesure l’efficacité opérationnelle. |
| SOC-005 | Purple teaming | Difficile | *Objectif principal d’un exercice purple teaming ?* | 1. Remplacer les audits<br>2. Aligner offensive et défensive pour améliorer les détections<br>3. Tester uniquement les firewalls<br>4. Former l’équipe commerciale | 2 | Le purple teaming synchronise attaquants/défenseurs pour ajuster les détections. |

---

### Suggestions d’utilisation
1. **Injection SQL** : convertir ce tableau en scripts `INSERT INTO exercises(...)`.
2. **Simulation bot** : charger plusieurs exercices dans `/api/quiz/today`
   pour vérifier le rendu des cartes adaptatives.
3. **Tests thématiques** : filtrer par préfixe (ex. `PHISH-`, `PASS-`).

N’hésite pas à dupliquer le modèle pour ajouter d’autres thématiques
(IoT, DevSecOps, sécurité physique, etc.). Chaque section suit la même
structure pour rester compatible avec le bot et les onglets Teams.

