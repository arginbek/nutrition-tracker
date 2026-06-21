import { View, Text } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { SeriesPoint, niceBounds, yToPixel } from '../../lib/trends';
import { colors, macroColors, type } from '../../theme';

export function BarChart({
  data, color = macroColors.calories, height = 120,
}: { data: SeriesPoint[]; color?: string; height?: number }) {
  const width = 300;
  const positives = data.map(d => d.value ?? 0);
  const hasData = positives.some(v => v > 0);

  if (!hasData) {
    return (
      <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.captionSm }}>
          No calories logged in this range yet.
        </Text>
      </View>
    );
  }

  const max = Math.max(...positives);
  const n = data.length;
  const gap = 2;
  const barW = (width - gap * (n - 1)) / n;

  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {data.map((d, i) => {
        const v = d.value ?? 0;
        const h = max > 0 ? (v / max) * height : 0;
        return (
          <Rect
            key={i}
            x={i * (barW + gap)}
            y={height - h}
            width={barW}
            height={h}
            rx={2}
            fill={v > 0 ? color : colors.secondary}
          />
        );
      })}
    </Svg>
  );
}
