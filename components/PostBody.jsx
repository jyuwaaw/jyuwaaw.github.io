'use client';

import { useEffect, useState } from 'react';

// Renders the post title + body. When a Chinese variant exists, both variants
// are in the static HTML (SEO-safe) and a toggle switches which one is shown.
// The choice persists across posts via localStorage; default is English.
export default function PostBody({ title, titleZh, html, htmlZh }) {
  const bilingual = Boolean(htmlZh);
  const [lang, setLang] = useState('en');

  useEffect(() => {
    if (!bilingual) return;
    if (window.localStorage.getItem('post-lang') === 'zh') setLang('zh');
  }, [bilingual]);

  const pick = (l) => {
    setLang(l);
    window.localStorage.setItem('post-lang', l);
  };

  const zh = bilingual && lang === 'zh';
  return (
    <>
      {bilingual && (
        <div className="lang-toggle" role="group" aria-label="Post language">
          <button className={zh ? '' : 'active'} onClick={() => pick('en')}>EN</button>
          <button className={zh ? 'active' : ''} onClick={() => pick('zh')}>中文</button>
        </div>
      )}
      <h1 className="post-title">{zh && titleZh ? titleZh : title}</h1>
      <div
        className="prose"
        lang="en"
        style={zh ? { display: 'none' } : undefined}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {bilingual && (
        <div
          className="prose"
          lang="zh"
          style={zh ? undefined : { display: 'none' }}
          dangerouslySetInnerHTML={{ __html: htmlZh }}
        />
      )}
    </>
  );
}
