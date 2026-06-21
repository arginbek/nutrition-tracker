import { Pressable, Text, View } from 'react-native';
import { colors, radii, spacing, type } from '../../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
const palette: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.amber, fg: colors.onAccent, border: 'transparent' },
  secondary: { bg: colors.secondary, fg: colors.text, border: colors.border },
  ghost: { bg: 'transparent', fg: colors.amber, border: 'transparent' },
  destructive: { bg: colors.danger, fg: '#fff', border: 'transparent' },
};

export function Button({
  variant = 'primary', icon, disabled = false, onPress, children,
}: {
  variant?: Variant;
  icon?: React.ReactNode;
  disabled?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
}) {
  const p = palette[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
        backgroundColor: p.bg, borderWidth: 1, borderColor: p.border,
        borderRadius: radii.row, paddingVertical: spacing.s14, paddingHorizontal: spacing.lg,
      })}
    >
      <Text style={{ color: p.fg, fontFamily: type.familyBold, fontSize: type.body }}>{children}</Text>
      {icon != null && <View>{icon}</View>}
    </Pressable>
  );
}
