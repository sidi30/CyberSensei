@echo off
REM ========================================
REM Application de la Migration Progression & Badges
REM ========================================

SET PGPATH="C:\Program Files\PostgreSQL\17\bin\psql.exe"
SET PGUSER=cybersensei
SET PGPASSWORD=cybersensei123
SET PGDB=cybersensei
SET MIGRATION=migration-progression-badges.sql

REM Note: Si vous utilisez PostgreSQL local au lieu de Docker, changez:
REM SET PGUSER=postgres
REM SET PGDB=cybersensei_db
REM Et commentez SET PGPASSWORD (le mot de passe sera demandé)

echo ==========================================
echo Migration : Systeme de Progression et Badges
echo ==========================================
echo.
echo Cette migration va creer :
echo  - 5 nouvelles tables (modules, badges, progression...)
echo  - 15 modules predefinis
echo  - 20 badges disponibles
echo  - Systeme d'attribution automatique
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
echo Verification des tables creees...
%PGPATH% -U %PGUSER% -d %PGDB% -c "SELECT table_name FROM information_schema.tables WHERE table_name IN ('modules', 'user_modules_progress', 'badges', 'user_badges', 'user_level');"

echo.
echo Verification des modules...
%PGPATH% -U %PGUSER% -d %PGDB% -c "SELECT COUNT(*) as nb_modules FROM modules;"

echo.
echo Verification des badges...
%PGPATH% -U %PGUSER% -d %PGDB% -c "SELECT COUNT(*) as nb_badges FROM badges;"

echo.
echo ==========================================
echo Prochaines etapes :
echo  1. Appliquer les seeds thematiques (apply-all-seeds.bat)
echo  2. Redemarrer le backend Java
echo  3. Ouvrir le dashboard React
echo ==========================================
echo.
pause

