import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load .env
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('mysql://root:0786@localhost:3306/standardsai'),
  JWT_SECRET: z.string().default('bis_intelligent_standards_jwt_secret_key_2026_super_secure_enterprise'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173,http://localhost:3000'),
  
  // AI Configuration
  AI_PROVIDER: z.enum(['gemini', 'openai', 'local']).default('gemini'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-1.5-flash'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  
  // Vector search
  EMBEDDING_MODEL: z.string().default('text-embedding-004'),
  VECTOR_STORE_TYPE: z.string().default('embedded'),
  SIMILARITY_THRESHOLD: z.string().transform(v => parseFloat(v)).default('0.65'),
  TOP_K_RETRIEVAL: z.string().transform(v => parseInt(v, 10)).default('6'),
  
  // Ingestion
  INGESTION_CRON_SCHEDULE: z.string().default('0 2 * * *'),
  AUTO_SYNC_ENABLED: z.string().transform(v => v === 'true').default('true'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Environment validation failed:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
