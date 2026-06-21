import { View, Text } from 'react-native';
import Svg, { Polyline, Circle } from 'react-native-svg';
import { SeriesPoint, niceBounds, yToPixel } from '../../lib/trends';
import { colors, macroColors, spacing, type } from '../../theme';

export function LineChart({
  data, color = macroColors.calories, height = 120,
}: { data: SeriesPoint[]; color?: string; height?: number }) {
  const width = 300;
  const present = data.map((d, i) => ({ i, value: d.value })).filter(p => p.value != null) as { i: number; value: number }[];

  if (present.length < 2) {
    return (
      <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.caption }}>
          Log a few more days to see a trend.
        </Text>
      </View>
    );
  }

  const { min, max } = niceBounds(present.map(p => p.value));
  const n = data.length;
  const x = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * width);
  const points = present.map(p => `${x(p.i)},${yToPixel(p.value, min, max, height)}`).join(' ');

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <Polyline points={points} fill="none" stroke={color} strokeWidth={2} />
        {present.map(p => (
          <Circle key={p.i} cx={x(p.i)} cy={yToPixel(p.value, min, max, height)} r={3} fill={color} />
        ))}
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs }}>
        <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.captionSm }}>{min.toFixed(0)}</Text>
        <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.captionSm }}>{max.toFixed(0)}</Text>
      </View>
    </View>
  );
}
