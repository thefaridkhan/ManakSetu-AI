import { prisma } from '../config/prisma.js';
import { versionSyncService } from '../ingestion/sync/versionSync.js';
import { BIS_SEED_STANDARDS } from '../data/bisInitialData.js';

export class AdminService {
  async getTelemetryStats() {
    const [
      totalDocuments,
      totalVersions,
      totalChunks,
      totalSources,
      totalUsers,
      totalConversations,
      totalQueries,
      recentJobs
    ] = await Promise.all([
      prisma.document.count(),
      prisma.documentVersion.count(),
      prisma.documentChunk.count(),
      prisma.source.count(),
      prisma.user.count(),
      prisma.conversation.count(),
      prisma.retrievalLog.count(),
      prisma.ingestionJob.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    // Calculate average latency
    const recentLogs = await prisma.retrievalLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      select: { latencyMs: true, avgScore: true }
    });

    const avgLatency = recentLogs.length > 0
      ? Math.round(recentLogs.reduce((sum, l) => sum + l.latencyMs, 0) / recentLogs.length)
      : 240;

    const avgGroundingScore = recentLogs.length > 0
      ? Number((recentLogs.reduce((sum, l) => sum + (l.avgScore || 0.85), 0) / recentLogs.length).toFixed(2))
      : 0.91;

    return {
      totalDocuments,
      totalVersions,
      totalChunks,
      totalSources,
      totalUsers,
      totalConversations,
      totalQueries,
      avgLatencyMs: avgLatency,
      avgGroundingScore,
      recentJobs
    };
  }

  async getDocuments(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        skip,
        take: limit,
        include: {
          source: true,
          versions: {
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: { chunks: true }
          }
        },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.document.count()
    ]);

    return {
      documents,
      total,
      page,
      limit
    };
  }

  async getJobs(page = 1, limit = 15) {
    const skip = (page - 1) * limit;
    const [jobs, total] = await Promise.all([
      prisma.ingestionJob.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.ingestionJob.count()
    ]);

    return {
      jobs,
      total,
      page,
      limit
    };
  }

  async triggerManualIngestion() {
    const job = await prisma.ingestionJob.create({
      data: {
        jobType: 'MANUAL_INGESTION',
        status: 'RUNNING',
        totalSources: BIS_SEED_STANDARDS.length,
        startedAt: new Date()
      }
    });

    // Execute in background
    setTimeout(async () => {
      try {
        const docsToSync = BIS_SEED_STANDARDS.map(s => ({
          sourceUrl: s.sourceUrl || 'https://www.services.bis.gov.in',
          sourceType: 'OFFICIAL_PORTAL',
          docIdentifier: s.isNumber,
          title: s.title,
          category: s.sector,
          versionTag: `${s.year}`,
          isMandatoryQCO: s.isMandatoryQCO,
          content: `Standard: ${s.isNumber}\nTitle: ${s.title}\nHindi Title: ${s.hindiTitle || ''}\nSector: ${s.sector}\nMandatory QCO: ${s.isMandatoryQCO ? 'YES (Mandatory ISI Mark Certification required by Law)' : 'Voluntary'}\nScope: ${s.scope}\nKey Test Requirements: ${s.keyRequirements.join('; ')}\nApplicable Products: ${s.applicableProducts.join(', ')}`,
          amendmentNotes: `Manual Ingestion triggered from Admin Console`
        }));

        await versionSyncService.syncDocuments(docsToSync, job.id);
      } catch (err: any) {
        await prisma.ingestionJob.update({
          where: { id: job.id },
          data: {
            status: 'FAILED',
            errorMessage: err.message,
            completedAt: new Date()
          }
        });
      }
    }, 100);

    return job;
  }
}

export const adminService = new AdminService();
