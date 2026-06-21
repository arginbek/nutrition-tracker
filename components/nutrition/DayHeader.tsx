import { View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, type } from '../../theme';

export function DayHeader({
  label, onPrev, onNext,
}: { label: string; onPrev: () => void; onNext: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Pressable onPress={onPrev} hitSlop={12}><Feather name="chevron-left" size={24} color={colors.textMuted} /></Pressable>
      <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.screenTitle }}>{label}</Text>
      <Pressable onPress={onNext} hitSlop={12}><Feather name="chevron-right" size={24} color={colors.textMuted} /></Pressable>
    </View>
  );
}
