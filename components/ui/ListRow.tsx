import { Pressable, View, Text } from 'react-native';
import { colors, radii, spacing, type } from '../../theme';

export function ListRow({
  icon, title, subtitle, meta, trailing, onPress,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  meta?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.6 : 1,
        flexDirection: 'row', alignItems: 'center', gap: spacing.s10,
        backgroundColor: colors.card,
        borderWidth: 1, borderColor: colors.border, borderRadius: radii.row,
        padding: spacing.md,
      })}
    >
      {icon}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ color: colors.text, fontFamily: type.familyMedium, fontSize: type.bodySm }}>{title}</Text>
        {subtitle != null && (
          <Text numberOfLines={1} style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.caption, marginTop: 2 }}>{subtitle}</Text>
        )}
      </View>
      {meta}
      {trailing}
    </Pressable>
  );
}
