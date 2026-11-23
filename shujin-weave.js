(() => {
  'use strict';
  const section = document.getElementById('shujin-weave');
  const config = window.SHUJIN_WEAVE_ASSETS;
  if (!section || !config || config.mode !== 'layers') return;
  const loadImage = src => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image.src);
    image.onerror = () => reject(new Error('未找到素材：' + src));
    image.src = src;
  });
  // 三张主体素材全部就绪才切换，避免缺图时显示不完整页面。
  Promise.all([config.background, config.flower, config.card].map(loadImage))
    .then(([background, flower, card]) => {
      section.style.backgroundImage = 'url(' + JSON.stringify(background) + ')';
      section.querySelector('.shujin-weave-flower').src = flower;
      section.querySelector('.shujin-weave-card img').src = card;
      section.querySelector('.shujin-weave-reference-art').hidden = true;
      section.classList.remove('is-reference');
      [['title', '.shujin-weave-title'], ['subtitle', '.shujin-weave-subtitle']].forEach(([key, selector]) => {
        if (!config[key]) return;
        loadImage(config[key]).then(src => {
          const heading = section.querySelector(selector);
          const image = heading.querySelector('.shujin-weave-text-art');
          image.src = src;
          image.hidden = false;
          heading.classList.add('is-ready');
        }).catch(error => console.warn(error.message));
      });
    }).catch(error => console.warn(error.message + '；继续显示参考图插画区域。'));
})();
