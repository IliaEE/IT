import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { colors, radius, space } from '@/theme/tokens';
import { Button } from './Button';
import { Card } from './Card';
import { Stat } from './Stat';
import { Text } from './Text';

type StatItem = { label: string; value: string; tone?: 'default' | 'success' };

type Props = {
  title: string;
  stats: StatItem[];
  primary: { title: string; icon?: 'download' | 'share'; onPress: () => Promise<void> | void };
  secondary?: { title: string; icon?: 'download' | 'share'; onPress: () => Promise<void> | void };
  onReset: () => void;
  filename?: string;
};

// Slides up once a job completes. Cobalt appears exactly once: on the check mark.
export function ResultSheet({ title, stats, primary, secondary, onReset, filename }: Props) {
  const [busy, setBusy] = useState<'primary' | 'secondary' | null>(null);
  const [done, setDone] = useState(false);

  const run = async (which: 'primary' | 'secondary', fn: () => Promise<void> | void) => {
    try {
      setBusy(which);
      await fn();
      if (which === 'primary') setDone(true);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Animated.View entering={FadeInDown.springify().damping(20).stiffness(200)} layout={LinearTransition}>
      <Card tone="deep" style={styles.card}>
        <View style={styles.head}>
          <View style={styles.check}>
            <Feather name="check" size={18} color={colors.onPrimary} />
          </View>
          <Text variant="headingMd">{title}</Text>
        </View>
        <View style={styles.stats}>
          {stats.map((s) => (
            <Stat key={s.label} label={s.label} value={s.value} tone={s.tone} />
          ))}
        </View>
        {filename ? (
          <Text variant="caption" tone="faint" numberOfLines={1}>{filename}</Text>
        ) : null}
        <View style={styles.actions}>
          <Button
            title={done ? 'Saved' : primary.title}
            icon={done ? undefined : primary.icon}
            loading={busy === 'primary'}
            disabled={done}
            onPress={() => run('primary', primary.onPress)}
            size="lg"
          />
          {secondary ? (
            <Button
              title={secondary.title}
              icon={secondary.icon}
              variant="soft"
              loading={busy === 'secondary'}
              onPress={() => run('secondary', secondary.onPress)}
              size="lg"
            />
          ) : null}
          <Button title="Start over" variant="ghost" onPress={onReset} />
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.xl },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  check: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: space.lg,
    paddingTop: space.lg,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  actions: { gap: space.sm },
});
