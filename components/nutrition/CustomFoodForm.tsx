import { useState } from 'react';
import { View, Text } from 'react-native';
import { Food, EMPTY_NUTRIENTS } from '../../lib/types';
import { round1 } from '../../lib/nutrition';
import { Field } from '../ui/Field';
import { Button } from '../ui/Button';
import { SectionLabel } from '../ui/SectionLabel';
import { colors, spacing, type } from '../../theme';

const num = (s: string) => Number(s) || 0;

export function CustomFoodForm({ onSave }: { onSave: (food: Food) => void }) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [grams, setGrams] = useState('100');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const valid = name.trim().length > 0 && num(grams) > 0;

  const save = () => {
    const g = num(grams);
    const factor = 100 / g; // per-serving -> per-100g
    const food: Food = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      brand: brand.trim() || null,
      source: 'custom',
      barcode: null,
      per100g: {
        ...EMPTY_NUTRIENTS,
        kcal: Math.round(num(kcal) * factor),
        protein: round1(num(protein) * factor),
        carbs: round1(num(carbs) * factor),
        fat: round1(num(fat) * factor),
      },
      servingOptions: [
        { label: '1 serving', grams: g },
        { label: '100 g', grams: 100 },
      ],
    };
    onSave(food);
  };

  const field = (label: string, value: string, set: (s: string) => void, numeric = true) => (
    <View style={{ gap: spacing.xs }}>
      <SectionLabel>{label}</SectionLabel>
      <Field value={value} onChangeText={set} keyboardType={numeric ? 'numeric' : 'default'} autoCorrect={false} />
    </View>
  );

  return (
    <View style={{ gap: spacing.md }}>
      {field('Name', name, setName, false)}
      {field('Brand (optional)', brand, setBrand, false)}
      <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.caption }}>
        Enter the values from the label for ONE serving.
      </Text>
      {field('Serving size (g)', grams, setGrams)}
      {field('Calories', kcal, setKcal)}
      {field('Protein (g)', protein, setProtein)}
      {field('Carbs (g)', carbs, setCarbs)}
      {field('Fat (g)', fat, setFat)}
      <Button onPress={save} disabled={!valid}>Save food</Button>
    </View>
  );
}
