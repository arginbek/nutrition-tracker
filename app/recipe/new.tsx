import { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Field } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { ListRow } from '../../components/ui/ListRow';
import { searchFoods, createRecipe } from '../../db/queries';
import { Food, RecipeComponentInput } from '../../lib/types';
import { colors, spacing, type } from '../../theme';

interface Picked { food: Food; servingLabel: string; quantity: number; }

export default function NewRecipe() {
  const [name, setName] = useState('');
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [picked, setPicked] = useState<Picked[]>([]);

  const onSearch = (t: string) => {
    setQ(t);
    if (t.trim().length >= 2) searchFoods(t.trim()).then(setResults); else setResults([]);
  };
  const add = (food: Food) => {
    const serving = food.servingOptions[0];
    setPicked(p => [...p, { food, servingLabel: serving.label, quantity: 1 }]);
    setQ(''); setResults([]);
  };
  const remove = (i: number) => setPicked(p => p.filter((_, idx) => idx !== i));

  const save = async () => {
    const components: RecipeComponentInput[] = picked.map(p => ({
      foodId: p.food.id, servingLabel: p.servingLabel, quantity: p.quantity,
    }));
    await createRecipe(name.trim(), components);
    router.back();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas }} contentContainerStyle={{ padding: spacing.gutter, gap: spacing.base, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.heading }}>New recipe</Text>
      <Field value={name} onChangeText={setName} placeholder="Recipe name (e.g. Overnight oats)" />

      <View style={{ gap: spacing.sm }}>
        <SectionLabel>Add ingredients</SectionLabel>
        <Field value={q} onChangeText={onSearch} placeholder="Search a food to add…" autoCorrect={false} />
        {results.map(f => (
          <ListRow key={f.id} title={f.name} subtitle={f.brand ?? `${f.per100g.kcal} kcal / 100 g`}
            onPress={() => add(f)}
            trailing={<Feather name="plus" size={18} color={colors.amber} />} />
        ))}
      </View>

      {picked.length > 0 && (
        <View style={{ gap: spacing.sm }}>
          <SectionLabel>Ingredients ({picked.length})</SectionLabel>
          {picked.map((p, i) => (
            <ListRow key={i} title={p.food.name} subtitle={`${p.quantity} × ${p.servingLabel}`}
              onPress={() => remove(i)}
              trailing={<Feather name="x" size={18} color={colors.textMuted} />} />
          ))}
        </View>
      )}

      <Button onPress={save} disabled={name.trim().length === 0 || picked.length === 0}>Save recipe</Button>
    </ScrollView>
  );
}
