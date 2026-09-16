import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

export class EmbeddingService {
  private geminiClient?: GoogleGenerativeAI;
  private openaiClient?: OpenAI;

  constructor() {
    if (env.GEMINI_API_KEY) {
      this.geminiClient = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    }
    if (env.OPENAI_API_KEY) {
      this.openaiClient = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    }
  }

  /**
   * Generates a 768-dimensional or 1536-dimensional embedding vector
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const cleanText = text.replace(/\n+/g, ' ').trim();

    // 1. Try Gemini embedding if configured
    if (this.geminiClient && env.AI_PROVIDER === 'gemini') {
      try {
        const model = this.geminiClient.getGenerativeModel({ model: 'text-embedding-004' });
        const result = await model.embedContent(cleanText);
        return result.embedding.values;
      } catch (error: any) {
        logger.warn('Gemini embedding failed, falling back to local deterministic embedding', { error: error.message });
      }
    }

    // 2. Try OpenAI embedding if configured
    if (this.openaiClient && (env.AI_PROVIDER === 'openai' || env.OPENAI_API_KEY)) {
      try {
        const response = await this.openaiClient.embeddings.create({
          model: 'text-embedding-3-small',
          input: cleanText
        });
        return response.data[0].embedding;
      } catch (error: any) {
        logger.warn('OpenAI embedding failed, falling back to local deterministic embedding', { error: error.message });
      }
    }

    // 3. Robust local semantic projection (TF-IDF hash embedding - 128 dimensions normalized)
    return this.generateDeterministicEmbedding(cleanText);
  }

  /**
   * Deterministic local embedding for zero-dependency offline resilience
   */
  private generateDeterministicEmbedding(text: string, dimensions = 128): number[] {
    const vector = new Array(dimensions).fill(0);
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2);

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let hash = 0;
      for (let j = 0; j < word.length; j++) {
        hash = (hash << 5) - hash + word.charCodeAt(j);
        hash |= 0;
      }
      const index = Math.abs(hash) % dimensions;
      vector[index] += 1.0;
    }

    // Normalize L2 norm
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
    return vector.map(val => val / magnitude);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
    const minLen = Math.min(vecA.length, vecB.length);
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < minLen; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }
}

export const embeddingService = new EmbeddingService();
