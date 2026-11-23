(() => {
  const links = [...document.querySelectorAll('.phases a')];
  const panels = [...document.querySelectorAll('.stage')];

  function showStep() {
    const matched = links.find(link => link.hash === location.hash);
    const previous = links.find(link => link.hasAttribute('aria-current'));
    const current = matched || (['#tools', '#patterns'].includes(location.hash) && previous) || links[0];
    for (const link of links) {
      if (link === current) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    }
    for (const panel of panels) panel.hidden = '#' + panel.id !== current.hash;
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#step-"]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (link.hash !== location.hash) history.pushState(null, '', link.hash);
    showStep();
    if (link.classList.contains('action') || link.classList.contains('kit-return')) {
      document.querySelector('.phases [aria-current]').focus();
    }
  });
  window.addEventListener('popstate', showStep);
  window.addEventListener('hashchange', showStep);
  showStep();
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
    for (const img of reading.querySelectorAll('.motif-seq img')) {
      img.src = 'assets/paper-cutting/meanings/' + card.dataset.unit + '.png';
    }
  }

  function filter() {
    const words = search.value.trim().split(/\s+/).filter(Boolean);
    for (const button of filters) button.setAttribute('aria-pressed', String(button === category));
    gallery.querySelector('.motif-intro').textContent = category.dataset.intro;
    for (const card of cards) {
      const text = [card.textContent, card.dataset.type, card.dataset.words, card.dataset.note].join(' ');
      card.hidden = (category !== filters[0] && category.textContent !== card.dataset.type) ||
        !words.every(word => text.includes(word));
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
  filter();
})();

document.querySelector('.lineage-play').addEventListener('click', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const link = event.currentTarget;
  const player = document.createElement('iframe');
  player.title = '江小鱼剪纸：八折团花简单的祥云纹窗花';
  player.allow = 'autoplay; fullscreen; picture-in-picture';
  player.allowFullscreen = true;
  player.src = link.dataset.player;
  link.replaceWith(player);
  player.focus();
});
