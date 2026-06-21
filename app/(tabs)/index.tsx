import { useCallback, useState } from 'react';
import { ScrollView, View, Text, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useApp } from '../../state/AppContext';
import { getEntriesForDate, deleteLogEntry } from '../../db/queries';
import { sumNutrients } from '../../lib/totals';
import { LogEntry, MEALS, MealId } from '../../lib/types';
import { MacroRing } from '../../components/nutrition/MacroRing';
import { MacroBar } from '../../components/nutrition/MacroBar';
import { MealSection } from '../../components/nutrition/MealSection';
import { Card } from '../../components/ui/Card';
import { colors, macroColors, spacing, type } from '../../theme';

export default function Today() {
  const { selectedDate, target } = useApp();
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setEntries(await getEntriesForDate(selectedDate));
  }, [selectedDate]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const totals = sumNutrients(entries);
  const byMeal = (m: MealId) => entries.filter(e => e.meal === m);

  const onPressEntry = (e: LogEntry) => {
    Alert.alert('Remove entry?', e.nameSnapshot, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => { await deleteLogEntry(e.id); load(); } },
    ]);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.canvas }}
      contentContainerStyle={{ padding: spacing.gutter, gap: spacing.base, paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={colors.textMuted} />}
    >
      <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.screenTitle }}>Today</Text>

      <Card style={{ alignItems: 'center', gap: spacing.base }}>
        <MacroRing consumed={totals.kcal} target={target.dailyKcal} />
        <View style={{ alignSelf: 'stretch', gap: spacing.md }}>
          <MacroBar label="Protein" consumed={totals.protein} target={target.proteinG} color={macroColors.protein} />
          <MacroBar label="Carbs" consumed={totals.carbs} target={target.carbsG} color={macroColors.carbs} />
          <MacroBar label="Fat" consumed={totals.fat} target={target.fatG} color={macroColors.fat} />
        </View>
      </Card>

      {entries.length === 0 && (
        <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.bodySm, textAlign: 'center', marginTop: spacing.lg }}>
          Nothing logged yet. Tap Add to log a food.
        </Text>
      )}

      {MEALS.map(m => (
        <MealSection key={m} meal={m} entries={byMeal(m)} onPressEntry={onPressEntry} />
      ))}
    </ScrollView>
  );
}
