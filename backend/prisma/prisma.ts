import { PrismaClient } from '@prisma/client'

// For ESM compatibility, use globalThis instead of global
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

let prismaClientInstance: PrismaClient

if (globalForPrisma.prisma) {
  prismaClientInstance = globalForPrisma.prisma
} else {
  prismaClientInstance = new PrismaClient()
  globalForPrisma.prisma = prismaClientInstance
}

// Verify the client is properly initialized
if (!prismaClientInstance || typeof prismaClientInstance.transaction === 'undefined') {
  throw new Error('PrismaClient failed to initialize properly. Make sure to run "npx prisma generate"')
}

export const prismaClient = prismaClientInstance
