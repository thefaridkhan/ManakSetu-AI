import cron from 'node-cron';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { prisma } from '../../config/prisma.js';
import { versionSyncService } from '../sync/versionSync.js';
import { BIS_SEED_STANDARDS } from '../../data/bisInitialData.js';

export function setupIngestionScheduler() {
  if (!env.AUTO_SYNC_ENABLED) {
    logger.info('ℹ️ Automated BIS Ingestion scheduler is disabled via AUTO_SYNC_ENABLED=false');
    return;
  }

  logger.info(`⏰ Setting up BIS Ingestion Cron Scheduler with pattern: "${env.INGESTION_CRON_SCHEDULE}"`);

  cron.schedule(env.INGESTION_CRON_SCHEDULE, async () => {
    logger.info('🔄 Running scheduled BIS Ingestion & Knowledge Base Sync job...');

    try {
      // Create Ingestion Job Record
      const job = await prisma.ingestionJob.create({
        data: {
          jobType: 'SCHEDULED_SYNC',
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
        content: `Standard: ${s.isNumber}\nTitle: ${s.title}\nSector: ${s.sector}\nMandatory QCO: ${s.isMandatoryQCO}\nScope: ${s.scope}\nRequirements: ${JSON.stringify(s.keyRequirements)}`,
        amendmentNotes: `Amendment count: ${s.amendmentsCount}`
      }));

      const stats = await versionSyncService.syncDocuments(docsToSync, job.id);
      logger.info('✅ Scheduled BIS Ingestion sync finished successfully:', stats);
    } catch (error: any) {
      logger.error('❌ Scheduled Ingestion sync failed:', { error: error.message });
    }
  });
}
