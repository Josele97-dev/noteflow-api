import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';

const updateChecklistSchema = z.object({
  title: z.string().min(1).optional(),
  archived: z.boolean().optional(),
  items: z.array(z.object({
    id: z.string().optional(),
    text: z.string().min(1),
    isCompleted: z.boolean().optional(),
  })).optional(),
});

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [checklist] = await query(`
      SELECT c.*, 
        COALESCE(json_agg(json_build_object('id', ci.id, 'text', ci.text, 'isCompleted', ci.is_completed)) FILTER (WHERE ci.id IS NOT NULL), '[]') as items
      FROM checklists c
      LEFT JOIN checklist_items ci ON c.id = ci.checklist_id
      WHERE c.id = $1
      GROUP BY c.id
    `, [id]);
    if (!checklist) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
    return NextResponse.json(checklist);
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = updateChecklistSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ errors: result.error.format() }, { status: 400 });
    }
    const { title, archived, items } = result.data;

    const [checklist] = await query(
      'UPDATE checklists SET title = COALESCE($1, title), archived = COALESCE($2, archived), updated_at = NOW() WHERE id = $3 RETURNING *',
      [title, archived, id]
    );
    if (!checklist) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });

    if (items !== undefined) {
      await query('DELETE FROM checklist_items WHERE checklist_id = $1', [id]);
      for (const item of items) {
        await query(
          'INSERT INTO checklist_items (checklist_id, text, is_completed) VALUES ($1, $2, $3)',
          [id, item.text, item.isCompleted ?? false]
        );
      }
    }

    const [checklistWithItems] = await query(`
      SELECT c.*, 
        COALESCE(json_agg(json_build_object('id', ci.id, 'text', ci.text, 'isCompleted', ci.is_completed)) FILTER (WHERE ci.id IS NOT NULL), '[]') as items
      FROM checklists c
      LEFT JOIN checklist_items ci ON c.id = ci.checklist_id
      WHERE c.id = $1
      GROUP BY c.id
    `, [id]);

    return NextResponse.json(checklistWithItems);
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await query('DELETE FROM checklists WHERE id = $1', [id]);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}