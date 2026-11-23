(() => {
  const links = [...document.querySelectorAll('.phases a')];
  const panels = [...document.querySelectorAll('.stage')];
  const navigation = document.querySelector('.phases');
  const status = document.querySelector('#step-status');
  let current = links[0];

  function showStep() {
    const matched = links.find(link => link.hash === location.hash);
    current = matched || (['#tools', '#patterns', '#heritage'].includes(location.hash) ? current : links[0]);
    for (const link of links) {
      if (link === current) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    }
    for (const panel of panels) panel.hidden = '#' + panel.id !== current.hash;
    status.textContent = '第 ' + current.querySelector('i').textContent + ' 步，共五步，' + current.querySelector('span').textContent;
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#step-"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (link.hash !== location.hash) history.pushState(null, '', link.hash);
    showStep();
    current.focus({ preventScroll: true });
    // Return from the tools section or a mobile detail panel to the step controls.
    const bounds = navigation.getBoundingClientRect();
    if (bounds.top < 0 || bounds.bottom > window.innerHeight) navigation.scrollIntoView({ block: 'start', behavior: 'instant' });
  });
  window.addEventListener('popstate', showStep);
  window.addEventListener('hashchange', showStep);
  showStep();

  const credits = document.querySelector('#credits-dialog');
  document.querySelector('#credits-open').addEventListener('click', () => credits.showModal());
  credits.addEventListener('click', event => {
    const bounds = credits.getBoundingClientRect();
    if (event.target === credits && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) credits.close();
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('entered');
        observer.unobserve(entry.target);
      }
    }, { threshold: .12 });
    observer.observe(document.querySelector('.craft-ending'));
  }
})();

(() => {
  const gallery = document.querySelector('#patterns');
  const filters = [...gallery.querySelectorAll('.motif-filters button')];
  const cards = [...gallery.querySelectorAll('.motif-card')];
  const search = gallery.querySelector('input[type="search"]');
  const reading = gallery.querySelector('.motif-reading');
  const title = reading.querySelector('h3');
  const status = gallery.querySelector('.motif-status');
  const empty = gallery.querySelector('.motif-empty');
  let category = filters[0];
  let selection = cards[0];

  function select(card) {
    selection = card;
    for (const item of cards) item.setAttribute('aria-pressed', String(item === card));
    title.textContent = card.querySelector('strong').textContent;
    reading.querySelector('.motif-kicker span').textContent = '／ ' + card.dataset.type;
    reading.querySelector('.motif-note').textContent = card.dataset.note;
    reading.querySelector('.motif-lens').replaceChildren(card.querySelector('.motif-art').cloneNode(true));
    for (const img of reading.querySelectorAll('.motif-seq img')) img.src = card.dataset.unit;
  }

  function filter() {
    const words = search.value.trim().split(/\s+/).filter(Boolean);
    for (const button of filters) button.setAttribute('aria-pressed', String(button === category));
    gallery.querySelector('.motif-intro').textContent = category.dataset.intro;
    for (const card of cards) {
      const text = [card.textContent, card.dataset.type, card.dataset.words, card.dataset.note].join(' ');
      card.hidden = (category !== filters[0] && category.textContent !== card.dataset.type) || !words.every(word => text.includes(word));
    }
    const matches = cards.filter(card => !card.hidden);
    reading.hidden = !matches.length;
    empty.hidden = !!matches.length;
    if (matches.length && selection.hidden) select(matches[0]);
    status.textContent = '找到 ' + matches.length + ' 个纹样';
  }

  filters.forEach(button => button.addEventListener('click', () => {
    category = button;
    filter();
  }));
  cards.forEach(card => card.addEventListener('click', () => {
    select(card);
    status.textContent = '正在观察' + title.textContent;
    if (window.matchMedia('(max-width:950px)').matches) title.focus();
  }));
  search.addEventListener('input', filter);
  empty.querySelector('button').addEventListener('click', () => {
    search.value = '';
    category = filters[0];
    filter();
    search.focus();
  });
  select(selection);
  filter();
})();

// Load the remote film only after an explicit play request.
(() => {
  const video = document.querySelector('#lineage-video');
  const button = document.querySelector('.lineage-play');
  const label = button.querySelector('.lineage-playlabel span');
  const status = document.querySelector('.lineage-status');
  let attempt = 0;

  function showRetry() {
    const restoreFocus = document.activeElement === video;
    video.controls = false;
    button.hidden = false;
    label.textContent = '重新加载视频';
    button.setAttribute('aria-label', '重新加载麻柳刺绣传承影像');
    status.textContent = '视频暂未加载成功，请检查网络后重试。';
    if (restoreFocus) button.focus({ preventScroll: true });
  }

  button.addEventListener('click', async () => {
    if (button.hidden) return;
    const currentAttempt = ++attempt;
    button.hidden = true;
    video.controls = true;
    status.textContent = '正在加载传承影像…';
    video.src = video.dataset.src;
    video.load();
    video.focus({ preventScroll: true });
    try {
      await video.play();
    } catch (error) {
      if (currentAttempt !== attempt) return;
      if (error.name === 'NotAllowedError') {
        status.textContent = '请点击播放器中的播放按钮开始观看。';
      } else {
        showRetry();
      }
    }
  });

  video.addEventListener('playing', () => {
    button.hidden = true;
    status.textContent = '正在播放，可使用播放器暂停、调节进度或全屏观看。';
  });
  video.addEventListener('pause', () => {
    if (button.hidden && !video.ended && !video.error) status.textContent = '已暂停，可点击播放器继续观看。';
  });
  video.addEventListener('ended', () => {
    status.textContent = '播放结束，可点击播放器重播，或回看下方制作工序。';
  });
  video.addEventListener('error', showRetry);
})();
