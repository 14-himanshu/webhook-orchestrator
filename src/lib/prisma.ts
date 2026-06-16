import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL || 'prisma+postgres://accelerate.prisma-data.net/?api_key=dummy',
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
