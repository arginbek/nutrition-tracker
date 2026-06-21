import { useCallback, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Field } from '../../components/ui/Field';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { FoodSearchRow } from '../../components/nutrition/FoodSearchRow';
import { searchFoods, getRecentFoods, getFrequentFoods, getFavoriteFoodIds, toggleFavorite } from '../../db/queries';
import { Food } from '../../lib/types';
import { colors, spacing, type } from '../../theme';

export default function Add() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [recents, setRecents] = useState<Food[]>([]);
  const [frequents, setFrequents] = useState<Food[]>([]);
  const [favIds, setFavIds] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    setRecents(await getRecentFoods(8));
    setFrequents(await getFrequentFoods(8));
    setFavIds(await getFavoriteFoodIds());
  }, []);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const onSearch = async (text: string) => {
    setQ(text);
    setResults(text.trim().length >= 2 ? await searchFoods(text.trim()) : []);
  };

  const onToggleFav = async (id: string) => { await toggleFavorite('food', id); setFavIds(await getFavoriteFoodIds()); };

  const row = (f: Food) => (
    <FoodSearchRow
      key={f.id} food={f} isFavorite={favIds.includes(f.id)}
      onPress={() => router.push(`/log/${f.id}`)}
      onToggleFavorite={() => onToggleFav(f.id)}
    />
  );

  const favorites = [...recents, ...frequents].filter((f, i, arr) =>
    favIds.includes(f.id) && arr.findIndex(x => x.id === f.id) === i);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.canvas }}
      contentContainerStyle={{ padding: spacing.gutter, gap: spacing.base, paddingBottom: 120 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.screenTitle }}>Add food</Text>
      <Field value={q} onChangeText={onSearch} placeholder="Search foods…" autoCorrect={false} />

      {q.trim().length >= 2 ? (
        <View style={{ gap: spacing.sm }}>
          <SectionLabel>Results</SectionLabel>
          {results.length === 0
            ? <Text style={{ color: colors.textMuted, fontFamily: type.family }}>No matches.</Text>
            : results.map(row)}
        </View>
      ) : (
        <>
          {favorites.length > 0 && <View style={{ gap: spacing.sm }}><SectionLabel>Favorites</SectionLabel>{favorites.map(row)}</View>}
          {recents.length > 0 && <View style={{ gap: spacing.sm }}><SectionLabel>Recent</SectionLabel>{recents.map(row)}</View>}
          {frequents.length > 0 && <View style={{ gap: spacing.sm }}><SectionLabel>Frequent</SectionLabel>{frequents.map(row)}</View>}
        </>
      )}
    </ScrollView>
  );
}
