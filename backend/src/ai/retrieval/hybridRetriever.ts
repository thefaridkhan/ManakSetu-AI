import { prisma } from '../../config/prisma.js';
import { embeddingService } from '../embeddings/embeddingService.js';
import { vectorStore, VectorSearchResult } from '../vector/vectorStore.js';
import { cleanQueryString, extractStandardNumbers, expandCrossLingualQuery } from '../../utils/textNormalizer.js';
import { logger } from '../../config/logger.js';

export interface RetrievedContextItem {
  id: string;
  sourceType: 'DOCUMENT_CHUNK' | 'STANDARD_RECORD' | 'SCHEME_RECORD' | 'GRIEVANCE_RECORD';
  identifier: string; // e.g. "IS 10500:2012"
  title: string;
  clauseRef?: string;
  content: string;
  sourceUrl?: string;
  isMandatoryQCO?: boolean;
  score: number;
}

export class HybridRetriever {
  /**
   * Performs hybrid dense vector + cross-lingual BM25 keyword + relational retrieval
   */
  async retrieve(query: string, topK = 6): Promise<RetrievedContextItem[]> {
    const results: RetrievedContextItem[] = [];
    const queryTokens = cleanQueryString(query).toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const crossLingualTokens = expandCrossLingualQuery(query);
    const allTokens = [...new Set([...queryTokens, ...crossLingualTokens])];
    const extractedStandards = extractStandardNumbers(query);

    try {
      // 1. Direct Standard lookup if IS standard is detected in query
      if (extractedStandards.length > 0) {
        for (const stdPattern of extractedStandards) {
          const matchedStandards = await prisma.standard.findMany({
            where: {
              OR: [
                { isNumber: { contains: stdPattern } },
                { title: { contains: stdPattern } }
              ]
            },
            take: 3
          });

          for (const std of matchedStandards) {
            results.push({
              id: `std-${std.id}`,
              sourceType: 'STANDARD_RECORD',
              identifier: std.isNumber,
              title: std.title,
              content: `STANDARD: ${std.isNumber} - ${std.title}\nSector: ${std.sector}\nMandatory QCO: ${std.isMandatoryQCO ? 'YES (Mandatory ISI Mark Certification required)' : 'Voluntary'}\nScope: ${std.scope}\nKey Requirements: ${JSON.stringify(std.keyRequirements)}\nApplicable Products: ${JSON.stringify(std.applicableProducts)}`,
              sourceUrl: std.sourceUrl || 'https://www.services.bis.gov.in',
              isMandatoryQCO: std.isMandatoryQCO,
              score: 1.0 // Maximum priority for exact standard match
            });
          }
        }
      }

      // 2. Cross-lingual / Relational search across standards
      if (allTokens.length > 0) {
        const matchingStandards = await prisma.standard.findMany({
          where: {
            OR: allTokens.map(token => ({
              OR: [
                { title: { contains: token } },
                { hindiTitle: { contains: token } },
                { scope: { contains: token } },
                { standardNo: { contains: token } },
                { sector: { contains: token } }
              ]
            }))
          },
          take: 4
        });

        for (const std of matchingStandards) {
          results.push({
            id: `std-${std.id}`,
            sourceType: 'STANDARD_RECORD',
            identifier: std.isNumber,
            title: std.title,
            content: `STANDARD: ${std.isNumber} - ${std.title}\nHindi: ${std.hindiTitle || ''}\nSector: ${std.sector}\nMandatory QCO: ${std.isMandatoryQCO ? 'YES' : 'Voluntary'}\nScope: ${std.scope}\nKey Requirements: ${JSON.stringify(std.keyRequirements)}`,
            sourceUrl: std.sourceUrl || 'https://www.services.bis.gov.in',
            isMandatoryQCO: std.isMandatoryQCO,
            score: 0.95
          });
        }
      }

      // 3. Relational search across products & schemes
      if (allTokens.length > 0) {
        const productMatches = await prisma.product.findMany({
          where: {
            OR: allTokens.map(token => ({
              OR: [
                { name: { contains: token } },
                { description: { contains: token } },
                { applicableStandard: { contains: token } }
              ]
            }))
          },
          take: 3
        });

        for (const prod of productMatches) {
          results.push({
            id: `prod-${prod.id}`,
            sourceType: 'STANDARD_RECORD',
            identifier: prod.applicableStandard,
            title: `Product Certification: ${prod.name}`,
            content: `PRODUCT: ${prod.name} (Category: ${prod.category})\nApplicable Standard: ${prod.applicableStandard}\nMandatory Certification: ${prod.isMandatory ? 'YES' : 'NO'}\nScheme: ${prod.scheme}\nDescription: ${prod.description || ''}`,
            sourceUrl: 'https://www.services.bis.gov.in',
            isMandatoryQCO: prod.isMandatory,
            score: 0.9
          });
        }
      }

      // 4. Dense Vector Search
      const queryEmbedding = await embeddingService.generateEmbedding(query);
      const vectorResults: VectorSearchResult[] = await vectorStore.search(queryEmbedding, topK, 0.4);

      for (const vRes of vectorResults) {
        results.push({
          id: `chunk-${vRes.chunkId}`,
          sourceType: 'DOCUMENT_CHUNK',
          identifier: vRes.docIdentifier,
          title: vRes.title,
          clauseRef: vRes.clauseRef || undefined,
          content: `${vRes.title} [${vRes.docIdentifier}] ${vRes.clauseRef ? `(${vRes.clauseRef})` : ''}\n${vRes.content}`,
          sourceUrl: vRes.sourceUrl || 'https://www.services.bis.gov.in',
          score: vRes.score
        });
      }

      // 5. Grievance & Scheme check if query mentions complaints, hallmarking, or licensing
      const isGrievanceQuery = /complaint|fake|fraud|shikayat|grievance|care app|duplicate|farzi/i.test(query) || allTokens.includes('complaint');
      if (isGrievanceQuery) {
        const guides = await prisma.grievanceGuide.findMany({ take: 2 });
        for (const g of guides) {
          results.push({
            id: `grievance-${g.id}`,
            sourceType: 'GRIEVANCE_RECORD',
            identifier: 'BIS Grievance Redressal Portal',
            title: g.topic,
            content: `TOPIC: ${g.topic}\nCategory: ${g.category}\nSteps to Report: ${JSON.stringify(g.stepsToReport)}\nBIS Care App Action: ${g.bisCareAppAction}\nNational Helpline: ${g.contactHelpline}`,
            sourceUrl: g.onlinePortalUrl,
            score: 0.95
          });
        }
      }

      // 6. Deduplicate and take top results
      const uniqueMap = new Map<string, RetrievedContextItem>();
      for (const item of results) {
        const key = `${item.identifier}-${item.clauseRef || ''}-${item.content.substring(0, 50)}`;
        if (!uniqueMap.has(key) || (uniqueMap.get(key)!.score < item.score)) {
          uniqueMap.set(key, item);
        }
      }

      const deduplicated = Array.from(uniqueMap.values());
      deduplicated.sort((a, b) => b.score - a.score);

      return deduplicated.slice(0, topK);
    } catch (error: any) {
      logger.error('Hybrid retrieval failed:', { error: error.message });
      return [];
    }
  }
}

export const hybridRetriever = new HybridRetriever();
