import { list, create, remove, update } from "@/app/repositories/note.repository";
import { NextResponse } from "next/server";
import { z } from "zod";
import {errorZodMessages} from '@/app/services/zod.services'


const noteValidator = z.object({
  word: z.string().min(1, "A palavra ou frase é obrigatória."),
  mean: z.string().min(1, "O significado é obrigatório."),
  description: z.string().optional(),
});

const noteUpdateValidator = z.object({
  id: z.number().optional(),
  word: z.string().min(1, "A palavra ou frase é obrigatória."),
  mean: z.string().min(1, "O significado é obrigatório."),
  description: z.string().optional(),
});


export async function GET() {
  try { 
    const data = await list();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: "Erro ao eliminar palavra", status: 500 });
  }
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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const data = noteUpdateValidator.parse(body); // Validar campos
    const note = await update(data);
    return NextResponse.json(note, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Erro ao eliminar palavra" , status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const data = await request.json();
    const note = await remove(data.id);
    return NextResponse.json(note, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Erro ao eliminar palavra" , status: 500 });
  }
}