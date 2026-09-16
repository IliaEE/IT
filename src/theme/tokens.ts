// Design tokens adapted from the Revolut reference (docs/design-reference-revolut.md)
// for an app surface: true-black canvas, one elevated dark step, white pill CTAs,
// cobalt kept scarce, Inter for everything (Aeonik Pro is not licensable).

export const colors = {
  canvas: '#000000',
  surfaceDeep: '#0a0a0a',
  surface: '#16181a',
  surfaceSoft: '#f4f4f4',
  primary: '#494fdf',
  primaryBright: '#4f55f1',
  primaryDeep: '#3a40c4',
  onPrimary: '#ffffff',
  onDark: '#ffffff',
  onDarkMute: 'rgba(255,255,255,0.72)',
  onDarkFaint: 'rgba(255,255,255,0.45)',
  hairline: 'rgba(255,255,255,0.12)',
  divider: 'rgba(255,255,255,0.06)',
  ink: '#191c1f',
  faint: '#c9c9cd',
  success: '#00a87e',
  warning: '#ec7e00',
  danger: '#e23b4a',
} as const;

export const radius = { sm: 8, md: 12, lg: 20, xl: 28, full: 9999 } as const;

export const space = {
  xxs: 4,
  xs: 6,
  sm: 8,
  md: 14,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const type = {
  displayLg: { fontFamily: font.semibold, fontSize: 40, lineHeight: 44, letterSpacing: -1.2 },
  displayMd: { fontFamily: font.semibold, fontSize: 32, lineHeight: 36, letterSpacing: -0.8 },
  headingLg: { fontFamily: font.semibold, fontSize: 28, lineHeight: 34, letterSpacing: -0.56 },
  headingMd: { fontFamily: font.semibold, fontSize: 24, lineHeight: 30, letterSpacing: -0.36 },
  headingSm: { fontFamily: font.semibold, fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
  bodyLg: { fontFamily: font.regular, fontSize: 18, lineHeight: 28, letterSpacing: -0.09 },
  bodyMd: { fontFamily: font.regular, fontSize: 16, lineHeight: 24, letterSpacing: 0.1 },
  bodyMdBold: { fontFamily: font.semibold, fontSize: 16, lineHeight: 24, letterSpacing: 0.1 },
  bodySm: { fontFamily: font.regular, fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  buttonMd: { fontFamily: font.semibold, fontSize: 16, lineHeight: 24, letterSpacing: 0.2 },
  buttonSm: { fontFamily: font.semibold, fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
  caption: { fontFamily: font.regular, fontSize: 13, lineHeight: 18, letterSpacing: 0 },
  overline: { fontFamily: font.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 1.2 },
} as const;

export const spring = {
  press: { damping: 16, stiffness: 320, mass: 0.6 },
  gentle: { damping: 20, stiffness: 180 },
  snappy: { damping: 22, stiffness: 260 },
} as const;
