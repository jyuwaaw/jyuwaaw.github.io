'use client';

import { useState } from 'react';
import Link from 'next/link';
import '@fontsource/jost/latin-300.css';
import '@fontsource/jost/latin-400.css';
import '@fontsource/manrope/latin-300.css';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/barlow-condensed/latin-300.css';
import '@fontsource/barlow-condensed/latin-400.css';
import '@fontsource/ibm-plex-sans/latin-300.css';
import '@fontsource/ibm-plex-sans/latin-400.css';
import styles from './PhotographyTypePreview.module.css';

const fonts = [
  { name: 'Geist', family: 'var(--font-geist-sans), sans-serif', note: '清晰中性 · 对照款' },
  { name: 'Jost', family: '"Jost", sans-serif', note: '轻盈几何 · 已选定' },
  { name: 'Manrope', family: '"Manrope", sans-serif', note: '圆润开阔 · 温和现代' },
  { name: 'Barlow Condensed', family: '"Barlow Condensed", sans-serif', note: '窄体修长 · 摄影刊物感' },
  { name: 'IBM Plex Sans', family: '"IBM Plex Sans", sans-serif', note: '有棱角 · 技术档案感' },
];

export default function PhotographyTypePreview({ children }) {
  const [selected, setSelected] = useState('Jost');
  const [weight, setWeight] = useState(300);
  const font = fonts.find((item) => item.name === selected);
  return <div className={styles.preview} style={{ '--photography-font': font.family, '--sans': font.family, '--preview-weight': weight }}>
    <aside className={styles.panel} aria-label="Photography font preview">
      <div className={styles.heading}>
        <div><h1>挑一个相册字体</h1><p>点击试穿：标题、分组、照片信息同步切换。照片和排版保持一致。</p></div>
        <Link href="/photography/">返回相册 ↗</Link>
      </div>
      <div className={styles.choices} role="group" aria-label="选择字体">
        {fonts.map((item) => <button key={item.name} aria-pressed={selected === item.name} onClick={() => setSelected(item.name)}>
          <span className={styles.sample} style={{ fontFamily: item.family, fontWeight: weight }}>Photography</span>
          <span className={styles.name}>{item.name}</span>
          <span className={styles.note}>{item.note}</span>
        </button>)}
      </div>
      <div className={styles.bottom}>
        <p aria-live="polite">当前：{selected} / {weight === 300 ? 'Light' : 'Regular'}</p>
        <div className={styles.weights} role="group" aria-label="选择字重">
          <button aria-pressed={weight === 300} onClick={() => setWeight(300)}>Light 300</button>
          <button aria-pressed={weight === 400} onClick={() => setWeight(400)}>Regular 400</button>
        </div>
      </div>
    </aside>
    {children}
  </div>;
}
