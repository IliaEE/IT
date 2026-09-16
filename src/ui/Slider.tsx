import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { colors, radius, spring } from '@/theme/tokens';

type Props = {
  value: number; // 0..1
  onChange: (v: number) => void;
  onEnd?: (v: number) => void;
};

const THUMB = 28;

// Hairline track, white fill, white thumb — the thumb grows while dragging.
export function Slider({ value, onChange, onEnd }: Props) {
  const [width, setWidth] = useState(0);
  const progress = useSharedValue(value);
  const active = useSharedValue(0);
  const usable = Math.max(0, width - THUMB);

  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => {
      active.value = withSpring(1, spring.press);
      const p = Math.min(1, Math.max(0, (e.x - THUMB / 2) / usable));
      progress.value = p;
      scheduleOnRN(onChange, p);
    })
    .onUpdate((e) => {
      const p = Math.min(1, Math.max(0, (e.x - THUMB / 2) / usable));
      progress.value = p;
      scheduleOnRN(onChange, p);
    })
    .onFinalize(() => {
      active.value = withSpring(0, spring.press);
      if (onEnd) scheduleOnRN(onEnd, progress.value);
    });

  const fill = useAnimatedStyle(() => ({ width: THUMB / 2 + progress.value * usable }));
  const thumb = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * usable }, { scale: 1 + active.value * 0.15 }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.root} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <View style={styles.track} />
        <Animated.View style={[styles.fill, fill]} />
        <Animated.View style={[styles.thumb, thumb]} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  root: { height: 44, justifyContent: 'center' },
  track: { height: 4, borderRadius: 2, backgroundColor: colors.hairline },
  fill: { position: 'absolute', left: 0, height: 4, borderRadius: 2, backgroundColor: colors.onDark },
  thumb: {
    position: 'absolute',
    left: 0,
    width: THUMB,
    height: THUMB,
    borderRadius: radius.full,
    backgroundColor: colors.onDark,
  },
});
