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
  const ink = '#2d2543', muted = '#514b60', violet = '#5842a6', lilac = '#e7e0ff';
  const font = (size, weight) => weight + ' ' + size + 'px system-ui, sans-serif';
  const inset = 52, content = width - inset * 2;
  let y = 0;
  const textRuns = [];
  function label(text, x, baseline, size, color, weight) {
    textRuns.push({ text, x, baseline, color, font: font(size, weight) });
  }
  function paragraph(text, x, lineWidth, size, leading, color, weight = 400) {
    ctx.font = font(size, weight);
    let line = '';
    function flush() {
      label(line, x, y + size, size, color, weight);
      y += leading;
      line = '';
    }
    for (const char of text) {
      if (char === '\n') { flush(); continue; }
      if (line && ctx.measureText(line + char).width > lineWidth) flush();
      line += char;
    }
    if (line) flush();
  }
  label('“', inset + 8, 96, 53, '#fff', 700);
  label('Roast My Homescreen', inset + 60, 86, 32, ink, 650);
  label('桌面锐评', width - inset - 105, 84, 24, muted, 500);
  const bubbleTop = 125;
  y = bubbleTop + 30;
  paragraph(review.title, inset + 32, content - 64, 46, 60, ink, 700);
  y += 12;
  paragraph(review.roast, inset + 32, content - 64, 32, 48, ink);
  const bubbleBottom = y + 25;
  y = bubbleBottom + 60;
  label('MBTI 趣猜', inset, y + 29, 25, ink, 650);
  ctx.font = font(28, 650);
  const badgeWidth = Math.min(content - 160, ctx.measureText(review.mbti).width + 28);
  const badgeTop = y - 4;
  label(review.mbti, inset + 161, y + 29, 28, '#fff', 650);
  y += 61;
  paragraph(review.reason, inset, content, 28, 43, muted);
  const divider = y + 24;
  y = divider + 25;
  paragraph('性格印象', inset, content, 25, 39, ink, 650);
  for (const trait of review.traits) {
    y += 8;
    const top = y;
    paragraph(trait.name, inset, 210, 25, 38, ink, 650);
    const leftBottom = y;
    y = top;
    paragraph(trait.evidence, inset + 235, content - 235, 25, 38, muted);
    y = Math.max(leftBottom, y);
  }
  const gap = 16;
  const cell = (content - (screenshots.length - 1) * gap) / screenshots.length;
  const thumbs = screenshots.map(img => {
    const scale = Math.min(cell / img.width, 560 / img.height);
    return { img, w: img.width * scale, h: img.height * scale };
  });
  const thumbTop = y + 38;
  canvas.width = width;
  canvas.height = Math.ceil(thumbTop + Math.max(0, ...thumbs.map(t => t.h)) + inset);
  function box(x, top, w, h, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.roundRect(x, top, w, h, radius); ctx.fill();
  }
  ctx.fillStyle = '#fcfaff';
  ctx.fillRect(0, 0, width, canvas.height);
  box(inset, 53, 44, 43, 12, violet);
  box(inset, bubbleTop, content, bubbleBottom - bubbleTop, [30, 30, 30, 6], lilac);
  ctx.beginPath(); ctx.moveTo(inset, bubbleBottom - 9); ctx.lineTo(inset + 30, bubbleBottom - 2);
  ctx.lineTo(inset, bubbleBottom + 15); ctx.fill();
  box(inset + 147, badgeTop, badgeWidth, 46, 9, violet);
  ctx.fillStyle = '#ded9e7'; ctx.fillRect(inset, divider, content, 2);
  for (const t of textRuns) {
    ctx.font = t.font; ctx.fillStyle = t.color;
    ctx.fillText(t.text, t.x, t.baseline);
  }
  thumbs.forEach((t, i) => ctx.drawImage(t.img, inset + (cell + gap) * i + (cell - t.w) / 2, thumbTop, t.w, t.h));
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = 'roastmyhomescreen.png';
  link.click();
}
