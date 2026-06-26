import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

// Global cache for PrismaClient - works in BOTH development and production
// On Vercel (serverless), this caches within a single function instance's lifetime
const globalForDb = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createDb(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || '';
  const isTurso = databaseUrl.startsWith('libsql://');

  console.log('[DB] Initializing database connection...');
  console.log('[DB] DATABASE_URL prefix:', databaseUrl.substring(0, 20) + '...');
  console.log('[DB] Is Turso:', isTurso);
  console.log('[DB] Has AUTH_TOKEN:', !!process.env.DATABASE_AUTH_TOKEN);

  if (isTurso) {
    // Reuse PrismaClient if already created
    if (!globalForDb.prisma) {
      console.log('[DB] Creating new PrismaClient with LibSQL adapter...');
      // PrismaLibSQL is a FACTORY - pass config object, NOT a Client instance
      // The factory internally calls createClient(config) in its connect() method
      const adapter = new PrismaLibSQL({
        url: databaseUrl,
        authToken: process.env.DATABASE_AUTH_TOKEN || '',
      });
      globalForDb.prisma = new PrismaClient({ adapter } as any);
    }

    return globalForDb.prisma;
  }

  // Standard SQLite (local dev)
  if (!globalForDb.prisma) {
    console.log('[DB] Creating new PrismaClient for local SQLite...');
    globalForDb.prisma = new PrismaClient({
      log: ['error', 'warn'],
    });
  }

  return globalForDb.prisma;
}

export const db = createDb();