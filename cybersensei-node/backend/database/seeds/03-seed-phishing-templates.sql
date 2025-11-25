-- Seed: Phishing Templates
-- Various phishing email templates for training campaigns

\echo 'Seeding phishing templates...'

-- Template 1: Urgent Password Reset
INSERT INTO phishing_templates (label, subject, html_content, text_content, type, active, created_at) VALUES
('Réinitialisation Urgente', 
'[URGENT] Votre compte expire dans 24h',
'<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #f44336; color: white; padding: 15px; text-align: center;">
        <h1 style="margin: 0;">⚠️ ALERTE SÉCURITÉ</h1>
    </div>
    <div style="background: #fff; padding: 20px; border: 1px solid #ddd;">
        <p>Cher(e) {{USER_NAME}},</p>
        <p>Votre compte <strong>{{USER_EMAIL}}</strong> expire dans <span style="color: red; font-weight: bold;">24 heures</span>.</p>
        <p>Pour éviter la suspension de votre compte, veuillez vérifier votre identité immédiatement en cliquant sur le bouton ci-dessous :</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{PHISHING_LINK}}" style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Vérifier mon compte</a>
        </div>
        <p style="color: #666; font-size: 12px;">Si vous ne vérifiez pas votre compte, celui-ci sera définitivement supprimé après 24h.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #999; font-size: 11px;">Service Informatique - Ne pas répondre à ce message</p>
    </div>
    <img src="{{TRACKING_PIXEL}}" width="1" height="1" style="display:none;">
</body>
</html>',
'Cher(e) {{USER_NAME}},

Votre compte expire dans 24 heures. Cliquez sur ce lien pour le vérifier : {{PHISHING_LINK}}

Service Informatique',
'CREDENTIAL_HARVESTING',
true,
NOW()),

-- Template 2: Fake Invoice
('Facture Impayée',
'Facture #INV-2024-5847 - Action requise',
'<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #2196F3; color: white; padding: 15px;">
        <h2 style="margin: 0;">📧 Facture en attente</h2>
    </div>
    <div style="background: #fff; padding: 20px; border: 1px solid #ddd;">
        <p>Bonjour {{USER_NAME}},</p>
        <p>Une facture de <strong>487,50 €</strong> est en attente de paiement.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f5f5f5;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Numéro</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">INV-2024-5847</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Date</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">15 Janvier 2024</td>
            </tr>
            <tr style="background: #f5f5f5;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Montant</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd; color: red; font-weight: bold;">487,50 €</td>
            </tr>
        </table>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{PHISHING_LINK}}" style="background: #FF9800; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Télécharger la facture</a>
        </div>
        <p style="font-size: 12px; color: #666;">En cas de non-paiement sous 48h, des frais supplémentaires seront appliqués.</p>
    </div>
    <img src="{{TRACKING_PIXEL}}" width="1" height="1" style="display:none;">
</body>
</html>',
'Bonjour {{USER_NAME}},

Une facture de 487,50 € est en attente. Cliquez ici : {{PHISHING_LINK}}

Service Comptabilité',
'BUSINESS_EMAIL_COMPROMISE',
true,
NOW()),

-- Template 3: IT Support Scam
('Support Technique',
'Votre session va expirer - Reconnexion requise',
'<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #673AB7; color: white; padding: 15px;">
        <h2 style="margin: 0;">🔧 Support Technique</h2>
    </div>
    <div style="background: #fff; padding: 20px; border: 1px solid #ddd;">
        <p>Bonjour {{USER_NAME}},</p>
        <p>Nous avons détecté que votre session sur le portail entreprise va expirer dans <strong>2 heures</strong>.</p>
        <p>Pour maintenir l''accès à vos outils de travail, veuillez vous reconnecter en cliquant sur le bouton ci-dessous :</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{PHISHING_LINK}}" style="background: #673AB7; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Me reconnecter</a>
        </div>
        <p style="background: #FFF3E0; padding: 15px; border-left: 4px solid #FF9800;">
            <strong>⚠️ Note :</strong> Si vous ne vous reconnectez pas, vous perdrez l''accès à vos emails, dossiers partagés et applications métier.
        </p>
        <p style="color: #999; font-size: 11px; margin-top: 30px;">Support IT - Tél: 01.XX.XX.XX.XX</p>
    </div>
    <img src="{{TRACKING_PIXEL}}" width="1" height="1" style="display:none;">
</body>
</html>',
'Bonjour {{USER_NAME}},

Votre session va expirer. Reconnectez-vous : {{PHISHING_LINK}}

Support IT',
'CREDENTIAL_HARVESTING',
true,
NOW()),

