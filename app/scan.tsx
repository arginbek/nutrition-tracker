import { useRef, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { lookupBarcode } from '../lib/openfoodfacts';
import { upsertFood } from '../db/queries';
import { Button } from '../components/ui/Button';
import { colors, spacing, type } from '../theme';

export default function Scan() {
  const [permission, requestPermission] = useCameraPermissions();
  const handled = useRef(false);
  const [busy, setBusy] = useState(false);

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: colors.canvas }} />;
  }
  if (!permission.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.canvas, padding: spacing.gutter, gap: spacing.base, justifyContent: 'center' }}>
        <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.heading }}>Camera access</Text>
        <Text style={{ color: colors.textSecondary, fontFamily: type.family, fontSize: type.bodySm }}>
          Nutrition needs the camera to scan barcodes.
        </Text>
        <Button onPress={requestPermission}>Grant camera access</Button>
        <Button variant="secondary" onPress={() => router.back()}>Cancel</Button>
      </View>
    );
  }

  const onScan = async ({ data }: { data: string }) => {
    if (handled.current) return;
    handled.current = true;
    setBusy(true);
    const food = await lookupBarcode(data);
    setBusy(false);
    if (food) {
      await upsertFood(food);
      router.replace(`/log/${food.id}`);
    } else {
      Alert.alert('Not found', `No product found for ${data}.`, [
        { text: 'Scan again', onPress: () => { handled.current = false; } },
        { text: 'Add custom food', onPress: () => router.replace('/food/new') },
      ]);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
        onBarcodeScanned={handled.current ? undefined : onScan}
      />
      <View style={{ position: 'absolute', bottom: 48, left: 0, right: 0, alignItems: 'center', gap: spacing.md }}>
        <Text style={{ color: '#fff', fontFamily: type.familyMedium, fontSize: type.bodySm }}>
          {busy ? 'Looking up…' : 'Point at a barcode'}
        </Text>
        <View style={{ width: 200 }}>
          <Button variant="secondary" onPress={() => router.back()}>Cancel</Button>
        </View>
      </View>
    </View>
  );
}
