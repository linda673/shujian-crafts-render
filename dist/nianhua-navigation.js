(() => {
  'use strict';
  const page = location.pathname.split('/').pop();
  if (page === 'index.html' || page === '') {
    const updateLinks = () => document.querySelectorAll('a[href]').forEach(a => {
      const target = new URL(a.getAttribute('href'), location.href);
      if (target.pathname.endsWith('/nianhua.html')) {
        target.pathname = target.pathname.replace(/nianhua\.html$/, 'nianhua-intro.html');
        a.href = target.href;
      }
    });
    updateLinks();
    // Deferred scripts run while readyState is interactive, before DOMContentLoaded.
    if (document.readyState !== 'complete') {
      document.addEventListener('DOMContentLoaded', updateLinks, { once: true });
    }
  }
  if (page === 'nianhua.html') {
    document.addEventListener('click', event => {
      const button = event.target.closest('[data-nav]');
      if (!button) return;
      if (button.dataset.nav === '观微阁') {
        event.preventDefault();
        event.stopImmediatePropagation();
        location.href = 'nianhua-intro.html';
      } else if (button.dataset.nav === '习艺坊') {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
  }
})();
