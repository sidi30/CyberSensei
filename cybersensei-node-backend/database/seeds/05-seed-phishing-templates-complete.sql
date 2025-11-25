-- =============================================================================
-- Seed Phishing Templates with Complete HTML
-- =============================================================================

-- Template 1: Réinitialisation Urgente de Mot de Passe
INSERT INTO phishing_templates (label, subject, html_content, text_content, type, active, created_at)
VALUES (
    'Réinitialisation Urgente',
    '⚠️ ALERTE SÉCURITÉ - Votre compte expire dans 24h',
    '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation Urgente</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: #f44336; color: white; padding: 15px; text-align: center;">
            <h1 style="margin: 0;">⚠️ ALERTE SÉCURITÉ</h1>
        </div>
        <div style="padding: 30px 20px;">
            <p>Cher(e) <strong>{{USER_NAME}}</strong>,</p>
            <p>Votre compte <strong>{{USER_EMAIL}}</strong> expire dans <span style="color: red; font-weight: bold;">24 heures</span>.</p>
            <p>Pour éviter la suspension de votre compte, veuillez vérifier votre identité immédiatement en cliquant sur le bouton ci-dessous :</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{PHISHING_LINK}}" style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                    Vérifier mon compte
                </a>
            </div>
            <p style="color: #666; font-size: 12px;">Si vous ne vérifiez pas votre compte, celui-ci sera définitivement supprimé après 24h.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #999; font-size: 11px;">Service Informatique - Ne pas répondre à ce message</p>
        </div>
        <img src="{{TRACKING_PIXEL}}" width="1" height="1" style="display:none;" alt="" />
    </div>
</body>
</html>',
    'Cher(e) {{USER_NAME}}, Votre compte {{USER_EMAIL}} expire dans 24 heures. Veuillez vérifier votre identité immédiatement.',
    'CREDENTIAL_HARVESTING',
    true,
    NOW()
);

-- Template 2: Fausse Facture Impayée
INSERT INTO phishing_templates (label, subject, html_content, text_content, type, active, created_at)
VALUES (
    'Facture Impayée',
    '📧 Facture en attente - 487,50 € à régler',
    '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture en attente</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: #2196F3; color: white; padding: 15px;">
            <h2 style="margin: 0;">📧 Facture en attente</h2>
        </div>
        <div style="padding: 30px 20px;">
            <p>Bonjour <strong>{{USER_NAME}}</strong>,</p>
            <p>Une facture de <strong>487,50 €</strong> est en attente de paiement.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background: #f5f5f5;">
                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Numéro</strong></td>
                    <td style="padding: 10px; border: 1px solid #ddd;">INV-2024-5847</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Date</strong></td>
                    <td style="padding: 10px; border: 1px solid #ddd;">24/11/2024</td>
                </tr>
                <tr style="background: #f5f5f5;">
                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Montant</strong></td>
                    <td style="padding: 10px; border: 1px solid #ddd; color: red; font-weight: bold;">487,50 €</td>
                </tr>
            </table>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{PHISHING_LINK}}" style="background: #FF9800; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                    Télécharger la facture
                </a>
            </div>
            <p style="font-size: 12px; color: #666;">En cas de non-paiement sous 48h, des frais supplémentaires seront appliqués.</p>
        </div>
        <div style="background: #f9f9f9; padding: 15px; text-align: center; color: #666; font-size: 12px;">
            <p>{{COMPANY_NAME}}</p>
            <p>Service Comptabilité</p>
        </div>
        <img src="{{TRACKING_PIXEL}}" width="1" height="1" style="display:none;" alt="" />
    </div>
</body>
</html>',
    'Bonjour {{USER_NAME}}, Une facture de 487,50 € est en attente de paiement. Numéro: INV-2024-5847.',
    'BUSINESS_EMAIL_COMPROMISE',
    true,
    NOW()
);

