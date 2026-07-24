import prisma from "../lib/prisma";

export async function list() {
  return prisma.note.findMany();
}

export async function create(data) {
  return prisma.note.create({data});
}

export async function update(data) {
  return prisma.note.update({
    where: { id: data.id},
    data: data,
  });
}

export async function remove(id) {
  return prisma.note.delete({
    where: { id },
  });
}