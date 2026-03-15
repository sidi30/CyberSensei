#!/usr/bin/env node
/**
 * Génère les icônes placeholder pour le manifest Teams
 * Utilise le module sharp (npm install sharp)
 */

const fs = require('fs');
const path = require('path');

// Vérifier si sharp est installé
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.log('⚠️  Le module "sharp" n\'est pas installé.');
  console.log('   Installation: npm install sharp');
  console.log('\n📝 Création de fichiers placeholder SVG à la place...\n');
  
  // Créer des fichiers SVG comme placeholder
  createSvgIcons();
  process.exit(0);
}

async function createColorIcon() {
  const width = 192;
  const height = 192;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#0078D4"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="white">
        CS
      </text>
    </svg>
  `;
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(__dirname, 'color.png'));
  
  console.log('✅ color.png créé (192x192)');
}

async function createOutlineIcon() {
  const width = 32;
  const height = 32;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="none" stroke="white" stroke-width="2"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="white">
        CS
      </text>
    </svg>
  `;
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(__dirname, 'outline.png'));
  
  console.log('✅ outline.png créé (32x32)');
}

function createSvgIcons() {
  // Créer color.svg (peut être utilisé temporairement)
  const colorSvg = `<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" fill="#0078D4"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
        font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="white">
    CS
  </text>
</svg>`;
  
  const outlineSvg = `<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <circle cx="16" cy="16" r="14" fill="none" stroke="white" stroke-width="2"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
        font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="white">
    CS
  </text>
</svg>`;
  
  fs.writeFileSync(path.join(__dirname, 'color.svg'), colorSvg);
  fs.writeFileSync(path.join(__dirname, 'outline.svg'), outlineSvg);
  
  console.log('📝 Fichiers SVG créés:');
  console.log('   - color.svg (192x192)');
  console.log('   - outline.svg (32x32)');
  console.log('\n⚠️  Teams nécessite des fichiers PNG.');
  console.log('   Convertissez les SVG en PNG avec un outil en ligne:');
  console.log('   https://cloudconvert.com/svg-to-png');
  console.log('\n   Ou installez sharp: npm install sharp');
}

async function main() {
  try {
    console.log('🎨 Génération des icônes Teams...\n');
    await createColorIcon();
    await createOutlineIcon();
    console.log('\n✨ Icônes générées avec succès!');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n📝 Création de fichiers SVG à la place...\n');
    createSvgIcons();
  }
}

if (require.main === module) {
  main();
}

