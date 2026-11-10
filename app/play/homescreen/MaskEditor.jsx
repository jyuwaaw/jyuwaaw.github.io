'use client';
import { useRef, useState } from 'react';
import styles from './screen.module.css';

function point(event) {
  const box = event.currentTarget.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(1, (event.clientX - box.left) / box.width)),
    y: Math.max(0, Math.min(1, (event.clientY - box.top) / box.height)),
  };
}
function rectangle(a, b) {
  return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(a.x - b.x), h: Math.abs(a.y - b.y) };
}
function placement(mask) {
  return { left: mask.x * 100 + '%', top: mask.y * 100 + '%', width: mask.w * 100 + '%', height: mask.h * 100 + '%' };
}
function iconMask({ x, y }) {
  return { x: Math.max(0, Math.min(0.75, x - 0.125)), y: Math.max(0, Math.min(0.875, y - 0.05)), w: 0.25, h: 0.125 };
}

export default function MaskEditor({ shot, disabled, onMask }) {
  const start = useRef(null);
  const [draft, setDraft] = useState(null);
  const [cursor, setCursor] = useState(null);
  function end() { start.current = null; setDraft(null); }
  function key(event) {
    if (disabled) return;
    const pos = cursor || { x: 0.5, y: 0.5 };
    const arrows = { ArrowLeft: [-0.025, 0], ArrowRight: [0.025, 0], ArrowUp: [0, -0.025], ArrowDown: [0, 0.025] };
    if (arrows[event.key]) {
      event.preventDefault();
      const [dx, dy] = arrows[event.key];
      setCursor({ x: Math.max(0, Math.min(1, pos.x + dx)), y: Math.max(0, Math.min(1, pos.y + dy)) });
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); onMask(iconMask(pos)); setCursor(pos);
    }
  }
  return <div className={styles.editor} tabIndex={disabled ? -1 : 0} role="group"
    aria-label="截图遮挡区，可用方向键移动、回车遮住图标" onKeyDown={key}
    onBlur={() => setCursor(null)}
    onPointerDown={event => {
      if (disabled || !event.isPrimary || event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      start.current = point(event);
    }}
    onPointerMove={event => {
      if (start.current && event.isPrimary) setDraft(rectangle(start.current, point(event)));
    }}
    onPointerCancel={end} onLostPointerCapture={end}
    onPointerUp={event => {
      if (!start.current || !event.isPrimary) return;
      const stop = point(event);
      const box = rectangle(start.current, stop);
      onMask(box.w < 0.025 && box.h < 0.02 ? iconMask(stop) : { ...box, w: Math.max(0.01, box.w), h: Math.max(0.01, box.h) });
      end();
    }}>
    <img src={shot.url} alt="待点评的桌面截图" draggable="false" />
    {shot.masks.map((m, i) => <span aria-hidden="true" key={i} className={styles.mask} style={placement(m)} />)}
    {draft && <span className={styles.draft} style={placement(draft)} />}
    {cursor && <span className={styles.draft} style={placement(iconMask(cursor))} />}
  </div>;
}
