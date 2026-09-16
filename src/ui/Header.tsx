import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, radius, space } from '@/theme/tokens';
import { ScalePressable } from './ScalePressable';
import { Text } from './Text';

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const router = useRouter();
  return (
    <View style={styles.root}>
      <ScalePressable onPress={() => router.back()} style={styles.back} scaleTo={0.9} hitSlop={8}>
        <Feather name="chevron-left" size={22} color={colors.onDark} />
      </ScalePressable>
      <View style={{ gap: 2 }}>
        <Text variant="headingLg">{title}</Text>
        {subtitle ? <Text variant="bodySm" tone="mute">{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space.lg, paddingTop: space.xs },
  back: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
