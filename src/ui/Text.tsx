import { Text as RNText, type TextProps } from 'react-native';
import { colors, type as T } from '@/theme/tokens';

type Variant = keyof typeof T;
type Tone = 'default' | 'mute' | 'faint' | 'ink' | 'inkMute' | 'primary' | 'success';

const toneColor: Record<Tone, string> = {
  default: colors.onDark,
  mute: colors.onDarkMute,
  faint: colors.onDarkFaint,
  ink: colors.ink,
  inkMute: 'rgba(25,28,31,0.6)',
  primary: colors.primaryBright,
  success: colors.success,
};

export function Text({
  variant = 'bodyMd',
  tone = 'default',
  style,
  ...rest
}: TextProps & { variant?: Variant; tone?: Tone }) {
  return <RNText {...rest} style={[T[variant], { color: toneColor[tone] }, style]} />;
}
