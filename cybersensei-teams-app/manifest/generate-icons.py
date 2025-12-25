#!/usr/bin/env python3
"""
Génère les icônes placeholder pour le manifest Teams
"""

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("PIL/Pillow n'est pas installé. Installation...")
    import subprocess
    subprocess.check_call(['pip', 'install', 'pillow'])
    from PIL import Image, ImageDraw, ImageFont

def create_color_icon():
    """Crée l'icône couleur 192x192"""
    size = (192, 192)
    bg_color = (0, 120, 212)  # #0078D4
    text_color = (255, 255, 255)  # white
    
    img = Image.new('RGB', size, bg_color)
    draw = ImageDraw.Draw(img)
    
    # Dessiner "CS" au centre
    text = "CS"
    
    # Utiliser une police par défaut ou une police système
    try:
        font = ImageFont.truetype("arial.ttf", 80)
    except:
        try:
            font = ImageFont.truetype("Arial.ttf", 80)
        except:
            font = ImageFont.load_default()
    
    # Centrer le texte
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    position = ((size[0] - text_width) // 2, (size[1] - text_height) // 2 - 10)
    
    draw.text(position, text, fill=text_color, font=font)
    
    img.save('color.png')
    print("✅ color.png créé (192x192)")

def create_outline_icon():
    """Crée l'icône outline 32x32"""
    size = (32, 32)
    
    img = Image.new('RGBA', size, (0, 0, 0, 0))  # transparent
    draw = ImageDraw.Draw(img)
    
    # Dessiner un cercle avec bordure blanche
    circle_color = (255, 255, 255, 255)  # white
    draw.ellipse([2, 2, 30, 30], outline=circle_color, width=2)
    
    # Dessiner "CS" au centre
    text = "CS"
    
    try:
        font = ImageFont.truetype("arial.ttf", 12)
    except:
        try:
            font = ImageFont.truetype("Arial.ttf", 12)
        except:
            font = ImageFont.load_default()
    
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    position = ((size[0] - text_width) // 2, (size[1] - text_height) // 2 - 2)
    
    draw.text(position, text, fill=circle_color, font=font)
    
    img.save('outline.png')
    print("✅ outline.png créé (32x32)")

if __name__ == '__main__':
    import os
    
    # Se placer dans le dossier manifest
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    print("🎨 Génération des icônes Teams...")
    create_color_icon()
    create_outline_icon()
    print("\n✨ Icônes générées avec succès!")
    print("   - color.png (192x192)")
    print("   - outline.png (32x32)")

