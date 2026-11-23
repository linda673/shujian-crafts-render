(() => {
  'use strict';
  if (!document.body.classList.contains('home-redesign')) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const opening = document.getElementById('home-opening');
  const hero = document.querySelector('.home-hero');
  const art = document.querySelector('.home-hero-art img');
  const cards = [...document.querySelectorAll('.craft-card')];
  const running = new Map();
  const handlers = [];
  let started = false, revealObserver, openingObserver, pending = 0;
  const moves = new Map();
  document.documentElement.classList.add('home-motion-page');
  function animate(el, delay = 0) {
    if (reduced.matches || !el.animate) return;
    const animation = el.animate([
      { opacity: .15, transform: 'translateY(22px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 850, delay, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
    running.set(el, animation);
    animation.onfinish = animation.oncancel = () => running.delete(el);
  }
  function schedule(el, values) {
    moves.set(el, values);
    if (pending) return;
    pending = requestAnimationFrame(() => {
      pending = 0;
      moves.forEach((properties, target) => {
        Object.entries(properties).forEach(([key, value]) => target.style.setProperty(key, value));
      });
      moves.clear();
    });
  }
  function listen(el, type, fn) {
    el.addEventListener(type, fn, { passive: true });
    handlers.push(() => el.removeEventListener(type, fn));
  }
  function clearPointer() {
    cancelAnimationFrame(pending); pending = 0; moves.clear();
    art?.style.removeProperty('--hero-x'); art?.style.removeProperty('--hero-y');
    cards.forEach(card => ['--tilt-x', '--tilt-y', '--card-x', '--card-y'].forEach(key => card.style.removeProperty(key)));
  }
  function start() {
    if (started) return;
    started = true; openingObserver?.disconnect();
    if (reduced.matches || document.hidden) return;
    const intro = [...document.querySelectorAll('.home-hero .intro > *')];
    const targets = [...intro, document.querySelector('.home-hero-art'), document.querySelector('.craft-heading'), ...cards, document.querySelector('.latest-work:not([hidden])'), document.querySelector('.home-footer')].filter(Boolean);
    if ('IntersectionObserver' in window) {
      revealObserver = new IntersectionObserver(entries => {
        entries.filter(entry => entry.isIntersecting).forEach((entry, index) => {
          animate(entry.target, Math.min(index * 85, 340));
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: .08 });
      targets.forEach(el => revealObserver.observe(el));
    } else targets.forEach((el, index) => animate(el, Math.min(index * 70, 280)));
    if (hero && art) {
      listen(hero, 'pointermove', event => {
        if (!fine.matches || reduced.matches || event.pointerType === 'touch') return;
        const rect = hero.getBoundingClientRect();
        const x = Math.max(-.5, Math.min(.5, (event.clientX - rect.left) / rect.width - .5));
        const y = Math.max(-.5, Math.min(.5, (event.clientY - rect.top) / rect.height - .5));
        schedule(art, { '--hero-x': `${x * 14}px`, '--hero-y': `${y * 10}px` });
      });
      listen(hero, 'pointerleave', () => schedule(art, { '--hero-x': '0px', '--hero-y': '0px' }));
    }
    cards.forEach(card => {
      listen(card, 'pointermove', event => {
        if (!fine.matches || reduced.matches || event.pointerType === 'touch') return;
        const rect = card.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
        schedule(card, { '--card-x': `${x * 100}%`, '--card-y': `${y * 100}%`, '--tilt-x': `${(y - .5) * -3}deg`, '--tilt-y': `${(x - .5) * 3}deg` });
      });
      listen(card, 'pointerleave', () => schedule(card, { '--tilt-x': '0deg', '--tilt-y': '0deg', '--card-x': '50%', '--card-y': '50%' }));
    });
  }
  function settle() {
    revealObserver?.disconnect();
    [...running.values()].forEach(animation => animation.cancel()); running.clear();
    clearPointer();
  }
  reduced.addEventListener('change', () => { if (reduced.matches) settle(); });
  fine.addEventListener('change', clearPointer);
  document.addEventListener('visibilitychange', () => { if (document.hidden) settle(); });
  document.addEventListener('focusin', event => {
    // Keyboard navigation never lands on a transparent or moving link.
    running.forEach((animation, el) => { if (el === event.target || el.contains(event.target)) animation.cancel(); });
  });
  window.addEventListener('pagehide', () => { settle(); openingObserver?.disconnect(); handlers.forEach(remove => remove()); });
  if (opening && !opening.hidden) {
    openingObserver = new MutationObserver(() => { if (opening.hidden) start(); });
    openingObserver.observe(opening, { attributes: true, attributeFilter: ['hidden'] });
  } else start();
})();
