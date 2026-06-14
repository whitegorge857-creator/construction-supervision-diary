import { NextRequest, NextResponse } from 'next/server';
import { getDb, dbAll, dbGet, dbRun } from '@/lib/db';

export async function GET() {
  await getDb();
  const projects = dbAll('SELECT * FROM projects ORDER BY id DESC');
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const body = await request.json();
  await getDb();
  const result = dbRun('INSERT INTO projects (name, code, contractor) VALUES (?, ?, ?)', [body.name, body.code || '', body.contractor || '']);
  const project = dbGet('SELECT * FROM projects WHERE id = ?', [result.lastInsertRowid]);
  return NextResponse.json(project, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, name, code, contractor } = body;
  if (!id) return NextResponse.json({ error: '缺少项目ID' }, { status: 400 });
  await getDb();
  const result = dbRun('UPDATE projects SET name = ?, code = ?, contractor = ? WHERE id = ?', [name, code || '', contractor || '', id]);
  if (result.changes === 0) return NextResponse.json({ error: '项目不存在' }, { status: 404 });
  const project = dbGet('SELECT * FROM projects WHERE id = ?', [id]);
  return NextResponse.json(project);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get('id') || '');
  if (!id) return NextResponse.json({ error: '缺少项目ID' }, { status: 400 });
  await getDb();
  dbRun('DELETE FROM diaries WHERE projectId = ?', [id]);
  dbRun('DELETE FROM projects WHERE id = ?', [id]);
  return NextResponse.json({ success: true });
}
