import type { APIRoute } from 'astro';
import { getPhotographs } from '@/lib/photography.js';
import { localRequest, saveSelection, session } from './storage.mjs';

export const POST: APIRoute = async ({ request }) => {
  const reply = (body:object, status=200) => Response.json(body, {status, headers:{'Cache-Control':'no-store'}});
  if (!localRequest(request) || request.headers.get('origin') !== new URL(request.url).origin ||
      request.headers.get('x-cover-session') !== session || !request.headers.get('content-type')?.startsWith('application/json')) {
    return reply({error:'请从这台电脑的头图管理页保存。'}, 403);
  }
  let input;
  try { input = await request.json(); } catch { return reply({error:'无法读取清单，请刷新后重试。'}, 400); }
  try {
    const photos = await getPhotographs();
    const ids = await saveSelection(input, new Set(photos.map(photo => photo.id)));
    return reply({ids});
  } catch (error) {
    if (error instanceof Error && 'status' in error && typeof error.status === 'number') return reply({error:error.message}, error.status);
    return reply({error:'写入网站文件失败，请重试。'}, 500);
  }
};
