import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { UpdateMetadata } from '../../entities/update-metadata.entity';
import { Tenant } from '../../entities/tenant.entity';
import { License, LicenseStatus } from '../../entities/license.entity';
import { Readable } from 'stream';
import * as crypto from 'crypto';
import * as AdmZip from 'adm-zip';
import { VersionMetadata } from './interfaces/version-metadata.interface';
import { ExerciseService } from '../exercise/exercise.service';

@Injectable()
export class UpdateService {
  private readonly logger = new Logger(UpdateService.name);

  constructor(
    @InjectRepository(UpdateMetadata)
    private updateMetadataRepository: Repository<UpdateMetadata>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(License)
    private licenseRepository: Repository<License>,
    @InjectConnection()
    private mongoConnection: Connection,
    @Inject(forwardRef(() => ExerciseService))
    private exerciseService: ExerciseService,
  ) {}

  private getGridFSBucket() {
    return new this.mongoConnection.mongo.GridFSBucket(
      this.mongoConnection.db,
      {
        bucketName: 'update_packages',
      },
    );
  }

  /**
   * Extraire et valider le fichier version.json du ZIP
   */
  private extractVersionMetadata(fileBuffer: Buffer): VersionMetadata {
    try {
      const zip = new AdmZip(fileBuffer);
      const versionEntry = zip.getEntry('version.json');

      if (!versionEntry) {
        throw new BadRequestException(
          'Le fichier ZIP doit contenir un fichier version.json à la racine',
        );
      }

      const versionContent = versionEntry.getData().toString('utf8');
      const metadata: VersionMetadata = JSON.parse(versionContent);

      // Validation des champs requis
      if (!metadata.version) {
        throw new BadRequestException(
          'version.json doit contenir le champ "version"',
        );
      }

      if (!metadata.changelog) {
        throw new BadRequestException(
          'version.json doit contenir le champ "changelog"',
        );
      }

      if (!metadata.requiredNodeVersion) {
        throw new BadRequestException(
          'version.json doit contenir le champ "requiredNodeVersion"',
        );
      }

      // Valider le format de version (semver basique)
      const versionRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/;
      if (!versionRegex.test(metadata.version)) {
        throw new BadRequestException(
          'Format de version invalide. Utilisez le format semver (ex: 1.2.3)',
        );
      }

      if (!versionRegex.test(metadata.requiredNodeVersion)) {
        throw new BadRequestException(
          'Format de requiredNodeVersion invalide. Utilisez le format semver (ex: 1.0.0)',
        );
      }

      return metadata;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Erreur lors de l'extraction de version.json: ${error.message}`,
      );
    }
  }

  /**
   * Comparer deux versions semver
   * Retourne: -1 si v1 < v2, 0 si égales, 1 si v1 > v2
   */
  private compareVersions(v1: string, v2: string): number {
    const cleanVersion = (v: string) => v.split('-')[0]; // Ignore pre-release tags
    const parts1 = cleanVersion(v1).split('.').map(Number);
    const parts2 = cleanVersion(v2).split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      if (parts1[i] > parts2[i]) return 1;
      if (parts1[i] < parts2[i]) return -1;
    }

    return 0;
  }

  /**
   * Upload d'un package de mise à jour (SUPERADMIN only)
   */
  async upload(file: Express.Multer.File, checksum?: string) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    // Validation du type de fichier
    if (!file.originalname.endsWith('.zip')) {
      throw new BadRequestException(
        'Le fichier doit être au format ZIP',
      );
    }

    // Extraction et validation des métadonnées
    this.logger.log('Extraction des métadonnées depuis version.json...');
    const versionMetadata = this.extractVersionMetadata(file.buffer);

    this.logger.log(
      `Métadonnées extraites: version=${versionMetadata.version}, requiredNodeVersion=${versionMetadata.requiredNodeVersion}`,
    );

    // Vérifier si la version existe déjà
    const existing = await this.updateMetadataRepository.findOne({
      where: { version: versionMetadata.version },
    });

    if (existing) {
      throw new ConflictException(
        `Une mise à jour avec la version ${versionMetadata.version} existe déjà`,
      );
    }

    // Calculer le checksum si non fourni
    const fileChecksum =
      checksum ||
      'sha256:' +
        crypto.createHash('sha256').update(file.buffer).digest('hex');

    this.logger.log(`Checksum: ${fileChecksum}`);

    // Upload vers MongoDB GridFS
    this.logger.log('Upload vers MongoDB GridFS...');
    const bucket = this.getGridFSBucket();
    const uploadStream = bucket.openUploadStream(file.originalname, {
      contentType: 'application/zip',
      metadata: {
        version: versionMetadata.version,
        requiredNodeVersion: versionMetadata.requiredNodeVersion,
        uploadedAt: new Date(),
      },
    });

    const readStream = Readable.from(file.buffer);
    await new Promise((resolve, reject) => {
      readStream
        .pipe(uploadStream)
        .on('finish', resolve)
        .on('error', reject);
    });

    this.logger.log(
      `Fichier uploadé dans GridFS avec l'ID: ${uploadStream.id}`,
    );

    // Sauvegarder les métadonnées dans PostgreSQL
    const metadata = this.updateMetadataRepository.create({
      version: versionMetadata.version,
      changelog: versionMetadata.changelog,
      filename: file.originalname,
      fileSize: file.size,
      mongoFileId: uploadStream.id.toString(),
      checksum: fileChecksum,
      active: true,
      metadata: {
        requiredNodeVersion: versionMetadata.requiredNodeVersion,
        platform: versionMetadata.platform,
        architecture: versionMetadata.architecture,
        dependencies: versionMetadata.dependencies,
        breaking: versionMetadata.breaking,
        securityUpdate: versionMetadata.securityUpdate,
        createdAt: versionMetadata.createdAt || new Date().toISOString(),
      },
    });

    await this.updateMetadataRepository.save(metadata);

    this.logger.log(
      `Métadonnées sauvegardées dans PostgreSQL (ID: ${metadata.id})`,
    );

    return {
      id: metadata.id,
      version: metadata.version,
      changelog: metadata.changelog,
      filename: metadata.filename,
      fileSize: metadata.fileSize,
      checksum: metadata.checksum,
      requiredNodeVersion: versionMetadata.requiredNodeVersion,
      createdAt: metadata.createdAt,
    };
  }

  /**
   * Vérifier si une mise à jour est disponible pour un node client
   */
  async checkForUpdates(tenantId: string, currentVersion: string) {
    this.logger.log(
      `Vérification de mise à jour pour tenant=${tenantId}, version=${currentVersion}`,
    );

    // 1. Vérifier que le tenant existe et est actif
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant non trouvé');
    }

    if (!tenant.active) {
      throw new BadRequestException('Tenant inactif');
    }

    // 2. Vérifier que le tenant a une licence active
    const activeLicense = await this.licenseRepository.findOne({
      where: {
        tenantId: tenantId,
        status: LicenseStatus.ACTIVE,
      },
    });

    if (!activeLicense) {
      throw new BadRequestException(
        'Aucune licence active trouvée pour ce tenant',
      );
    }

    // Vérifier l'expiration de la licence
    if (
      activeLicense.expiresAt &&
      new Date() > new Date(activeLicense.expiresAt)
    ) {
      throw new BadRequestException('Licence expirée');
    }

    // 3. Récupérer la dernière mise à jour active
    const latestUpdate = await this.updateMetadataRepository.findOne({
      where: { active: true },
      order: { createdAt: 'DESC' },
    });

    if (!latestUpdate) {
      this.logger.log('Aucune mise à jour disponible');
      return {
        available: false,
        message: 'Aucune mise à jour disponible',
        currentVersion,
      };
    }

    // 4. Comparer les versions
    const versionComparison = this.compareVersions(
      latestUpdate.version,
      currentVersion,
    );

    const updateAvailable = versionComparison > 0;

    if (!updateAvailable) {
      this.logger.log(
        `Node à jour (version actuelle: ${currentVersion}, dernière: ${latestUpdate.version})`,
      );
      return {
        available: false,
        message: 'Le node est à jour',
        currentVersion,
        latestVersion: latestUpdate.version,
      };
    }

    // 5. Vérifier la compatibilité de version du node
    const requiredNodeVersion =
      latestUpdate.metadata?.['requiredNodeVersion'];
    if (requiredNodeVersion) {
      const nodeVersionComparison = this.compareVersions(
        currentVersion,
        requiredNodeVersion,
      );

      if (nodeVersionComparison < 0) {
        this.logger.warn(
          `Version du node trop ancienne (actuelle: ${currentVersion}, requise: ${requiredNodeVersion})`,
        );
        return {
          available: false,
          message: `Mise à jour disponible mais nécessite une version du node >= ${requiredNodeVersion}. Veuillez d'abord mettre à jour votre node.`,
          currentVersion,
          latestVersion: latestUpdate.version,
          requiredNodeVersion,
        };
      }
    }

    this.logger.log(
      `Mise à jour disponible: ${currentVersion} -> ${latestUpdate.version}`,
    );

    return {
      available: true,
      updateId: latestUpdate.id,
      currentVersion,
      latestVersion: latestUpdate.version,
      changelog: latestUpdate.changelog,
      fileSize: latestUpdate.fileSize,
      checksum: latestUpdate.checksum,
      requiredNodeVersion: requiredNodeVersion || null,
      createdAt: latestUpdate.createdAt,
      breaking: latestUpdate.metadata?.['breaking'] || false,
      securityUpdate: latestUpdate.metadata?.['securityUpdate'] || false,
    };
  }

  /**
   * Télécharger un package de mise à jour
   */
  async download(updateId: string) {
    this.logger.log(`Téléchargement de la mise à jour: ${updateId}`);

    const metadata = await this.updateMetadataRepository.findOne({
      where: { id: updateId },
    });

    if (!metadata) {
      throw new NotFoundException('Mise à jour non trouvée');
    }

    if (!metadata.active) {
      throw new BadRequestException('Cette mise à jour n\'est plus active');
    }

    const bucket = this.getGridFSBucket();

    try {
      const downloadStream = bucket.openDownloadStream(
        new this.mongoConnection.mongo.ObjectId(metadata.mongoFileId),
      );

      this.logger.log(`Streaming du fichier: ${metadata.filename}`);

      return {
        stream: downloadStream,
        filename: metadata.filename,
        contentType: 'application/zip',
        size: metadata.fileSize,
        version: metadata.version,
        checksum: metadata.checksum,
      };
    } catch (error) {
      this.logger.error(
        `Erreur lors du téléchargement: ${error.message}`,
        error.stack,
      );
      throw new NotFoundException(
        'Fichier de mise à jour non trouvé dans le stockage',
      );
    }
  }

  /**
   * Lister toutes les mises à jour
   */
  async getAllUpdates() {
    return await this.updateMetadataRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Récupérer une mise à jour par ID
   */
  async getUpdateById(id: string) {
    const update = await this.updateMetadataRepository.findOne({
      where: { id },
    });

    if (!update) {
      throw new NotFoundException('Mise à jour non trouvée');
    }

    return update;
  }

  /**
   * Désactiver une mise à jour
   */
  async deactivate(id: string) {
    const update = await this.getUpdateById(id);
    update.active = false;
    await this.updateMetadataRepository.save(update);
    this.logger.log(`Mise à jour ${id} (version ${update.version}) désactivée`);
    return { message: 'Mise à jour désactivée', version: update.version };
  }

  /**
   * Supprimer une mise à jour (fichier + métadonnées)
   */
  async delete(id: string) {
    const update = await this.getUpdateById(id);

    // Supprimer le fichier de GridFS
    const bucket = this.getGridFSBucket();
    try {
      await bucket.delete(
        new this.mongoConnection.mongo.ObjectId(update.mongoFileId),
      );
      this.logger.log(
        `Fichier GridFS supprimé (ID: ${update.mongoFileId})`,
      );
    } catch (error) {
      this.logger.error(
        'Erreur lors de la suppression du fichier GridFS:',
        error,
      );
    }

    // Supprimer les métadonnées
    await this.updateMetadataRepository.remove(update);
    this.logger.log(
      `Métadonnées supprimées (ID: ${id}, version: ${update.version})`,
    );

    return {
      message: 'Mise à jour supprimée avec succès',
      version: update.version,
    };
  }

  /**
   * Obtenir les statistiques des téléchargements (à implémenter avec un système de tracking)
   */
  async getDownloadStats(updateId: string) {
    const update = await this.getUpdateById(updateId);

    // TODO: Implémenter un système de tracking des téléchargements
    // Pour l'instant, retourne les informations de base

    return {
      updateId: update.id,
      version: update.version,
      totalDownloads: 0, // À implémenter
      activeInstallations: 0, // À implémenter
      createdAt: update.createdAt,
    };
  }

  /**
   * Generate an update package with exercises.json included
   * This creates a ZIP file with:
   * - version.json (metadata)
   * - exercises.json (exercise data for sync)
   */
  async generateUpdatePackage(
    version: string,
    changelog: string,
    requiredNodeVersion: string = '1.0.0',
  ): Promise<{
    buffer: Buffer;
    filename: string;
    checksum: string;
    exerciseCount: number;
  }> {
    this.logger.log(`Generating update package for version ${version}`);

    // Create a new ZIP file
    const zip = new AdmZip();

    // Generate version.json
    const versionMetadata: VersionMetadata = {
      version,
      changelog,
      requiredNodeVersion,
      createdAt: new Date().toISOString(),
    };
    zip.addFile(
      'version.json',
      Buffer.from(JSON.stringify(versionMetadata, null, 2)),
    );

    // Generate exercises.json from current exercises
    const exercisePayload = await this.exerciseService.exportForSync();
    zip.addFile(
      'exercises.json',
      Buffer.from(JSON.stringify(exercisePayload, null, 2)),
    );

    // Get the buffer
    const buffer = zip.toBuffer();

    // Calculate checksum
    const checksum =
      'sha256:' + crypto.createHash('sha256').update(buffer).digest('hex');

    const filename = `cybersensei-update-${version}.zip`;

    this.logger.log(
      `Generated update package: ${filename} (${buffer.length} bytes, ${exercisePayload.exercises.length} exercises)`,
    );

    return {
      buffer,
      filename,
      checksum,
      exerciseCount: exercisePayload.exercises.length,
    };
  }

  /**
   * Generate and upload an update package with current exercises
   */
  async generateAndUploadPackage(
    version: string,
    changelog: string,
    requiredNodeVersion: string = '1.0.0',
  ) {
    // Generate the package
    const pkg = await this.generateUpdatePackage(
      version,
      changelog,
      requiredNodeVersion,
    );

    // Create a mock file object for upload
    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: pkg.filename,
      encoding: '7bit',
      mimetype: 'application/zip',
      buffer: pkg.buffer,
      size: pkg.buffer.length,
      destination: '',
      filename: pkg.filename,
      path: '',
      stream: null as any,
    };

    // Upload using existing method
    const result = await this.upload(file, pkg.checksum);

    return {
      ...result,
      exerciseCount: pkg.exerciseCount,
    };
  }
}
