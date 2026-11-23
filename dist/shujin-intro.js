/* 内容采用真实 HTML，图片仅承担装饰与插画。可按项目资料继续补充。 */
(() => {
  'use strict';
  const topics = {
    origin: ['溯锦 · 知来处', [['锦城寻源', '从成都与蜀锦的联系出发，认识这门手艺的来处。'], ['丝缕与色彩', '观察丝线的光泽、粗细与配色，寻找一幅织锦的材料线索。']]],
    craft: ['织华 · 识匠艺', [['经纬织造', '从经线与纬线的交错入手，观察织物的结构。'], ['锦纹解意', '从花鸟与几何图案中，发现对称、重复和连续排列。']]],
    life: ['续锦 · 入日常', [['锦入日常', '观察织锦在服饰、配饰与家居织物中的应用。'], ['匠心传承', '从手艺人的工作与设计实践中，认识传统纹样的新表达。']]],
    silk: ['丝线 · 材料之美', [['观察光泽', '转动视角，比较丝线在不同光线下的明暗变化。'], ['搭配色彩', '选择主色与点缀色，再进入习艺坊尝试你的配色。']]],
    weave: ['经纬 · 交织成锦', [['看结构', '把纵向与横向的线索联系起来，观察交织的规律。'], ['看图案', '想一想，重复的色彩和线条怎样构成完整纹样？']]],
    pattern: ['纹样 · 花鸟成趣', [['找对称', '观察花瓣、叶片与禽鸟的形态关系。'], ['找节奏', '比较图案的大小、间隔与重复方式。']]],
    credits: ['项目与出处', [['项目', '一针成景 · 四城五艺。此页为成都蜀锦主题的视觉与科普入口。'], ['素材', '插画与界面素材由项目方提供。正式发布前请在此补充作者、授权信息与科普资料来源。']]]
  };
  const dialog = document.querySelector('#topic-dialog');
  document.querySelectorAll('[data-topic]').forEach(button => {
    button.addEventListener('click', () => {
      const [title, sections] = topics[button.dataset.topic];
      document.querySelector('#topic-title').textContent = title;
      const body = document.querySelector('#topic-body');
      body.replaceChildren();
      sections.forEach(([heading, copy]) => {
        const h = document.createElement('h3'); h.textContent = heading;
        const p = document.createElement('p'); p.textContent = copy;
        body.append(h, p);
      });
      dialog.showModal();
    });
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) {
    const rect=dialog.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom) dialog.close();
  }});
})();

(() => {
  if (!('IntersectionObserver' in window) || !matchMedia('(prefers-reduced-motion: no-preference)').matches) return;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12 });
  document.querySelectorAll('.section-heading, .card').forEach(element => observer.observe(element));
})();
