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
    const sample = card.querySelector('.motif-art img').getAttribute('src');
    const captions = card.dataset.details.split('|');
    reading.querySelectorAll('.motif-diagrams figure').forEach((figure, index) => {
      figure.querySelector('img').src = sample.replace('.webp', '-' + (index + 1) + '.webp');
      figure.querySelector('figcaption').textContent = captions[index];
    });
    const workshop = reading.querySelector('.motif-workshop');
    const pattern = card.dataset.workshop;
    workshop.href = pattern ? 'stone-carving.html?pattern=' + encodeURIComponent(pattern) : 'stone-carving.html';
    workshop.firstElementChild.textContent = pattern ? '去习艺坊查看此画稿' : '去习艺坊选石刻画稿';
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
