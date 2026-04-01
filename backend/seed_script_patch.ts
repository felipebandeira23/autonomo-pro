import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('connect', (client) => {
  client.query("SET search_path TO 'autonomo', 'public'");
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
