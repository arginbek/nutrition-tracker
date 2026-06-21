import { useState, useEffect } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useApp } from '../../state/AppContext';
import { setTarget, getSetting, setSetting } from '../../db/queries';
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
  const [usdaKey, setUsdaKey] = useState('');
  const [keySaved, setKeySaved] = useState(false);
  const [anthropicKey, setAnthropicKey] = useState('');
  const [aiSaved, setAiSaved] = useState(false);

  useEffect(() => {
    getSetting('usda_api_key').then(v => setUsdaKey(v ?? ''));
    getSetting('anthropic_api_key').then(v => setAnthropicKey(v ?? ''));
  }, []);

  const save = async () => {
    await setTarget({
      dailyKcal: Number(kcal) || 0, proteinG: Number(p) || 0,
      carbsG: Number(c) || 0, fatG: Number(f) || 0,
    });
    await refreshTarget();
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const saveKey = async () => {
    await setSetting('usda_api_key', usdaKey.trim());
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 1500);
  };

  const saveAiKey = async () => {
    await setSetting('anthropic_api_key', anthropicKey.trim());
    setAiSaved(true);
    setTimeout(() => setAiSaved(false), 1500);
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
      <Card style={{ gap: spacing.md }}>
        <SectionLabel>Food data (USDA)</SectionLabel>
        <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.caption }}>
          Leave blank to use the shared DEMO_KEY (rate-limited). Get a free key at api.data.gov/signup.
        </Text>
        <Field
          value={usdaKey}
          onChangeText={setUsdaKey}
          placeholder="USDA API key (optional)"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Button variant="secondary" onPress={saveKey}>{keySaved ? 'Saved ✓' : 'Save key'}</Button>
      </Card>
      <Card style={{ gap: spacing.md }}>
        <SectionLabel>AI photo estimation (Anthropic)</SectionLabel>
        <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.caption }}>
          Needed for "Snap a meal". Get a key at console.anthropic.com. Stored on this device; ~a few cents per photo.
        </Text>
        <Field
          value={anthropicKey}
          onChangeText={setAnthropicKey}
          placeholder="Anthropic API key"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
        />
        <Button variant="secondary" onPress={saveAiKey}>{aiSaved ? 'Saved ✓' : 'Save key'}</Button>
      </Card>
    </ScrollView>
  );
}
