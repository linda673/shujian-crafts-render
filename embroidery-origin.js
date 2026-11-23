/* 普通脚本，无需服务端，支持本地 file:// 打开。 */
(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const activeAnimations = new Set();
  function animateChange(element, keyframes, options) {
    if (reducedMotion.matches || !element.animate) return;
    element.getAnimations().forEach(animation => animation.cancel());
    const animation = element.animate(keyframes, { easing: 'cubic-bezier(.18,.76,.23,1)', ...options });
    activeAnimations.add(animation);
    animation.finished.catch(() => {}).finally(() => activeAnimations.delete(animation));
  }
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) activeAnimations.forEach(animation => animation.cancel());
  });
  document.querySelectorAll('[data-dialog]').forEach(button => {
    const dialog = document.getElementById(button.dataset.dialog);
    button.addEventListener('click', () => dialog.showModal());
  });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
  });
  document.querySelectorAll('[data-close-dialog]').forEach(link => {
    link.addEventListener('click', () => link.closest('dialog').close());
  });
  const views = {
    petal: { image: 'detail-petal-v2.png', x: 50, y: 19, title: '斜向针脚，汇成一片花瓣', caption: '花瓣 · 顺着纹理看针向', copy: '从花瓣两侧向中间看，短线斜斜相接，形成清楚的中线。深浅相邻的珊瑚色，让花瓣既有方向，也有层次。' },
    center: { image: 'detail-center-v2.png', x: 50, y: 39, title: '一枚菱形，收住整朵花的中心', caption: '花心 · 看中心与对称', copy: '金色菱形位于花瓣相聚的地方，内外几层线条层层围合。以它为中心看左右，两侧花瓣在形状与颜色上互相照应。' },
    leaf: { image: 'detail-leaf-v2.png', x: 24, y: 71, title: '沿着叶脉，读出枝叶的朝向', caption: '枝叶 · 看疏密与留白', copy: '浅色叶脉把绿叶分成两侧，斜向纹理顺着叶片舒展。枝叶之间留出空隙，让每一片叶子的轮廓都能被看清。' }
  };
  const detail = document.getElementById('detail-image');
  const ring = document.querySelector('.focus-ring');
  const closeup = document.getElementById('closeup');
  let focusRequest = 0;
  let displayedFocus = document.querySelector('input[name="stitch-focus"]:checked').value;
  const imageLoads = new Map();
  function loadDetail(source) {
    if (!imageLoads.has(source)) {
      const image = new Image();
      image.src = source;
      const loading = image.decode().catch(error => {
        imageLoads.delete(source);
        throw error;
      });
      imageLoads.set(source, loading);
    }
    return imageLoads.get(source);
  }
  async function showFocus(name) {
    const view = views[name];
    if (!view) return;
    const request = ++focusRequest;
    const source = `assets/maliu-pages/embroidery/origin/${view.image}`;
    const changed = detail.getAttribute('src') !== source;
    closeup.setAttribute('aria-busy', 'true');
    try {
      await loadDetail(source);
    } catch (error) {
      if (request !== focusRequest) return;
      closeup.setAttribute('aria-busy', 'false');
      document.querySelector(`input[name="stitch-focus"][value="${displayedFocus}"]`).checked = true;
      document.getElementById('detail-caption').textContent = '局部图片加载失败，请重新选择。';
      return;
    }
    // 只呈现最后一次选择，高清图片解码完成后再切换。
    if (request !== focusRequest) return;
    displayedFocus = name;
    closeup.setAttribute('aria-busy', 'false');
    detail.src = source;
    detail.alt = view.caption;
    ring.style.left = `${view.x}%`;
    ring.style.top = `${view.y}%`;
    document.getElementById('detail-caption').textContent = view.caption;
    document.getElementById('reading-title').textContent = view.title;
    document.getElementById('reading-copy').textContent = view.copy;
    if (changed) {
      animateChange(detail, [
        { clipPath: 'inset(0 94% 0 0)', transform: 'scale(.98)' },
        { clipPath: 'inset(0)', transform: 'none' }
      ], { duration: 540 });
      animateChange(document.getElementById('stitch-reading'), [
        { opacity: .2, transform: 'translateY(12px)' },
        { opacity: 1, transform: 'none' }
      ], { duration: 420 });
    }
  }
  document.querySelectorAll('input[name="stitch-focus"]').forEach(input => {
    input.addEventListener('change', () => showFocus(input.value));
  });
  const currentFocus = () => document.querySelector('input[name="stitch-focus"]:checked').value;
  showFocus(currentFocus());
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('entered'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.1 });
    const targets = [
      '.chapter-heading', '.photo-wrap', '.story-copy', '.banner-copy',
      '.study-intro', '.closeup', '.pattern-overview', '#history-title',
      '.history-view', '#meaning-title', '.meaning-gallery figure', '.next-section'
    ];
    document.querySelectorAll(targets.join(', ')).forEach(node => observer.observe(node));
  }
})();

(() => {
  const radios = document.querySelectorAll('input[name="history-era"]');
  const sync = () => {
    radios.forEach(input => {
      const panel = document.getElementById(input.getAttribute('aria-controls'));
      if (input.checked) { const img = panel.querySelector('img'); img.loading = 'eager'; }
    });
  };
  radios.forEach(input => input.addEventListener('change', sync));
  sync();
})();
