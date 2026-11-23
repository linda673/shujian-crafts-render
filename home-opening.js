(() => {
  'use strict';
  const opening = document.getElementById('home-opening');
  if (!opening) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const key = 'shujian:home-opening:v1';
  let seen = false;
  try { seen = sessionStorage.getItem(key) === 'seen'; } catch {}
  const returning = performance.getEntriesByType('navigation')[0]?.type === 'back_forward';
  if (seen || preference.matches || location.hash || new URLSearchParams(location.search).has('saved') || returning) return;
  // If this optional stylesheet cannot load, leave the homepage fully usable.
  if (getComputedStyle(opening).position !== 'fixed') return;
  const priorFocus = document.activeElement;
  const siblings = [...document.body.children].filter(el => el !== opening && !['SCRIPT', 'STYLE', 'LINK'].includes(el.tagName));
  const previousInert = siblings.map(el => el.inert);
  let finished = false, dismissed = false, timer, cleanupTimer;
  const skip = opening.querySelector('.opening-skip');
  function cleanup() {
    if (finished) return;
    finished = true;
    clearTimeout(timer); clearTimeout(cleanupTimer);
    opening.hidden = true;
    siblings.forEach((el, index) => { el.inert = previousInert[index]; });
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', onPageHide);
    preference.removeEventListener('change', onPreference);
    if (document.activeElement === skip) {
      const target = priorFocus && priorFocus !== document.body ? priorFocus : document.querySelector('.explore-button');
      target?.focus({ preventScroll: true });
    }
  }
  function dismiss(immediate = false) {
    if (immediate) { cleanup(); return; }
    if (dismissed || finished) return;
    dismissed = true;
    opening.classList.add('is-leaving');
    cleanupTimer = setTimeout(cleanup, 680);
  }
  function onKey(event) {
    if (event.key === 'Escape') { event.preventDefault(); dismiss(true); }
    if (event.key === 'Tab') { event.preventDefault(); skip.focus({ preventScroll: true }); }
  }
  function onVisibility() { if (document.hidden) dismiss(true); }
  function onPageHide() { dismiss(true); }
  function onPreference(event) { if (event.matches) dismiss(true); }
  opening.hidden = false;
  siblings.forEach(el => { el.inert = true; });
  try { sessionStorage.setItem(key, 'seen'); } catch {}
  skip.addEventListener('click', () => dismiss(true));
  document.addEventListener('keydown', onKey);
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', onPageHide);
  preference.addEventListener('change', onPreference);
  skip.focus({ preventScroll: true });
  timer = setTimeout(() => dismiss(), 2200);
})();
