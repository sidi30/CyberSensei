/**
 * Script de setup initial
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setup de CyberSensei Teams App\n');

// Créer le fichier .env s'il n'existe pas
const envPath = path.join(__dirname, '../.env');
const envExamplePath = path.join(__dirname, '../.env.example');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  console.log('📝 Création du fichier .env...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ Fichier .env créé. Veuillez le configurer avec vos valeurs.\n');
} else if (fs.existsSync(envPath)) {
  console.log('ℹ️  Le fichier .env existe déjà.\n');
}

// Installer les dépendances
console.log('📦 Installation des dépendances...\n');

const modules = [
  { name: 'common', path: path.join(__dirname, '../common') },
  { name: 'bot', path: path.join(__dirname, '../bot') },
  { name: 'tabs/employee', path: path.join(__dirname, '../tabs/employee') },
  { name: 'tabs/manager', path: path.join(__dirname, '../tabs/manager') },
];

for (const module of modules) {
  if (fs.existsSync(module.path)) {
    console.log(`📦 Installation des dépendances pour ${module.name}...`);
    try {
      execSync('npm install', { cwd: module.path, stdio: 'inherit' });
      console.log(`✅ ${module.name} - OK\n`);
    } catch (error) {
      console.error(`❌ Erreur lors de l'installation de ${module.name}`);
    }
  }
}

console.log('\n✅ Setup terminé !\n');
console.log('Prochaines étapes :');
console.log('1. Configurez le fichier .env avec vos valeurs');
console.log('2. Créez les icônes dans manifest/color.png et manifest/outline.png');
console.log('3. Lancez npm run build pour compiler l\'application');
console.log('4. Lancez npm run package pour créer le package Teams\n');

