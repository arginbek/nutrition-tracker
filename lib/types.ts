export type MealId = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export const MEALS: MealId[] = ['breakfast', 'lunch', 'dinner', 'snack'];
export const MEAL_LABELS: Record<MealId, string> = {
  breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snacks',
};

export interface Nutrients {
  kcal: number; protein: number; carbs: number; fat: number;
  fiber: number; sugar: number; sodium: number; satFat: number;
}

export interface ServingOption { label: string; grams: number; }

export interface Food {
  id: string;
  name: string;
  brand: string | null;
  source: 'usda' | 'openfoodfacts' | 'custom';
  barcode: string | null;
  per100g: Nutrients;
  servingOptions: ServingOption[];
}

export interface LogEntry {
  id: string;
  date: string;            // YYYY-MM-DD
  meal: MealId;
  foodId: string | null;
  nameSnapshot: string;
  servingLabel: string;
  quantity: number;
  computed: Nutrients;     // snapshot at log time
}

export interface Target {
  dailyKcal: number; proteinG: number; carbsG: number; fatG: number;
}

export const EMPTY_NUTRIENTS: Nutrients = {
  kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, satFat: 0,
};

export interface Recipe {
  id: string;
  name: string;
}

export interface RecipeComponent {
  id: string;
  recipeId: string;
  foodId: string;
  servingLabel: string;
  quantity: number;
}

/** A component as supplied when creating a recipe (id is generated on insert). */
export interface RecipeComponentInput {
  foodId: string;
  servingLabel: string;
  quantity: number;
}
