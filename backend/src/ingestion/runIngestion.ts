import { prisma } from '../config/prisma.js';
import { logger } from '../config/logger.js';
import { versionSyncService } from './sync/versionSync.js';
import { BIS_SEED_STANDARDS } from '../data/bisInitialData.js';

async function runManualIngestion() {
  logger.info('🚀 Triggering Manual BIS Ingestion & Knowledge Base Sync...');

  try {
    const job = await prisma.ingestionJob.create({
      data: {
        jobType: 'MANUAL_INGESTION',
        status: 'RUNNING',
        totalSources: BIS_SEED_STANDARDS.length,
        startedAt: new Date()
      }
    });

    const docsToSync = BIS_SEED_STANDARDS.map(s => ({
      sourceUrl: s.sourceUrl || 'https://www.services.bis.gov.in',
      sourceType: 'OFFICIAL_PORTAL',
      docIdentifier: s.isNumber,
      title: s.title,
      category: s.sector,
      versionTag: `${s.year}`,
      isMandatoryQCO: s.isMandatoryQCO,
      content: `Standard: ${s.isNumber}\nTitle: ${s.title}\nHindi Title: ${s.hindiTitle || ''}\nSector: ${s.sector}\nMandatory QCO: ${s.isMandatoryQCO ? 'YES (Mandatory ISI Mark Certification required by Law)' : 'Voluntary'}\nScope: ${s.scope}\nKey Test Requirements: ${s.keyRequirements.join('; ')}\nApplicable Products: ${s.applicableProducts.join(', ')}`,
      amendmentNotes: `Manual synchronization trigger`
    }));

    const stats = await versionSyncService.syncDocuments(docsToSync, job.id);
    logger.info('✅ Manual Ingestion finished successfully:', stats);
  } catch (error: any) {
    logger.error('❌ Manual ingestion run failed:', { error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}

runManualIngestion();
