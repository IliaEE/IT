import { ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { colors, radius, space } from '@/theme/tokens';
import type { Picked } from '@/lib/image';
import { Button } from './Button';
import { Text } from './Text';

type Props = { images: Picked[]; meta: string; onChange?: () => void };

// Horizontal thumbnails for batch jobs — shared by Convert and Image Size.
export function ThumbStrip({ images, meta, onChange }: Props) {
  return (
    <Animated.View entering={FadeIn} layout={LinearTransition} style={styles.strip}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbs}>
        {images.map((i) => (
          <Image key={i.uri} source={{ uri: i.uri }} style={styles.thumb} contentFit="cover" transition={150} />
        ))}
      </ScrollView>
      <View style={styles.meta}>
        <Text variant="bodySm" tone="mute">{meta}</Text>
        {onChange ? <Button title="Change" variant="soft" onPress={onChange} style={{ height: 36, paddingHorizontal: 16 }} /> : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  strip: { gap: space.sm },
  thumbs: { gap: space.sm },
  thumb: { width: 96, height: 96, borderRadius: radius.md, backgroundColor: colors.surface },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.xs },
});
