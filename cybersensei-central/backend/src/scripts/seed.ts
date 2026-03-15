/**
 * CyberSensei - Script de seed
 * Crée un tenant par défaut avec un code d'activation user-friendly
 * + des exercices de démo pour tester l'extension
 *
 * Usage: npx ts-node -r tsconfig-paths/register src/scripts/seed.ts
 */

import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../.env') });

const ACTIVATION_CODE = 'CS-DEMO2024';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER || 'cybersensei',
  password: process.env.POSTGRES_PASSWORD || 'cybersensei',
  database: process.env.POSTGRES_DB || 'cybersensei_central',
  synchronize: false,
  logging: false,
});

async function seed() {
  console.log('🌱 CyberSensei - Seed en cours...\n');

  await dataSource.initialize();
  const queryRunner = dataSource.createQueryRunner();

  try {
    // ============================================
    // 1. Ajouter la colonne activationCode si elle n'existe pas
    // ============================================
    const colExists = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'tenants' AND column_name = 'activationCode'
    `);

    if (colExists.length === 0) {
      console.log('📦 Ajout de la colonne activationCode...');
      await queryRunner.query(`ALTER TABLE "tenants" ADD "activationCode" varchar UNIQUE`);
    }

    // ============================================
    // 2. Créer ou mettre à jour le tenant par défaut
    // ============================================
    const existingTenant = await queryRunner.query(
      `SELECT id FROM "tenants" WHERE "activationCode" = $1`,
      [ACTIVATION_CODE],
    );

    let tenantId: string;

    if (existingTenant.length > 0) {
      tenantId = existingTenant[0].id;
      console.log(`✅ Tenant démo existe déjà (ID: ${tenantId})`);
    } else {
      // Vérifier si un tenant "CyberSensei Demo" existe déjà
      const existingByName = await queryRunner.query(
        `SELECT id FROM "tenants" WHERE name = $1`,
        ['CyberSensei Demo'],
      );

      if (existingByName.length > 0) {
        tenantId = existingByName[0].id;
        await queryRunner.query(
          `UPDATE "tenants" SET "activationCode" = $1 WHERE id = $2`,
          [ACTIVATION_CODE, tenantId],
        );
        console.log(`✅ Tenant existant mis à jour avec code: ${ACTIVATION_CODE}`);
      } else {
        const licenseKey = `DEMO-${Date.now().toString(36).toUpperCase()}-CYBERSENSEI`;
        const result = await queryRunner.query(
          `INSERT INTO "tenants" (name, "contactEmail", "licenseKey", "activationCode", active, "companyName", sector)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [
            'CyberSensei Demo',
            'demo@cybersensei.io',
            licenseKey,
            ACTIVATION_CODE,
            true,
            'CyberSensei - Compte Démo',
            'TECH',
          ],
        );
        tenantId = result[0].id;
        console.log(`✅ Tenant démo créé (ID: ${tenantId})`);
      }
    }

    // ============================================
    // 3. Créer un abonnement FREE si pas existant
    // ============================================
    const existingSub = await queryRunner.query(
      `SELECT id FROM "subscriptions" WHERE "tenantId" = $1`,
      [tenantId],
    );

    if (existingSub.length === 0) {
      // Vérifier si la table subscriptions existe
      const tableExists = await queryRunner.query(`
        SELECT table_name FROM information_schema.tables WHERE table_name = 'subscriptions'
      `);
      if (tableExists.length > 0) {
        await queryRunner.query(
          `INSERT INTO "subscriptions" ("tenantId", plan, status, "trialEndsAt")
           VALUES ($1, 'FREE', 'ACTIVE', NOW() + INTERVAL '30 days')`,
          [tenantId],
        );
        console.log('✅ Abonnement FREE créé');
      }
    } else {
      console.log('✅ Abonnement existe déjà');
    }

    // ============================================
    // 4. Créer des exercices de démo
    // ============================================
    const existingExercises = await queryRunner.query(
      `SELECT COUNT(*) as count FROM "exercises" WHERE "tenantId" = $1`,
      [tenantId],
    );

    if (parseInt(existingExercises[0].count) === 0) {
      const exercises = [
        {
          topic: 'Phishing',
          type: 'QUIZ',
          difficulty: 'BEGINNER',
          description: 'Apprenez à reconnaître les tentatives de phishing et protégez-vous.',
          payloadJSON: JSON.stringify({
            courseIntro: "Le phishing est l'attaque n°1 en entreprise. Saurez-vous déjouer ces pièges ?",
            questions: [
              {
                id: 'q1',
                text: "Vous recevez un email de votre banque vous demandant de confirmer vos identifiants via un lien. Que faites-vous ?",
                options: [
                  "Je clique sur le lien et je vérifie mes informations",
                  "Je contacte directement ma banque par téléphone pour vérifier",
                  "Je transfère l'email à un collègue pour avoir son avis",
                  "J'ignore l'email car ma banque ne m'envoie jamais de mails"
                ],
                correctAnswer: 1,
                context: "L'email semble authentique avec le logo de votre banque."
              },
              {
                id: 'q2',
                text: "Quel est le premier réflexe pour vérifier un email suspect ?",
                options: [
                  "Ouvrir les pièces jointes pour voir leur contenu",
                  "Vérifier l'adresse email de l'expéditeur",
                  "Répondre à l'email pour demander confirmation",
                  "Transférer l'email au service client"
                ],
                correctAnswer: 1
              },
              {
                id: 'q3',
                text: "Un collègue vous envoie un lien WeTransfer pour un fichier important. Mais il ne vous avait pas prévenu. Que faites-vous ?",
                options: [
                  "Je télécharge le fichier, c'est un collègue de confiance",
                  "Je vérifie directement avec mon collègue par un autre canal (Teams, téléphone)",
                  "Je scanne le lien avec mon antivirus seulement",
                  "Je clique pour voir le nom du fichier d'abord"
                ],
                correctAnswer: 1,
                context: "Le lien semble légitime mais vous n'attendiez pas de fichier."
              }
            ]
          }),
        },
        {
          topic: 'Mots de passe',
          type: 'QUIZ',
          difficulty: 'BEGINNER',
          description: 'Maîtrisez les bonnes pratiques de gestion des mots de passe.',
          payloadJSON: JSON.stringify({
            courseIntro: "80% des fuites de données sont liées à des mots de passe faibles ou réutilisés.",
            questions: [
              {
                id: 'q1',
                text: "Quel mot de passe est le plus sécurisé ?",
                options: [
                  "Azerty123!",
                  "MonChien2024",
                  "Kj#8mP!2xLq9$nR",
                  "MotDePasse1"
                ],
                correctAnswer: 2
              },
              {
                id: 'q2',
                text: "Quelle est la meilleure pratique pour gérer ses mots de passe ?",
                options: [
                  "Utiliser le même mot de passe partout mais très complexe",
                  "Les noter dans un fichier Excel protégé",
                  "Utiliser un gestionnaire de mots de passe (Bitwarden, 1Password...)",
                  "Les écrire sur un post-it sous le clavier"
                ],
                correctAnswer: 2
              },
              {
                id: 'q3',
                text: "Qu'est-ce que l'authentification à deux facteurs (2FA) ?",
                options: [
                  "Utiliser deux mots de passe différents",
                  "Demander une confirmation par un second moyen (SMS, app, clé physique)",
                  "Changer son mot de passe tous les 2 mois",
                  "Utiliser deux navigateurs différents"
                ],
                correctAnswer: 1
              }
            ]
          }),
        },
        {
          topic: 'Ransomware',
          type: 'QUIZ',
          difficulty: 'INTERMEDIATE',
          description: 'Comprenez les ransomwares et apprenez à vous en protéger.',
          payloadJSON: JSON.stringify({
            courseIntro: "Les ransomwares coûtent des milliards aux entreprises chaque année. Êtes-vous prêt ?",
            questions: [
              {
                id: 'q1',
                text: "Comment un ransomware pénètre-t-il généralement dans un système ?",
                options: [
                  "Par une mise à jour Windows",
                  "Par un email avec pièce jointe malveillante ou un lien piégé",
                  "Par le Wi-Fi de l'entreprise",
                  "Par l'antivirus lui-même"
                ],
                correctAnswer: 1
              },
              {
                id: 'q2',
                text: "Votre écran affiche un message demandant une rançon en Bitcoin. Que faites-vous en premier ?",
                options: [
                  "Je paie la rançon pour récupérer mes fichiers rapidement",
                  "Je déconnecte immédiatement mon PC du réseau et j'alerte le service IT",
                  "Je redémarre mon ordinateur",
                  "J'attends que ça passe"
                ],
                correctAnswer: 1
              },
              {
                id: 'q3',
                text: "Quelle est la meilleure protection contre les ransomwares ?",
                options: [
                  "Un antivirus payant",
                  "La règle de sauvegarde 3-2-1 (3 copies, 2 supports, 1 hors site)",
                  "Un pare-feu de dernière génération",
                  "Ne jamais ouvrir d'emails"
                ],
                correctAnswer: 1
              }
            ]
          }),
        },
        {
          topic: 'Ingénierie sociale',
          type: 'QUIZ',
          difficulty: 'INTERMEDIATE',
          description: 'Déjouez les techniques de manipulation les plus courantes.',
          payloadJSON: JSON.stringify({
            courseIntro: "L'ingénierie sociale exploite la psychologie humaine plutôt que les failles techniques.",
            questions: [
              {
                id: 'q1',
                text: "Quelqu'un appelle en se présentant comme le support IT et demande votre mot de passe pour 'une mise à jour urgente'. Que faites-vous ?",
                options: [
                  "Je donne mon mot de passe, c'est le support IT",
                  "Je demande le numéro de ticket et je rappelle le support via le numéro officiel",
                  "Je donne un faux mot de passe pour tester",
                  "Je change mon mot de passe et je le donne ensuite"
                ],
                correctAnswer: 1,
                context: "L'appelant connaît votre nom et votre poste."
              },
              {
                id: 'q2',
                text: "Qu'est-ce que le 'tailgating' en cybersécurité ?",
                options: [
                  "Suivre quelqu'un de trop près en voiture",
                  "Entrer dans un bâtiment sécurisé en suivant un employé sans badge",
                  "Voler les données en passant derrière l'écran de quelqu'un",
                  "Envoyer des emails à la suite d'un premier email légitime"
                ],
                correctAnswer: 1
              },
              {
                id: 'q3',
                text: "Un prestataire en costume demande à accéder à la salle serveur 'pour une maintenance urgente'. Votre réaction ?",
                options: [
                  "Je l'accompagne directement, il a l'air professionnel",
                  "Je vérifie son identité et je confirme la maintenance avec mon responsable",
                  "Je lui demande sa carte de visite",
                  "Je refuse catégoriquement tout accès"
                ],
                correctAnswer: 1
              }
            ]
          }),
        },
        {
          topic: 'VPN & Wi-Fi',
          type: 'QUIZ',
          difficulty: 'BEGINNER',
          description: 'Sécurisez vos connexions en télétravail et en déplacement.',
          payloadJSON: JSON.stringify({
            courseIntro: "En télétravail ou en déplacement, votre connexion est votre première ligne de défense.",
            questions: [
              {
                id: 'q1',
                text: "Vous êtes dans un café et devez accéder à l'intranet de votre entreprise. Que faites-vous ?",
                options: [
                  "Je me connecte au Wi-Fi gratuit et j'accède directement",
                  "J'active le VPN de mon entreprise avant tout accès",
                  "J'utilise le partage de connexion de mon téléphone sans VPN",
                  "J'attends d'être au bureau"
                ],
                correctAnswer: 1
              },
              {
                id: 'q2',
                text: "Pourquoi le Wi-Fi public est-il risqué ?",
                options: [
                  "Il est plus lent que le Wi-Fi privé",
                  "Un attaquant peut intercepter vos données non chiffrées (attaque man-in-the-middle)",
                  "Il consomme plus de batterie",
                  "Les fournisseurs vendent vos données"
                ],
                correctAnswer: 1
              },
              {
                id: 'q3',
                text: "Que fait un VPN exactement ?",
                options: [
                  "Il accélère votre connexion Internet",
                  "Il crée un tunnel chiffré entre votre appareil et le réseau de l'entreprise",
                  "Il bloque les publicités et les trackers",
                  "Il remplace votre antivirus"
                ],
                correctAnswer: 1
              }
            ]
          }),
        },
      ];

      for (const ex of exercises) {
        await queryRunner.query(
          `INSERT INTO "exercises" (topic, type, difficulty, description, "payloadJSON", active, "tenantId", version)
           VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8)`,
          [ex.topic, ex.type, ex.difficulty, ex.description, ex.payloadJSON, true, tenantId, '1.0.0'],
        );
      }

      console.log(`✅ ${exercises.length} exercices de démo créés`);
    } else {
      console.log(`✅ Exercices existent déjà (${existingExercises[0].count})`);
    }

    // ============================================
    // 5. Résumé
    // ============================================
    console.log('\n========================================');
    console.log('🎉 Seed terminé avec succès !');
    console.log('========================================');
    console.log(`\n📋 Tenant: CyberSensei Demo`);
    console.log(`🔑 Code d'activation: ${ACTIVATION_CODE}`);
    console.log(`📧 Email: demo@cybersensei.io`);
    console.log(`🏢 Secteur: TECH`);
    console.log(`📚 Exercices: 5 quiz de démo`);
    console.log(`\n👉 Utilise le code "${ACTIVATION_CODE}" dans l'extension Chrome pour tester !`);
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Erreur pendant le seed:', error.message);
    throw error;
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
