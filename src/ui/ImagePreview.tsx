import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { colors, radius, space } from '@/theme/tokens';
import { ScalePressable } from './ScalePressable';
import { Text } from './Text';

type Props = {
  uri: string;
  width: number;
  height: number;
  meta: string;
  onReplace?: () => void;
  maxHeight?: number;
};

export function ImagePreview({ uri, width, height, meta, onReplace, maxHeight = 300 }: Props) {
  const ratio = width > 0 && height > 0 ? width / height : 1;
  return (
    <Animated.View entering={ZoomIn.springify().damping(18).stiffness(180)} style={styles.root}>
      <View style={[styles.frame, { aspectRatio: Math.max(ratio, 0.75), maxHeight }]}>
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="contain" transition={200} />
        {onReplace ? (
          <ScalePressable onPress={onReplace} style={styles.replace} scaleTo={0.9} hitSlop={8}>
            <Feather name="refresh-cw" size={16} color={colors.ink} />
          </ScalePressable>
        ) : null}
      </View>
      <Animated.View entering={FadeIn.delay(120)} style={styles.meta}>
        <Text variant="bodySm" tone="mute">{meta}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space.sm },
  frame: {
    width: '100%',
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  replace: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.onDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { paddingHorizontal: space.xs },
});
