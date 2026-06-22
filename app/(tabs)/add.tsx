import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Field } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { FoodSearchRow } from '../../components/nutrition/FoodSearchRow';
import { searchFoods, getRecentFoods, getFrequentFoods, getFavoriteFoodIds, toggleFavorite, upsertFood, getSetting } from '../../db/queries';
import { searchUsda } from '../../lib/usda';
import { Food } from '../../lib/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, type } from '../../theme';

export default function Add() {
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<'rate_limit' | 'unauthorized' | 'network' | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (debounce.current) clearTimeout(debounce.current); }, []);
  const [recents, setRecents] = useState<Food[]>([]);
  const [frequents, setFrequents] = useState<Food[]>([]);
  const [favIds, setFavIds] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    setRecents(await getRecentFoods(8));
    setFrequents(await getFrequentFoods(8));
    setFavIds(await getFavoriteFoodIds());
  }, []);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const onSearch = (text: string) => {
    setQ(text);
    const q = text.trim();
    if (debounce.current) clearTimeout(debounce.current);
    if (q.length < 2) { setResults([]); setSearching(false); setSearchError(null); return; }
    setSearchError(null);

    // instant local results
    searchFoods(q).then(setResults);

    // debounced USDA merge
    setSearching(true);
    debounce.current = setTimeout(async () => {
      const key = (await getSetting('usda_api_key'))?.trim() || 'DEMO_KEY';
      const result = await searchUsda(q, key);
      if (result.ok) {
        for (const f of result.foods) { await upsertFood(f); }
        setResults(prev => {
          const seen = new Set(prev.map(p => p.id));
          return [...prev, ...result.foods.filter(r => !seen.has(r.id))];
        });
        setSearchError(null);
      } else {
        setSearchError(result.reason);
      }
      setSearching(false);
    }, 600);
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
      contentContainerStyle={{ padding: spacing.gutter, paddingTop: insets.top + spacing.sm, gap: spacing.base, paddingBottom: 120 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.screenTitle }}>Add food</Text>
      <Field value={q} onChangeText={onSearch} placeholder="Search foods…" autoCorrect={false} />
      <Button variant="secondary" icon={<Feather name="maximize" size={16} color={colors.text} />} onPress={() => router.push('/scan')}>
        Scan barcode
      </Button>
      <Button variant="secondary" icon={<Feather name="camera" size={16} color={colors.text} />} onPress={() => router.push('/photo')}>
        Snap a meal
      </Button>

      {q.trim().length >= 2 ? (
        <View style={{ gap: spacing.sm }}>
          <SectionLabel>Results</SectionLabel>
          {searching && (
            <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.caption }}>
              Searching USDA…
            </Text>
          )}
          {results.length === 0 && !searching
            ? <Text style={{ color: colors.textMuted, fontFamily: type.family }}>
                {searchError === 'rate_limit'
                  ? 'USDA hourly limit reached — add your own key in Settings.'
                  : searchError === 'unauthorized'
                  ? 'USDA key rejected — check it in Settings.'
                  : searchError === 'network'
                  ? "Couldn't reach USDA — check your connection."
                  : 'No matches.'}
              </Text>
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
