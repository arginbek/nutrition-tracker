import { TextInput, TextInputProps } from 'react-native';
import { colors, radii, spacing, type } from '../../theme';

export function Field(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      {...props}
      style={[
        {
          backgroundColor: colors.secondary,
          borderWidth: 1, borderColor: colors.border, borderRadius: radii.row,
          paddingHorizontal: spacing.md, paddingVertical: spacing.md,
          color: colors.text, fontFamily: type.family, fontSize: type.body,
        },
        props.style,
      ]}
    />
  );
}
