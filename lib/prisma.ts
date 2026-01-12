import { PrismaClient } from '@prisma/client'

// On ajoute une propriété globale pour éviter de recréer le client à chaque rechargement en dev
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma