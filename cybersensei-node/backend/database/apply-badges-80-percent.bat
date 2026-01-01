@echo off
REM ========================================
REM Application de la Migration Badges à 80%
REM ========================================

SET PGPATH="C:\Program Files\PostgreSQL\17\bin\psql.exe"
SET PGUSER=cybersensei
SET PGPASSWORD=cybersensei123
SET PGDB=cybersensei
SET MIGRATION=migration-badges-80-percent.sql

REM Note: Si vous utilisez PostgreSQL local au lieu de Docker, changez:
REM SET PGUSER=postgres
REM SET PGDB=cybersensei_db
REM Et commentez SET PGPASSWORD (le mot de passe sera demandé)

echo ==========================================
echo Migration : Badges attribués à 80%%
echo ==========================================
echo.
echo Cette migration va modifier :
echo  - Fonction award_badge_if_earned
echo  - Seuil d'attribution : 100%% =^> 80%%
echo.
pause

echo.
echo [1/1] Application de la migration...
%PGPATH% -U %PGUSER% -d %PGDB% -f "%MIGRATION%"

IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo ==========================================
    echo ERREUR : La migration a echoue
    echo ==========================================
    echo.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo TERMINE ! Migration appliquee avec succes
echo ==========================================
echo.
echo Verifications...
echo.

echo 1. Verifier les badges existants :
%PGPATH% -U %PGUSER% -d %PGDB% -c "SELECT COUNT(*) as nb_badges FROM badges;"

echo.
echo 2. Verifier les badges obtenus par les utilisateurs :
%PGPATH% -U %PGUSER% -d %PGDB% -c "SELECT u.name, COUNT(ub.id) as nb_badges FROM users u LEFT JOIN user_badges ub ON u.id = ub.user_id GROUP BY u.id, u.name ORDER BY nb_badges DESC LIMIT 5;"

echo.
echo ==========================================
echo Prochaines etapes :
echo  1. Redemarrer le backend Java
echo  2. Tester l'attribution des badges
echo  3. Verifier l'interface des badges
echo ==========================================
echo.
pause

