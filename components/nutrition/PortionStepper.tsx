import { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Food } from '../../lib/types';
import { computeEntryNutrition } from '../../lib/nutrition';
import { Field } from '../ui/Field';
import { colors, radii, spacing, type } from '../../theme';

const MULTIPLIERS = [0.5, 1, 1.5, 2];

export interface PortionSelection {
  servingLabel: string; quantity: number; grams: number;
  nutrients: ReturnType<typeof computeEntryNutrition>;
}

export function PortionStepper({ food, onChange }: { food: Food; onChange: (s: PortionSelection) => void }) {
  const [serving, setServing] = useState(food.servingOptions[0]);
  const [multiplier, setMultiplier] = useState(1);
  const [gramOverride, setGramOverride] = useState('');

  useEffect(() => {
    const grams = gramOverride ? Number(gramOverride) || 0 : serving.grams * multiplier;
    const label = gramOverride ? `${grams} g` : serving.label;
    const quantity = gramOverride ? 1 : multiplier;
    const servingGrams = gramOverride ? grams : serving.grams;
    onChange({
      servingLabel: label, quantity, grams,
      nutrients: computeEntryNutrition(food.per100g, servingGrams, quantity),
    });
  }, [serving, multiplier, gramOverride]);

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {food.servingOptions.map(opt => (
          <Pressable
            key={opt.label}
            onPress={() => { setServing(opt); setGramOverride(''); }}
            style={{
              paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
              borderRadius: radii.control, borderWidth: 1,
              borderColor: !gramOverride && serving.label === opt.label ? colors.amber : colors.border,
              backgroundColor: colors.secondary,
            }}
          >
            <Text style={{ color: colors.text, fontFamily: type.familyMedium, fontSize: type.bodySm }}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {MULTIPLIERS.map(m => (
          <Pressable
            key={m}
            onPress={() => { setMultiplier(m); setGramOverride(''); }}
            style={{
              flex: 1, alignItems: 'center', paddingVertical: spacing.sm,
              borderRadius: radii.control, borderWidth: 1,
              borderColor: !gramOverride && multiplier === m ? colors.amber : colors.border,
              backgroundColor: colors.secondary,
            }}
          >
            <Text style={{ color: colors.text, fontFamily: type.familyMedium, fontSize: type.bodySm }}>{m}×</Text>
          </Pressable>
        ))}
      </View>

      <Field
        value={gramOverride}
        onChangeText={setGramOverride}
        placeholder="or enter exact grams"
        keyboardType="numeric"
      />
    </View>
  );
}
