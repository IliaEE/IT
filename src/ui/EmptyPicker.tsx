import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, radius, space } from '@/theme/tokens';
import { IconCircle } from './IconCircle';
import { ScalePressable } from './ScalePressable';
import { Text } from './Text';

type Props = { title: string; hint: string; onPress: () => void };

// The first thing a tool shows: one big tappable surface to pick a photo.
export function EmptyPicker({ title, hint, onPress }: Props) {
  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <ScalePressable onPress={onPress} style={styles.root} scaleTo={0.985}>
        <IconCircle name="image" size={64} tone="light" />
        <View style={{ alignItems: 'center', gap: space.xs }}>
          <Text variant="headingSm">{title}</Text>
          <Text variant="bodySm" tone="mute" style={{ textAlign: 'center' }}>{hint}</Text>
        </View>
      </ScalePressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 280,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xl,
    padding: space.xxl,
  },
});
