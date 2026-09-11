import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export function createSqliteDatabase(dbPath: string = ':memory:'): Database.Database {
  if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new Database(dbPath);

  // Activación de restricciones de claves foráneas
  db.pragma('foreign_keys = ON');

  // Modo Write-Ahead Logging para concurrencia y resiliencia en disco
  if (dbPath !== ':memory:') {
    db.pragma('journal_mode = WAL');
  }

  // Creación idempotente del esquema relacional
  db.exec(`
    CREATE TABLE IF NOT EXISTS pockets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL NOT NULL,
      progress REAL NOT NULL,
      is_completed INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS deposits (
      id TEXT PRIMARY KEY,
      pocket_id TEXT NOT NULL,
      amount REAL NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (pocket_id) REFERENCES pockets(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_deposits_pocket_id ON deposits(pocket_id);
  `);

  return db;
}
