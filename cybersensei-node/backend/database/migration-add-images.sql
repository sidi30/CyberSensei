-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION : AJOUT DU SYSTÈME D'IMAGES POUR LES EXERCICES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Table pour stocker les images d'exemples (captures d'écran, faux emails, etc.)
CREATE TABLE IF NOT EXISTS exercise_images (
    id BIGSERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'phishing', 'fake_login', 'fake_email', 'social_engineering', etc.
    image_url TEXT NOT NULL, -- URL publique de l'image (peut être stockée localement ou sur CDN)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances de recherche par catégorie
CREATE INDEX IF NOT EXISTS idx_exercise_images_category ON exercise_images(category);

-- Commentaires pour la documentation
COMMENT ON TABLE exercise_images IS 'Stocke les images utilisées dans les exercices de sensibilisation (captures d''écran, exemples visuels)';
COMMENT ON COLUMN exercise_images.filename IS 'Nom du fichier image (unique)';
COMMENT ON COLUMN exercise_images.display_name IS 'Nom d''affichage pour l''utilisateur';
COMMENT ON COLUMN exercise_images.description IS 'Description de ce que montre l''image';
COMMENT ON COLUMN exercise_images.category IS 'Catégorie de l''image (phishing, fake_login, social_engineering, etc.)';
COMMENT ON COLUMN exercise_images.image_url IS 'URL complète de l''image (locale ou CDN)';

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEED INITIAL : EXEMPLES D'IMAGES
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO exercise_images (filename, display_name, description, category, image_url) VALUES
-- Phishing Emails
('phishing_email_microsoft.png', 'Faux email Microsoft', 'Email de phishing se faisant passer pour Microsoft avec urgence et fautes d''orthographe', 'phishing', '/assets/images/phishing_email_microsoft.png'),
('phishing_email_paypal.png', 'Faux email PayPal', 'Email de phishing imitant PayPal avec demande de vérification de compte', 'phishing', '/assets/images/phishing_email_paypal.png'),
('phishing_email_dhl.png', 'Faux email DHL', 'Email de phishing de fausse livraison DHL avec lien suspect', 'phishing', '/assets/images/phishing_email_dhl.png'),
('phishing_email_boss.png', 'Faux email du patron', 'Email de phishing usurpant l''identité du patron demandant des cartes cadeaux', 'phishing', '/assets/images/phishing_email_boss.png'),

-- Fausses pages de connexion
('fake_login_microsoft.png', 'Fausse page Microsoft', 'Page de connexion Microsoft contrefaite pour voler les identifiants', 'fake_login', '/assets/images/fake_login_microsoft.png'),
('fake_login_office365.png', 'Fausse page Office 365', 'Page de connexion Office 365 frauduleuse avec URL suspecte', 'fake_login', '/assets/images/fake_login_office365.png'),
('fake_login_linkedin.png', 'Fausse page LinkedIn', 'Page de connexion LinkedIn contrefaite', 'fake_login', '/assets/images/fake_login_linkedin.png'),

-- Liens suspects
('suspicious_url_example1.png', 'URL suspecte avec caractère Unicode', 'Exemple d''URL avec caractère Unicode ressemblant à microsoft.com', 'suspicious_link', '/assets/images/suspicious_url_example1.png'),
('suspicious_url_example2.png', 'URL suspecte avec faute', 'Exemple d''URL avec faute d''orthographe (amaz0n.com)', 'suspicious_link', '/assets/images/suspicious_url_example2.png'),

-- Ingénierie sociale
('social_eng_livreur.png', 'Livreur suspect', 'Photo illustrant un livreur demandant l''accès à une zone sécurisée', 'social_engineering', '/assets/images/social_eng_livreur.png'),
('social_eng_badge.png', 'Badge falsifié', 'Exemple de badge d''accès falsifié', 'social_engineering', '/assets/images/social_eng_badge.png'),

-- Fausses factures
('fake_invoice_1.png', 'Fausse facture fournisseur', 'Facture frauduleuse imitant un fournisseur connu', 'fake_invoice', '/assets/images/fake_invoice_1.png'),
('fake_invoice_rib.png', 'Email de changement de RIB', 'Email frauduleux annonçant un changement de RIB bancaire', 'fake_invoice', '/assets/images/fake_invoice_rib.png'),

-- Pièces jointes dangereuses
('malicious_attachment_1.png', 'Pièce jointe double extension', 'Fichier avec double extension .pdf.exe', 'malicious_attachment', '/assets/images/malicious_attachment_1.png'),
('malicious_attachment_macro.png', 'Document avec macros', 'Document Word demandant d''activer les macros', 'malicious_attachment', '/assets/images/malicious_attachment_macro.png'),

-- Ransomware
('ransomware_screen.png', 'Écran de ransomware', 'Message de ransomware demandant une rançon', 'ransomware', '/assets/images/ransomware_screen.png'),

-- Télétravail
('wifi_public_danger.png', 'Wi-Fi public non sécurisé', 'Illustration des dangers du Wi-Fi public', 'remote_work', '/assets/images/wifi_public_danger.png'),
('screen_privacy.png', 'Protection d''écran', 'Illustration de l''importance de protéger son écran en public', 'remote_work', '/assets/images/screen_privacy.png');

-- Vérification
SELECT category, COUNT(*) as nb_images FROM exercise_images GROUP BY category ORDER BY category;




