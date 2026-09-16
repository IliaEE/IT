import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space } from '@/theme/tokens';

type Props = { children: ReactNode; scroll?: boolean; footer?: ReactNode };

// Black canvas, safe-area aware, optional sticky footer for the main CTA.
export function Screen({ children, scroll = true, footer }: Props) {
  const insets = useSafeAreaInsets();
  const padding = { paddingTop: insets.top + space.sm, paddingBottom: footer ? space.lg : insets.bottom + space.xl };
  return (
    <View style={styles.root}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, padding]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, padding, { flex: 1 }]}>{children}</View>
      )}
      {footer ? <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  // On web the phone layout sits centered in a phone-width column instead of stretching.
  content: { paddingHorizontal: 20, gap: space.lg, ...(Platform.OS === 'web' ? { maxWidth: 560, width: '100%', alignSelf: 'center' } : {}) },
  footer: {
    paddingHorizontal: 20,
    ...(Platform.OS === 'web' ? { maxWidth: 560, width: '100%', alignSelf: 'center' } : {}),
    paddingTop: space.md,
    backgroundColor: colors.canvas,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
});
