"use client";

import Link from 'next/link';
import { createContext, useContext, useEffect, useState } from 'react';
import { APPEARANCE_KEY, FONTS, normalizeAppearance } from '@/lib/appearance.mjs';

const AppearanceContext = createContext(null);
function apply(value) {
  document.documentElement.dataset.theme = value.theme;
  document.documentElement.dataset.font = value.font;
  document.documentElement.dataset.weight = String(value.weight);
}
export function AppearanceProvider({ children }) {
  const [value, setValue] = useState(normalizeAppearance(null));
  useEffect(() => {
    const root = document.documentElement.dataset;
    setValue(normalizeAppearance({ theme: root.theme, font: root.font, weight: Number(root.weight) }));
    const sync = (event) => {
      if (event.key !== APPEARANCE_KEY && event.key !== null) return;
      let saved;
      try { saved = JSON.parse(event.newValue); } catch {}
      const next = normalizeAppearance(saved);
      apply(next);
      setValue(next);
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  function choose(patch) {
    const next = normalizeAppearance({ ...value, ...patch });
    apply(next);
    setValue(next);
    try { localStorage.setItem(APPEARANCE_KEY, JSON.stringify(next)); } catch {}
  }
  return <AppearanceContext.Provider value={{ value, choose }}>{children}</AppearanceContext.Provider>;
}

export function ThemeChoices() {
  const { value, choose } = useContext(AppearanceContext);
  return <div className="appearance-options" role="group" aria-label="Color theme">
    {[['system', 'System'], ['light', 'Light'], ['dark', 'Dark']].map(([id, name]) =>
      <button key={id} aria-pressed={value.theme === id} onClick={() => choose({ theme: id })}>{name}</button>)}
  </div>;
}

export function AppearanceMenu() {
  return <details className="appearance-menu" onKeyDown={(event) => {
    if (event.key === 'Escape') {
      event.currentTarget.open = false;
      event.currentTarget.querySelector('summary').focus();
    }
  }}>
    <summary aria-label="Appearance settings"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor"/></svg><span>Appearance</span></summary>
    <div className="appearance-popover">
      <p>Color theme</p>
      <ThemeChoices />
    </div>
  </details>;
}

export function TypeStudio() {
  const { value, choose } = useContext(AppearanceContext);
  return <section className="type-studio wrap" aria-label="Site typography preview">
    <div className="type-studio-heading">
      <div><span className="section-label">Type studio</span><h1>同一个网站，五种气质。</h1><p>选择后全站即时生效。跳到其他页面继续比较，刷新也会保留选择。</p></div>
      <ThemeChoices />
    </div>
    <div className="type-candidates" role="group" aria-label="Site font">
      {FONTS.map((font) => <button key={font.id} aria-pressed={value.font === font.id} onClick={() => choose({ font: font.id })}>
        <span className="type-candidate-sample" style={{ fontFamily: font.family, fontWeight: value.weight }}>Aa / Benji.</span>
        <strong>{font.name}</strong><span>{font.note}</span>
      </button>)}
    </div>
    <div className="type-studio-bottom">
      <p aria-live="polite">{FONTS.find(font => font.id === value.font).name} · {value.weight === 300 ? 'Light 300' : 'Regular 400'}</p>
      <div className="appearance-options" role="group" aria-label="Site font weight">
        {[300, 400].map(weight => <button key={weight} aria-pressed={value.weight === weight} onClick={() => choose({ weight })}>{weight === 300 ? 'Light 300' : 'Regular 400'}</button>)}
      </div>
    </div>
    <div className="type-reading-sample"><p>Hardware, software, shipped.</p><p>在车库动手，在路上记录。Ideas, photographs, and things built along the way.</p><span>2026 / Sony A7M3 / Irvine, California</span></div>
    <div className="type-page-links"><span>看实际页面</span><Link href="/">Home ↗</Link><Link href="/writing/">Writing ↗</Link><Link href="/blog/">Blog ↗</Link><Link href="/photography/">Photography ↗</Link><Link href="/mechanic/">Benji’s Garage ↗</Link><Link href="/about/">About ↗</Link></div>
    <p className="type-preview-note">全站已选定 IBM Plex Sans；这里保留其他字体作比较。</p>
  </section>;
}
