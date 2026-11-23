/* 在 paper-cutting.html 中以 defer 引入，放在原 paper-cutting.js 后面。
   原站使用 addEventListener；捕获阶段拦截这三个导航，避免原处理器再次跳转。 */
(() => {
  'use strict';
  if (!document.body.classList.contains('paper-cutting-page')) return;
  const routes = {'观微阁':'paper-cutting-intro.html','习艺坊':'paper-cutting.html','寄情居':'index.html#latest-work'};
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
    link.dataset.introLink = ''; link.href = 'paper-cutting-intro.html'; link.textContent = '三台剪纸';
    if (span) span.replaceChildren(document.createTextNode(' / '), link);
  }
})();
