/**
 * CyberSensei Teams - Package Creator
 * Creates the Teams app package (.zip) for deployment
 * 
 * USAGE:
 *   node scripts/package-app.js                          # Interactive mode
 *   node scripts/package-app.js --config config.json     # From config file
 *   node scripts/package-app.js --app-id xxx --hostname yyy  # CLI args
 * 
 * CONFIG FILE FORMAT (config.json):
 * {
 *   "microsoftAppId": "00000000-0000-0000-0000-000000000000",
 *   "botId": "00000000-0000-0000-0000-000000000000",
 *   "hostname": "myapp.azurewebsites.net"
 * }
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const readline = require('readline');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CLI Arguments Parser
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    interactive: true,
    configFile: null,
    microsoftAppId: null,
    botId: null,
    hostname: null,
    outputPath: null,
    skipIconCheck: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--config':
      case '-c':
        config.configFile = args[++i];
        config.interactive = false;
        break;
      case '--app-id':
        config.microsoftAppId = args[++i];
        config.interactive = false;
        break;
      case '--bot-id':
        config.botId = args[++i];
        break;
      case '--hostname':
        config.hostname = args[++i];
        config.interactive = false;
        break;
      case '--output':
      case '-o':
        config.outputPath = args[++i];
        break;
      case '--skip-icon-check':
        config.skipIconCheck = true;
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
    }
  }

  return config;
}

function showHelp() {
  console.log(`
CyberSensei Teams Package Creator

USAGE:
  node scripts/package-app.js [OPTIONS]

OPTIONS:
  --config, -c <file>     Load configuration from JSON file
  --app-id <id>           Microsoft App ID (Azure AD)
  --bot-id <id>           Bot ID (defaults to App ID)
  --hostname <hostname>   Hostname for tabs (e.g., myapp.azurewebsites.net)
  --output, -o <path>     Output path for the package
  --skip-icon-check       Skip icon validation
  --help, -h              Show this help

EXAMPLES:
  # Interactive mode
  node scripts/package-app.js

  # With CLI arguments
  node scripts/package-app.js --app-id "xxx" --hostname "myapp.com"

  # With config file
  node scripts/package-app.js --config deployment-config.json
`);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Interactive Mode
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function interactiveMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

  console.log('📦 Création du package Microsoft Teams pour CyberSensei\n');

  const appId = await question('Microsoft App ID: ');
  const botId = (await question('Bot ID (Entrée = même que App ID): ')) || appId;
  const hostname = await question('Hostname (ex: myapp.azurewebsites.net): ');

  rl.close();

  return { microsoftAppId: appId, botId, hostname };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Icon Generation (if missing)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function ensureIcons(manifestDir, skipCheck) {
  const colorIconPath = path.join(manifestDir, 'color.png');
  const outlineIconPath = path.join(manifestDir, 'outline.png');

  const colorExists = fs.existsSync(colorIconPath);
  const outlineExists = fs.existsSync(outlineIconPath);

  if (colorExists && outlineExists) {
    return true;
  }

  if (skipCheck) {
    console.log('⚠️  Icônes manquantes mais --skip-icon-check activé');
    return false;
  }

  console.log('⚠️  Icônes manquantes. Génération d\'icônes par défaut...');

  try {
    // Try to use sharp to generate placeholder icons
    const sharp = require('sharp');

    // Generate color icon (192x192, blue background)
    if (!colorExists) {
      const colorSvg = `
        <svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
          <rect width="192" height="192" fill="#0078D4"/>
          <text x="96" y="110" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle">CS</text>
        </svg>
      `;
      await sharp(Buffer.from(colorSvg)).png().toFile(colorIconPath);
      console.log('  ✓ color.png généré');
    }

    // Generate outline icon (32x32, white on transparent)
    if (!outlineExists) {
      const outlineSvg = `
        <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
          <text x="16" y="22" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">CS</text>
        </svg>
      `;
      await sharp(Buffer.from(outlineSvg)).png().toFile(outlineIconPath);
      console.log('  ✓ outline.png généré');
    }

    return true;
  } catch (err) {
    console.error('❌ Impossible de générer les icônes automatiquement.');
    console.error('   Installez sharp: npm install sharp');
    console.error('   Ou créez manuellement les fichiers:');
    console.error('   - manifest/color.png (192x192)');
    console.error('   - manifest/outline.png (32x32)');
    return false;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Package Creation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function createPackage(config) {
  const projectDir = path.join(__dirname, '..');
  const manifestDir = path.join(projectDir, 'manifest');
  const tempDir = path.join(projectDir, 'temp-package');
  const outputPath = config.outputPath || path.join(projectDir, 'cybersensei-teams-app.zip');

  console.log('\n🔧 Configuration:');
  console.log(`   App ID: ${config.microsoftAppId}`);
  console.log(`   Bot ID: ${config.botId}`);
  console.log(`   Hostname: ${config.hostname}\n`);

  // Ensure icons exist
  const hasIcons = await ensureIcons(manifestDir, config.skipIconCheck);

  // Read and process manifest
  const manifestPath = path.join(manifestDir, 'manifest.json');
  let manifestContent = fs.readFileSync(manifestPath, 'utf8');

  // Replace placeholders
  manifestContent = manifestContent
    .replace(/\{\{MICROSOFT_APP_ID\}\}/g, config.microsoftAppId)
    .replace(/\{\{BOT_ID\}\}/g, config.botId)
    .replace(/\{\{HOSTNAME\}\}/g, config.hostname);

  // Validate manifest
  try {
    const manifest = JSON.parse(manifestContent);
    console.log(`✓ Manifest valide (version ${manifest.version})`);
  } catch (err) {
    console.error('❌ Manifest JSON invalide:', err.message);
    process.exit(1);
  }

  // Create temp directory
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  fs.mkdirSync(tempDir, { recursive: true });

  // Write processed manifest
  fs.writeFileSync(path.join(tempDir, 'manifest.json'), manifestContent);

  // Copy icons if they exist
  if (hasIcons) {
    fs.copyFileSync(path.join(manifestDir, 'color.png'), path.join(tempDir, 'color.png'));
    fs.copyFileSync(path.join(manifestDir, 'outline.png'), path.join(tempDir, 'outline.png'));
  }

  // Create ZIP
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      // Cleanup
      fs.rmSync(tempDir, { recursive: true, force: true });

      console.log('\n✅ Package créé avec succès!');
      console.log(`   Fichier: ${outputPath}`);
      console.log(`   Taille: ${(archive.pointer() / 1024).toFixed(2)} KB\n`);
      console.log('🚀 Prochaines étapes:');
      console.log('   1. Ouvrez Microsoft Teams');
      console.log('   2. Applications > Gérer vos applications');
      console.log('   3. Publier une application > Envoyer une application personnalisée');
      console.log(`   4. Sélectionnez: ${outputPath}\n`);

      resolve(outputPath);
    });

    archive.on('error', (err) => {
      console.error('❌ Erreur lors de la création du package:', err);
      reject(err);
    });

    archive.pipe(output);
    archive.directory(tempDir, false);
    archive.finalize();
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function main() {
  const cliConfig = parseArgs();

  let config;

  // Load from config file if provided
  if (cliConfig.configFile) {
    try {
      const configPath = path.resolve(cliConfig.configFile);
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      console.log(`📄 Configuration chargée depuis: ${configPath}`);
    } catch (err) {
      console.error(`❌ Impossible de lire le fichier de configuration: ${err.message}`);
      process.exit(1);
    }
  } else if (cliConfig.interactive) {
    config = await interactiveMode();
  } else {
    config = {
      microsoftAppId: cliConfig.microsoftAppId,
      botId: cliConfig.botId || cliConfig.microsoftAppId,
      hostname: cliConfig.hostname,
    };
  }

  // Merge CLI options
  config.outputPath = cliConfig.outputPath || config.outputPath;
  config.skipIconCheck = cliConfig.skipIconCheck;

  // Validate required fields
  if (!config.microsoftAppId || !config.hostname) {
    console.error('❌ App ID et Hostname sont requis');
    process.exit(1);
  }

  // Default botId to appId
  config.botId = config.botId || config.microsoftAppId;

  await createPackage(config);
}

main().catch((err) => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
