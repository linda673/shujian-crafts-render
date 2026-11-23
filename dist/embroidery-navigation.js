/* 放在 embroidery.html 的原有 defer 脚本之后引用。 */
(() => {
  'use strict';
  const page = location.pathname.split('/').pop();
  if (page !== 'embroidery.html') return;

  const observe = document.querySelector('[data-nav="观微阁"]');
  const workshop = document.querySelector('[data-nav="习艺坊"]');
  const letters = document.querySelector('[data-nav="寄情居"]');

  if (observe) observe.onclick = () => { location.href = 'embroidery-intro.html'; };
  if (workshop) {
    workshop.onclick = () => { document.querySelector('.workspace')?.scrollIntoView({ block: 'start', behavior: 'smooth' }); };
  }
  if (letters) letters.onclick = () => { location.href = 'embroidery-gift.html'; };
})();
