/* Independent origin page interactions. No fetch or module loader: works via file://. */
(() => {
  'use strict';
  // Switch only after both independent assets load, to avoid duplicated decoration.
  const photo = document.getElementById('craft-photo');
  const book = document.getElementById('book-decoration');
  const loadAsset = element => new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(image.src);
    image.onerror = () => resolve(null);
    image.src = element.dataset.src;
  });
  Promise.all([loadAsset(photo), loadAsset(book)]).then(([photoUrl, bookUrl]) => {
    if (!photoUrl || !bookUrl) return;
    photo.src = photoUrl;
    book.src = bookUrl;
    photo.hidden = false;
    book.hidden = false;
    photo.closest('.photo-wrap').classList.add('has-assets');
  });
  [['open-story', 'story-dialog'], ['open-credits', 'credits-dialog']].forEach(([buttonId, dialogId]) => {
    const button = document.getElementById(buttonId);
    const dialog = document.getElementById(dialogId);
    button.addEventListener('click', () => dialog.showModal());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
    });
  });
})();
