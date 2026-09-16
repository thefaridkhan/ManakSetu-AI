import { prisma } from '../../config/prisma.js';
import { computeSha256 } from '../../utils/contentHash.js';
import { semanticChunker } from '../chunker/semanticChunker.js';
import { vectorStore } from '../../ai/vector/vectorStore.js';
import { logger } from '../../config/logger.js';

export interface IngestionInputDocument {
  sourceUrl: string;
  sourceType: string;
  docIdentifier: string;
  title: string;
  category: string;
  versionTag: string;
  isMandatoryQCO: boolean;
  content: string;
  amendmentNotes?: string;
  gazetteRef?: string;
}

export interface SyncStats {
  totalProcessed: number;
  newDocs: number;
  updatedDocs: number;
  skippedDocs: number;
  chunksCreated: number;
  failedDocs: number;
}

export class VersionSyncService {
  /**
   * Synchronizes a batch of documents with SHA-256 change detection
   */
  async syncDocuments(documents: IngestionInputDocument[], jobId?: string): Promise<SyncStats> {
    const stats: SyncStats = {
      totalProcessed: 0,
      newDocs: 0,
      updatedDocs: 0,
      skippedDocs: 0,
      chunksCreated: 0,
      failedDocs: 0
    };

    const logEntries: any[] = [];

    for (const doc of documents) {
      stats.totalProcessed++;
      try {
        const contentHash = computeSha256(doc.content);

        // 1. Ensure source exists
        let source = await prisma.source.findUnique({
          where: { url: doc.sourceUrl }
        });

        if (!source) {
          source = await prisma.source.create({
            data: {
              name: `BIS Portal - ${doc.category}`,
              url: doc.sourceUrl,
              sourceType: doc.sourceType || 'OFFICIAL_PORTAL',
              publisher: 'Bureau of Indian Standards',
              isPermitted: true,
              lastSyncedAt: new Date()
            }
          });
        }

        // 2. Check if document exists
        const existingDoc = await prisma.document.findUnique({
          where: { docIdentifier: doc.docIdentifier },
          include: { versions: true }
        });

        if (!existingDoc) {
          // New Document
          const newDoc = await prisma.document.create({
            data: {
              sourceId: source.id,
              docIdentifier: doc.docIdentifier,
              title: doc.title,
              category: doc.category,
              currentVersion: doc.versionTag || '1.0',
              status: 'ACTIVE',
              isMandatoryQCO: doc.isMandatoryQCO,
              versions: {
                create: {
                  versionTag: doc.versionTag || '1.0',
                  contentHash,
                  status: 'ACTIVE',
                  amendmentNotes: doc.amendmentNotes,
                  gazetteRef: doc.gazetteRef
                }
              }
            }
          });

          // Chunk and embed
          const chunks = semanticChunker.chunkStandard(doc.docIdentifier, doc.title, doc.content, {
            category: doc.category,
            isMandatoryQCO: doc.isMandatoryQCO
          });

          for (const chunk of chunks) {
            await vectorStore.upsertChunk(
              newDoc.id,
              chunk.chunkIndex,
              chunk.content,
              chunk.clauseRef,
              chunk.metadata
            );
            stats.chunksCreated++;
          }

          stats.newDocs++;
          logEntries.push({
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `Created new document ${doc.docIdentifier} with ${chunks.length} chunks.`
          });
        } else {
          // Document exists - check if content changed by hash
          const latestVersion = existingDoc.versions.find(v => v.status === 'ACTIVE') || existingDoc.versions[0];

          if (latestVersion && latestVersion.contentHash === contentHash) {
            // UNCHANGED: Skip re-embedding to save compute & resources
            stats.skippedDocs++;
            logEntries.push({
              timestamp: new Date().toISOString(),
              level: 'info',
              message: `Document ${doc.docIdentifier} hash matches. Skipping re-embedding.`
            });
            continue;
          }

          // Content Changed - Mark old version REVISED, create new version
          if (latestVersion) {
            await prisma.documentVersion.update({
              where: { id: latestVersion.id },
              data: { status: 'REVISED' }
            });
          }

          const nextVersionTag = doc.versionTag || `${(parseFloat(existingDoc.currentVersion) + 0.1).toFixed(1)}`;

          await prisma.documentVersion.create({
            data: {
              documentId: existingDoc.id,
              versionTag: nextVersionTag,
              contentHash,
              status: 'ACTIVE',
              amendmentNotes: doc.amendmentNotes || 'Updated content via automated ingestion',
              gazetteRef: doc.gazetteRef
            }
          });

          await prisma.document.update({
            where: { id: existingDoc.id },
            data: {
              currentVersion: nextVersionTag,
              title: doc.title,
              isMandatoryQCO: doc.isMandatoryQCO,
              status: 'ACTIVE'
            }
          });

          // Delete obsolete chunks & re-chunk
          await prisma.documentChunk.deleteMany({
            where: { documentId: existingDoc.id }
          });

          const chunks = semanticChunker.chunkStandard(doc.docIdentifier, doc.title, doc.content, {
            category: doc.category,
            isMandatoryQCO: doc.isMandatoryQCO
          });

          for (const chunk of chunks) {
            await vectorStore.upsertChunk(
              existingDoc.id,
              chunk.chunkIndex,
              chunk.content,
              chunk.clauseRef,
              chunk.metadata
            );
            stats.chunksCreated++;
          }

          stats.updatedDocs++;
          logEntries.push({
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `Updated document ${doc.docIdentifier} to version ${nextVersionTag} with ${chunks.length} chunks.`
          });
        }
      } catch (err: any) {
        stats.failedDocs++;
        logger.error(`Error syncing document ${doc.docIdentifier}:`, { error: err.message });
        logEntries.push({
          timestamp: new Date().toISOString(),
          level: 'error',
          message: `Failed to sync ${doc.docIdentifier}: ${err.message}`
        });
      }
    }

    // Update Ingestion Job record if jobId is provided
    if (jobId) {
      await prisma.ingestionJob.update({
        where: { id: jobId },
        data: {
          status: stats.failedDocs === 0 ? 'COMPLETED' : 'COMPLETED',
          processedDocs: stats.totalProcessed,
          newDocs: stats.newDocs,
          updatedDocs: stats.updatedDocs,
          failedDocs: stats.failedDocs,
          chunksCreated: stats.chunksCreated,
          logs: logEntries as any,
          completedAt: new Date()
        }
      });
    }

    return stats;
  }
}

export const versionSyncService = new VersionSyncService();
