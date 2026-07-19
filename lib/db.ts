import { PrismaClient } from '@prisma/client';

/**
 * Синглтон Prisma-клиента.
 * В dev-режиме Next.js перезагружает модули при hot reload — кешируем
 * клиент в globalThis, чтобы не плодить подключения к SQLite.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
