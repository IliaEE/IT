import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius } from '@/theme/tokens';

type Props = { name: keyof typeof Feather.glyphMap; size?: number; tone?: 'dark' | 'light' | 'cobalt' };

export function IconCircle({ name, size = 48, tone = 'dark' }: Props) {
  const bg = tone === 'light' ? colors.onDark : tone === 'cobalt' ? colors.primary : 'rgba(255,255,255,0.08)';
  const fg = tone === 'light' ? colors.ink : colors.onDark;
  return (
    <View style={[styles.root, { width: size, height: size, backgroundColor: bg }]}>
      <Feather name={name} size={Math.round(size * 0.42)} color={fg} />
    </View>
  );
}

const styles = StyleSheet.create({ root: { borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' } });
