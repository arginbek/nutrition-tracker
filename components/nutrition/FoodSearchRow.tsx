import { Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Food } from '../../lib/types';
import { ListRow } from '../ui/ListRow';
import { IconTile } from '../ui/IconTile';
import { colors } from '../../theme';

export function FoodSearchRow({
  food, isFavorite, onPress, onToggleFavorite,
}: { food: Food; isFavorite: boolean; onPress: () => void; onToggleFavorite: () => void }) {
  return (
    <ListRow
      icon={<IconTile color={colors.amber}><Feather name="box" size={18} color={colors.amber} /></IconTile>}
      title={food.name}
      subtitle={food.brand ?? `${food.per100g.kcal} kcal / 100 g`}
      onPress={onPress}
      trailing={
        <Pressable onPress={onToggleFavorite} hitSlop={10}>
          <Feather name="star" size={18} color={isFavorite ? colors.amber : colors.textMuted} />
        </Pressable>
      }
    />
  );
}
