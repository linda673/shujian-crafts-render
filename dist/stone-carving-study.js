(() => {
  'use strict';
  const section = document.getElementById('stone-details');
  if (!section) return;
  const details = {
    outline: {
      image: 'detail-outline.webp',
      alt: '浅色花瓣边缘与深灰石底相接，弯曲的轮廓清晰可见',
      heading: '花瓣的边，怎样立起来？',
      copy: '看花瓣与石底相接的地方。亮色的瓣缘转入一线暗影，弯曲的外轮廓因此清晰，花也有了从石面浮起的感觉。'
    },
    relief: {
      image: 'detail-relief.webp',
      alt: '石刻花心局部，翻卷花瓣的凹凸与阴影表现前后叠合',
      heading: '前后叠合，怎样看出来？',
      copy: '把目光移到花心。前一瓣遮住后一瓣的根部，卷起的瓣尖旁留着较深的阴影。顺着这几处明暗变化，可以读出花瓣的高低和朝向。'
    },
    texture: {
      image: 'detail-texture.webp',
      alt: '石刻叶片局部，主脉两侧分布细密刻痕',
      heading: '细细的刻痕，走向哪里？',
      copy: '先沿叶片中央的主脉看，再看两侧斜向展开的细痕。较宽的叶面被细线分出方向，叶尖与叶缘的转折也更容易辨认。'
    }
  };
  const image = section.querySelector('#stone-detail-image');
  const heading = section.querySelector('#stone-detail-heading');
  const copy = section.querySelector('#stone-detail-copy');
  const buttons = section.querySelectorAll('[data-stone-detail]');
  section.addEventListener('click', event => {
    const button = event.target.closest('[data-stone-detail]');
    if (!button || !section.contains(button)) return;
    const detail = details[button.dataset.stoneDetail];
    if (!detail) return;
    image.src = 'assets/stone-carving/study/' + detail.image;
    image.alt = detail.alt;
    heading.textContent = detail.heading;
    copy.textContent = detail.copy;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  });
})();
