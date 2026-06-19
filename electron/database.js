import Database from "better-sqlite3";
import { app } from "electron";
import path from "path";

let db;

export function initDatabase() {
  const dbPath = path.join(app.getPath("userData"), "mini-erp.db");
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate();
}

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      run_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  // Add migration entries here as the schema grows
}

export function dbGet(sql, params = []) {
  return db.prepare(sql).get(...params);
}

export function dbAll(sql, params = []) {
  return db.prepare(sql).all(...params);
}

export function dbRun(sql, params = []) {
  return db.prepare(sql).run(...params);
}