-- Template 3: Microsoft 365 - Activité Suspecte
INSERT INTO phishing_templates (label, subject, html_content, text_content, type, active, created_at)
VALUES (
    'Microsoft 365 - Activité suspecte',
    'Microsoft 365 - Connexion inhabituelle détectée',
    '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Microsoft 365 - Activité suspecte</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Segoe UI'', Arial, sans-serif; background: #f3f3f3;">
    <div style="max-width: 600px; margin: 20px auto;">
        <div style="background: white; padding: 0;">
            <div style="background: #0078D4; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">Microsoft 365</h1>
            </div>
            <div style="padding: 30px;">
                <p>Bonjour <strong>{{USER_NAME}}</strong>,</p>
                <p>Nous avons détecté une <strong>connexion inhabituelle</strong> à votre compte Microsoft 365 :</p>
                <table style="width: 100%; background: #FFF4E5; border: 1px solid #FFB300; margin: 20px 0;">
                    <tr>
                        <td style="padding: 15px;">
                            <p style="margin: 0;"><strong>📍 Localisation :</strong> Russie (Moscou)</p>
                            <p style="margin: 10px 0 0 0;"><strong>🕐 Heure :</strong> Aujourd''hui à 03:47</p>
                            <p style="margin: 10px 0 0 0;"><strong>💻 Appareil :</strong> Chrome sur Windows</p>
                        </td>
                    </tr>
                </table>
                <p><strong>Était-ce vous ?</strong></p>
                <p>Si vous reconnaissez cette activité, vous pouvez ignorer ce message. Sinon, nous vous recommandons de sécuriser votre compte immédiatement.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{PHISHING_LINK}}" style="background: #0078D4; color: white; padding: 15px 40px; text-decoration: none; border-radius: 2px; display: inline-block; font-weight: 600;">
                        Sécuriser mon compte
                    </a>
                </div>
                <p style="color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
                    Microsoft Corporation<br>
                    One Microsoft Way, Redmond, WA 98052
                </p>
            </div>
        </div>
        <img src="{{TRACKING_PIXEL}}" width="1" height="1" style="display:none;" alt="" />
    </div>
</body>
</html>',
    'Bonjour {{USER_NAME}}, Connexion inhabituelle détectée sur votre compte Microsoft 365 depuis la Russie (Moscou) à 03:47.',
    'SPEAR_PHISHING',
    true,
    NOW()
);

-- Template 4: Faux colis DHL
INSERT INTO phishing_templates (label, subject, html_content, text_content, type, active, created_at)
VALUES (
    'Colis DHL en attente',
    '📦 DHL - Votre colis est en attente de livraison',
    '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DHL - Colis en attente</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: #FFCC00; padding: 20px; text-align: center;">
            <h1 style="margin: 0; color: #D40511;">DHL Express</h1>
        </div>
        <div style="padding: 30px 20px;">
            <p>Bonjour <strong>{{USER_NAME}}</strong>,</p>
            <p>Votre colis <strong>#DHL847592847</strong> est en attente de livraison.</p>
            <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #D40511;">
                <p style="margin: 0;"><strong>Statut :</strong> En attente de confirmation</p>
                <p style="margin: 10px 0 0 0;"><strong>Destination :</strong> {{USER_EMAIL}}</p>
                <p style="margin: 10px 0 0 0;"><strong>Frais de douane :</strong> 3,50 €</p>
            </div>
            <p>Pour recevoir votre colis, veuillez régler les frais de douane en cliquant sur le bouton ci-dessous :</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{PHISHING_LINK}}" style="background: #D40511; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                    Payer et suivre mon colis
                </a>
            </div>
            <p style="font-size: 12px; color: #666;">Si vous ne réglez pas sous 48h, votre colis sera retourné à l''expéditeur.</p>
        </div>
        <div style="background: #f9f9f9; padding: 15px; text-align: center; color: #666; font-size: 12px;">
            <p>DHL Express - Service Client</p>
        </div>
        <img src="{{TRACKING_PIXEL}}" width="1" height="1" style="display:none;" alt="" />
    </div>
</body>
</html>',
    'Bonjour {{USER_NAME}}, Votre colis DHL #DHL847592847 est en attente. Frais de douane: 3,50 €.',
    'CREDENTIAL_HARVESTING',
    true,
    NOW()
);

