import { useCallback, useEffect, useRef, useState } from 'react';
import { flattenImage, prepareImage, saveReview } from './images';
import { MAX_SCREENSHOTS, scoreDimensions } from '@/lib/homescreen-review.mjs';
import MaskEditor from './MaskEditor';
import Privacy from './Privacy';
import ToyStats from '../ToyStats.jsx';
import { example } from './example.js';
import styles from './screen.module.css';

const endpoint = import.meta.env.PUBLIC_HOMESCREEN_API_URL;
function revealOnPhone(ref) {
  if (!window.matchMedia('(max-width: 700px)').matches) return;
  requestAnimationFrame(() => {
    if (!ref.current?.getClientRects().length) return;
    const navHeight = document.querySelector('header')?.getBoundingClientRect().height || 0;
    window.scrollBy({ top: ref.current.getBoundingClientRect().top - navHeight - 12, behavior: 'instant' });
  });
}
async function getReview(images) {
  if (!endpoint) throw new Error('在线点评尚未接通。你仍可在本机预览分享遮挡。');
  const response = await fetch(endpoint, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ images }),
    signal: AbortSignal.timeout(60000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '点评暂时不可用，请稍后再试。');
  return data;
}

export default function Homescreen({ statsId }) {
  const [panel, setPanel] = useState('review');
  const [shots, setShots] = useState([]);
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [review, setReview] = useState(null);
  const [showPoints, setShowPoints] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(null);
  const [draggingFiles, setDraggingFiles] = useState(false);
  const hasMasks = shots.some(s => s.masks.length > 0);
  const input = useRef(null);
  const result = useRef(null);
  const upload = useRef(null);
  const lock = useRef(false);
  const shot = shots[active];
  const card = sharing ? (shared?.review || (!hasMasks && review)) : review;
  const display = card || example;
  const readyToSave = sharing && Boolean(card);
  const cardHeading = sharing && shot ? '分享卡预览' : review ? '你的锐评卡' : '示例锐评卡';
  let actionLabel = '锐评我的桌面';
  if (review && !sharing) actionLabel = '制作分享卡';
  if (sharing) actionLabel = readyToSave ? '保存分享卡 PNG' : '生成分享版点评';
  if (busy === 'review' || busy === 'share') actionLabel = '正在看你的桌面…';
  const points = showPoints ? (review?.points || []).filter(p => p.page === active + 1) : [];
  const clearReview = useCallback(() => { setError(''); setReview(null); setShared(null); setShowPoints(false); }, []);
  const count = shots.length;
  const addFiles = useCallback(async (files) => {
    if (!files.length || lock.current) return;
    if (files.length + count > MAX_SCREENSHOTS) {
      setError(`最多 ${MAX_SCREENSHOTS} 张。请移除一张，或少选几张。`);
      return;
    }
    lock.current = true;
    setBusy('reading'); setError('');
    try {
      const added = [];
      for (const file of files) added.push(await prepareImage(file));
      clearReview(); setShots(current => [...current, ...added]); setActive(count);
      revealOnPhone(upload);
    } catch (err) { setError(err.message); }
    finally { lock.current = false; setBusy(''); }
  }, [count, clearReview]);

  useEffect(() => {
    const isFileDrag = event => Array.from(event.dataTransfer?.types || []).includes('Files');
    function over(event) {
      if (!isFileDrag(event)) return;
      event.preventDefault();
      const acceptsDrop = panel === 'review' && !lock.current;
      event.dataTransfer.dropEffect = acceptsDrop ? 'copy' : 'none';
      setDraggingFiles(acceptsDrop);
    }
    function leave(event) {
      if (!event.relatedTarget) setDraggingFiles(false);
    }
    function drop(event) {
      setDraggingFiles(false);
      if (!isFileDrag(event)) return;
      event.preventDefault();
      if (panel === 'review') addFiles(Array.from(event.dataTransfer.files));
    }
    function paste(event) {
      if (panel !== 'review') return;
      if (event.target.closest?.('input, textarea, [contenteditable="true"]')) return;
      const images = Array.from(event.clipboardData?.files || []).filter(file => file.type.startsWith('image/'));
      if (!images.length) return;
      event.preventDefault();
      addFiles(images);
    }
    window.addEventListener('dragover', over);
    window.addEventListener('dragleave', leave);
    window.addEventListener('drop', drop);
    window.addEventListener('paste', paste);
    return () => {
      window.removeEventListener('dragover', over);
      window.removeEventListener('dragleave', leave);
      window.removeEventListener('drop', drop);
      window.removeEventListener('paste', paste);
    };
  }, [addFiles, panel]);
  function maskUpdate(masks) {
    if (lock.current) return;
    setShared(null); setError('');
    setShots(shots.map((s, i) => i === active ? { ...s, masks } : s));
  }
  function remove() {
    clearReview(); setShots(shots.filter((_, i) => i !== active)); setActive(Math.max(0, active - 1));
  }
  async function analyze() {
    if (!shots.length || lock.current) return;
    lock.current = true;
    setBusy(sharing ? 'share' : 'review'); setError('');
    try {
      if (sharing) {
        const images = [];
        for (const shot of shots) images.push(shot.masks.length ? await flattenImage(shot) : shot.url);
        const safeReview = !hasMasks && review ? review : await getReview(images);
        setShared({ images, review: safeReview });
        if (!hasMasks) setReview(safeReview);
      } else {
        setReview(await getReview(shots.map(s => s.url)));
        setShowPoints(false);
      }
      revealOnPhone(result);
    } catch (err) {
      setError(err instanceof TypeError || err instanceof SyntaxError || err.name === 'TimeoutError' ? '连接点评服务失败，请稍后重试。' : err.message);
    } finally { lock.current = false; setBusy(''); }
  }
  async function download() {
    try {
      // A masked card must use both words and pixels from the same share-only review.
      if (hasMasks && !shared) return;
      await saveReview(shared?.review || review, shared?.images || shots.map(s => s.url));
    } catch { setError('分享卡保存失败，请重试。'); }
  }
  function switchMode(next) {
    setSharing(next); setError(''); setShowPoints(false);
    if (next) revealOnPhone(upload);
  }

  return <section lang="zh-CN" className={'wrap ' + styles.page} data-has-shots={panel === 'review' && Boolean(shot)}>
    {draggingFiles && <div className={styles.dropOverlay} aria-hidden="true"><strong>松开即可添加截图</strong></div>}
    <h1 lang="en">Roast My Homescreen<span>.</span></h1>
    <p className={styles.intro}>放上你的手机主屏，猜猜桌面的 MBTI，看看哪个细节最抢戏。</p>
    {statsId && <ToyStats statsId={statsId} title="Roast My Homescreen" countVisit viewsLabel="{n} 次访问" className={styles.stats} />}
    <div className={styles.panelTabs} role="tablist" aria-label="桌面锐评">
      {['review', 'privacy'].map(id => <button key={id} type="button" role="tab" id={id + '-tab'}
        aria-selected={panel === id} aria-controls={id + '-panel'} tabIndex={panel === id ? 0 : -1}
        onClick={() => setPanel(id)} onKeyDown={event => {
          let next;
          if (event.key === 'Home') next = 'review';
          if (event.key === 'End') next = 'privacy';
          if (['ArrowLeft', 'ArrowRight'].includes(event.key)) next = id === 'review' ? 'privacy' : 'review';
          if (!next) return;
          event.preventDefault();
          setPanel(next);
          document.getElementById(next + '-tab')?.focus();
        }}>{id === 'review' ? '桌面锐评' : '隐私说明'}</button>)}
    </div>
    <div id="privacy-panel" role="tabpanel" aria-labelledby="privacy-tab" hidden={panel !== 'privacy'}><Privacy /></div>
    <div id="review-panel" role="tabpanel" aria-labelledby="review-tab" hidden={panel !== 'review'}>
    <div className={styles.spread}>
      <section ref={upload} className={styles.inputs}>
        <div className={styles.row}><h2>你的桌面</h2><span>{shots.length} / {MAX_SCREENSHOTS}</span></div>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={event => {
          const files = Array.from(event.target.files);
          event.target.value = '';
          addFiles(files);
        }} />
        {!shot ? <button type="button" className={styles.drop} disabled={!!busy} onClick={() => input.current.click()}>
          <span className={styles.plus} aria-hidden="true">＋</span>
          <strong>{busy ? '正在读取…' : '选择桌面截图'}</strong><small>也可以直接拖入或粘贴截图</small><small>最多 {MAX_SCREENSHOTS} 张 · PNG / JPEG / WebP</small>
        </button> : <>
          <div className={styles.tabs}>{shots.map((s, i) => <button key={s.id} aria-pressed={active === i}
            onClick={() => setActive(i)}>第 {i + 1} 页</button>)}
            {shots.length < MAX_SCREENSHOTS && <button disabled={!!busy} onClick={() => input.current.click()}>＋ 添加</button>}
          </div>
          <div className={styles.modes} aria-label="预览模式">
            <button disabled={!!busy} aria-pressed={!sharing} onClick={() => switchMode(false)}>自己看</button>
            <button disabled={!!busy} aria-pressed={sharing} onClick={() => switchMode(true)}>分享给朋友</button>
          </div>
          {sharing && <>
            <p className={styles.hint}>轻点藏住一个 App，拖动可框住名称、通知或整个文件夹。每一页都可以单独遮挡。</p>
            <MaskEditor key={shot.id} shot={shot} disabled={!!busy} onMask={m => maskUpdate([...shot.masks, m])} />
          </>}
          {!sharing && <div className={styles.original}>
            <img src={shot.url} alt="自己看的完整桌面" />
            {points.map((p, i) => <span className={styles.pin} key={i}
              style={{ left: p.x * 100 + '%', top: p.y * 100 + '%' }}>{i + 1}</span>)}
          </div>}
          {points.length > 0 && <ol className={styles.evidence}>{points.map((p, i) => <li key={i}>{p.label}</li>)}</ol>}
          <div className={styles.tools}>
            {sharing && <button disabled={!!busy || !shot.masks.length} onClick={() => maskUpdate(shot.masks.slice(0, -1))}>撤销遮挡</button>}
            <button disabled={!!busy} onClick={remove}>移除这页</button>
          </div>
        </>}
        <p className={styles.hint}>{sharing
          ? '分享卡包含当前预览的截图。有遮挡时，会将遮过的图发给 OpenAI，重新生成卡片文字。'
          : '点「锐评我的桌面」会将完整截图发给 OpenAI。你可以稍后为分享卡单独遮挡 App。'}</p>
        <div className={styles.actionBar}>
          {error && <p role="alert" className={styles.error}>{error}</p>}
          {shot && <span className={styles.actionContext}>已选 {count} 张<small>{readyToSave ? '仅保存到设备' : !sharing && review ? '可遮挡私人 App' : sharing ? '按分享预览点评' : '发给 OpenAI 点评'}</small></span>}
          <button className={styles.action} disabled={!shot || !!busy}
            onClick={readyToSave ? download : !sharing && review ? () => switchMode(true) : analyze}>
            {actionLabel}
          </button>
        </div>
      </section>
      <section ref={result} className={styles.card} aria-live="polite" aria-busy={busy === 'review' || busy === 'share'}>
        <div className={styles.cardHead}><span className={styles.notifIcon} aria-hidden="true">“</span>
          <h2>{cardHeading}</h2><span className={styles.brand} lang="en">Roast My Homescreen</span></div>
        {sharing && shot && !card ? <p>确认每一页的遮挡后，点「生成分享版点评」预览朋友会看到的文字。</p> : <>
          <div className={styles.bubble}><h3>{display.title}</h3><p>{display.roast}</p></div>
          {display.scores && <div className={styles.ratings}><h4>桌面评分</h4>
            <dl>{scoreDimensions.map(({ key, label }) => {
              const rating = display.scores[key];
              return <div key={key}><dt>{label}<strong>{rating.value === null ? '线索不足' : rating.value + '/10'}</strong></dt>
                <dd>{rating.evidence}</dd></div>;
            })}</dl>
          </div>}
          <div className={styles.reading}><div className={styles.readingTitle}><h4>MBTI 趣猜</h4><strong className={styles.type}>{display.mbti}</strong></div>{display.reason && <p>{display.reason}</p>}</div>
          {display.traits.length > 0 && <div className={styles.signals}><h4>性格印象</h4>
            <dl>{display.traits.map((t, i) => <div key={i}><dt>{t.name}</dt><dd>{t.evidence}</dd></div>)}</dl>
          </div>}
        </>}
        {sharing && card && <div className={styles.thumbs} data-count={count}>
          {(shared?.images || shots.map(s => s.url)).map((url, i) => <img key={i} src={url} alt={'分享卡第 ' + (i + 1) + ' 页'} />)}
        </div>}
        {!sharing && review && <div className={styles.controls}>
          {review.points?.length > 0 && <button aria-pressed={showPoints} onClick={() => {
            if (!showPoints) { setActive(review.points[0].page - 1); revealOnPhone(upload); }
            setShowPoints(!showPoints);
          }}>{showPoints ? '收起标注' : '圈出笑点'}</button>}
        </div>}
      </section>
    </div>
    </div>
  </section>;
}
