import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getRecipes, getRecipeComponents, getFood, deleteRecipe, insertLogEntry } from '../../db/queries';
import { recipeTotals } from '../../lib/recipe';
import { Food, Recipe, RecipeComponent, MealId, MEALS, MEAL_LABELS, LogEntry } from '../../lib/types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { useApp } from '../../state/AppContext';
import { colors, radii, spacing, type } from '../../theme';

export default function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedDate } = useApp();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [components, setComponents] = useState<RecipeComponent[]>([]);
  const [foods, setFoods] = useState<Map<string, Food>>(new Map());
  const [meal, setMeal] = useState<MealId>('breakfast');

  useEffect(() => {
    (async () => {
      const r = (await getRecipes()).find(x => x.id === id) ?? null;
      setRecipe(r);
      const comps = await getRecipeComponents(id);
      setComponents(comps);
      const m = new Map<string, Food>();
      for (const c of comps) { const f = await getFood(c.foodId); if (f) m.set(f.id, f); }
      setFoods(m);
    })();
  }, [id]);

  if (!recipe) return null;
  const totals = recipeTotals(components, (fid) => foods.get(fid));

  const log = async () => {
    const entry: LogEntry = {
      id: `log_${Date.now()}`, date: selectedDate, meal,
      foodId: null, nameSnapshot: recipe.name,
      servingLabel: '1 serving', quantity: 1, computed: totals,
    };
    await insertLogEntry(entry);
    router.back();
  };
  const onDelete = () => {
    Alert.alert('Delete recipe?', recipe.name, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteRecipe(recipe.id); router.back(); } },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas }} contentContainerStyle={{ padding: spacing.gutter, gap: spacing.base, paddingBottom: 40 }}>
      <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.heading }}>{recipe.name}</Text>
      <Card>
        <Text style={{ color: colors.text, fontFamily: type.familySemibold, fontSize: type.body }}>
          {totals.kcal} kcal · {totals.protein}g P · {totals.carbs}g C · {totals.fat}g F
        </Text>
      </Card>

      <View style={{ gap: spacing.sm }}>
        <SectionLabel>Ingredients</SectionLabel>
        {components.map(c => {
          const f = foods.get(c.foodId);
          return (
            <Text key={c.id} style={{ color: colors.textSecondary, fontFamily: type.family, fontSize: type.bodySm }}>
              • {f?.name ?? 'Unknown'} — {c.quantity} × {c.servingLabel}
            </Text>
          );
        })}
      </View>

      <View style={{ gap: spacing.sm }}>
        <SectionLabel>Meal</SectionLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {MEALS.map(m => (
            <Pressable key={m} onPress={() => setMeal(m)} style={{
              paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.control,
              borderWidth: 1, borderColor: meal === m ? colors.amber : colors.border, backgroundColor: colors.secondary,
            }}>
              <Text style={{ color: colors.text, fontFamily: type.familyMedium, fontSize: type.bodySm }}>{MEAL_LABELS[m]}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Button onPress={log}>Log to {MEAL_LABELS[meal]}</Button>
      <Button variant="destructive" onPress={onDelete}>Delete recipe</Button>
    </ScrollView>
  );
}
