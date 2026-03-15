# 📸 Dossier des Images d'Exercices CyberSensei

Ce dossier contient les images utilisées dans les exercices de sensibilisation à la cybersécurité.

## 🗂️ Structure

Les images sont organisées par catégorie :

- **Phishing** : Exemples d'emails de phishing
- **Fake Login** : Fausses pages de connexion
- **Suspicious Links** : Exemples de liens suspects
- **Social Engineering** : Illustrations d'ingénierie sociale
- **Fake Invoices** : Fausses factures
- **Malicious Attachments** : Pièces jointes dangereuses
- **Ransomware** : Écrans de ransomware
- **Remote Work** : Risques du télétravail

## 📝 Convention de nommage

Format : `{categorie}_{description}_{numero}.png`

Exemples :
- `phishing_email_microsoft.png`
- `fake_login_office365.png`
- `suspicious_url_example1.png`

## 🎨 Format recommandé

- **Format** : PNG ou JPG
- **Résolution** : 800-1200px de largeur recommandée
- **Poids** : < 500 KB par image (optimisez avec TinyPNG si nécessaire)

## 🔗 Utilisation dans les exercices

Dans le `payload_json` des exercices, référencez les images comme ceci :

```json
{
  "questions": [
    {
      "text": "Tu reçois cet email. Est-il suspect ?",
      "imageUrl": "/assets/images/phishing_email_microsoft.png",
      "imageDescription": "Faux email Microsoft avec urgence et fautes"
    }
  ]
}
```

## 🌐 Sources d'images

Pour créer vos propres exemples :

1. **Captures d'écran simulées** : Utilisez des outils comme Figma, Canva
2. **Images libres de droits** : Unsplash, Pexels (pour illustrations)
3. **Créations personnalisées** : Créez vos propres faux emails/pages

⚠️ **IMPORTANT** : N'utilisez JAMAIS de vraies captures d'écran contenant des données sensibles ou personnelles.

## 📦 Images par défaut

Pour démarrer, vous pouvez utiliser des images de placeholder :

- `placeholder_phishing.png` - Image générique pour phishing
- `placeholder_fake_login.png` - Image générique pour fausse page
- `placeholder_suspicious_link.png` - Image générique pour lien suspect

Ces images seront remplacées progressivement par des exemples réels.

## 🚀 Ajout d'une nouvelle image

1. Ajoutez l'image dans ce dossier
2. Ajoutez une entrée dans la table `exercise_images` :
   ```sql
   INSERT INTO exercise_images (filename, display_name, description, category, image_url) 
   VALUES ('mon_image.png', 'Nom affiché', 'Description', 'categorie', '/assets/images/mon_image.png');
   ```
3. Référencez-la dans un exercice via `imageUrl` dans le `payload_json`

---

**Besoin d'aide pour créer des images ?** Contactez l'équipe de design ou consultez le guide de création d'images.




