import { useCallback, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { getLoggedDates } from '../../db/queries';
import { useApp } from '../../state/AppContext';
import { todayISO } from '../../lib/date';
import { ListRow } from '../../components/ui/ListRow';
import { Pill } from '../../components/ui/Pill';
import { colors, spacing, type } from '../../theme';

export default function History() {
  const { setSelectedDate } = useApp();
  const [days, setDays] = useState<{ date: string; kcal: number }[]>([]);
  const load = useCallback(async () => { setDays(await getLoggedDates()); }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const open = (date: string) => { setSelectedDate(date); router.push('/(tabs)'); };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas }} contentContainerStyle={{ padding: spacing.gutter, gap: spacing.base, paddingBottom: 120 }}>
      <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.screenTitle }}>History</Text>
      {days.length === 0 ? (
        <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.bodySm }}>
          No days logged yet. Log a food on Today and it'll show up here.
        </Text>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {days.map(d => (
            <ListRow
              key={d.date}
              title={d.date === todayISO() ? 'Today' : d.date}
              onPress={() => open(d.date)}
              meta={<Pill tone={colors.amber}>{d.kcal} kcal</Pill>}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
