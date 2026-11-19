import { readFile, rename, rm, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';

export const selectionPath = join(process.cwd(), 'src/data/cover-photos.json');
export const session = randomUUID();
export const readSelection = async (path = selectionPath) => JSON.parse(await readFile(path, 'utf8'));
export function localRequest(request) {
  const host = request.headers.get('host');
  return /^(localhost|127\.0\.0\.1):\d+$/.test(host || '') && request.url.startsWith(`http://${host}/`);
}

let queue = Promise.resolve();
export function saveSelection(input, available, path = selectionPath) {
  const write = async () => {
    if (!Array.isArray(input?.ids) || !input.ids.length || input.ids.length > available.size ||
        new Set(input.ids).size !== input.ids.length || input.ids.some(id => !available.has(id))) {
      throw Object.assign(new Error('请至少选择一张相册中的照片，每张只选一次。'), { status: 400 });
    }
    const current = await readSelection(path);
    if (JSON.stringify(input.previous) !== JSON.stringify(current)) {
      throw Object.assign(new Error('清单已在其他窗口更新。请重新载入后再编辑。'), { status: 409 });
    }
    const temporary = path + '.' + randomUUID() + '.tmp';
    try {
      await writeFile(temporary, JSON.stringify(input.ids, null, 2) + '\n', { flag:'wx' });
      await rename(temporary, path);
    } finally {
      await rm(temporary, { force:true });
    }
    return input.ids;
  };
  const next = queue.then(write);
  queue = next.catch(() => {});
  return next;
}
