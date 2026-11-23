/* 在 stone-carving.html 中以 defer 引入，放在原 stone-carving.js 后面。
   原站已有点击处理器；捕获阶段拦截这三个导航，避免原处理器再次跳转。 */
(() => {
  'use strict';
  if (!document.body.classList.contains('stone-carving-page')) return;
  const routes = {'观微阁':'stone-carving-intro.html','习艺坊':'stone-carving.html','寄情居':'index.html#latest-work'};
  document.querySelectorAll('[data-nav]').forEach(button => {
    if (button.dataset.introNavigation) return;
    button.dataset.introNavigation = 'true';
    button.addEventListener('click', event => {
      const target = routes[button.dataset.nav];
      if (!target) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      location.href = target;
    }, true);
  });
  const breadcrumb = document.querySelector('.experience-breadcrumb');
  if (breadcrumb && !breadcrumb.querySelector('[data-intro-link]')) {
    const span = breadcrumb.querySelector('span');
    const link = document.createElement('a');
    link.dataset.introLink = ''; link.href = 'stone-carving-intro.html'; link.textContent = '白花石刻';
    if (span) span.replaceChildren(document.createTextNode(' / '), link);
  }
})();
