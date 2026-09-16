import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, space } from '@/theme/tokens';
import { ScalePressable } from './ScalePressable';
import { Text } from './Text';

type Variant = 'primary' | 'soft' | 'outline' | 'ghost' | 'cobalt';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: 'md' | 'lg';
  icon?: keyof typeof Feather.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const surface: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.onDark },
  soft: { backgroundColor: colors.surface },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.onDark },
  ghost: { backgroundColor: 'transparent' },
  cobalt: { backgroundColor: colors.primary },
};

const label: Record<Variant, string> = {
  primary: colors.ink,
  soft: colors.onDark,
  outline: colors.onDark,
  ghost: colors.onDarkMute,
  cobalt: colors.onPrimary,
};

export function Button({ title, onPress, variant = 'primary', size = 'md', icon, loading, disabled, style }: Props) {
  const color = label[variant];
  const inactive = disabled || loading;
  return (
    <ScalePressable
      onPress={onPress}
      disabled={inactive}
      style={[styles.base, size === 'lg' && styles.lg, surface[variant], inactive && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <View style={styles.row}>
          {icon ? <Feather name={icon} size={18} color={color} /> : null}
          <Text variant={size === 'lg' ? 'buttonMd' : 'buttonMd'} style={{ color }}>
            {title}
          </Text>
        </View>
      )}
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    paddingHorizontal: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lg: { height: 56 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  disabled: { opacity: 0.4 },
});
