import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors, space } from '@/theme/tokens';

export function ProgressBar({ value }: { value: number }) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withTiming(value, { duration: 250 });
  }, [value, w]);
  const style = useAnimatedStyle(() => ({ width: `${Math.round(w.value * 100)}%` }));
  return (
    <Animated.View entering={FadeIn} style={styles.track}>
      <Animated.View style={[styles.fill, style]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  track: { height: 4, borderRadius: 2, backgroundColor: colors.hairline, overflow: 'hidden', marginTop: space.sm },
  fill: { height: 4, backgroundColor: colors.onDark },
});
