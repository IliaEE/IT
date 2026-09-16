import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors, radius, space } from '@/theme/tokens';

export function Card({ style, tone = 'elevated', ...rest }: ViewProps & { tone?: 'elevated' | 'deep' | 'featured' }) {
  return (
    <View
      {...rest}
      style={[
        styles.base,
        tone === 'deep' && { backgroundColor: colors.surfaceDeep, borderWidth: 1, borderColor: colors.hairline },
        tone === 'featured' && { backgroundColor: colors.primary },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.xl,
  },
});
