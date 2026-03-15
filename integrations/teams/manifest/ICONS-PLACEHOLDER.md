# 🎨 Création des Icônes pour le Manifest Teams

**IMPORTANT** : Les fichiers `color.png` et `outline.png` sont requis mais ne sont pas inclus dans ce projet. Vous devez les créer avant de pouvoir packager l'application Teams.

## 📏 Spécifications

### color.png (Icône Couleur)

- **Dimensions** : 192 x 192 pixels
- **Format** : PNG avec transparence (facultative)
- **Couleur de fond** : #0078D4 (bleu Microsoft) ou votre couleur de marque
- **Usage** : Affichée dans la galerie d'applications Teams

**Contenu suggéré :**
- Logo CyberSensei complet
- Texte lisible (optionnel)
- Design professionnel et attrayant
- Doit être reconnaissable à petite échelle

### outline.png (Icône Outline)

- **Dimensions** : 32 x 32 pixels
- **Format** : PNG avec transparence (obligatoire)
- **Couleur** : Blanc (#FFFFFF) uniquement
- **Fond** : Transparent
- **Épaisseur de trait** : 1-2 pixels
- **Usage** : Icône dans la barre latérale Teams

**Contenu suggéré :**
- Version simplifiée/stylisée du logo
- Contours nets et clairs
- Doit rester lisible à 32x32px
- Style "line art" ou "outline"

## 🎨 Options de création

### Option 1 : Outils de design en ligne (Gratuit)

**Canva** (canva.com)
```
1. Créer un design personnalisé 192x192px
2. Ajouter votre logo ou créer un design
3. Utiliser le fond bleu #0078D4
4. Exporter en PNG
5. Répéter pour 32x32px (version simplifiée)
```

**Figma** (figma.com)
```
1. Créer un nouveau fichier
2. Frame de 192x192px
3. Importer logo ou créer design
4. Exporter en PNG 2x pour meilleure qualité
5. Créer version outline 32x32px
```

### Option 2 : Outils professionnels

**Adobe Illustrator / Photoshop**
- Créer les icônes selon les specs
- Exporter en PNG avec transparence
- Optimiser la taille du fichier

**Inkscape** (Gratuit et open-source)
- Outil vectoriel gratuit
- Parfait pour créer des icônes
- Export PNG de qualité

### Option 3 : Générateurs IA

**DALL-E / Midjourney**
```
Prompt suggéré :
"Professional app icon for cybersecurity training platform,
shield with graduation cap, blue color scheme #0078D4,
minimalist modern design, 192x192 pixels"
```

Puis simplifier pour la version outline avec un éditeur d'images.

### Option 4 : Icônes temporaires pour le développement

Si vous voulez tester rapidement, créez des icônes basiques :

#### Avec ImageMagick (ligne de commande)

```bash
# Installer ImageMagick
# Windows: choco install imagemagick
# Mac: brew install imagemagick
# Linux: apt-get install imagemagick

# Créer color.png (carré bleu avec texte)
convert -size 192x192 xc:#0078D4 \
  -pointsize 60 -fill white -gravity center \
  -annotate +0+0 "CS" \
  color.png

# Créer outline.png (bordure blanche)
convert -size 32x32 xc:transparent \
  -fill transparent -stroke white -strokewidth 2 \
  -draw "circle 16,16 16,4" \
  outline.png
```

#### Avec Python + Pillow

```python
# Installer : pip install pillow

from PIL import Image, ImageDraw, ImageFont

# color.png
img = Image.new('RGB', (192, 192), color='#0078D4')
draw = ImageDraw.Draw(img)
# Ajouter du texte ou des formes
img.save('color.png')

# outline.png
img = Image.new('RGBA', (32, 32), color=(0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw.ellipse([4, 4, 28, 28], outline='white', width=2)
img.save('outline.png')
```

## 🎯 Exemples de designs

### Design minimaliste
```
color.png:
┌─────────────────┐
│                 │
│   🛡️ + 🎓      │
│                 │
│  CyberSensei    │
│                 │
└─────────────────┘
```

### Design avec bouclier
```
outline.png (32x32):
┌──────┐
│  /\  │  ← Bouclier stylisé
│ /  \ │     en blanc
│ \  / │
│  \/  │
└──────┘
```

## 📝 Checklist de création

Avant de créer le package Teams, assurez-vous que :

- [ ] `color.png` existe dans `manifest/`
- [ ] Dimensions : 192 x 192 pixels exactement
- [ ] Format PNG
- [ ] Taille de fichier < 500 KB

- [ ] `outline.png` existe dans `manifest/`
- [ ] Dimensions : 32 x 32 pixels exactement
- [ ] Format PNG avec transparence
- [ ] Couleur blanche uniquement
- [ ] Fond transparent
- [ ] Taille de fichier < 100 KB

## 🔍 Validation

Après création, vérifiez :

```bash
# Vérifier les dimensions
file color.png outline.png

# Vérifier la taille
ls -lh color.png outline.png

# Prévisualiser
# Windows: color.png (double-clic)
# Mac: open color.png
# Linux: xdg-open color.png
```

## 🚀 Étapes suivantes

Une fois les icônes créées :

1. Placez-les dans le dossier `manifest/`
2. Vérifiez qu'elles sont nommées exactement `color.png` et `outline.png`
3. Lancez `npm run package` pour créer le package Teams
4. Le package `cybersensei-teams-app.zip` sera créé
5. Installez-le dans Teams via sideloading

## 💡 Conseils de design

### Pour color.png
- Utilisez des couleurs contrastées
- Le logo doit être centré
- Évitez trop de détails (lisibilité)
- Testez à différentes tailles
- Cohérence avec votre marque

### Pour outline.png
- Simplicité maximale
- Traits épais et nets
- Évitez les détails fins
- Doit être reconnaissable instantanément
- Testez sur fond clair et foncé

## 📚 Ressources

- [Microsoft Teams App Icons](https://learn.microsoft.com/microsoftteams/platform/concepts/build-and-test/apps-package#app-icons)
- [Teams Design Guidelines](https://learn.microsoft.com/microsoftteams/platform/concepts/design/design-teams-app-overview)
- [Icon Generator Tools](https://www.appicon.co/)
- [Flat Icon](https://www.flaticon.com/) - Icônes gratuites

## ⚠️ Attention

Le script `npm run package` **échouera** si les icônes sont manquantes.
Créez-les avant de continuer !

```bash
# Le script vérifie leur présence
npm run package
# ❌ Erreur : Les icônes color.png et outline.png sont manquantes

# Après création
npm run package
# ✅ Package créé avec succès !
```

---

**Besoin d'aide ?** Contactez l'équipe CyberSensei ou consultez la documentation Teams.

