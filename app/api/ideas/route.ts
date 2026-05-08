import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';

const ideaSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  color: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET() {
  try {
    const ideas = await query(`
      SELECT i.*, 
        COALESCE(json_agg(it.tag) FILTER (WHERE it.id IS NOT NULL), '[]') as tags
      FROM ideas i
      LEFT JOIN idea_tags it ON i.id = it.idea_id
      GROUP BY i.id
      ORDER BY i.created_at DESC
    `);
    return NextResponse.json(ideas);
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = ideaSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ errors: result.error.format() }, { status: 400 });
    }
    const { title, content, color, tags } = result.data;
    const [idea] = await query<{ id: string }>(      
      'INSERT INTO ideas (title, content, color) VALUES ($1, $2, $3) RETURNING *',
      [title, content, color]
    );

    if (tags && tags.length > 0) {
      for (const tag of tags) {
        await query('INSERT INTO idea_tags (idea_id, tag) VALUES ($1, $2)', [idea.id, tag]);
      }
    }

    const [ideaWithTags] = await query(`
      SELECT i.*, 
        COALESCE(json_agg(it.tag) FILTER (WHERE it.id IS NOT NULL), '[]') as tags
      FROM ideas i
      LEFT JOIN idea_tags it ON i.id = it.idea_id
      WHERE i.id = $1
      GROUP BY i.id
    `, [idea.id]);

    return NextResponse.json(ideaWithTags, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}