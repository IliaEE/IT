import { ClipOp, ImageFormat, PathOp, Skia, StrokeCap, StrokeJoin, TileMode, type SkImage, type SkPath } from '@shopify/react-native-skia';
import { writeBytes } from './files';
import { fileSize, type Processed } from './image';

export type Point = { x: number; y: number };
export type Stroke = { points: Point[]; width: number }; // canvas coordinates

export type BlurExport = {
  image: SkImage;
  strokes: Stroke[];
  sigma: number; // in canvas px
  origin: Point; // where the photo sits inside the canvas
  scale: number; // photo px per canvas px
};

const MAX_SIDE = 4096;

export function strokePath(points: Point[], map: (p: Point) => Point = (p) => p): SkPath {
  const path = Skia.Path.Make();
  points.forEach((pt, i) => {
    const { x, y } = map(pt);
    if (i === 0) path.moveTo(x, y);
    path.lineTo(x, y);
  });
  return path;
}

// Re-draws the edit at photo resolution: the photo, then a blurred copy clipped to the
// union of the brush strokes. Everything is scaled from canvas space by `scale`.
export async function exportBlur(job: BlurExport): Promise<Processed> {
  const w = job.image.width();
  const h = job.image.height();
  const fit = Math.min(1, MAX_SIDE / Math.max(w, h));
  const outW = Math.round(w * fit);
  const outH = Math.round(h * fit);
  const surface = Skia.Surface.MakeOffscreen(outW, outH);
  if (!surface) throw new Error('Could not create a drawing surface for this photo size');

  const canvas = surface.getCanvas();
  const src = Skia.XYWHRect(0, 0, w, h);
  const dst = Skia.XYWHRect(0, 0, outW, outH);
  canvas.drawImageRect(job.image, src, dst, Skia.Paint());

  const k = job.scale * fit;
  let clip: SkPath | null = null;
  for (const s of job.strokes) {
    const outline = strokePath(s.points, (p) => ({ x: (p.x - job.origin.x) * k, y: (p.y - job.origin.y) * k })).stroke({
      width: s.width * k,
      cap: StrokeCap.Round,
      join: StrokeJoin.Round,
    });
    if (!outline) continue;
    if (clip) clip.op(outline, PathOp.Union);
    else clip = outline;
  }
  if (clip) {
    canvas.save();
    canvas.clipPath(clip, ClipOp.Intersect, true);
    const paint = Skia.Paint();
    paint.setImageFilter(Skia.ImageFilter.MakeBlur(job.sigma * k, job.sigma * k, TileMode.Clamp, null));
    canvas.drawImageRect(job.image, src, dst, paint);
    canvas.restore();
  }
  surface.flush();

  const bytes = surface.makeImageSnapshot().encodeToBytes(ImageFormat.JPEG, 92);
  const uri = await writeBytes(bytes, `blur-${Date.now()}.jpg`, 'image/jpeg');
  return { uri, width: outW, height: outH, size: await fileSize(uri), format: 'jpg' };
}
