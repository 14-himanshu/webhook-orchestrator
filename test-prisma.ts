import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

try {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://a:b@c:5432/d" });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  console.log("Success");
} catch(e) {
  console.log(e);
}
