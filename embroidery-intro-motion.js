/* One-time entrance animation. Everything remains visible if JS or observers are unavailable. */
(() => {
  'use strict';
  const preference = window.matchMedia('(prefers-reduced-motion: no-preference)');
  const targets = [...document.querySelectorAll('.section-heading, .story-card')];
  let observer;
  function update() {
    if (observer) observer.disconnect();
    if (!preference.matches) {
      targets.forEach(target => target.classList.remove('in-view'));
      return;
    }
    if (!('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      });
    }, {threshold:0.12});
    targets.filter(target => !target.classList.contains('in-view')).forEach(target => observer.observe(target));
  }
  update();
  preference.addEventListener('change', update);
})();
