import { View, Text } from 'react-native';
import { colors, radii, type } from '../../theme';
import { fillPercent } from './meter';

export function MeterBar({
  value, max, color = colors.amber, label, count,
}: {
  value: number; max: number; color?: string; label?: string; count?: string;
}) {
  const pct = fillPercent(value, max);
  return (
    <View>
      {(label != null || count != null) && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          {label != null && (
            <Text style={{ color: colors.text, fontFamily: type.familyMedium, fontSize: type.bodySm }}>{label}</Text>
          )}
          {count != null && (
            <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.bodySm }}>{count}</Text>
          )}
        </View>
      )}
      <View style={{ height: 6, borderRadius: radii.pill, backgroundColor: colors.secondary, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: radii.pill }} />
      </View>
    </View>
  );
}
