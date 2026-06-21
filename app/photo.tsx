import { useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { analyzePhoto, scaleItem, EstimatedItem } from '../lib/photoAI';
import { getSetting, insertLogEntry } from '../db/queries';
import { useApp } from '../state/AppContext';
import { MEALS, MEAL_LABELS, MealId, LogEntry, EMPTY_NUTRIENTS } from '../lib/types';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { Card } from '../components/ui/Card';
import { SectionLabel } from '../components/ui/SectionLabel';
import { colors, radii, spacing, type } from '../theme';

type Phase = 'capture' | 'analyzing' | 'review';

interface Row { id: string; base: EstimatedItem; name: string; gramsText: string; }

export default function Photo() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { selectedDate } = useApp();
  const [phase, setPhase] = useState<Phase>('capture');
  const [rows, setRows] = useState<Row[]>([]);
  const [meal, setMeal] = useState<MealId>('lunch');

  if (!permission) return <View style={{ flex: 1, backgroundColor: colors.canvas }} />;
  if (!permission.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.canvas, padding: spacing.gutter, gap: spacing.base, justifyContent: 'center' }}>
        <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.heading }}>Camera access</Text>
        <Text style={{ color: colors.textSecondary, fontFamily: type.family, fontSize: type.bodySm }}>
          Nutrition needs the camera to estimate a meal from a photo.
        </Text>
        <Button onPress={requestPermission}>Grant camera access</Button>
        <Button variant="secondary" onPress={() => router.back()}>Cancel</Button>
      </View>
    );
  }

  const capture = async () => {
    const key = (await getSetting('anthropic_api_key'))?.trim();
    if (!key) {
      Alert.alert('No API key', 'Add an Anthropic API key in Settings to use photo estimation.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      return;
    }
    const pic = await cameraRef.current?.takePictureAsync({ base64: true, quality: 0.4 });
    if (!pic?.base64) return;
    setPhase('analyzing');
    const result = await analyzePhoto(pic.base64, key);
    if (result.ok) {
      setRows(result.items.map((it, i) => ({
        id: `r_${i}_${Math.random().toString(36).slice(2, 7)}`,
        base: it, name: it.name, gramsText: String(it.grams),
      })));
      setPhase('review');
    } else {
      const msg = {
        unauthorized: 'API key rejected — check it in Settings.',
        refusal: "Couldn't analyze that photo. Try another shot.",
        network: 'Network error reaching Claude. Check your connection.',
        empty: 'No food detected. Try a clearer photo.',
      }[result.reason];
      Alert.alert('Estimation failed', msg, [{ text: 'Retry', onPress: () => setPhase('capture') }]);
    }
  };

  // Always scale from base; blank/invalid grams falls back to base grams (never zero).
  const scaledOf = (r: Row): EstimatedItem => {
    const n = Number(r.gramsText);
    const grams = Number.isFinite(n) && n > 0 ? n : r.base.grams;
    return { ...scaleItem(r.base, grams), name: r.name };
  };

  const setGrams = (id: string, text: string) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, gramsText: text } : r));
  const setName = (id: string, text: string) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, name: text } : r));
  const removeRow = (id: string) => setRows(prev => prev.filter(r => r.id !== id));

  const logAll = async () => {
    for (const r of rows) {
      const it = scaledOf(r);
      const entry: LogEntry = {
        id: `log_${Date.now()}_${r.id}_${Math.random().toString(36).slice(2, 7)}`,
        date: selectedDate, meal, foodId: null, nameSnapshot: it.name,
        servingLabel: `${it.grams} g`, quantity: 1,
        computed: { ...EMPTY_NUTRIENTS, kcal: it.kcal, protein: it.protein, carbs: it.carbs, fat: it.fat },
      };
      await insertLogEntry(entry);
    }
    router.back();
  };

  if (phase === 'capture') {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} />
        <View style={{ position: 'absolute', bottom: 48, left: 0, right: 0, alignItems: 'center', gap: spacing.md }}>
          <Text style={{ color: '#fff', fontFamily: type.familyMedium, fontSize: type.bodySm }}>Frame your meal, then capture</Text>
          <View style={{ width: 220, gap: spacing.sm }}>
            <Button onPress={capture}>Capture</Button>
            <Button variant="secondary" onPress={() => router.back()}>Cancel</Button>
          </View>
        </View>
      </View>
    );
  }

  if (phase === 'analyzing') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
        <Text style={{ color: colors.text, fontFamily: type.familySemibold, fontSize: type.body }}>Estimating your meal…</Text>
        <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.caption }}>Asking Claude to read the photo</Text>
      </View>
    );
  }

  // review phase
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas }} contentContainerStyle={{ padding: spacing.gutter, gap: spacing.base, paddingBottom: 40 }}>
      <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.heading }}>Confirm items</Text>
      <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.caption }}>
        AI estimates — edit grams or names, remove anything wrong, then log.
      </Text>

      <View style={{ gap: spacing.sm }}>
        <SectionLabel>Meal</SectionLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {MEALS.map(m => (
            <Pressable key={m} onPress={() => setMeal(m)} style={{
              paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.control,
              borderWidth: 1, borderColor: meal === m ? colors.amber : colors.border, backgroundColor: colors.secondary,
            }}>
              <Text style={{ color: colors.text, fontFamily: type.familyMedium, fontSize: type.bodySm }}>{MEAL_LABELS[m]}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {rows.map(r => {
        const s = scaledOf(r);
        return (
          <Card key={r.id} style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <View style={{ flex: 1 }}><Field value={r.name} onChangeText={t => setName(r.id, t)} /></View>
              <Pressable onPress={() => removeRow(r.id)} hitSlop={10}>
                <Text style={{ color: colors.danger, fontFamily: type.familyMedium, fontSize: type.bodySm }}>Remove</Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <View style={{ width: 110 }}>
                <Field value={r.gramsText} onChangeText={t => setGrams(r.id, t)} keyboardType="numeric" placeholder="grams" />
              </View>
              <Text style={{ color: colors.textSecondary, fontFamily: type.family, fontSize: type.bodySm }}>
                {s.kcal} kcal · {s.protein}P {s.carbs}C {s.fat}F
              </Text>
            </View>
          </Card>
        );
      })}

      {rows.length === 0 ? (
        <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.bodySm }}>No items left.</Text>
      ) : (
        <Button onPress={logAll}>Log {rows.length} item{rows.length === 1 ? '' : 's'} to {MEAL_LABELS[meal]}</Button>
      )}
      <Button variant="secondary" onPress={() => setPhase('capture')}>Retake</Button>
    </ScrollView>
  );
}
