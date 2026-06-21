import { ScrollView, Text } from 'react-native';
import { router } from 'expo-router';
import { CustomFoodForm } from '../../components/nutrition/CustomFoodForm';
import { upsertFood } from '../../db/queries';
import { Food } from '../../lib/types';
import { colors, spacing, type } from '../../theme';

export default function NewFood() {
  const onSave = async (food: Food) => { await upsertFood(food); router.back(); };
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas }} contentContainerStyle={{ padding: spacing.gutter, gap: spacing.base, paddingBottom: 40 }}>
      <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.heading }}>New custom food</Text>
      <CustomFoodForm onSave={onSave} />
    </ScrollView>
  );
}
