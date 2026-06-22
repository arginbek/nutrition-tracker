import { useCallback, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getCustomFoods, getRecipes } from '../../db/queries';
import { Food, Recipe } from '../../lib/types';
import { Button } from '../../components/ui/Button';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { ListRow } from '../../components/ui/ListRow';
import { IconTile } from '../../components/ui/IconTile';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, type } from '../../theme';

export default function Foods() {
  const insets = useSafeAreaInsets();
  const [foods, setFoods] = useState<Food[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const load = useCallback(async () => {
    setFoods(await getCustomFoods());
    setRecipes(await getRecipes());
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas }} contentContainerStyle={{ padding: spacing.gutter, paddingTop: insets.top + spacing.sm, gap: spacing.base, paddingBottom: 120 }}>
      <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.screenTitle }}>Foods</Text>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}><Button variant="secondary" onPress={() => router.push('/food/new')}>+ Food</Button></View>
        <View style={{ flex: 1 }}><Button variant="secondary" onPress={() => router.push('/recipe/new')}>+ Recipe</Button></View>
      </View>

      <View style={{ gap: spacing.sm }}>
        <SectionLabel>Saved Recipes</SectionLabel>
        {recipes.length === 0
          ? <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.bodySm }}>No recipes yet.</Text>
          : recipes.map(r => (
              <ListRow key={r.id} title={r.name}
                icon={<IconTile color={colors.amber}><Feather name="book-open" size={18} color={colors.amber} /></IconTile>}
                onPress={() => router.push(`/recipe/${r.id}`)} />
            ))}
      </View>

      <View style={{ gap: spacing.sm }}>
        <SectionLabel>Custom Foods</SectionLabel>
        {foods.length === 0
          ? <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.bodySm }}>No custom foods yet.</Text>
          : foods.map(f => (
              <ListRow key={f.id} title={f.name} subtitle={f.brand ?? `${f.per100g.kcal} kcal / 100 g`}
                icon={<IconTile color={colors.amber}><Feather name="box" size={18} color={colors.amber} /></IconTile>}
                onPress={() => router.push(`/log/${f.id}`)} />
            ))}
      </View>
    </ScrollView>
  );
}
