import {list} from '@/app/repositories/note.repository';
import { NextResponse } from 'next/server.js';

export async function GET() {
  const data = await list();
  return NextResponse.json(data);
}