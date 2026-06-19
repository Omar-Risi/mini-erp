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
  rollover();
}

function applyMigration(name, sql) {
  const already = db.prepare("SELECT 1 FROM _migrations WHERE name = ?").get(name);
  if (!already) {
    db.exec(sql);
    db.prepare("INSERT INTO _migrations (name) VALUES (?)").run(name);
  }
}

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      run_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  applyMigration("001_create_tasks", `
    CREATE TABLE tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      due_date TEXT NOT NULL,
      assigned_date TEXT NOT NULL,
      is_overdue INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT
    );
  `);
}

// Runs on every app start: bumps stale active tasks to today and marks them overdue.
function rollover() {
  db.prepare(`
    UPDATE tasks
    SET assigned_date = date('now'), is_overdue = 1
    WHERE assigned_date < date('now') AND status = 'active'
  `).run();
}

export function dbGet(sql, params = []) {
  return db.prepare(sql).get(...params);
}

export function dbAll(sql, params = []) {
  return db.prepare(sql).all(...params);
}

export function dbRun(sql, params = []) {
  const result = db.prepare(sql).run(...params);
  return { changes: result.changes, lastInsertRowid: Number(result.lastInsertRowid) };
}
