import prisma from "../lib/prisma";

export async function list() {
  return prisma.note.findMany();
}