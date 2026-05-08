import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';

const noteSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
});

export async function GET() {
  try {
    const notes = await query('SELECT * FROM notes ORDER BY created_at DESC');
    return NextResponse.json(notes);
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = noteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ errors: result.error.format() }, { status: 400 });
    }
    const { title, content } = result.data;
    const [note] = await query(
      'INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *',
      [title, content]
    );
    return NextResponse.json(note, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}