import { round1 } from './nutrition';

export interface EstimatedItem {
  name: string; grams: number; kcal: number; protein: number; carbs: number; fat: number;
}

export const ITEM_SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          grams: { type: 'number' },
          kcal: { type: 'number' },
          protein: { type: 'number' },
          carbs: { type: 'number' },
          fat: { type: 'number' },
        },
        required: ['name', 'grams', 'kcal', 'protein', 'carbs', 'fat'],
        additionalProperties: false,
      },
    },
  },
  required: ['items'],
  additionalProperties: false,
} as const;

export const PROMPT =
  'You are a nutrition estimator. Identify each distinct food item visible in this photo. ' +
  'For each, estimate its portion in grams and the total calories and macronutrients (protein, carbs, fat) ' +
  'for that portion. Estimates are fine — be realistic, not precise. Return only the structured data.';

const clamp0 = (n: unknown): number => {
  const v = typeof n === 'number' && Number.isFinite(n) ? n : 0;
  return v < 0 ? 0 : v;
};

export function parseItems(jsonText: string): EstimatedItem[] {
  try {
    // Strip ```json ... ``` fences if present, then extract the JSON object/array.
    let text = jsonText.trim();
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    if (!text.startsWith('{') && !text.startsWith('[')) {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1) text = text.slice(start, end + 1);
    }
    const data = JSON.parse(text) as { items?: unknown };
    if (!Array.isArray(data.items)) return [];
    return data.items
      .filter((it): it is Record<string, unknown> => !!it && typeof it === 'object')
      .map((it) => ({
        name: typeof it.name === 'string' ? it.name : 'Item',
        grams: clamp0(it.grams),
        kcal: clamp0(it.kcal),
        protein: clamp0(it.protein),
        carbs: clamp0(it.carbs),
        fat: clamp0(it.fat),
      }));
  } catch {
    return [];
  }
}

export function scaleItem(item: EstimatedItem, newGrams: number): EstimatedItem {
  if (newGrams <= 0 || item.grams <= 0) {
    return { ...item, grams: Math.max(0, newGrams), kcal: 0, protein: 0, carbs: 0, fat: 0 };
  }
  const f = newGrams / item.grams;
  return {
    name: item.name,
    grams: newGrams,
    kcal: Math.round(item.kcal * f),
    protein: round1(item.protein * f),
    carbs: round1(item.carbs * f),
    fat: round1(item.fat * f),
  };
}

type AnalyzeResult =
  | { ok: true; items: EstimatedItem[] }
  | { ok: false; reason: 'unauthorized' | 'refusal' | 'network' | 'empty' };

export async function analyzePhoto(base64: string, apiKey: string): Promise<AnalyzeResult> {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-8',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 } },
            { type: 'text', text: PROMPT },
          ],
        }],
        output_config: { format: { type: 'json_schema', schema: ITEM_SCHEMA } },
      }),
    });
    if (res.status === 401 || res.status === 403) return { ok: false, reason: 'unauthorized' };
    if (!res.ok) return { ok: false, reason: 'network' };
    const data = (await res.json()) as {
      stop_reason?: string;
      content?: { type: string; text?: string }[];
    };
    if (data.stop_reason === 'refusal') return { ok: false, reason: 'refusal' };
    const text = data.content?.find(b => b.type === 'text')?.text ?? '';
    const items = parseItems(text);
    if (items.length === 0) return { ok: false, reason: 'empty' };
    return { ok: true, items };
  } catch {
    return { ok: false, reason: 'network' };
  }
}
