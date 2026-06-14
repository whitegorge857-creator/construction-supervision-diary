 // better-sqlite3 is a native module - use require
const Database = require('better-sqlite3');
 import path from 'path';
 import fs from 'fs';
 
 const DB_DIR = path.join(process.cwd(), 'data');
 const DB_PATH = path.join(DB_DIR, 'supervision.db');
 
 let db: Database.Database | null = null;
 
 export function getDb(): Database.Database {
   if (db) return db;
 
   if (!fs.existsSync(DB_DIR)) {
     fs.mkdirSync(DB_DIR, { recursive: true });
   }
 
   db = new Database(DB_PATH);
   db.pragma('journal_mode = WAL');
   db.pragma('foreign_keys = ON');
 
   db.exec(`
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
 
   return db;
 }
