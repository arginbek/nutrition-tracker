import { buildBackup, parseBackup, countRows, BACKUP_APP, BackupTables } from '../lib/backup';

const empty: BackupTables = {
  foods: [], log_entries: [], recipes: [], recipe_components: [],
  weight_entries: [], targets: [], favorites: [], settings: [],
};

describe('buildBackup / parseBackup', () => {
  it('round-trips data with the app marker', () => {
    const data: BackupTables = { ...empty, log_entries: [{ id: 'log_1', date: '2026-06-20' }] };
    const text = buildBackup(data, '2026-06-21T00:00:00.000Z');
    const parsed = parseBackup(text);
    expect(parsed).not.toBeNull();
    expect(parsed!.app).toBe(BACKUP_APP);
    expect(parsed!.version).toBe(1);
    expect(parsed!.exportedAt).toBe('2026-06-21T00:00:00.000Z');
    expect(parsed!.data.log_entries).toHaveLength(1);
  });
  it('rejects non-JSON', () => {
    expect(parseBackup('nope')).toBeNull();
  });
  it('rejects a foreign file (wrong app marker)', () => {
    expect(parseBackup(JSON.stringify({ app: 'something-else', data: {} }))).toBeNull();
  });
  it('rejects when data is missing/not an object', () => {
    expect(parseBackup(JSON.stringify({ app: BACKUP_APP, version: 1 }))).toBeNull();
  });
});

describe('countRows', () => {
  it('sums rows across tables', () => {
    const data: BackupTables = {
      ...empty,
      foods: [{ id: 'a' }, { id: 'b' }],
      log_entries: [{ id: 'l' }],
    };
    expect(countRows(data)).toBe(3);
  });
});
