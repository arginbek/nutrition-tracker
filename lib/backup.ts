export const BACKUP_APP = 'nutrition-tracker';
export const BACKUP_VERSION = 1;

export type BackupRow = Record<string, string | number | null>;

export interface BackupTables {
  foods: BackupRow[];
  log_entries: BackupRow[];
  recipes: BackupRow[];
  recipe_components: BackupRow[];
  weight_entries: BackupRow[];
  targets: BackupRow[];
  favorites: BackupRow[];
  settings: BackupRow[];
}

export interface Backup {
  app: string;
  version: number;
  exportedAt: string;
  data: BackupTables;
}

export const BACKUP_TABLE_KEYS: (keyof BackupTables)[] = [
  'foods', 'log_entries', 'recipes', 'recipe_components',
  'weight_entries', 'targets', 'favorites', 'settings',
];

export function buildBackup(data: BackupTables, exportedAt: string): string {
  const backup: Backup = { app: BACKUP_APP, version: BACKUP_VERSION, exportedAt, data };
  return JSON.stringify(backup, null, 2);
}

export function parseBackup(text: string): Backup | null {
  try {
    const obj = JSON.parse(text) as Partial<Backup>;
    if (!obj || obj.app !== BACKUP_APP) return null;
    if (!obj.data || typeof obj.data !== 'object') return null;
    // normalize: ensure every known table key is an array
    const data = {} as BackupTables;
    const objData = obj.data as unknown as Record<string, unknown>;
    for (const key of BACKUP_TABLE_KEYS) {
      const rows = objData[key];
      data[key] = Array.isArray(rows) ? (rows as BackupRow[]) : [];
    }
    return {
      app: BACKUP_APP,
      version: typeof obj.version === 'number' ? obj.version : 1,
      exportedAt: typeof obj.exportedAt === 'string' ? obj.exportedAt : '',
      data,
    };
  } catch {
    return null;
  }
}

export function countRows(data: BackupTables): number {
  return BACKUP_TABLE_KEYS.reduce((sum, key) => sum + data[key].length, 0);
}
