export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('图片打不开，请选 PNG、JPEG 或 WebP 截图。'));
    image.src = url;
  });
}

export async function prepareImage(file) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 20 * 1024 * 1024)
    throw new Error('请选择 20 MB 以内的 PNG、JPEG 或 WebP 截图。');
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    const scale = Math.min(1, 2200 / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return { id: crypto.randomUUID(), url: canvas.toDataURL('image/jpeg', 0.85), masks: [] };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function flattenImage({ url, masks }) {
  const img = await loadImage(url);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  ctx.fillStyle = '#171717';
  for (const mask of masks) {
    const left = Math.floor(mask.x * img.width);
    const top = Math.floor(mask.y * img.height);
    ctx.fillRect(left, top, Math.ceil((mask.x + mask.w) * img.width) - left, Math.ceil((mask.y + mask.h) * img.height) - top);
  }
  return canvas.toDataURL('image/jpeg', 0.86);
}

export async function saveReview(review, images) {
  const screenshots = await Promise.all(images.map(loadImage));
  const canvas = document.createElement('canvas');
  const width = 900;
  const ctx = canvas.getContext('2d');
  const lines = [];
  let height = 70;
  function add(text, size, color, weight = 400) {
    const font = weight + ' ' + size + 'px system-ui, sans-serif';
    ctx.font = font;
    let line = '';
    for (const char of text) {
      if (ctx.measureText(line + char).width > width - 120 && line) {
        lines.push({ line, font, color, y: height });
        height += size * 1.56;
        line = '';
      }
      line += char;
    }
    lines.push({ line, font, color, y: height });
    height += size * 1.56 + 18;
  }
  add('桌面锐评', 25, '#b5ed94', 600);
  add(review.title, 46, '#ffffff', 700);
  add(review.roast, 30, '#ececec');
  add('MBTI 趣猜 · ' + review.mbti, 34, '#b5ed94', 700);
  add(review.reason, 27, '#eeeeee');
  for (const t of review.traits) add(t.name + ' · ' + t.evidence, 26, '#dedede');
  add('根据可见主屏的趣味印象', 22, '#aaaaaa');
  const gap = 16;
  const cell = (width - 120 - (screenshots.length - 1) * gap) / screenshots.length;
  const thumbs = screenshots.map(img => {
    const scale = Math.min(cell / img.width, 620 / img.height);
    return { img, w: img.width * scale, h: img.height * scale };
  });
  const thumbHeight = Math.max(0, ...thumbs.map(t => t.h));
  canvas.width = width;
  canvas.height = Math.ceil(height + thumbHeight + 45);
  ctx.fillStyle = '#151515';
  ctx.fillRect(0, 0, width, canvas.height);
  for (const t of lines) {
    ctx.font = t.font;
    ctx.fillStyle = t.color;
    ctx.fillText(t.line, 60, t.y);
  }
  thumbs.forEach((t, i) => {
    ctx.drawImage(t.img, 60 + (cell + gap) * i + (cell - t.w) / 2, height, t.w, t.h);
  });
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = '桌面锐评.png';
  link.click();
}
