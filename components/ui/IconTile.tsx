import { View } from 'react-native';
import { radii, tint } from '../../theme';

export function IconTile({
  color, size = 40, children,
}: {
  color: string;
  size?: number;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        width: size, height: size, borderRadius: radii.control,
        backgroundColor: tint(color),
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      {children}
    </View>
  );
}
