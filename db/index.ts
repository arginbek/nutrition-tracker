import * as SQLite from 'expo-sqlite';
import { SCHEMA, DEFAULT_TARGET } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!db) db = SQLite.openDatabaseSync('nutrition.db');
  return db;
}

export async function initDb(): Promise<void> {
  const d = getDb();
  await d.execAsync(SCHEMA);
  const row = await d.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM targets');
  if (!row || row.c === 0) {
    await d.runAsync(
      'INSERT INTO targets (id, daily_kcal, protein_g, carbs_g, fat_g) VALUES (1, ?, ?, ?, ?)',
      [DEFAULT_TARGET.dailyKcal, DEFAULT_TARGET.proteinG, DEFAULT_TARGET.carbsG, DEFAULT_TARGET.fatG],
    );
  }
}
