import { useState, useEffect } from 'react';
import { ScrollView, View, Text, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import { useApp } from '../../state/AppContext';
import { setTarget, getSetting, setSetting, dumpTables, loadTables } from '../../db/queries';
import { buildBackup, parseBackup, countRows } from '../../lib/backup';
import { Field } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { Card } from '../../components/ui/Card';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, type } from '../../theme';

export default function Settings() {
  const { target, refreshTarget } = useApp();
  const insets = useSafeAreaInsets();
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

  const exportBackup = async () => {
    try {
      const data = await dumpTables();
      const json = buildBackup(data, new Date().toISOString());
      const f = new File(Paths.cache, 'nutrition-backup.json');
      f.write(json);
      const uri = f.uri;
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Sharing unavailable', 'Cannot open the share sheet on this device.');
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'application/json', UTI: 'public.json', dialogTitle: 'Nutrition backup' });
    } catch {
      Alert.alert('Export failed', 'Could not create the backup.');
    }
  };

  const restoreBackup = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
      if (res.canceled || !res.assets?.[0]?.uri) return;
      const text = await new File(res.assets[0].uri).text();
      const backup = parseBackup(text);
      if (!backup) {
        Alert.alert('Invalid file', 'That is not a Nutrition backup file.');
        return;
      }
      const n = countRows(backup.data);
      Alert.alert('Restore backup?', `Merge ${n} item${n === 1 ? '' : 's'} from this backup into your data?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restore', onPress: async () => {
          const imported = await loadTables(backup.data);
          Alert.alert('Restored', `Merged ${imported} item${imported === 1 ? '' : 's'}.`);
        } },
      ]);
    } catch {
      Alert.alert('Restore failed', 'Could not read that backup file.');
    }
  };

  const labelled = (label: string, value: string, onChange: (s: string) => void) => (
    <View style={{ gap: spacing.xs }}>
      <SectionLabel>{label}</SectionLabel>
      <Field value={value} onChangeText={onChange} keyboardType="numeric" />
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas }} contentContainerStyle={{ padding: spacing.gutter, paddingTop: insets.top + spacing.sm, gap: spacing.base, paddingBottom: 120 }}>
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
      <Card style={{ gap: spacing.md }}>
        <SectionLabel>Backup & Restore</SectionLabel>
        <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.caption }}>
          Export saves all your data (not your API keys) to a file you can store in Files or iCloud. Restore merges a backup back in.
        </Text>
        <Button variant="secondary" onPress={exportBackup}>Export backup</Button>
        <Button variant="secondary" onPress={restoreBackup}>Restore from backup</Button>
      </Card>
    </ScrollView>
  );
}
