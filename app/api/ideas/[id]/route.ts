import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';

const updateIdeaSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  color: z.string().optional(),
  archived: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [idea] = await query(`
      SELECT i.*, 
        COALESCE(json_agg(it.tag) FILTER (WHERE it.id IS NOT NULL), '[]') as tags
      FROM ideas i
      LEFT JOIN idea_tags it ON i.id = it.idea_id
      WHERE i.id = $1
      GROUP BY i.id
    `, [id]);
    if (!idea) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
    return NextResponse.json(idea);
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = updateIdeaSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ errors: result.error.format() }, { status: 400 });
    }
    const { title, content, color, archived, tags } = result.data;

    const [idea] = await query(
      'UPDATE ideas SET title = COALESCE($1, title), content = COALESCE($2, content), color = COALESCE($3, color), archived = COALESCE($4, archived), updated_at = NOW() WHERE id = $5 RETURNING *',
      [title, content, color, archived, id]
    );
    if (!idea) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });

    if (tags !== undefined) {
      await query('DELETE FROM idea_tags WHERE idea_id = $1', [id]);
      for (const tag of tags) {
        await query('INSERT INTO idea_tags (idea_id, tag) VALUES ($1, $2)', [id, tag]);
      }
    }

    const [ideaWithTags] = await query(`
      SELECT i.*, 
        COALESCE(json_agg(it.tag) FILTER (WHERE it.id IS NOT NULL), '[]') as tags
      FROM ideas i
      LEFT JOIN idea_tags it ON i.id = it.idea_id
      WHERE i.id = $1
      GROUP BY i.id
    `, [id]);

    return NextResponse.json(ideaWithTags);
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await query('DELETE FROM ideas WHERE id = $1', [id]);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}