(() => {

  document.getElementById('end-credits').addEventListener('click', () => {
    document.getElementById('credits-dialog').showModal();
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('life-entered');
        observer.unobserve(entry.target);
      }
    }, { threshold: .12 });
    const targets = [
      '.life-hero', '.hero-copy', '.life-title', '.flower-grid article',
      '.local-story figure', '.local-text > *', '.life-next'
    ];
    document.querySelectorAll(targets.join(', ')).forEach(element => observer.observe(element));
  }
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  document.querySelectorAll('.flower-grid figure').forEach(figure => {
    figure.addEventListener('pointermove', event => {
      if (!finePointer.matches || event.pointerType === 'touch') return;
      const bounds = figure.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, 2 * (event.clientX - bounds.left) / bounds.width - 1));
      const y = Math.max(-1, Math.min(1, 2 * (event.clientY - bounds.top) / bounds.height - 1));
      figure.style.setProperty('--tilt-x', (-5 * y).toFixed(2) + 'deg');
      figure.style.setProperty('--tilt-y', (7 * x).toFixed(2) + 'deg');
    });
    figure.addEventListener('pointerleave', () => {
      figure.style.removeProperty('--tilt-x');
      figure.style.removeProperty('--tilt-y');
    });
  });

const credits = document.querySelector('#credits-dialog');
credits.addEventListener('click', event => {
  const bounds = credits.getBoundingClientRect();
  if (event.target === credits && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) credits.close();
});

})();
