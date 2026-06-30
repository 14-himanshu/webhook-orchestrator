import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  const url = process.env.DATABASE_URL;
  if (url && (url.startsWith('postgres://') || url.startsWith('postgresql://'))) {
    const pool = new Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }
  return new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL || 'prisma+postgres://accelerate.prisma-data.net/?api_key=dummy',
  });
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
// Forced TS reload