-- Template 5: Faux remboursement d'impôts
INSERT INTO phishing_templates (label, subject, html_content, text_content, type, active, created_at)
VALUES (
    'Remboursement Impôts',
    '💰 Remboursement d''impôts - 523,40 € à percevoir',
    '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Remboursement Impôts</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: #000091; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">RÉPUBLIQUE FRANÇAISE</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Direction Générale des Finances Publiques</p>
        </div>
        <div style="padding: 30px 20px;">
            <p>Madame, Monsieur <strong>{{USER_NAME}}</strong>,</p>
            <p>Suite à la vérification de votre déclaration fiscale, nous avons constaté un <strong>trop-perçu d''impôts</strong>.</p>
            <div style="background: #E8F5E9; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center;">
                <p style="margin: 0; font-size: 14px;">Montant du remboursement</p>
                <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #4CAF50;">523,40 €</p>
            </div>
            <p>Pour percevoir ce remboursement, veuillez confirmer vos coordonnées bancaires :</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{PHISHING_LINK}}" style="background: #000091; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                    Percevoir mon remboursement
                </a>
            </div>
            <p style="font-size: 12px; color: #666;">Numéro de dossier : 2024-FR-{{USER_EMAIL}}</p>
        </div>
        <div style="background: #f9f9f9; padding: 15px; text-align: center; color: #666; font-size: 12px;">
            <p>Ministère de l''Économie, des Finances et de la Souveraineté Industrielle et Numérique</p>
        </div>
        <img src="{{TRACKING_PIXEL}}" width="1" height="1" style="display:none;" alt="" />
    </div>
</body>
</html>',
    'Madame, Monsieur {{USER_NAME}}, Vous avez un remboursement d''impôts de 523,40 € à percevoir.',
    'CREDENTIAL_HARVESTING',
    true,
    NOW()
);

-- Template 6: LinkedIn Premium
INSERT INTO phishing_templates (label, subject, html_content, text_content, type, active, created_at)
VALUES (
    'LinkedIn Premium',
    '💼 Profitez de 3 mois gratuits LinkedIn Premium',
    '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LinkedIn Premium</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f2ef;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: #0A66C2; color: white; padding: 20px;">
            <h1 style="margin: 0; font-size: 28px;">in</h1>
        </div>
        <div style="padding: 30px 20px;">
            <p>Bonjour <strong>{{USER_NAME}}</strong>,</p>
            <p>Bonne nouvelle ! Vous avez été sélectionné(e) pour bénéficier de <strong>3 mois gratuits</strong> de LinkedIn Premium.</p>
            <div style="background: #FFF7E6; padding: 20px; margin: 20px 0; border-left: 4px solid #F5A623;">
                <p style="margin: 0;"><strong>Avantages inclus :</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>InMail illimités</li>
                    <li>Voir qui a consulté votre profil</li>
                    <li>Accès aux formations en ligne</li>
                    <li>Badge Premium sur votre profil</li>
                </ul>
            </div>
            <p>Cette offre est <strong>limitée aux 500 premiers inscrits</strong>. Ne manquez pas cette opportunité !</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{PHISHING_LINK}}" style="background: #0A66C2; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                    Activer LinkedIn Premium
                </a>
            </div>
            <p style="font-size: 12px; color: #666;">Offre valable jusqu''au 31/12/2024</p>
        </div>
        <div style="background: #f9f9f9; padding: 15px; text-align: center; color: #666; font-size: 12px;">
            <p>© 2024 LinkedIn Corporation</p>
        </div>
        <img src="{{TRACKING_PIXEL}}" width="1" height="1" style="display:none;" alt="" />
    </div>
</body>
</html>',
    'Bonjour {{USER_NAME}}, Profitez de 3 mois gratuits LinkedIn Premium. Offre limitée.',
    'SPEAR_PHISHING',
    true,
    NOW()
);

-- =============================================================================
-- Verification Query
-- =============================================================================

-- SELECT 
--     id,
--     label,
--     subject,
--     type,
--     active,
--     LENGTH(html_content) as html_length,
--     created_at
-- FROM phishing_templates
-- ORDER BY created_at DESC;


