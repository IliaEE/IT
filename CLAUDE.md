# Image Tools

Expo (SDK 57) app — one codebase for iOS, Android and web. Four on-device photo utilities,
no server, no AI: **Convert** (HEIC/JPG/PNG + photo→PDF), **Image Size** (resize, batch, fit-to-ratio,
DPI), **Compress** (quality slider with live size), **Blur** (brush that blurs what you paint, adjustable strength). Product context lives in `docs/`:
`PRD.md` (original, partly superseded), `aso/demand-report-2026-09-16.md` (why exactly these features).

## Scope rule — data-driven only

A feature ships only if a keyword cluster in `docs/aso/demand-report-2026-09-16.md` supports it.
Since 2026-09-17 the bar for new features is **popularity > 40 in at least one of US/CA/AU/GB**. Section 5.3 there is the source of truth for
what is in, what was removed (rotate/flip, WebP, target-KB compression) and why. Do not add "expected"
or "nice" features without a row in that table.

## Run

```bash
npx expo start          # Metro; press i for iOS simulator (Expo Go), w for web
npx tsc --noEmit        # type check — keep it clean
```

Expo Go is enough: every native module used here ships in it. `.claude/launch.json` starts the same server.

## Layout

- `src/app/` — Expo Router screens: `index` (home), `convert`, `size`, `compress`; `_layout` loads Inter and the Stack.
- `src/ui/` — design-system components (Button, Card, Chip, Segmented, Slider, ResultSheet…). Import from `@/ui`.
- `src/lib/image.ts` — the processing engine on top of `expo-image-manipulator`; `pdf.ts` (expo-print), `save.ts` (Photos / share / web download).
- `src/screens/BlurScreen.tsx` + `src/lib/blur.ts` — the Blur brush on `@shopify/react-native-skia` (in Expo Go). Preview: base image + blurred copy inside a `Mask` of stroked paths; export: offscreen surface at photo resolution, `clipPath` on the union of stroked outlines, `MakeBlur` scaled by the canvas→photo ratio. Input is normalised to JPEG first (Skia has no HEIC decoder and its URI loader rejects picker paths). `BlurRoute.web.tsx` wraps it in `WithSkiaWeb` (CanvasKit from jsDelivr); the split lives in `screens/`, not `app/`, because Expo Router pulls `.web.tsx` routes into the native bundle.
- `src/lib/naming.ts` — every output is `image-tools-<tool>-<YYYY-MM-DD>[-<n>].<ext>`; `save.ts` copies the temp file under that name before Photos / share so the name survives.
- `src/lib/dpi.ts` — DPI is metadata the manipulator cannot write, so this patches the bytes: JFIF APP0 density, EXIF IFD0 X/YResolution + ResolutionUnit, Photoshop 8BIM 0x03ED, PNG pHYs. All three JPEG records are kept in sync because ImageIO prefers EXIF over JFIF.
- `src/ui/FitCanvas.tsx` — native "fit to ratio": the manipulator's `extent` is web-only, so native renders the photo in an offscreen view and snapshots it with `react-native-view-shot` (`useRenderInContext`, no explicit size — output = view dp × PixelRatio).
- `src/theme/tokens.ts` — colours, type scale, radii, springs. Derived from `docs/design-reference-revolut.md`.

## Design rules (Revolut-derived)

- Canvas is true black `#000`; the only other dark step is `surface` `#16181a`. No shadows — depth comes from those two steps and hairlines.
- Primary CTA is a **white pill with black text**. Cobalt `#494fdf` appears at most once per screen (featured card, result check mark).
- All buttons/chips `radius.full`; cards 20px; inputs 12px. Inter everywhere; display sizes use tight negative tracking.
- Motion: every tappable uses `ScalePressable` (spring to 0.97); sections enter with `FadeInDown.springify()`; results slide up in `ResultSheet`. Prefer springs over timings.

## Platform gotchas

- PNG input keeps PNG output in Image Size; everything else is JPEG. WebP is intentionally absent (no search demand, and iOS cannot encode it).
- `expo-file-system` and `expo-media-library` have no web implementation: both are imported lazily behind `Platform.OS !== 'web'`.
- `Link asChild` rejects array styles — navigate with `router.push` instead.
- Metro in `CI=1` mode disables fast refresh; run `expo start` without it.
