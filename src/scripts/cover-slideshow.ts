interface Slide {
  src: string;
  position: string;
  alt: string;
  href: string;
  caption: string;
  date: string;
  dateLabel: string;
}

export function startCoverSlideshow(root: HTMLElement) {
  const slides: Slide[] = JSON.parse(root.dataset.slides!);
  const controls = root.querySelector<HTMLElement>('.print-controls')!;
  const frame = root.querySelector<HTMLAnchorElement>('.print-image')!;
  const img = frame.querySelector('img')!;
  const caption = root.querySelector<HTMLElement>('[data-caption]')!;
  const date = root.querySelector('time')!;
  const count = controls.querySelector<HTMLElement>('[data-current]')!;
  const announcement = controls.querySelector<HTMLElement>('[data-announcement]')!;
  const play = controls.querySelector<HTMLButtonElement>('[data-play]')!;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let playing = !motion.matches;
  let visible = false;
  let pointerOverPhoto = false;
  let current = 0;
  let target = 0;
  let request = 0;
  let timer: number | undefined;

  function canAutoplay() {
    return playing && visible && !document.hidden && !pointerOverPhoto && document.activeElement !== frame;
  }

  function schedule() {
    window.clearTimeout(timer);
    if (canAutoplay()) {
      timer = window.setTimeout(() => advance(1, false), 7000);
    }
  }

  function updatePlayback() {
    play.title = playing ? 'Pause slideshow' : 'Play slideshow';
    play.setAttribute('aria-label', play.title);
    play.querySelector<HTMLElement>('[data-pause-icon]')!.hidden = !playing;
    play.querySelector<HTMLElement>('[data-play-icon]')!.hidden = playing;
    schedule();
  }

  async function advance(step: number, manual: boolean) {
    window.clearTimeout(timer);
    const revision = ++request;
    target = (target + step + slides.length) % slides.length;
    const slide = slides[target];
    const incoming = new Image();
    incoming.src = slide.src;
    try {
      await incoming.decode();
    } catch {
      if (revision === request) {
        if (manual) announcement.textContent = 'This photograph could not be loaded.';
        schedule();
      }
      return;
    }
    if (revision !== request) return;
    if (!manual && !canAutoplay()) {
      target = current;
      schedule();
      return;
    }

    if (!motion.matches && current !== target && img.complete && img.naturalWidth) {
      const previous = img.cloneNode() as HTMLImageElement;
      previous.setAttribute('aria-hidden', 'true');
      previous.alt = '';
      Object.assign(previous.style, {position:'absolute', inset:'0', pointerEvents:'none'});
      frame.append(previous);
      previous.animate([{opacity:1}, {opacity:0}], {duration:450, easing:'ease-out'}).finished
        .then(() => previous.remove(), () => previous.remove());
    }
    img.src = slide.src;
    img.alt = slide.alt;
    img.style.objectPosition = slide.position;
    frame.href = slide.href;
    frame.setAttribute('aria-label', 'View photograph: ' + slide.alt);
    caption.textContent = slide.caption;
    caption.hidden = !slide.caption;
    date.dateTime = slide.date;
    date.textContent = slide.dateLabel;
    date.hidden = !slide.date;
    current = target;
    count.textContent = String(current + 1);
    if (manual) announcement.textContent = 'Photograph ' + (current + 1) + ' of ' + slides.length + '. ' + slide.alt;
    schedule();
  }

  controls.querySelector('[data-prev]')!.addEventListener('click', () => advance(-1, true));
  controls.querySelector('[data-next]')!.addEventListener('click', () => advance(1, true));
  play.addEventListener('click', () => { playing = !playing; updatePlayback(); });
  motion.addEventListener('change', () => { playing = !motion.matches; updatePlayback(); });
  document.addEventListener('visibilitychange', schedule);
  frame.addEventListener('pointerenter', event => { pointerOverPhoto = event.pointerType === 'mouse'; schedule(); });
  frame.addEventListener('pointerleave', () => { pointerOverPhoto = false; schedule(); });
  root.addEventListener('focusin', event => {
    if (event.target instanceof HTMLElement && event.target.matches(':focus-visible')) {
      playing = false;
      updatePlayback();
    }
  });
  frame.addEventListener('blur', schedule);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  }).observe(frame);

  let touch: { x: number; y: number } | undefined;
  let lastSwipe = -Infinity;
  frame.addEventListener('touchstart', event => {
    const finger = event.touches[0];
    touch = event.touches.length === 1 ? {x:finger.clientX, y:finger.clientY} : undefined;
  }, {passive:true});
  frame.addEventListener('touchcancel', () => { touch = undefined; });
  frame.addEventListener('touchend', event => {
    if (!touch) return;
    const dx = event.changedTouches[0].clientX - touch.x;
    const dy = event.changedTouches[0].clientY - touch.y;
    touch = undefined;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    lastSwipe = performance.now();
    advance(dx < 0 ? 1 : -1, true);
  }, {passive:true});
  frame.addEventListener('click', event => {
    if (event.detail && performance.now() - lastSwipe < 500) event.preventDefault();
  });
  controls.hidden = false;
  updatePlayback();
}
