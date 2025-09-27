import { PrismaClient } from "@/generated/prisma"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.ENV !== 'production') globalForPrisma.prisma = prisma
