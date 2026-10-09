import defaultCaptions from './photography.json';
import { getPhotoSources } from './gallery-sources.mjs';
import { photoDisplayName, cameraDisplayName, locationDisplayName } from './gallery-metadata.mjs';

// Keep the camera's local capture time; never substitute the export/file date.
function captureDate(value) {
  if (typeof value !== 'string') return '';
  const match = value.match(/^(\d{4})[:-](\d{2})[:-](\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2}))?/);
  if (!match) return '';
  const [, year, month, day, hour = '00', minute = '00', second = '00'] = match;
  const normalized = year + '-' + month + '-' + day + 'T' + hour + ':' + minute + ':' + second;
  const date = new Date(normalized + 'Z');
  return Number(year) > 0 && !Number.isNaN(date.valueOf()) && date.toISOString().slice(0,19) === normalized ? normalized : '';
}

// Read only the curated drop folder. Originals are never modified.
export async function getPhotographs({ folder = 'photography', captions = defaultCaptions, defaultStyle = 'Unsorted' } = {}) {
  const sources = await getPhotoSources(folder);
  const photos = [];
  for (const { filename, src, fullSrc, width, height, exif } of sources) {
    const caption = captions.find((item) => item.filename === filename) ?? {};
    const title = caption.title || photoDisplayName(filename);
    const capturedAt = captureDate(caption.capturedAt) || captureDate(exif.DateTimeOriginal) || captureDate(exif.CreateDate);
    const exposure = Number(exif.ExposureTime);
    const settings = [
      exif.FocalLength ? Number(Number(exif.FocalLength).toFixed(2)) + 'mm' : '',
      exif.FNumber ? 'f/' + Number(Number(exif.FNumber).toFixed(2)) : '',
      exposure > 0 ? (exposure < 1 ? '1/' + Math.round(1 / exposure) : exposure) + 's' : '',
      exif.ISO ? 'ISO ' + exif.ISO : '',
    ].filter(Boolean).join(' · ');
    photos.push({
      id: filename,
      src,
      fullSrc,
      width,
      height,
      title,
      label: caption.label || '',
      style: caption.style || defaultStyle,
      light: caption.light || '',
      order: Number.isFinite(caption.order) ? caption.order : Number.MAX_SAFE_INTEGER,
      capturedAt,
      date: capturedAt.slice(0, 10),
      camera: cameraDisplayName(caption.camera ?? exif.Model),
      settings,
      alt: caption.alt || title,
      location: typeof caption.location === 'string' ? caption.location : locationDisplayName(exif),
      year: caption.year || '',
    });
  }
  return photos;
}
