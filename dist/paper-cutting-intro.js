/* 三台剪纸介绍页。正文使用可编辑文字；所有插画均可同名替换。 */
(() => {
  'use strict';
  const topics = {
    origin: ['溯纸 · 知来处', [['认识材料', '观察一张纸的厚薄、颜色和质感，想一想它们会怎样影响折叠与剪出的边缘。'], ['寻找生活线索', '从窗花、节庆装饰和礼物中的纸艺出发，寻找剪纸与日常生活的联系。']]],
    life: ['寄意 · 入日常', [['纹样与心意', '从花草、动物和文字中选择主题，把想表达的祝愿写进自己的作品说明。'], ['展示与分享', '想一想作品适合装饰窗户、贺卡还是相框，在习艺坊完成作品后保存并分享。']]],
    fold: ['折叠 · 纸面藏形', [['观察折线', '将折线看作观察图案的线索，比较展开前后的形状。'], ['动手体验', '现有习艺坊提供纹样选择与平铺剪纸操作；折叠过程可结合纸张实物观察。']]],
    cut: ['镂空 · 虚实相生', [['看留白', '观察图案里哪些部分被剪去，哪些部分保留。'], ['看连接', '留意细小连接如何让不同部分组成一个整体。']]],
    symmetry: ['对称 · 展纸成花', [['找对应', '沿图案中线观察，两侧有哪些形状相互对应？'], ['看变化', '比较不同纹样的对称方式，也可以选择不完全对称的图案进行创作。']]],
    credits: ['项目与出处', [['项目', '一针成景 · 三台剪纸。插画用于呈现材料与制作过程，供页面导览使用。'], ['素材与资料', '页面插画由项目方提供。具体作品的名称、作者及资料出处请按最终采用的素材补充。']]]
  };
  const dialog = document.querySelector('#topic-dialog');
  document.querySelectorAll('[data-topic]').forEach(button => {
    button.addEventListener('click', () => {
      const topic = topics[button.dataset.topic];
      if (!topic) return;
      document.querySelector('#topic-title').textContent = topic[0];
      const body = document.querySelector('#topic-body');
      body.replaceChildren();
      topic[1].forEach(([heading, copy]) => {
        const h = document.createElement('h3'); h.textContent = heading;
        const p = document.createElement('p'); p.textContent = copy;
        body.append(h, p);
      });
      dialog.showModal();
    });
  });
  if (new URLSearchParams(location.search).get('topic') === 'craft') {
    location.replace(document.getElementById('craft-card').href);
  }
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
})();

/* Reveal section headings and cards as they enter the viewport. */
(() => {
  if (!('IntersectionObserver' in window) || !matchMedia('(prefers-reduced-motion: no-preference)').matches) return;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12 });
  document.querySelectorAll('.section-heading, .cards .card').forEach(element => observer.observe(element));
})();
