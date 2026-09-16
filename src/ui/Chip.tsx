import { StyleSheet } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';
import { colors, radius, type as T } from '@/theme/tokens';
import { ScalePressable } from './ScalePressable';

type Props = { label: string; selected?: boolean; onPress?: () => void };

// Selectable pill. The selected state is the "white on black" inversion the
// reference uses for its loudest surfaces, animated instead of snapped.
export function Chip({ label, selected = false, onPress }: Props) {
  const progress = useDerivedValue(() => withTiming(selected ? 1 : 0, { duration: 180 }));
  const bg = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.surface, colors.onDark]),
  }));
  const fg = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [colors.onDark, colors.ink]),
  }));
  return (
    <ScalePressable onPress={onPress} scaleTo={0.95}>
      <Animated.View style={[styles.chip, bg]}>
        <Animated.Text style={[T.buttonSm, fg]}>{label}</Animated.Text>
      </Animated.View>
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
