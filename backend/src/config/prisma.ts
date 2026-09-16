import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

declare global {
  var prismaClient: PrismaClient | undefined;
}

export const prisma = global.prismaClient || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
});

if (process.env.NODE_ENV !== 'production') {
  global.prismaClient = prisma;
}

export async function connectDB() {
  try {
    await prisma.$connect();
    logger.info('✅ MySQL Database connected successfully via Prisma');
  } catch (error: any) {
    logger.error('❌ Database connection failed. Please ensure MySQL is running on port 3306.', { error: error.message });
  }
}
