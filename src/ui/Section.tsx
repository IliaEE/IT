import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { space } from '@/theme/tokens';
import { Text } from './Text';

export function Section({ label, children, delay = 0 }: { label: string; children: ReactNode; delay?: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(20).stiffness(180)} layout={LinearTransition} style={styles.root}>
      <Text variant="overline" tone="faint">{label.toUpperCase()}</Text>
      <View style={styles.body}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({ root: { gap: space.sm }, body: { gap: space.sm } });
