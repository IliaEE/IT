import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors, radius, spring, type as T } from '@/theme/tokens';

type Option<K extends string> = { key: K; label: string };

type Props<K extends string> = {
  options: Option<K>[];
  value: K;
  onChange: (key: K) => void;
};

// Segmented control with a single white indicator that slides between options.
export function Segmented<K extends string>({ options, value, onChange }: Props<K>) {
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.key === value));
  const segment = width > 0 ? (width - 8) / options.length : 0;

  const indicator = useAnimatedStyle(() => ({
    width: segment,
    transform: [{ translateX: withSpring(index * segment, spring.snappy) }],
  }));

  return (
    <View style={styles.track} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {segment > 0 ? <Animated.View style={[styles.indicator, indicator]} /> : null}
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable key={o.key} style={styles.item} onPress={() => onChange(o.key)} hitSlop={4}>
            <Animated.Text style={[T.buttonSm, { color: active ? colors.ink : colors.onDarkMute }]}>{o.label}</Animated.Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    padding: 4,
    height: 48,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: radius.full,
    backgroundColor: colors.onDark,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
