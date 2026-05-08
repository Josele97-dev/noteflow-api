import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';

const checklistSchema = z.object({
  title: z.string().min(1),
  items: z.array(z.object({
    text: z.string().min(1),
    isCompleted: z.boolean().optional(),
  })).optional(),
});

export async function GET() {
  try {
    const checklists = await query(`
      SELECT c.*, 
        COALESCE(json_agg(json_build_object('id', ci.id, 'text', ci.text, 'isCompleted', ci.is_completed)) FILTER (WHERE ci.id IS NOT NULL), '[]') as items
      FROM checklists c
      LEFT JOIN checklist_items ci ON c.id = ci.checklist_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    return NextResponse.json(checklists);
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = checklistSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ errors: result.error.format() }, { status: 400 });
    }
    const { title, items } = result.data;

    const [checklist] = await query<{ id: string }>(
      'INSERT INTO checklists (title) VALUES ($1) RETURNING *',
      [title]
    );

    if (items && items.length > 0) {
      for (const item of items) {
        await query(
          'INSERT INTO checklist_items (checklist_id, text, is_completed) VALUES ($1, $2, $3)',
          [checklist.id, item.text, item.isCompleted ?? false]
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
    `, [checklist.id]);

    return NextResponse.json(checklistWithItems, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}