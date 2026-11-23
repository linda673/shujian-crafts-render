(() => {
  'use strict';
  // 放入同名独立素材后自动启用，暂缺时保留随包预览。
  const photo = document.querySelector('[data-optional-src]');
  const replacement = new Image();
  replacement.onload = () => {
    photo.src = replacement.src;
    photo.hidden = false;
    photo.closest('.photo-wrap').classList.add('has-photo');
  };
  replacement.src = photo.dataset.optionalSrc;

  const badge = new Image();
  badge.onload = () => {
    document.querySelectorAll('.keyword-shape').forEach(shape => {
      shape.classList.add('custom');
      shape.style.setProperty('--badge-image', 'url("assets/shujin/origin/keyword-frame.png")');
    });
  };
  badge.src = 'assets/shujin/origin/keyword-frame.png';

  [['open-story', 'story-dialog'], ['open-credits', 'credits-dialog']].forEach(([buttonId, dialogId]) => {
    const button = document.getElementById(buttonId);
    const dialog = document.getElementById(dialogId);
    button.addEventListener('click', () => dialog.showModal());
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
  });
})();
