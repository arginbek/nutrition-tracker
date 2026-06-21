export const SCHEMA = `
CREATE TABLE IF NOT EXISTS foods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  source TEXT NOT NULL,
  barcode TEXT,
  per100g TEXT NOT NULL,
  serving_options TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS log_entries (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  meal TEXT NOT NULL,
  food_id TEXT,
  name_snapshot TEXT NOT NULL,
  serving_label TEXT NOT NULL,
  quantity REAL NOT NULL,
  computed TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_log_date ON log_entries(date);
CREATE INDEX IF NOT EXISTS idx_log_food ON log_entries(food_id);

CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  ref_type TEXT NOT NULL,
  ref_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS targets (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  daily_kcal INTEGER NOT NULL,
  protein_g INTEGER NOT NULL,
  carbs_g INTEGER NOT NULL,
  fat_g INTEGER NOT NULL
);
`;

export const DEFAULT_TARGET = {
  dailyKcal: 2000,
  proteinG: 150,
  carbsG: 200,
  fatG: 67,
};
