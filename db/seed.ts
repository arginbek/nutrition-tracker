import { getDb } from './index';
import { upsertFood } from './queries';
import { Food } from '../lib/types';
import seed from '../assets/data/seed-foods.json';

export async function seedIfEmpty(): Promise<void> {
  const row = await getDb().getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM foods');
  if (row && row.c > 0) return;
  for (const f of seed as Food[]) {
    await upsertFood(f);
  }
}
