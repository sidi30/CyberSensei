================================================================================
                    ACCÈS BASE DE DONNÉES - CYBERSENSEI
================================================================================

🔑 IDENTIFIANTS PAR DÉFAUT (Docker)
================================================================================

Base de données : cybersensei
Utilisateur     : cybersensei
Mot de passe    : cybersensei123
Host           : localhost
Port           : 5432


🚀 DÉMARRER POSTGRESQL
================================================================================

cd cybersensei-node/backend/database
docker-compose -f docker-compose-db.yml up -d


✅ LES SCRIPTS .BAT FONCTIONNENT MAINTENANT AUTOMATIQUEMENT
================================================================================

Ils utilisent automatiquement les identifiants Docker.
AUCUN MOT DE PASSE NE VOUS SERA DEMANDÉ !

1. Migration progression :
   cd cybersensei-node/backend/database
   .\apply-migration-progression.bat

2. Seeds (15 thèmes) :
   cd seeds
   .\apply-all-seeds.bat

3. Migration badges 80% :
   cd cybersensei-node/backend/database
   .\apply-badges-80-percent.bat


🌐 PGADMIN (INTERFACE WEB)
================================================================================

URL : http://localhost:5050

Email        : admin@cybersensei.io
Mot de passe : admin123


💻 CONNEXION VIA PSQL (LIGNE DE COMMANDE)
================================================================================

SET PGPASSWORD=cybersensei123
psql -h localhost -U cybersensei -d cybersensei

Ou :
psql -h localhost -U cybersensei -d cybersensei
(Mot de passe : cybersensei123)


📚 DOCUMENTATION COMPLÈTE
================================================================================

ACCES_RAPIDES.md            - Guide rapide (recommandé)
ACCES_BASE_DE_DONNEES.md    - Guide détaillé avec toutes les options


🔧 SI VOUS UTILISEZ POSTGRESQL LOCAL (pas Docker)
================================================================================

Modifiez les .bat et décommentez :

REM SET PGUSER=postgres
REM SET PGDB=cybersensei_db

Et commentez :

REM SET PGPASSWORD=cybersensei123

Le mot de passe vous sera alors demandé à chaque exécution.


================================================================================
✅ Tout est configuré ! Les scripts .bat fonctionnent maintenant sans demander
   de mot de passe.
================================================================================

