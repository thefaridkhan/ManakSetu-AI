import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { logger } from '../config/logger.js';
import {
  BIS_SEED_STANDARDS,
  BIS_SEED_PRODUCTS,
  BIS_SEED_SCHEMES,
  BIS_SEED_GRIEVANCES
} from './bisInitialData.js';
import { versionSyncService } from '../ingestion/sync/versionSync.js';

async function seed() {
  logger.info('🌱 Starting Bureau of Indian Standards (BIS) Database Seeding...');

  try {
    // 1. Seed Default Users
    const passwordHash = await bcrypt.hash('bisadmin123', 10);
    const userPasswordHash = await bcrypt.hash('user123', 10);

    // Admin
    await prisma.user.upsert({
      where: { email: 'admin@bis.gov.in' },
      update: {},
      create: {
        email: 'admin@bis.gov.in',
        passwordHash,
        name: 'BIS Senior Technical Officer',
        role: 'ADMIN',
        organization: 'Bureau of Indian Standards Headquarters, New Delhi'
      }
    });

    // Industry User
    await prisma.user.upsert({
      where: { email: 'industry@example.com' },
      update: {},
      create: {
        email: 'industry@example.com',
        passwordHash: userPasswordHash,
        name: 'Rajesh Sharma',
        role: 'INDUSTRY_USER',
        organization: 'Apex Polymer Pipes & Fittings Ltd.',
        industryType: 'Plastics & Water Supply'
      }
    });

    // Consumer User
    await prisma.user.upsert({
      where: { email: 'consumer@example.com' },
      update: {},
      create: {
        email: 'consumer@example.com',
        passwordHash: userPasswordHash,
        name: 'Priya Verma',
        role: 'CONSUMER',
        organization: 'National Consumer Awareness Forum'
      }
    });

    logger.info('✅ Seeded default users (Admin, Industry, Consumer)');

    // 2. Seed Standards
    for (const std of BIS_SEED_STANDARDS) {
      await prisma.standard.upsert({
        where: { isNumber: std.isNumber },
        update: {
          title: std.title,
          hindiTitle: std.hindiTitle,
          scope: std.scope,
          sector: std.sector,
          isMandatoryQCO: std.isMandatoryQCO,
          qcoNotification: std.qcoNotification,
          schemeType: std.schemeType,
          keyRequirements: std.keyRequirements as any,
          applicableProducts: std.applicableProducts as any,
          sampleSize: std.sampleSize,
          testingDays: std.testingDays,
          amendmentsCount: std.amendmentsCount,
          sourceUrl: std.sourceUrl
        },
        create: {
          isNumber: std.isNumber,
          standardNo: std.standardNo,
          year: std.year,
          title: std.title,
          hindiTitle: std.hindiTitle,
          scope: std.scope,
          icsCode: std.icsCode,
          sector: std.sector,
          isMandatoryQCO: std.isMandatoryQCO,
          qcoNotification: std.qcoNotification,
          schemeType: std.schemeType,
          keyRequirements: std.keyRequirements as any,
          applicableProducts: std.applicableProducts as any,
          sampleSize: std.sampleSize,
          testingDays: std.testingDays,
          amendmentsCount: std.amendmentsCount,
          sourceUrl: std.sourceUrl
        }
      });
    }
    logger.info(`✅ Seeded ${BIS_SEED_STANDARDS.length} authentic Indian Standards`);

    // 3. Seed Products
    for (const prod of BIS_SEED_PRODUCTS) {
      const existing = await prisma.product.findFirst({
        where: { name: prod.name, applicableStandard: prod.applicableStandard }
      });

      if (!existing) {
        await prisma.product.create({
          data: {
            name: prod.name,
            category: prod.category,
            hsCode: prod.hsCode,
            applicableStandard: prod.applicableStandard,
            isMandatory: prod.isMandatory,
            scheme: prod.scheme,
            description: prod.description,
            estimatedFee: prod.estimatedFee
          }
        });
      }
    }
    logger.info(`✅ Seeded ${BIS_SEED_PRODUCTS.length} Product-to-Standard mappings`);

    // 4. Seed Certification Schemes
    for (const scheme of BIS_SEED_SCHEMES) {
      await prisma.certificationScheme.upsert({
        where: { schemeCode: scheme.schemeCode },
        update: {
          title: scheme.title,
          hindiTitle: scheme.hindiTitle,
          description: scheme.description,
          eligibleEntities: scheme.eligibleEntities,
          procedureSteps: scheme.procedureSteps as any,
          requiredDocuments: scheme.requiredDocuments as any,
          portalUrl: scheme.portalUrl,
          feeStructure: scheme.feeStructure as any
        },
        create: {
          schemeCode: scheme.schemeCode,
          title: scheme.title,
          hindiTitle: scheme.hindiTitle,
          description: scheme.description,
          eligibleEntities: scheme.eligibleEntities,
          procedureSteps: scheme.procedureSteps as any,
          requiredDocuments: scheme.requiredDocuments as any,
          portalUrl: scheme.portalUrl,
          feeStructure: scheme.feeStructure as any
        }
      });
    }
    logger.info(`✅ Seeded ${BIS_SEED_SCHEMES.length} BIS Certification Schemes`);

    // 5. Seed Grievance Guides
    for (const g of BIS_SEED_GRIEVANCES) {
      const existing = await prisma.grievanceGuide.findFirst({
        where: { topic: g.topic }
      });

      if (!existing) {
        await prisma.grievanceGuide.create({
          data: {
            topic: g.topic,
            category: g.category,
            description: g.description,
            stepsToReport: g.stepsToReport as any,
            bisCareAppAction: g.bisCareAppAction,
            legalProvisions: g.legalProvisions,
            contactHelpline: g.contactHelpline,
            onlinePortalUrl: g.onlinePortalUrl
          }
        });
      }
    }
    logger.info(`✅ Seeded ${BIS_SEED_GRIEVANCES.length} Consumer Grievance workflows`);

    // 6. Seed RAG Document Chunks and Vector Embeddings
    logger.info('🧠 Generating Vector Embeddings and Chunk Indexes for Knowledge Base...');
    const docsToSync = BIS_SEED_STANDARDS.map(s => ({
      sourceUrl: s.sourceUrl || 'https://www.services.bis.gov.in',
      sourceType: 'OFFICIAL_PORTAL',
      docIdentifier: s.isNumber,
      title: s.title,
      category: s.sector,
      versionTag: `${s.year}`,
      isMandatoryQCO: s.isMandatoryQCO,
      content: `Standard: ${s.isNumber}\nTitle: ${s.title}\nHindi Title: ${s.hindiTitle || ''}\nSector: ${s.sector}\nMandatory QCO: ${s.isMandatoryQCO ? 'YES (Mandatory ISI Mark Certification required by Law)' : 'Voluntary'}\nScope: ${s.scope}\nKey Test Requirements: ${s.keyRequirements.join('; ')}\nApplicable Products: ${s.applicableProducts.join(', ')}\nSample Size: ${s.sampleSize || 'N/A'}\nTesting Duration: ${s.testingDays || 7} days\nAmendments: ${s.amendmentsCount}`,
      amendmentNotes: `Initial baseline dataset with ${s.amendmentsCount} amendments`
    }));

    const syncStats = await versionSyncService.syncDocuments(docsToSync);
    logger.info('🎉 Knowledge Base Vector Indexing Complete:', syncStats);

    logger.info('🚀 Database seeding finished successfully!');
  } catch (error: any) {
    logger.error('❌ Database seeding failed:', { error: error.message, stack: error.stack });
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Auto execute if called directly
seed();
