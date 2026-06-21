import { View } from 'react-native';
import { LogEntry, MealId, MEAL_LABELS } from '../../lib/types';
import { SectionLabel } from '../ui/SectionLabel';
import { ListRow } from '../ui/ListRow';
import { spacing, colors, type } from '../../theme';
import { Text } from 'react-native';

export function MealSection({
  meal, entries, onPressEntry,
}: { meal: MealId; entries: LogEntry[]; onPressEntry: (e: LogEntry) => void }) {
  if (entries.length === 0) return null;
  return (
    <View style={{ gap: spacing.sm }}>
      <SectionLabel>{MEAL_LABELS[meal]}</SectionLabel>
      {entries.map(e => (
        <ListRow
          key={e.id}
          title={e.nameSnapshot}
          subtitle={`${e.quantity} × ${e.servingLabel}`}
          onPress={() => onPressEntry(e)}
          trailing={
            <Text style={{ color: colors.text, fontFamily: type.familySemibold, fontSize: type.bodySm }}>
              {e.computed.kcal} kcal
            </Text>
          }
        />
      ))}
    </View>
  );
}
