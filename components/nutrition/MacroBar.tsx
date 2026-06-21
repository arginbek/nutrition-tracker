import { View, Text } from 'react-native';
import { MeterBar } from '../ui/MeterBar';
import { macroPercentOfTarget } from '../../lib/totals';
import { colors, type } from '../../theme';

export function MacroBar({
  label, consumed, target, color,
}: { label: string; consumed: number; target: number; color: string }) {
  const pct = macroPercentOfTarget(consumed, target);
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.text, fontFamily: type.familyMedium, fontSize: type.bodySm }}>{label}</Text>
        <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.caption }}>
          {Math.round(consumed)}g / {target}g ({pct}%)
        </Text>
      </View>
      <MeterBar value={consumed} max={target} color={color} />
    </View>
  );
}
