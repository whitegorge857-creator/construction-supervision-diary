import { NextRequest, NextResponse } from 'next/server';
import { getDb, dbAll, dbGet, dbRun } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const date = searchParams.get('date');

  await getDb();
  let sql = 'SELECT * FROM diaries';
  const params: any[] = [];
  const conditions: string[] = [];

  if (projectId) { conditions.push('projectId = ?'); params.push(parseInt(projectId)); }
  if (date) { conditions.push('date = ?'); params.push(date); }
  if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY id DESC';

  const rows = dbAll(sql, params);
  const diaries = rows.map((row: any) => ({
    ...row,
    modules: typeof row.modules === 'string' ? JSON.parse(row.modules) : (row.modules || []),
    isAutoWeather: row.isAutoWeather === 1,
  }));
  return NextResponse.json(diaries);
}

export async function POST(request: Request) {
  const body = await request.json();
  await getDb();
  const result = dbRun(`INSERT INTO diaries (projectId, date, weather, weathercode, temperature_2m_max, temperature_2m_min, precipitation_sum, isAutoWeather, author, modules, aiGeneratedContent, finalContent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
    body.projectId, body.date, body.weather || '',
    body.weathercode ?? null, body.temperature_2m_max ?? null, body.temperature_2m_min ?? null,
    body.precipitation_sum ?? null, body.isAutoWeather ? 1 : 0, body.author || '',
    JSON.stringify(body.modules || []), body.aiGeneratedContent || '', body.finalContent || ''
  ]);
  const row = dbGet('SELECT * FROM diaries WHERE id = ?', [result.lastInsertRowid]);
  if (!row) return NextResponse.json({ error: '创建失败' }, { status: 500 });
  return NextResponse.json({ ...row, modules: JSON.parse(row.modules || '[]'), isAutoWeather: row.isAutoWeather === 1 }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: '缺少日记ID' }, { status: 400 });
  await getDb();
  const fields: string[] = [];
  const vals: any[] = [];
  if (updates.projectId !== undefined) { fields.push('projectId = ?'); vals.push(updates.projectId); }
  if (updates.date !== undefined) { fields.push('date = ?'); vals.push(updates.date); }
  if (updates.weather !== undefined) { fields.push('weather = ?'); vals.push(updates.weather); }
  if (updates.weathercode !== undefined) { fields.push('weathercode = ?'); vals.push(updates.weathercode); }
  if (updates.temperature_2m_max !== undefined) { fields.push('temperature_2m_max = ?'); vals.push(updates.temperature_2m_max); }
  if (updates.temperature_2m_min !== undefined) { fields.push('temperature_2m_min = ?'); vals.push(updates.temperature_2m_min); }
  if (updates.precipitation_sum !== undefined) { fields.push('precipitation_sum = ?'); vals.push(updates.precipitation_sum); }
  if (updates.isAutoWeather !== undefined) { fields.push('isAutoWeather = ?'); vals.push(updates.isAutoWeather ? 1 : 0); }
  if (updates.author !== undefined) { fields.push('author = ?'); vals.push(updates.author); }
  if (updates.modules !== undefined) { fields.push('modules = ?'); vals.push(JSON.stringify(updates.modules)); }
  if (updates.aiGeneratedContent !== undefined) { fields.push('aiGeneratedContent = ?'); vals.push(updates.aiGeneratedContent); }
  if (updates.finalContent !== undefined) { fields.push('finalContent = ?'); vals.push(updates.finalContent); }
  if (fields.length === 0) return NextResponse.json({ error: '无更新字段' }, { status: 400 });
  vals.push(id);
  const r = dbRun('UPDATE diaries SET ' + fields.join(', ') + ' WHERE id = ?', vals);
  if (r.changes === 0) return NextResponse.json({ error: '日记不存在' }, { status: 404 });
  const row = dbGet('SELECT * FROM diaries WHERE id = ?', [id]);
  if (!row) return NextResponse.json({ error: '日记不存在' }, { status: 404 });
  return NextResponse.json({ ...row, modules: JSON.parse(row.modules || '[]'), isAutoWeather: row.isAutoWeather === 1 });
}

export async function DELETE(request: NextRequest) {
  const id = parseInt(new URL(request.url).searchParams.get('id') || '');
  if (!id) return NextResponse.json({ error: '缺少日记ID' }, { status: 400 });
  await getDb();
  dbRun('DELETE FROM diaries WHERE id = ?', [id]);
  return NextResponse.json({ success: true });
}
