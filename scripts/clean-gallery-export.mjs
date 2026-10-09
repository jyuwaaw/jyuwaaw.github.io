import fs from 'node:fs/promises';
import path from 'node:path';

// Next copies public/ verbatim. Remove local originals from the export only.
for (const folder of ['photography', 'Mechanic']) {
  const directory = path.join('out', folder);
  for (const entry of await fs.readdir(directory, { withFileTypes: true }).catch(error => {
    if (error.code === 'ENOENT') return [];
    throw error;
  })) {
    if (entry.isFile() && /\.(jpe?g|png|webp|avif)$/i.test(entry.name)) {
      await fs.unlink(path.join(directory, entry.name));
    }
  }
}

// The retired portrait is retained locally, but is not part of the site.
await fs.rm('out/images/portrait.png', { force: true });
