import { useCallback, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { addWeight, getLatestWeight, getSetting, setSetting } from '../../db/queries';
import { todayISO } from '../../lib/date';
import { WeightEntry } from '../../lib/types';
import { Card } from '../ui/Card';
import { Field } from '../ui/Field';
import { Button } from '../ui/Button';
import { SectionLabel } from '../ui/SectionLabel';
import { colors, radii, spacing, type } from '../../theme';

export function WeightCard({ onSaved }: { onSaved: () => void }) {
  const [latest, setLatest] = useState<WeightEntry | null>(null);
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg');

  const load = useCallback(async () => {
    setLatest(await getLatestWeight());
    const u = await getSetting('weight_unit');
    if (u === 'kg' || u === 'lb') setUnit(u);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const save = async () => {
    const n = Number(value);
    if (!n || n <= 0) return;
    await setSetting('weight_unit', unit);
    await addWeight(todayISO(), n, unit);
    setValue('');
    await load();
    onSaved();
  };

  return (
    <Card style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionLabel>Weight</SectionLabel>
        {latest && (
          <Text style={{ color: colors.text, fontFamily: type.familySemibold, fontSize: type.body }}>
            {latest.weight} {latest.unit}
          </Text>
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Field value={value} onChangeText={setValue} placeholder={`Today's weight (${unit})`} keyboardType="numeric" />
        </View>
        {(['kg', 'lb'] as const).map(u => (
          <Pressable key={u} onPress={() => setUnit(u)} style={{
            paddingHorizontal: spacing.md, paddingVertical: spacing.s10, borderRadius: radii.control,
            borderWidth: 1, borderColor: unit === u ? colors.amber : colors.border, backgroundColor: colors.secondary,
          }}>
            <Text style={{ color: unit === u ? colors.amber : colors.textMuted, fontFamily: type.familyMedium, fontSize: type.bodySm }}>{u}</Text>
          </Pressable>
        ))}
      </View>
      <Button variant="secondary" onPress={save} disabled={!value || Number(value) <= 0}>Save weight</Button>
    </Card>
  );
}
