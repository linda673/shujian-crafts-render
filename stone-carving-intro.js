/* 白花石刻介绍页。正文使用可编辑文字；所有插画均可同名替换。 */
(() => {
  'use strict';
  const topics = {
  "origin": [
    "溯石 · 知来处",
    [
      [
        "观察材料",
        "从石料的深浅色层、纹理和外形出发，辨认材料本身提供的创作线索。页面绿色插画是视觉示意，可进入习艺坊对照石面效果。"
      ],
      [
        "寻找手艺的来处",
        "围绕广元白花石刻，整理产地、作品与匠人的故事。具体作品的年代、作者和资料出处，可在项目中逐件补充。"
      ]
    ]
  ],
  "craft": [
    "琢华 · 识匠艺",
    [
      [
        "纹样与布局",
        "观察主体、枝叶和留白的位置，比较线稿与完成效果，理解一幅纹样怎样安排在石面上。"
      ],
      [
        "刀法与层次",
        "沿轮廓、转折和细节观察浅色纹样如何与深色底面形成层次。在习艺坊选择图稿，对照细节进行观察。"
      ]
    ]
  ],
  "life": [
    "寄石 · 入日常",
    [
      [
        "纹样与心意",
        "从花卉、兰竹、双鱼和山水中选择喜欢的主题，为作品写下自己的理解与心愿。"
      ],
      [
        "陈设与欣赏",
        "结合底座、摆放位置和观看距离，观察石刻在空间中的效果，让材料与纹样共同构成日常风景。"
      ]
    ]
  ],
  "stone": [
    "石色 · 深浅相映",
    [
      [
        "看色层",
        "比较石面上深色与浅色区域的分布，观察纹样与底色的关系。"
      ],
      [
        "看肌理",
        "放大观察颗粒、纹理和表面起伏，区分材料的自然质感与图案的边缘。"
      ]
    ]
  ],
  "carve": [
    "雕琢 · 刀下生花",
    [
      [
        "看轮廓",
        "从主花到枝叶，沿外轮廓寻找转折和连接，观察线条粗细如何变化。"
      ],
      [
        "看层次",
        "比较图稿与参考效果中的明暗、凹凸和细节，感受雕刻表现的空间层次。"
      ]
    ]
  ],
  "pattern": [
    "纹样 · 石上有意",
    [
      [
        "选主题",
        "进入习艺坊，可在牡丹、兰竹、双鱼和山水四组纹样之间切换。"
      ],
      [
        "看构成",
        "观察图案的中心、疏密和呼应关系，想一想哪种布局适合自己希望表达的主题。"
      ]
    ]
  ],
  "credits": [
    "项目与出处",
    [
      [
        "项目",
        "一针成景 · 白花石刻。介绍页插画用于材料与工艺的视觉导览。"
      ],
      [
        "素材与资料",
        "页面沿用项目方提供的素材。正式展示时，请为采用的作品补充名称、作者、图片授权与资料出处。"
      ]
    ]
  ]
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
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
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
  document.querySelectorAll('.section-heading, .cards .card').forEach(element => observer.observe(element));
})();
