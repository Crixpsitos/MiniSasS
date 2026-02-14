import {Database} from "bun:sqlite";

const db = new Database("db.sqlite", { create: true });

db.run(`
  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT,
    original_name TEXT,
    url TEXT,
    copy_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS video_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    video_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);



export default db;