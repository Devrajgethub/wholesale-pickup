import { PrismaClient } from '@prisma/client';

function createDb(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || '';
  const isTurso = databaseUrl.startsWith('libsql://');

  if (isTurso) {
    // Turso / LibSQL for Vercel deployment - dynamic import to avoid build errors with SQLite
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSql } = require('@prisma/adapter-libsql');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@libsql/client');
    const libsql = createClient({
      url: databaseUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
    });
    const adapter = new PrismaLibSql(libsql);
    return new PrismaClient({ adapter } as any);
  }

  // Standard SQLite (local dev)
  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
  };

  const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error'] : [],
    });

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

  return prisma;
}

export const db = createDb();