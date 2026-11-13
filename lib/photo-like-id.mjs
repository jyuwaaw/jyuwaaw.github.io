import { createHash } from 'node:crypto';

// Independent of image encoding, metadata and gallery ordering.
export function photoLikeId(folder, filename) {
  return createHash('sha256').update(`${folder}/${filename}`).digest('hex').slice(0, 32);
}
