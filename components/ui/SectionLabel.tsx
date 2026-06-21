import { Text } from 'react-native';
import { colors, type } from '../../theme';

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontFamily: type.familySemibold,
        fontSize: type.eyebrow,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        color: colors.textMuted,
      }}
    >
      {children}
    </Text>
  );
}
