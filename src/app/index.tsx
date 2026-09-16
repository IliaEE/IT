import { StyleSheet, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { colors, radius, space } from '@/theme/tokens';
import { IconCircle, ScalePressable, Screen, Text } from '@/ui';

type Tool = {
  href: Href;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  desc: string;
  featured?: boolean;
};

const tools: Tool[] = [
  { href: '/convert', icon: 'repeat', title: 'Convert', desc: 'HEIC to JPG or PNG — or a PDF from any photos.', featured: true },
  { href: '/size', icon: 'maximize-2', title: 'Image Size', desc: 'Resize one photo or a batch. Fit any ratio without cropping. Set DPI.' },
  { href: '/compress', icon: 'minimize-2', title: 'Compress', desc: 'Smaller files, same photo. See the size as you drag.' },
  { href: '/blur', icon: 'droplet', title: 'Blur', desc: 'Paint over faces, plates or text. Dial the strength.' },
];

export default function Home() {
  const router = useRouter();
  return (
    <Screen>
      <Animated.View entering={FadeIn.duration(400)} style={styles.hero}>
        <Text variant="overline" tone="faint">IMAGE TOOLS</Text>
        <Text variant="displayLg">Convert.{'\n'}Resize.{'\n'}Compress.</Text>
        <Text variant="bodyLg" tone="mute">Runs on your device. Photos never leave your phone.</Text>
      </Animated.View>

      <View style={styles.list}>
        {tools.map((t, i) => (
          <Animated.View key={t.title} entering={FadeInDown.delay(120 + i * 90).springify().damping(18).stiffness(160)}>
            <ScalePressable onPress={() => router.push(t.href)} style={[styles.card, t.featured && styles.featured]} scaleTo={0.975}>
                <IconCircle name={t.icon} tone={t.featured ? 'light' : 'dark'} />
                <View style={styles.copy}>
                  <Text variant="headingMd">{t.title}</Text>
                  <Text variant="bodySm" style={{ color: t.featured ? 'rgba(255,255,255,0.8)' : colors.onDarkMute }}>{t.desc}</Text>
                </View>
                <Feather name="chevron-right" size={20} color={t.featured ? colors.onPrimary : colors.onDarkFaint} />
            </ScalePressable>
          </Animated.View>
        ))}
      </View>

      <Animated.View entering={FadeIn.delay(500)}>
        <Text variant="caption" tone="faint" style={{ textAlign: 'center' }}>
          Free · No account · Nothing is uploaded
        </Text>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: space.md, paddingTop: space.xl, paddingBottom: space.lg },
  list: { gap: space.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    padding: space.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  featured: { backgroundColor: colors.primary },
  copy: { flex: 1, gap: space.xxs },
});
