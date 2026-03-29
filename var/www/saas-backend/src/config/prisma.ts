import { env } from "./env.js";

const connectionString = env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

export type ShowcasePrismaClient = {
  [key: string]: any;
};

const globalForPrisma = globalThis as {
  prisma?: ShowcasePrismaClient;
};

const createShowcasePrismaClient = (): ShowcasePrismaClient => {
  return {};
};

export const prisma = globalForPrisma.prisma ?? createShowcasePrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
