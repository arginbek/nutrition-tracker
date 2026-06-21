import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Food, MealId, MEALS, MEAL_LABELS, LogEntry } from '../../lib/types';
import { getFood, insertLogEntry } from '../../db/queries';
import { PortionStepper, PortionSelection } from '../../components/nutrition/PortionStepper';
import { Button } from '../../components/ui/Button';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { useApp } from '../../state/AppContext';
import { colors, radii, spacing, type } from '../../theme';

export default function LogFood() {
  const { foodId } = useLocalSearchParams<{ foodId: string }>();
  const { selectedDate } = useApp();
  const [food, setFood] = useState<Food | null>(null);
  const [meal, setMeal] = useState<MealId>('breakfast');
  const [sel, setSel] = useState<PortionSelection | null>(null);

  useEffect(() => { getFood(foodId).then(setFood); }, [foodId]);
  if (!food) return null;

  const log = async () => {
    if (!sel) return;
    const entry: LogEntry = {
      id: `log_${Date.now()}`, date: selectedDate, meal,
      foodId: food.id, nameSnapshot: food.name,
      servingLabel: sel.servingLabel, quantity: sel.quantity, computed: sel.nutrients,
    };
    await insertLogEntry(entry);
    router.back();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas }} contentContainerStyle={{ padding: spacing.gutter, gap: spacing.base }}>
      <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.heading }}>{food.name}</Text>

      <View style={{ gap: spacing.sm }}>
        <SectionLabel>Meal</SectionLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {MEALS.map(m => (
            <Pressable key={m} onPress={() => setMeal(m)}
              style={{
                paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.control,
                borderWidth: 1, borderColor: meal === m ? colors.amber : colors.border, backgroundColor: colors.secondary,
              }}>
              <Text style={{ color: colors.text, fontFamily: type.familyMedium, fontSize: type.bodySm }}>{MEAL_LABELS[m]}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ gap: spacing.sm }}>
        <SectionLabel>Portion</SectionLabel>
        <PortionStepper food={food} onChange={setSel} />
      </View>

      {sel && (
        <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.bodySm }}>
          {sel.nutrients.kcal} kcal · {sel.nutrients.protein}g P · {sel.nutrients.carbs}g C · {sel.nutrients.fat}g F
        </Text>
      )}

      <Button onPress={log}>Log to {MEAL_LABELS[meal]}</Button>
    </ScrollView>
  );
}
