import prisma from "../lib/prisma";

export async function list() {
  return prisma.note.findMany();
}

export async function create(data) {
  return prisma.note.create({data});
}