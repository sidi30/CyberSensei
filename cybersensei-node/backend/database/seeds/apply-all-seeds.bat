@echo off
REM ========================================
REM Script d'application de tous les seeds
REM ========================================

SET PGPATH="C:\Program Files\PostgreSQL\17\bin\psql.exe"
SET PGUSER=cybersensei
SET PGPASSWORD=cybersensei123
SET PGDB=cybersensei
SET SEEDDIR=themes

REM Note: Si vous utilisez PostgreSQL local au lieu de Docker, changez:
REM SET PGUSER=postgres
REM SET PGDB=cybersensei_db
REM Et commentez SET PGPASSWORD (le mot de passe sera demandé)

echo ==========================================
echo Application des seeds CyberSensei
echo ==========================================
echo.
echo Ce script va appliquer les 15 seeds (10+ exercices chacun)
echo.
pause

echo.
echo [1/15] Phishing Emails...
%PGPATH% -U %PGUSER% -d %PGDB% -f "%SEEDDIR%\seed-phishing-emails.sql"

echo.
echo [2/15] Liens Suspects...
%PGPATH% -U %PGUSER% -d %PGDB% -f "%SEEDDIR%\seed-liens-suspects.sql"

echo.
echo [3/15] Mots de Passe...
%PGPATH% -U %PGUSER% -d %PGDB% -f "%SEEDDIR%\seed-mots-de-passe.sql"

echo.
echo [4/15] Faux Messages Internes...
%PGPATH% -U %PGUSER% -d %PGDB% -f "%SEEDDIR%\seed-faux-messages-internes.sql"

echo.
echo [5/15] Reflexes Securite Base...
%PGPATH% -U %PGUSER% -d %PGDB% -f "%SEEDDIR%\seed-reflexes-securite-base.sql"

echo.
echo [6/15] Ingenierie Sociale...
%PGPATH% -U %PGUSER% -d %PGDB% -f "%SEEDDIR%\seed-ingenierie-sociale.sql"

echo.
echo [7/15] Pieces Jointes Malveillantes...
%PGPATH% -U %PGUSER% -d %PGDB% -f "%SEEDDIR%\seed-pieces-jointes-malveillantes.sql"

echo.
echo [8/15] Fausse Facture Fraude...
%PGPATH% -U %PGUSER% -d %PGDB% -f "%SEEDDIR%\seed-fausse-facture-fraude.sql"

echo.
echo [9/15] Usurpation Identite...
%PGPATH% -U %PGUSER% -d %PGDB% -f "%SEEDDIR%\seed-usurpation-identite.sql"

echo.
echo [10/15] Teletravail Mobilite...
%PGPATH% -U %PGUSER% -d %PGDB% -f "%SEEDDIR%\seed-teletravail-mobilite.sql"

echo.
echo [11/15] Attaques Ciblees...
%PGPATH% -U %PGUSER% -d %PGDB% -f "%SEEDDIR%\seed-attaques-ciblees.sql"

echo.
echo [12/15] Ransomware...
%PGPATH% -U %PGUSER% -d %PGDB% -f "%SEEDDIR%\seed-ransomware.sql"

echo.
echo [13/15] Protection Donnees...
%PGPATH% -U %PGUSER% -d %PGDB% -f "%SEEDDIR%\seed-protection-donnees.sql"

echo.
echo [14/15] Shadow IT...
%PGPATH% -U %PGUSER% -d %PGDB% -f "%SEEDDIR%\seed-shadow-it.sql"

echo.
echo [15/15] Culture Securite...
%PGPATH% -U %PGUSER% -d %PGDB% -f "%SEEDDIR%\seed-culture-securite.sql"

echo.
echo ==========================================
echo TERMINE ! Tous les seeds sont appliques
echo ==========================================
echo.
echo Verification du nombre d'exercices...
%PGPATH% -U %PGUSER% -d %PGDB% -c "SELECT topic, COUNT(*) as nb FROM exercises GROUP BY topic ORDER BY topic;"

echo.
pause

