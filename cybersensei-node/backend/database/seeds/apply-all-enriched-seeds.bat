@echo off
REM =====================================================
REM Script d'application de TOUS les seeds enrichis
REM CyberSensei - Format Commercial Ready
REM =====================================================

echo.
echo ========================================
echo    CYBERSENSEI - ALL ENRICHED SEEDS
echo    Format Pedagogique Commercial
echo ========================================
echo.

REM Configuration PostgreSQL
set PGHOST=localhost
set PGPORT=5432
set PGUSER=cybersensei
set PGPASSWORD=cybersensei
set PGDB=cybersensei

echo [INFO] Configuration:
echo   Host: %PGHOST%:%PGPORT%
echo   Base: %PGDB%
echo   User: %PGUSER%
echo.

REM Application des seeds enrichis
echo [1/7] Phishing Emails enrichi...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDB% -f themes\seed-phishing-emails-enriched.sql
if %ERRORLEVEL% neq 0 goto :error

echo [2/7] Mots de Passe enrichi...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDB% -f themes\seed-mots-de-passe-enriched.sql
if %ERRORLEVEL% neq 0 goto :error

echo [3/7] Ingenierie Sociale enrichi...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDB% -f themes\seed-ingenierie-sociale-enriched.sql
if %ERRORLEVEL% neq 0 goto :error

echo [4/7] Liens Suspects enrichi...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDB% -f themes\seed-liens-suspects-enriched.sql
if %ERRORLEVEL% neq 0 goto :error

echo [5/7] Ransomware enrichi...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDB% -f themes\seed-ransomware-enriched.sql
if %ERRORLEVEL% neq 0 goto :error

echo [6/7] Faux Messages Internes enrichi...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDB% -f themes\seed-faux-messages-internes-enriched.sql
if %ERRORLEVEL% neq 0 goto :error

echo [7/7] Autres themes (format standard)...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDB% -f themes\seed-reflexes-securite-base.sql
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDB% -f themes\seed-pieces-jointes-malveillantes.sql
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDB% -f themes\seed-usurpation-identite.sql
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDB% -f themes\seed-fausse-facture-fraude.sql
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDB% -f themes\seed-protection-donnees.sql
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDB% -f themes\seed-teletravail-mobilite.sql
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDB% -f themes\seed-shadow-it.sql
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDB% -f themes\seed-attaques-ciblees.sql
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDB% -f themes\seed-culture-securite.sql

echo.
echo ========================================
echo    TOUS LES SEEDS APPLIQUES
echo ========================================
echo.
echo Seeds enrichis (format commercial):
echo   - Phishing Emails (7 exercices)
echo   - Mots de Passe (6 exercices)
echo   - Ingenierie Sociale (6 exercices)
echo   - Liens Suspects (10 questions, 3 sessions)
echo   - Ransomware (10 questions, 3 sessions)
echo   - Faux Messages Internes (10 questions, 3 sessions)
echo.
echo Seeds standards (9 themes):
echo   - Reflexes Securite Base
echo   - Pieces Jointes Malveillantes
echo   - Usurpation Identite
echo   - Fausse Facture / Fraude
echo   - Protection des Donnees
echo   - Teletravail / Mobilite
echo   - Shadow IT
echo   - Attaques Ciblees
echo   - Culture Securite
echo.
echo Total: ~100+ exercices prets
echo.
goto :end

:error
echo.
echo [ERREUR] Un probleme est survenu.
echo.

:end
pause

