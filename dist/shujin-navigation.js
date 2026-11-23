/* 必须以 defer 加载，并排在原 shujin.js 之后；保留全部画稿和上色逻辑。 */
(() => {
  'use strict';
  if (!document.body.classList.contains('shujin-page')) return;
  document.querySelectorAll('[data-nav]').forEach(button => {
    const label = button.dataset.nav;
    if (label === '观微阁') button.onclick = () => { location.href = 'shujin-intro.html'; };
    if (label === '习艺坊') button.onclick = () => { location.href = 'shujin.html'; };
    if (label === '寄情居') button.onclick = () => { location.href = 'index.html#latest-work'; };
  });
  const breadcrumb = document.querySelector('.experience-breadcrumb');
  if (breadcrumb && !breadcrumb.querySelector('[data-intro-link]')) {
    const span = breadcrumb.querySelector('span');
    const link = document.createElement('a');
    link.dataset.introLink = ''; link.href = 'shujin-intro.html'; link.textContent = '成都蜀锦';
    if (span) span.replaceChildren(document.createTextNode(' / '), link);
  }
})();
