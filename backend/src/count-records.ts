import { prisma } from './config/prisma.js';

async function check() {
  const standards = await prisma.standard.count();
  const products = await prisma.product.count();
  const schemes = await prisma.certificationScheme.count();
  const grievanceGuides = await prisma.grievanceGuide.count();
  const chunks = await prisma.documentChunk.count();
  const topStandards = await prisma.standard.findMany({
    take: 5,
    select: { isNumber: true, title: true, isMandatoryQCO: true }
  });

  console.log('=== DATABASE STATUS ===');
  console.log('Total Standards:', standards);
  console.log('Total Products:', products);
  console.log('Certification Schemes:', schemes);
  console.log('Grievance Guides:', grievanceGuides);
  console.log('Vector Embeddings (Chunks):', chunks);
  console.log('Sample Standards:', JSON.stringify(topStandards, null, 2));
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

