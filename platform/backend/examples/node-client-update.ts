/**
 * Exemple d'implémentation d'un client Node pour les mises à jour
 * 
 * Utilisation:
 * ts-node examples/node-client-update.ts
 */

import axios from 'axios';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as AdmZip from 'adm-zip';
import * as path from 'path';

// Configuration
const BACKEND_URL = 'http://localhost:3000';
const TENANT_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; // Depuis seed data
const CURRENT_VERSION = '1.0.0';
const INSTALL_DIR = '/opt/cybersensei'; // Répertoire d'installation

interface UpdateCheckResponse {
  available: boolean;
  updateId?: string;
  currentVersion: string;
  latestVersion?: string;
  changelog?: string;
  fileSize?: number;
  checksum?: string;
  requiredNodeVersion?: string;
  breaking?: boolean;
  securityUpdate?: boolean;
  message?: string;
}

class CyberSenseiUpdateClient {
  private tenantId: string;
  private currentVersion: string;
  private backendUrl: string;

  constructor(tenantId: string, currentVersion: string, backendUrl: string) {
    this.tenantId = tenantId;
    this.currentVersion = currentVersion;
    this.backendUrl = backendUrl;
  }

  /**
   * Vérifier si une mise à jour est disponible
   */
  async checkForUpdates(): Promise<UpdateCheckResponse> {
    try {
      console.log('🔍 Vérification des mises à jour...');
      
      const response = await axios.get(`${this.backendUrl}/update/check`, {
        params: {
          tenantId: this.tenantId,
          version: this.currentVersion,
        },
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(
          `Erreur serveur: ${error.response.status} - ${error.response.data.message}`,
        );
      }
      throw new Error(`Erreur réseau: ${error.message}`);
    }
  }

  /**
   * Télécharger une mise à jour
   */
  async downloadUpdate(
    updateId: string,
    outputPath: string,
  ): Promise<boolean> {
    try {
      console.log(`⬇️  Téléchargement de la mise à jour: ${updateId}...`);

      const response = await axios.get(
        `${this.backendUrl}/update/download/${updateId}`,
        {
          responseType: 'stream',
        },
      );

      // Récupérer les métadonnées depuis les headers
      const version = response.headers['x-update-version'];
      const expectedChecksum = response.headers['x-checksum'];
      const contentLength = response.headers['content-length'];

      console.log(`Version: ${version}`);
      console.log(`Taille: ${(parseInt(contentLength) / 1024 / 1024).toFixed(2)} MB`);

      // Écrire le fichier
      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      console.log(`✅ Fichier téléchargé: ${outputPath}`);

      // Vérifier le checksum
      if (expectedChecksum) {
        console.log('🔐 Vérification du checksum...');
        const actualChecksum = await this.calculateChecksum(outputPath);

        if (actualChecksum === expectedChecksum) {
          console.log('✅ Checksum vérifié');
          return true;
        } else {
          console.error('❌ Checksum invalide!');
          console.error(`Attendu: ${expectedChecksum}`);
          console.error(`Reçu: ${actualChecksum}`);
          fs.unlinkSync(outputPath); // Supprimer le fichier corrompu
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error(`❌ Erreur de téléchargement: ${error.message}`);
      return false;
    }
  }

  /**
   * Calculer le checksum SHA-256 d'un fichier
   */
  private calculateChecksum(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);

      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve('sha256:' + hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * Extraire et lire version.json du ZIP
   */
  private readVersionFromZip(zipPath: string): any {
    const zip = new AdmZip(zipPath);
    const versionEntry = zip.getEntry('version.json');

    if (!versionEntry) {
      throw new Error('version.json non trouvé dans le ZIP');
    }

    const content = versionEntry.getData().toString('utf8');
    return JSON.parse(content);
  }

  /**
   * Créer un backup du répertoire d'installation
   */
  private async createBackup(dir: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `${dir}_backup_${timestamp}`;

    console.log(`💾 Création du backup: ${backupDir}`);

    // Copier le répertoire (implémentation simplifiée)
    // En production, utiliser fs-extra ou un outil de backup approprié
    
    return backupDir;
  }

  /**
   * Appliquer la mise à jour
   */
  async applyUpdate(zipPath: string, installDir: string): Promise<void> {
    try {
      console.log('📦 Application de la mise à jour...');

      // 1. Lire version.json
      const versionData = this.readVersionFromZip(zipPath);
      console.log(`Version: ${versionData.version}`);
      console.log(`Changelog:\n${versionData.changelog}\n`);

      // 2. Créer un backup
      if (fs.existsSync(installDir)) {
        await this.createBackup(installDir);
      }

      // 3. Extraire le ZIP
      console.log('📂 Extraction des fichiers...');
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(installDir, true);

      console.log(`✅ Mise à jour ${versionData.version} appliquée avec succès`);

      // 4. Mettre à jour la version courante
      this.currentVersion = versionData.version;

      // 5. Note: Redémarrage du service requis
      console.log('ℹ️  Redémarrage du service requis pour appliquer les changements');
    } catch (error) {
      console.error(`❌ Erreur lors de l'application: ${error.message}`);
      throw error;
    }
  }

  /**
   * Workflow complet de mise à jour
   */
  async performUpdateIfAvailable(): Promise<void> {
    try {
      // 1. Vérifier les mises à jour
      const check = await this.checkForUpdates();

      if (!check.available) {
        console.log(check.message || '✅ Node à jour');
        return;
      }

      // 2. Afficher les informations
      console.log('\n📦 Mise à jour disponible!');
      console.log(`Version actuelle: ${check.currentVersion}`);
      console.log(`Nouvelle version: ${check.latestVersion}`);
      console.log(`Taille: ${(check.fileSize / 1024 / 1024).toFixed(2)} MB`);

      if (check.breaking) {
        console.log('⚠️  ATTENTION: Breaking changes inclus!');
      }

      if (check.securityUpdate) {
        console.log('🔒 Mise à jour de sécurité');
      }

      console.log(`\nChangelog:\n${check.changelog}\n`);

      // 3. Télécharger
      const tmpDir = '/tmp';
      const zipPath = path.join(tmpDir, `cybersensei-update-${check.latestVersion}.zip`);

      const downloadSuccess = await this.downloadUpdate(check.updateId, zipPath);

      if (!downloadSuccess) {
        throw new Error('Échec du téléchargement');
      }

      // 4. Appliquer
      await this.applyUpdate(zipPath, INSTALL_DIR);

      // 5. Nettoyer
      fs.unlinkSync(zipPath);
      console.log('🧹 Nettoyage effectué');

      console.log('\n🎉 Mise à jour terminée avec succès!');
      console.log('🔄 Veuillez redémarrer le service pour appliquer les changements.');
    } catch (error) {
      console.error(`\n❌ Erreur: ${error.message}`);
      process.exit(1);
    }
  }
}

// Exécution
async function main() {
  console.log('🚀 CyberSensei Update Client\n');

  const client = new CyberSenseiUpdateClient(
    TENANT_ID,
    CURRENT_VERSION,
    BACKEND_URL,
  );

  await client.performUpdateIfAvailable();
}

// Exécution si lancé directement
if (require.main === module) {
  main().catch((error) => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
}

export { CyberSenseiUpdateClient };

