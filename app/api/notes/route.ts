import { list, create } from "@/app/repositories/note.repository";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await list();
  return NextResponse.json(data);
}

export async function POST(request: Request) {

  try {

    const body = await request.json();
    const note = await create({
      word: body.word,
      mean: body.mean,
      description: body.description,
    });

    return NextResponse.json(note, {status: 201});
  } catch (error) {
    return NextResponse.json({message: "Erro ao criar palavra", status: 500} );
  }
}