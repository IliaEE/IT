import { StyleSheet, View } from 'react-native';
import { Text } from './Text';

export function Stat({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'success' }) {
  return (
    <View style={styles.root}>
      <Text variant="caption" tone="mute">{label}</Text>
      <Text variant="headingSm" tone={tone}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, gap: 2 } });
