import { prisma } from '../../config/prisma.js';
import { EmbeddingService, embeddingService } from '../embeddings/embeddingService.js';
import { logger } from '../../config/logger.js';

export interface VectorSearchResult {
  chunkId: string;
  documentId: string;
  docIdentifier: string;
  title: string;
  category: string;
  clauseRef: string | null;
  content: string;
  sourceUrl: string | null;
  score: number;
  metadata: any;
}

export interface VectorSearchFilter {
  category?: string;
  isMandatoryQCO?: boolean;
  docIdentifier?: string;
}

export class VectorStore {
  /**
   * Search for chunks most semantically similar to query vector
   */
  async search(
    queryVector: number[],
    limit: number = 6,
    threshold: number = 0.5,
    filter?: VectorSearchFilter
  ): Promise<VectorSearchResult[]> {
    try {
      // Retrieve chunks with document and source relations
      const chunks = await prisma.documentChunk.findMany({
        where: {
          document: {
            ...(filter?.category ? { category: filter.category } : {}),
            ...(filter?.isMandatoryQCO !== undefined ? { isMandatoryQCO: filter.isMandatoryQCO } : {}),
            ...(filter?.docIdentifier ? { docIdentifier: filter.docIdentifier } : {}),
            status: 'ACTIVE'
          }
        },
        include: {
          document: {
            include: {
              source: true
            }
          }
        }
      });

      if (!chunks || chunks.length === 0) {
        return [];
      }

      const scoredResults: VectorSearchResult[] = [];

      for (const chunk of chunks) {
        let chunkEmbedding: number[] = [];
        if (chunk.embedding && Array.isArray(chunk.embedding)) {
          chunkEmbedding = chunk.embedding as number[];
        }

        let similarity = 0;
        if (chunkEmbedding.length > 0) {
          similarity = EmbeddingService.cosineSimilarity(queryVector, chunkEmbedding);
        }

        if (similarity >= threshold || isNaN(similarity)) {
          scoredResults.push({
            chunkId: chunk.id,
            documentId: chunk.documentId,
            docIdentifier: chunk.document.docIdentifier,
            title: chunk.document.title,
            category: chunk.document.category,
            clauseRef: chunk.clauseRef,
            content: chunk.content,
            sourceUrl: chunk.document.source?.url || null,
            score: isNaN(similarity) ? 0.5 : Number(similarity.toFixed(4)),
            metadata: chunk.metadata
          });
        }
      }

      // Sort descending by similarity score
      scoredResults.sort((a, b) => b.score - a.score);

      return scoredResults.slice(0, limit);
    } catch (error: any) {
      logger.error('Vector store search failed:', { error: error.message });
      return [];
    }
  }

  /**
   * Index or update a document chunk with embedding vector
   */
  async upsertChunk(
    documentId: string,
    chunkIndex: number,
    content: string,
    clauseRef?: string,
    metadata?: any
  ): Promise<string> {
    const embedding = await embeddingService.generateEmbedding(content);
    const tokenCount = Math.ceil(content.split(/\s+/).length * 1.3);

    const chunk = await prisma.documentChunk.create({
      data: {
        documentId,
        chunkIndex,
        content,
        clauseRef: clauseRef || null,
        tokenCount,
        embedding: embedding as any,
        metadata: metadata || {}
      }
    });

    return chunk.id;
  }
}

export const vectorStore = new VectorStore();
