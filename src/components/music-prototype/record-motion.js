// The modal remains a native dialog (focus trap, Escape, top layer). Only the
// temporary record flies outside its paper sheet; no page-sized layout tween.
const ease = 'cubic-bezier(.22,.75,.2,1)';
const visible = rect => rect && rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
const position = (from, to) => `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width})`;

export function openRecordDialog(dialog, source, onClosed) {
  const sheet = dialog.querySelector('.rs-dialog-sheet');
  const art = sheet.querySelector('.rs-detail-art');
  const flight = dialog.querySelector('.rs-flight-art');
  const disc = flight.querySelector('.rs-vinyl');
  const copy = sheet.querySelector('.rs-detail-copy');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set();
  let active = true, closing = false;
  const originalOverflow = document.body.style.overflow;
  const originalPadding = document.body.style.paddingRight;
  const scrollbar = window.innerWidth - document.documentElement.clientWidth;
  const sourceRect = source?.art?.getBoundingClientRect();
  const animate = (element, frames, options) => {
    if (!element?.animate) return null;
    const animation = element.animate(frames, { easing: ease, fill: 'both', ...options });
    animations.add(animation);
    return animation;
  };
  const stop = () => { for (const animation of animations) animation.cancel(); animations.clear(); };
  const restore = () => {
    source?.button?.classList.remove('rs-is-pulled');
    document.body.style.overflow = originalOverflow;
    document.body.style.paddingRight = originalPadding;
    reduced.removeEventListener('change', preferenceChanged);
  };
  const finish = () => {
    if (!active) return;
    active = false; stop(); restore();
    if (dialog.open) dialog.close();
    onClosed();
    if (source?.trigger?.isConnected) source.trigger.focus({ preventScroll: true });
  };
  function preferenceChanged(event) {
    if (!event.matches || !active) return;
    if (closing) return finish();
    stop(); flight.style.visibility = 'hidden'; art.style.visibility = '';
    dialog.dataset.motion = 'open';
  }
  const placeFlight = rect => {
    Object.assign(flight.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, visibility: 'visible' });
    art.style.visibility = 'hidden';
  };

  document.body.style.overflow = 'hidden';
  if (scrollbar > 0) document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + scrollbar}px`;
  dialog.dataset.motion = 'opening';
  sheet.scrollTop = 0;
  dialog.showModal();
  source?.button?.classList.add('rs-is-pulled');
  reduced.addEventListener('change', preferenceChanged);

  const targetRect = art.getBoundingClientRect();
  if (reduced.matches || !flight.animate) {
    dialog.dataset.motion = 'open';
  } else {
    placeFlight(targetRect);
    const start = visible(sourceRect) ? position(sourceRect, targetRect) : 'translate(0, 20px) scale(.94)';
    const transfer = animate(flight, [
      { transform: start, opacity: 1, offset: 0 },
      { transform: `${start} translateY(-18px) rotate(-3deg)`, offset: .16 },
      { transform: 'translate(0, -5px) scale(1.018)', offset: .84 },
      { transform: 'none', opacity: 1, offset: 1 },
    ], { duration: 620 });
    const slide = animate(disc, [
      { transform: 'translateX(-23%) rotate(-12deg)' },
      { transform: 'translateX(-23%) rotate(-12deg)', offset: .28 },
      { transform: 'translateX(0) rotate(15deg)' },
    ], { duration: 740 });
    animate(sheet, [{ opacity: 0, transform: 'translateY(14px) scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 390, delay: 70 });
    animate(copy, [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 290, delay: 230 });
    [...copy.querySelectorAll('.rs-tracks li')].slice(0, 5).forEach((row, index) => animate(row, [{ opacity: 0, transform: 'translateY(7px)' }, { opacity: 1, transform: 'none' }], { duration: 220, delay: 300 + index * 28 }));
    Promise.allSettled([transfer?.finished, slide?.finished]).then(() => {
      if (!active || closing) return;
      flight.style.visibility = 'hidden'; art.style.visibility = '';
      dialog.dataset.motion = 'open'; stop();
    });
  }

  return {
    close() {
      if (!active || closing) return;
      closing = true;
      if (reduced.matches || !flight.animate) return finish();
      const inFlight = dialog.dataset.motion === 'opening';
      const fromRect = inFlight ? null : art.getBoundingClientRect();
      const currentTransform = inFlight ? getComputedStyle(flight).transform : 'none';
      const currentDisc = inFlight ? getComputedStyle(disc).transform : 'rotate(15deg)';
      const sheetStyle = getComputedStyle(sheet);
      const opacity = sheetStyle.opacity, transform = sheetStyle.transform;
      const copyOpacity = getComputedStyle(copy).opacity;
      stop(); dialog.dataset.motion = 'closing';
      if (fromRect) placeFlight(fromRect);
      const toRect = source?.art?.getBoundingClientRect();
      const baseRect = { left: parseFloat(flight.style.left), top: parseFloat(flight.style.top), width: parseFloat(flight.style.width) };
      const canReturn = visible(toRect) && (inFlight || visible(fromRect));
      animate(copy, [{ opacity: copyOpacity }, { opacity: 0 }], { duration: 120 });
      animate(sheet, [{ opacity, transform }, { opacity: 0, transform: 'translateY(10px) scale(.98)' }], { duration: 300, delay: 90 });
      animate(disc, [{ transform: currentDisc }, { transform: 'translateX(-23%) rotate(-12deg)' }], { duration: 240 });
      const returning = animate(flight, [
        { transform: currentTransform, opacity: 1, offset: 0 },
        { transform: currentTransform, opacity: 1, offset: .2 },
        { transform: canReturn ? position(toRect, baseRect) : 'translate(0, 14px) scale(.96)', opacity: canReturn ? 1 : 0, offset: 1 },
      ], { duration: 460, easing: 'cubic-bezier(.45,0,.3,1)' });
      Promise.allSettled([returning?.finished]).then(finish);
    },
    destroy() {
      if (!active) return;
      active = false; stop(); restore();
      if (dialog.open) dialog.close();
    },
  };
}
