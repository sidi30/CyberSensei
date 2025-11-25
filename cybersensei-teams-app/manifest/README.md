# Manifest Teams - CyberSensei

Ce dossier contient le manifest et les assets pour l'application Microsoft Teams.

## Fichiers requis

- `manifest.json` - Le fichier manifest de l'application
- `color.png` - Icône couleur 192x192px
- `outline.png` - Icône outline 32x32px

## Variables à remplacer

Avant de créer le package, remplacez les variables suivantes dans `manifest.json` :

- `{{MICROSOFT_APP_ID}}` - L'ID de votre application Microsoft (Azure AD)
- `{{BOT_ID}}` - L'ID de votre bot (généralement le même que MICROSOFT_APP_ID)
- `{{HOSTNAME}}` - Le nom d'hôte où vos tabs sont hébergés (ex: myapp.azurewebsites.net)

## Création du package

Pour créer le package Teams (.zip) :

```bash
cd manifest
zip -r ../cybersensei-teams-app.zip manifest.json color.png outline.png
```

Ou utilisez le script fourni à la racine du projet :

```bash
npm run package
```

## Sideloading dans Teams

1. Ouvrez Microsoft Teams
2. Allez dans "Applications" (Apps)
3. Cliquez sur "Gérer vos applications"
4. Cliquez sur "Publier une application" > "Envoyer une application personnalisée"
5. Sélectionnez le fichier `cybersensei-teams-app.zip`
6. Suivez les instructions pour installer l'application

## Icônes

Les icônes doivent respecter les spécifications suivantes :

### color.png
- Dimensions : 192x192 pixels
- Format : PNG avec transparence
- Couleur de fond : #0078D4 (ou votre couleur d'accent)
- Contenu : Logo complet de l'application

### outline.png
- Dimensions : 32x32 pixels
- Format : PNG avec transparence
- Contenu : Logo en outline blanc sur fond transparent
- Épaisseur de trait : 1-2 pixels

