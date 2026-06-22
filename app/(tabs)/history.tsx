import { useCallback, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { getLoggedDates, getWeights } from '../../db/queries';
import { useApp } from '../../state/AppContext';
import { todayISO } from '../../lib/date';
import { seriesFromValues } from '../../lib/trends';
import { ListRow } from '../../components/ui/ListRow';
import { Pill } from '../../components/ui/Pill';
import { Card } from '../../components/ui/Card';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { WeightCard } from '../../components/nutrition/WeightCard';
import { LineChart } from '../../components/charts/LineChart';
import { BarChart } from '../../components/charts/BarChart';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, macroColors, spacing, type } from '../../theme';

export default function History() {
  const { setSelectedDate } = useApp();
  const insets = useSafeAreaInsets();
  const [days, setDays] = useState<{ date: string; kcal: number }[]>([]);
  const [weights, setWeights] = useState<{ date: string; value: number }[]>([]);

  const load = useCallback(async () => {
    setDays(await getLoggedDates());
    const w = await getWeights();
    setWeights(w.map(e => ({ date: e.date, value: e.weight })));
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const open = (date: string) => { setSelectedDate(date); router.push('/(tabs)'); };

  const today = todayISO();
  const weightSeries = seriesFromValues(weights, 30, today);
  const calorieSeries = seriesFromValues(days.map(d => ({ date: d.date, value: d.kcal })), 14, today);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas }} contentContainerStyle={{ padding: spacing.gutter, paddingTop: insets.top + spacing.sm, gap: spacing.base, paddingBottom: 120 }}>
      <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.screenTitle }}>History</Text>

      <WeightCard onSaved={load} />

      <Card style={{ gap: spacing.sm }}>
        <SectionLabel>Weight · last 30 days</SectionLabel>
        <LineChart data={weightSeries} color={macroColors.protein} />
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <SectionLabel>Calories · last 14 days</SectionLabel>
        <BarChart data={calorieSeries} color={macroColors.calories} />
      </Card>

      <View style={{ gap: spacing.sm }}>
        <SectionLabel>Logged days</SectionLabel>
        {days.length === 0 ? (
          <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.bodySm }}>
            No days logged yet.
          </Text>
        ) : days.map(d => (
          <ListRow key={d.date} title={d.date === today ? 'Today' : d.date}
            onPress={() => open(d.date)} meta={<Pill tone={colors.amber}>{d.kcal} kcal</Pill>} />
        ))}
      </View>
    </ScrollView>
  );
}
