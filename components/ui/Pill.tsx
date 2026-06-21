import { View, Text } from 'react-native';
import { colors, radii, type, tint } from '../../theme';

export function Pill({
  tone = colors.amber, dot = false, children,
}: {
  tone?: string;
  dot?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: tint(tone),
        borderRadius: radii.pill,
        paddingHorizontal: 10, paddingVertical: 4,
      }}
    >
      {dot && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: tone }} />}
      <Text style={{ color: tone, fontFamily: type.familyMedium, fontSize: type.captionSm }}>
        {children}
      </Text>
    </View>
  );
}
