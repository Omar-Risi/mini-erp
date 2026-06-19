declare global {
  interface Window {
    db: {
      get: (sql: string, params?: unknown[]) => Promise<unknown>;
      all: (sql: string, params?: unknown[]) => Promise<unknown[]>;
      run: (sql: string, params?: unknown[]) => Promise<{ changes: number; lastInsertRowid: number }>;
    };
  }
}

export const db = {
  get: <T>(sql: string, params?: unknown[]) => window.db.get(sql, params) as Promise<T | undefined>,
  all: <T>(sql: string, params?: unknown[]) => window.db.all(sql, params) as Promise<T[]>,
  run: (sql: string, params?: unknown[]) => window.db.run(sql, params),
};
