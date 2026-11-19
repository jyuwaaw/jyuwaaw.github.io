import { useEffect, useState } from 'react';
import './editor.css';

const draftKey = 'benji-cover-draft';
const sameOrder = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export default function CoverEditor({ library, selected, session }) {
  const [saved, setSaved] = useState(selected);
  const [ids, setIds] = useState(selected);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [conflict, setConflict] = useState(false);
  const byId = new Map(library.map(photo => [photo.id, photo]));
  const dirty = !sameOrder(ids, saved);
  const ready = ids.length > 0 && ids.every(id => byId.has(id));
  const term = query.trim().toLocaleLowerCase();
  const visible = library.filter(p => [p.id,p.location,p.date,p.alt].some(v => v.toLocaleLowerCase().includes(term)));
  const preview = '/manage/covers/preview/?' + new URLSearchParams(ids.map(id => ['cover', id]));

  useEffect(() => {
    try {
      const draft = JSON.parse(sessionStorage.getItem(draftKey));
      if (draft && sameOrder(draft.previous, selected) && Array.isArray(draft.ids) && draft.ids.every(id => typeof id === 'string')) setIds(draft.ids);
    } catch {}
  }, [selected]);

  function edit(next) {
    setIds(next); setMessage('');
    try { sessionStorage.setItem(draftKey, JSON.stringify({previous:saved, ids:next})); } catch {}
  }
  function toggle(id) {
    edit(ids.includes(id) ? ids.filter(value => value !== id) : [...ids,id]);
  }
  function move(index, step) {
    const next = [...ids];
    const destination = index + step;
    [next[index], next[destination]] = [next[destination], next[index]];
    edit(next);
  }
  async function save() {
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/manage/covers/save/', { method:'POST', headers:{'Content-Type':'application/json','X-Cover-Session':session}, body:JSON.stringify({previous:saved,ids}) });
      const result = await response.json();
      if (!response.ok) { if (response.status === 409) setConflict(true); throw new Error(result.error); }
      setSaved(result.ids);
      try { sessionStorage.removeItem(draftKey); } catch {}
      setMessage('已保存到本地首页。网站发布后生效。');
    } catch (error) { setMessage(error.message || '保存失败，请重试。'); }
    finally { setBusy(false); }
  }

  return <main className="covers-admin">
    <header><div><h1>首页头图</h1><p>第一张用作开场，其余按清单顺序轮播，每张停留 7 秒。</p></div>
      <div className="actions">
        {ready && <a href={preview} target="_blank" rel="noreferrer">预览首页 ↗</a>}
        <button className="save" disabled={!dirty || !ready || busy || conflict} onClick={save}>{busy ? '正在保存…' : '保存到本地首页'}</button>
      </div>
    </header>
    <div className="columns">
      <section className="sequence" aria-labelledby="order-title">
        <h2 id="order-title">已精选 <small>{ids.length}</small></h2>
        <ol>{ids.map((id, index) => {
          const photo=byId.get(id);
          return <li key={id}>
            {photo && <img src={photo.src} alt="" width="96" height="64" />}
            <div><strong>{photo?.location || id}</strong><small>{photo ? id : '已移出相册，请移除'}</small>
              <div className="order-actions">
                <button disabled={busy || index === 0} aria-label={`上移 ${id}`} onClick={()=>move(index, -1)}>上移</button>
                <button disabled={busy || index === ids.length - 1} aria-label={`下移 ${id}`} onClick={()=>move(index, 1)}>下移</button>
                <button disabled={busy} aria-label={`移除 ${id}`} onClick={()=>toggle(id)}>移除</button>
              </div>
            </div>
          </li>;
        })}</ol>
        {!ids.length && <p>从相册勾选第一张封面。</p>}
        <p role="status">{message || (dirty ? '有未保存的改动' : '')}</p>
        {conflict && <button onClick={()=>location.reload()}>重新载入</button>}
      </section>
      <section aria-labelledby="library-title">
        <div className="library-head"><h2 id="library-title">摄影相册 <small>{visible.length}</small></h2>
          <input type="search" aria-label="搜索照片" placeholder="搜索地点、文件名或年份" value={query} onChange={event=>setQuery(event.target.value)} />
        </div>
        <div className="library">{visible.map(photo => <label key={photo.id}>
          <img src={photo.src} alt={photo.alt} loading="lazy" width="300" height="200" />
          <input type="checkbox" aria-label={photo.id} checked={ids.includes(photo.id)} disabled={busy} onChange={()=>toggle(photo.id)} />
          <strong>{photo.location || photo.id}</strong><small>{photo.location ? photo.id : photo.date}</small>
        </label>)}</div>
        {!visible.length && <p>没有找到匹配的照片。</p>}
      </section>
    </div>
  </main>;
}
