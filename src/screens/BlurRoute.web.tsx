import { View } from 'react-native';
import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import { colors } from '@/theme/tokens';

// Skia's CanvasKit must load before any Skia component renders on the web.
export default function BlurRoute() {
  return (
    <WithSkiaWeb
      getComponent={() => import('./BlurScreen')}
      opts={{ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/canvaskit-wasm@0.41.0/bin/full/${file}` }}
      fallback={<View style={{ flex: 1, backgroundColor: colors.canvas }} />}
    />
  );
}
