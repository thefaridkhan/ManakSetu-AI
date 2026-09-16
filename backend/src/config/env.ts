import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load .env
dotenv.config();

const envSchema = z.object({
  PORT: z.union([z.string(), z.number()]).transform(v => String(v)).default('5000'),
  NODE_ENV: z.string().default('development'),
  DATABASE_URL: z.string().default('mysql://root:0786@localhost:3306/standardsai'),
  JWT_SECRET: z.string().default('bis_intelligent_standards_jwt_secret_key_2026_super_secure_enterprise'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('*'),
  
  // AI Configuration
  AI_PROVIDER: z.enum(['gemini', 'openai', 'local']).default('gemini'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-1.5-flash'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  
  // Vector search
  EMBEDDING_MODEL: z.string().default('gemini-embedding-001'),
  VECTOR_STORE_TYPE: z.string().default('embedded'),
  SIMILARITY_THRESHOLD: z.union([z.string(), z.number()]).transform(v => typeof v === 'number' ? v : parseFloat(v) || 0.65).default(0.65),
  TOP_K_RETRIEVAL: z.union([z.string(), z.number()]).transform(v => typeof v === 'number' ? v : parseInt(v, 10) || 6).default(6),
  
  // Ingestion
  INGESTION_CRON_SCHEDULE: z.string().default('0 2 * * *'),
  AUTO_SYNC_ENABLED: z.union([z.boolean(), z.string()]).transform(v => v === true || v === 'true').default(true),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Environment validation failed:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
