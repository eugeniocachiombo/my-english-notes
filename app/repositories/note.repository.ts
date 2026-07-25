import prisma from "../lib/prisma";

export async function list() {
  return prisma.note.findMany({
    orderBy: { id: "desc"},
  });
}

export async function create(data:any) {
  return prisma.note.create({data});
}

export async function update(data:any) {
  return prisma.note.update({
    where: { id: data.id},
    data: data,
  });
}

export async function remove(id:number) {
  return prisma.note.delete({
    where: { id },
  });
}