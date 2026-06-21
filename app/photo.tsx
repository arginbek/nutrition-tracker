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

export default function Photo() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { selectedDate } = useApp();
  const [phase, setPhase] = useState<Phase>('capture');
  const [items, setItems] = useState<EstimatedItem[]>([]);
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
      setItems(result.items);
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

  const setGrams = (i: number, grams: string) => {
    const n = Number(grams) || 0;
    setItems(prev => prev.map((it, idx) => idx === i ? scaleItem(it, n) : it));
  };
  const setName = (i: number, name: string) => {
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, name } : it));
  };
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const logAll = async () => {
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const entry: LogEntry = {
        id: `log_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 7)}`,
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

      {items.map((it, i) => (
        <Card key={i} style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <View style={{ flex: 1 }}><Field value={it.name} onChangeText={t => setName(i, t)} /></View>
            <Pressable onPress={() => removeItem(i)} hitSlop={10}>
              <Text style={{ color: colors.danger, fontFamily: type.familyMedium, fontSize: type.bodySm }}>Remove</Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <View style={{ width: 110 }}>
              <Field value={String(it.grams)} onChangeText={t => setGrams(i, t)} keyboardType="numeric" placeholder="grams" />
            </View>
            <Text style={{ color: colors.textSecondary, fontFamily: type.family, fontSize: type.bodySm }}>
              {it.kcal} kcal · {it.protein}P {it.carbs}C {it.fat}F
            </Text>
          </View>
        </Card>
      ))}

      {items.length === 0 ? (
        <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.bodySm }}>No items left.</Text>
      ) : (
        <Button onPress={logAll}>Log {items.length} item{items.length === 1 ? '' : 's'} to {MEAL_LABELS[meal]}</Button>
      )}
      <Button variant="secondary" onPress={() => setPhase('capture')}>Retake</Button>
    </ScrollView>
  );
}
