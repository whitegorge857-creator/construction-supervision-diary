 import { NextRequest, NextResponse } from 'next/server';
 import { getDb } from '@/lib/db';
 
 export async function GET() {
   const db = getDb();
   const projects = db.prepare('SELECT * FROM projects ORDER BY id DESC').all();
   return NextResponse.json(projects);
 }
 
 export async function POST(request: Request) {
   const body = await request.json();
   const db = getDb();
   const stmt = db.prepare('INSERT INTO projects (name, code, contractor) VALUES (?, ?, ?)');
   const result = stmt.run(body.name, body.code || '', body.contractor || '');
   const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
   return NextResponse.json(project, { status: 201 });
 }
 
 export async function PUT(request: NextRequest) {
   const body = await request.json();
   const { id, name, code, contractor } = body;
   if (!id) return NextResponse.json({ error: '缺少项目ID' }, { status: 400 });
   const db = getDb();
   const stmt = db.prepare('UPDATE projects SET name = ?, code = ?, contractor = ? WHERE id = ?');
   const result = stmt.run(name, code || '', contractor || '', id);
   if (result.changes === 0) return NextResponse.json({ error: '项目不存在' }, { status: 404 });
   const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
   return NextResponse.json(project);
 }
 
 export async function DELETE(request: NextRequest) {
   const { searchParams } = new URL(request.url);
   const id = parseInt(searchParams.get('id') || '');
   if (!id) return NextResponse.json({ error: '缺少项目ID' }, { status: 400 });
   const db = getDb();
   db.prepare('DELETE FROM diaries WHERE projectId = ?').run(id);
   db.prepare('DELETE FROM projects WHERE id = ?').run(id);
   return NextResponse.json({ success: true });
 }
