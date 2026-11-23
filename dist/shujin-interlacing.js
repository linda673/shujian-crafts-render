(() => {
  'use strict';
  const section = document.getElementById('shujin-interlacing');
  if (!section) return;
  const views = {
    all: {
      title: '交错之间，织物成形',
      body: '一上一下，循环往复。经纬彼此交织，形成平纹织物的基本结构。',
      step: '01 / 03 · 平纹结构示意',
      diagram: '平纹交织全貌：浅绿色经线纵向排列，米白与珊瑚色纬线横向穿行，上下交替。'
    },
    warp: {
      title: '经线，纵向排列',
      body: '浅绿色丝线沿纵向排列。观察同一根经线，它与相邻纬线一上一下交错。',
      step: '02 / 03 · 观察经线',
      diagram: '突出显示浅绿色纵向经线，横向纬线淡化。'
    },
    weft: {
      title: '纬线，横向穿行',
      body: '米白与珊瑚色丝线均为纬线，颜色用于区分行次。它们横向穿行，与经线交织。',
      step: '03 / 03 · 观察纬线',
      diagram: '突出显示米白和珊瑚色横向纬线，纵向经线淡化。'
    }
  };
  const buttons = [...section.querySelectorAll('[data-weave-view]')];
  const diagram = section.querySelector('svg');
  const setView = mode => {
    const view = views[mode];
    if (!view) return;
    section.dataset.view = mode;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.weaveView === mode)));
    section.querySelector('.interlace-mode-title').textContent = view.title;
    section.querySelector('.interlace-mode-body').textContent = view.body;
    section.querySelector('.interlace-step').textContent = view.step;
    diagram.setAttribute('aria-label', view.diagram);
  };
  buttons.forEach(button => button.addEventListener('click', () => setView(button.dataset.weaveView)));
})();