-- Template 4: Package Delivery
('Livraison Colis',
'Colis en attente - Confirmer votre adresse',
'<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #FFEB3B; color: #333; padding: 15px; text-align: center;">
        <h1 style="margin: 0;">📦 Colis Express</h1>
    </div>
    <div style="background: #fff; padding: 20px; border: 1px solid #ddd;">
        <p>Bonjour {{USER_NAME}},</p>
        <p>Un colis est en attente de livraison à votre nom.</p>
        <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p style="margin: 5px 0;"><strong>Numéro de suivi :</strong> FR847596302847</p>
            <p style="margin: 5px 0;"><strong>Expéditeur :</strong> Amazon.fr</p>
            <p style="margin: 5px 0;"><strong>Statut :</strong> <span style="color: orange;">En attente</span></p>
        </div>
        <p>⚠️ Votre adresse de livraison nécessite une confirmation. Veuillez mettre à jour vos informations dans les 48h.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{PHISHING_LINK}}" style="background: #FF5722; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Confirmer mon adresse</a>
        </div>
        <p style="font-size: 12px; color: #666;">Si aucune action n''est effectuée, le colis sera retourné à l''expéditeur.</p>
    </div>
    <img src="{{TRACKING_PIXEL}}" width="1" height="1" style="display:none;">
</body>
</html>',
'Bonjour {{USER_NAME}},

Colis en attente. Confirmez votre adresse : {{PHISHING_LINK}}

Service Livraison',
'SPEAR_PHISHING',
true,
NOW()),

-- Template 5: CEO Fraud
('Message du PDG',
'RE: Transfert urgent',
'<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #37474F; color: white; padding: 15px;">
        <p style="margin: 0; font-size: 12px;">De: Jean Dupont &lt;jean.dupont@entreprise.fr&gt;</p>
        <p style="margin: 5px 0 0 0; font-size: 12px;">À: {{USER_EMAIL}}</p>
    </div>
    <div style="background: #fff; padding: 20px; border: 1px solid #ddd;">
        <p>{{USER_NAME}},</p>
        <p>J''ai besoin que vous effectuiez un <strong>transfert urgent</strong> avant la fin de journée.</p>
        <p>Je suis en déplacement et je n''ai pas accès au système bancaire. Pouvez-vous traiter cette opération en priorité ?</p>
        <div style="background: #FFEBEE; padding: 15px; margin: 20px 0; border-left: 4px solid #f44336;">
            <p style="margin: 0;"><strong>🔴 CONFIDENTIEL - URGENT</strong></p>
            <p style="margin: 10px 0 0 0;">Montant: 12 500 €<br>
            Bénéficiaire: Consultants SA<br>
            Motif: Facture consulting Q4</p>
        </div>
        <p>Merci de me confirmer dès que c''est fait. Les coordonnées bancaires sont dans le document ci-joint.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{PHISHING_LINK}}" style="background: #f44336; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">📄 Télécharger les coordonnées</a>
        </div>
        <p>Cordialement,<br>
        <strong>Jean Dupont</strong><br>
        PDG</p>
    </div>
    <img src="{{TRACKING_PIXEL}}" width="1" height="1" style="display:none;">
</body>
</html>',
'{{USER_NAME}},

Transfert urgent 12 500 € - Voir document : {{PHISHING_LINK}}

Jean Dupont, PDG',
'WHALING',
true,
NOW()),

-- Template 6: Microsoft 365 Login
('Alerte Microsoft 365',
'Activité suspecte détectée sur votre compte',
'<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: ''Segoe UI'', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f3f3f3;">
    <div style="background: white; padding: 0;">
        <div style="background: #0078D4; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Microsoft 365</h1>
        </div>
        <div style="padding: 30px;">
            <p>Bonjour {{USER_NAME}},</p>
            <p>Nous avons détecté une <strong>connexion inhabituelle</strong> à votre compte Microsoft 365 :</p>
            <table style="width: 100%; background: #FFF4E5; border: 1px solid #FFB300; margin: 20px 0;">
                <tr><td style="padding: 15px;">
                    <p style="margin: 0;"><strong>📍 Localisation :</strong> Russie (Moscou)</p>
                    <p style="margin: 10px 0 0 0;"><strong>🕐 Heure :</strong> Aujourd''hui à 03:47</p>
                    <p style="margin: 10px 0 0 0;"><strong>💻 Appareil :</strong> Chrome sur Windows</p>
                </td></tr>
            </table>
            <p><strong>Était-ce vous ?</strong></p>
            <p>Si vous reconnaissez cette activité, vous pouvez ignorer ce message. Sinon, nous vous recommandons de sécuriser votre compte immédiatement.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{PHISHING_LINK}}" style="background: #0078D4; color: white; padding: 15px 40px; text-decoration: none; border-radius: 2px; display: inline-block; font-weight: 600;">Sécuriser mon compte</a>
            </div>
            <p style="color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
                Microsoft Corporation<br>
                One Microsoft Way, Redmond, WA 98052
            </p>
        </div>
    </div>
    <img src="{{TRACKING_PIXEL}}" width="1" height="1" style="display:none;">
</body>
</html>',
'Bonjour {{USER_NAME}},

Connexion suspecte détectée (Russie). Sécurisez votre compte : {{PHISHING_LINK}}

Microsoft Security',
'CREDENTIAL_HARVESTING',
true,
NOW())
ON CONFLICT DO NOTHING;

\echo 'Phishing templates seeded successfully (6 templates created).'


