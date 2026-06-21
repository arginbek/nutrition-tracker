import { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useApp } from '../../state/AppContext';
import { setTarget } from '../../db/queries';
import { Field } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { Card } from '../../components/ui/Card';
import { colors, spacing, type } from '../../theme';

export default function Settings() {
  const { target, refreshTarget } = useApp();
  const [kcal, setKcal] = useState(String(target.dailyKcal));
  const [p, setP] = useState(String(target.proteinG));
  const [c, setC] = useState(String(target.carbsG));
  const [f, setF] = useState(String(target.fatG));
  const [saved, setSaved] = useState(false);

  const save = async () => {
    await setTarget({
      dailyKcal: Number(kcal) || 0, proteinG: Number(p) || 0,
      carbsG: Number(c) || 0, fatG: Number(f) || 0,
    });
    await refreshTarget();
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const labelled = (label: string, value: string, onChange: (s: string) => void) => (
    <View style={{ gap: spacing.xs }}>
      <SectionLabel>{label}</SectionLabel>
      <Field value={value} onChangeText={onChange} keyboardType="numeric" />
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas }} contentContainerStyle={{ padding: spacing.gutter, gap: spacing.base, paddingBottom: 120 }}>
      <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.screenTitle }}>Settings</Text>
      <Card style={{ gap: spacing.md }}>
        {labelled('Daily calories', kcal, setKcal)}
        {labelled('Protein (g)', p, setP)}
        {labelled('Carbs (g)', c, setC)}
        {labelled('Fat (g)', f, setF)}
        <Button onPress={save}>{saved ? 'Saved ✓' : 'Save targets'}</Button>
      </Card>
    </ScrollView>
  );
}
