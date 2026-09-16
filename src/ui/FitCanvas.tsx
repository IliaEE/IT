import { useRef, useState, type ReactNode } from 'react';
import { PixelRatio, View } from 'react-native';
import { Image } from 'expo-image';
import { captureRef } from 'react-native-view-shot';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { fileSize, type Processed } from '@/lib/image';

type Job = {
  uri: string;
  target: { width: number; height: number };
  background: string;
  resolve: (p: Processed) => void;
  reject: (e: unknown) => void;
};

// Native "square fit": expo-image-manipulator only pads on web, so we render the
// photo contained inside an offscreen view of the target size and snapshot it.
export function useFitCanvas(): { element: ReactNode; fit: (uri: string, target: Job['target'], background: string) => Promise<Processed> } {
  const [job, setJob] = useState<Job | null>(null);
  const jobRef = useRef<Job | null>(null);
  const viewRef = useRef<View>(null);

  const fit = (uri: string, target: Job['target'], background: string) =>
    new Promise<Processed>((resolve, reject) => {
      const j = { uri, target, background, resolve, reject };
      jobRef.current = j;
      setJob(j);
    });

  const onLoad = async () => {
    const j = jobRef.current;
    if (!j) return;
    try {
      await new Promise((r) => setTimeout(r, 60)); // let the frame commit before snapshotting
      // No explicit width/height: the output is the view's bounds at device scale, which is
      // why the view is sized target / PixelRatio below. Passing a size would only stretch the
      // context while the layer keeps its natural bounds.
      const uri = await captureRef(viewRef, {
        format: 'jpg',
        quality: 0.95,
        result: 'tmpfile',
        // layer.renderInContext works for views positioned off-screen; drawViewHierarchy does not.
        useRenderInContext: true,
      });
      // dp × PixelRatio can land a pixel off the target; snap to the exact size.
      const ctx = ImageManipulator.manipulate(uri);
      const probe = await ctx.renderAsync();
      let out = { uri, width: probe.width, height: probe.height };
      if (probe.width !== j.target.width || probe.height !== j.target.height) {
        ctx.reset().resize({ width: j.target.width, height: j.target.height });
        const exact = await (await ctx.renderAsync()).saveAsync({ format: SaveFormat.JPEG, compress: 0.95 });
        out = { uri: exact.uri, width: exact.width, height: exact.height };
      }
      j.resolve({ ...out, size: await fileSize(out.uri), format: 'jpg' });
    } catch (e) {
      j.reject(e);
    } finally {
      jobRef.current = null;
      setJob(null);
    }
  };

  const scale = PixelRatio.get();
  const element = job ? (
    <View
      ref={viewRef}
      collapsable={false}
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: -20000,
        top: 0,
        width: job.target.width / scale,
        height: job.target.height / scale,
        backgroundColor: job.background,
      }}
    >
      <Image source={{ uri: job.uri }} style={{ flex: 1 }} contentFit="contain" onLoad={onLoad} onError={(e) => job.reject(e)} />
    </View>
  ) : null;

  return { element, fit };
}
