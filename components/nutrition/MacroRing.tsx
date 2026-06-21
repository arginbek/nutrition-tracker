import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, macroColors, type } from '../../theme';

export function MacroRing({ consumed, target }: { consumed: number; target: number }) {
  const size = 180, stroke = 14, r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = target > 0 ? Math.min(1, consumed / target) : 0;
  const remaining = target - consumed;
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.secondary} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={macroColors.calories} strokeWidth={stroke} fill="none"
          strokeDasharray={`${circ} ${circ}`} strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round" rotation={-90} origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: 32 }}>
          {Math.max(0, Math.round(remaining))}
        </Text>
        <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.caption }}>
          {remaining >= 0 ? 'kcal left' : 'kcal over'}
        </Text>
      </View>
    </View>
  );
}
