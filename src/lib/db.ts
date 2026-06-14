import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'supervision.db');

let SQL: any = null;
let db: any = null;
let database: any = null;
let initPromise: Promise<void> | null = null;

function ensureInit(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = initSqlJs().then(async (sqlLib) => {
    SQL = sqlLib;
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    let data: Buffer | undefined;
    if (fs.existsSync(DB_PATH)) {
      data = fs.readFileSync(DB_PATH);
    }
    db = new SQL.Database(data);
    db.run('PRAGMA foreign_keys = ON');
    db.run(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT NOT NULL DEFAULT '',
        contractor TEXT NOT NULL DEFAULT ''
      );
      CREATE TABLE IF NOT EXISTS diaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projectId INTEGER NOT NULL,
        date TEXT NOT NULL,
        weather TEXT DEFAULT '',
        weathercode INTEGER,
        temperature_2m_max REAL,
        temperature_2m_min REAL,
        precipitation_sum REAL,
        isAutoWeather INTEGER DEFAULT 0,
        author TEXT DEFAULT '',
        modules TEXT DEFAULT '[]',
        aiGeneratedContent TEXT DEFAULT '',
        finalContent TEXT DEFAULT '',
        FOREIGN KEY (projectId) REFERENCES projects(id)
      );
    `);
    database = db;
  });
  return initPromise;
}

export async function getDb(): Promise<any> {
  await ensureInit();
  return database;
}

function toObjects(results: any): any[] {
  if (!results || results.length === 0) return [];
  const r = results[0];
  if (!r || !r.values) return [];
  return r.values.map((row: any[]) => {
    const obj: any = {};
    r.columns.forEach((col: string, i: number) => { obj[col] = row[i]; });
    return obj;
  });
}

export function dbAll(sql: string, params: any[] = []): any[] {
  const results = database.exec(sql, params.length > 0 ? params : undefined);
  return toObjects(results);
}

export function dbGet(sql: string, params: any[] = []): any | undefined {
  const rows = dbAll(sql, params);
  return rows.length > 0 ? rows[0] : undefined;
}

export function dbRun(sql: string, params: any[] = []): { changes: number; lastInsertRowid: number } {
  if (params.length > 0) {
    database.run(sql, params);
  } else {
    database.run(sql);
  }
  const r = dbGet('SELECT changes() as changes, last_insert_rowid() as lastInsertRowid');
  saveDb();
  return r || { changes: 0, lastInsertRowid: 0 };
}

export function saveDb(): void {
  if (!database) return;
  const data = database.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}
