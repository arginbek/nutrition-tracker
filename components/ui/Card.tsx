import { View, ViewStyle, StyleProp } from 'react-native';
import { colors, radii, spacing } from '../../theme';

export function Card({
  accent, padding = spacing.base, children, style,
}: {
  accent?: string;
  padding?: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: accent ?? colors.border,
          borderRadius: radii.card,
          padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
