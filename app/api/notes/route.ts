import { list, create } from "@/app/repositories/note.repository";
import { NextResponse } from "next/server";
import { z } from "zod";
import {errorZodMessages} from '@/app/services/zod.services'


const noteValidator = z.object({
  word: z
    .string()
    .min(1, "A palavra é obrigatória."),

  mean: z
    .string()
    .min(1, "O significado é obrigatório."),
});

export async function GET() {
  const data = await list();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = noteValidator.parse(body); // Validar campos
    const note = await create(data);
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) { return errorZodMessages(error); }
    return NextResponse.json({ message: "Erro ao criar palavra", status: 500 });
  }
}