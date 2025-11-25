/**
 * Script pour créer le package Teams
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('📦 Création du package Microsoft Teams pour CyberSensei\n');

  // Lire les variables
  const appId = await question('Microsoft App ID: ');
  const botId = await question('Bot ID (appuyez sur Entrée pour utiliser App ID): ') || appId;
  const hostname = await question('Hostname (ex: myapp.azurewebsites.net): ');

  console.log('\n🔧 Configuration :');
  console.log(`   App ID: ${appId}`);
  console.log(`   Bot ID: ${botId}`);
  console.log(`   Hostname: ${hostname}\n`);

  // Lire le manifest
  const manifestPath = path.join(__dirname, '../manifest/manifest.json');
  let manifestContent = fs.readFileSync(manifestPath, 'utf8');

  // Remplacer les variables
  manifestContent = manifestContent
    .replace(/\{\{MICROSOFT_APP_ID\}\}/g, appId)
    .replace(/\{\{BOT_ID\}\}/g, botId)
    .replace(/\{\{HOSTNAME\}\}/g, hostname);

  // Créer un dossier temporaire
  const tempDir = path.join(__dirname, '../temp-package');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Écrire le manifest modifié
  const tempManifestPath = path.join(tempDir, 'manifest.json');
  fs.writeFileSync(tempManifestPath, manifestContent);

  // Copier les icônes
  const colorIconPath = path.join(__dirname, '../manifest/color.png');
  const outlineIconPath = path.join(__dirname, '../manifest/outline.png');

  if (!fs.existsSync(colorIconPath) || !fs.existsSync(outlineIconPath)) {
    console.error('❌ Erreur : Les icônes color.png et outline.png sont manquantes dans le dossier manifest/');
    console.error('   Veuillez créer ces icônes avant de créer le package.');
    rl.close();
    process.exit(1);
  }

  fs.copyFileSync(colorIconPath, path.join(tempDir, 'color.png'));
  fs.copyFileSync(outlineIconPath, path.join(tempDir, 'outline.png'));

  // Créer le ZIP
  const outputPath = path.join(__dirname, '../cybersensei-teams-app.zip');
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    console.log('✅ Package créé avec succès !');
    console.log(`   Fichier: ${outputPath}`);
    console.log(`   Taille: ${(archive.pointer() / 1024).toFixed(2)} KB\n`);
    console.log('🚀 Vous pouvez maintenant sideloader ce package dans Microsoft Teams.\n');

    // Nettoyer
    fs.rmSync(tempDir, { recursive: true, force: true });
    rl.close();
  });

  archive.on('error', (err) => {
    console.error('❌ Erreur lors de la création du package:', err);
    rl.close();
    process.exit(1);
  });

  archive.pipe(output);
  archive.directory(tempDir, false);
  archive.finalize();
}

main().catch((err) => {
  console.error('❌ Erreur:', err);
  rl.close();
  process.exit(1);
});

