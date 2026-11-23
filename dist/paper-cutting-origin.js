/* Independent origin page interactions. No fetch or module loader: works via file://. */
(() => {
  'use strict';
  [['open-story', 'story-dialog'], ['open-credits', 'credits-dialog']].forEach(([buttonId, dialogId]) => {
    const buttons = document.querySelectorAll(buttonId === 'open-credits' ? '#open-credits, #end-credits' : '#open-story');
    const dialog = document.getElementById(dialogId);
    buttons.forEach(button => button.addEventListener('click', () => dialog.showModal()));
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
    });
  });

  // Content is visible even before the observer runs or if motion is disabled.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('paper-entered');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12 });
    const sections = [
      '.chapter-heading', '.photo-wrap', '.story-copy', '.pc-banner-copy',
      '.pl-intro', '#pl-diagram', '.history-inner > h2', '.history-view',
      '#paper-meanings-title', '.meaning-gallery figure', '.paper-next'
    ];
    document.querySelectorAll(sections.join(', '))
      .forEach(element => observer.observe(element));
  }
})();
