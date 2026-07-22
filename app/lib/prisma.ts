import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Initialize the adapter according to your driver's requirements
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Pass the adapter instance to PrismaClient
const prisma = new PrismaClient({ adapter });

export default prisma;