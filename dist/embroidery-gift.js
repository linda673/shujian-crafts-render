'use strict';

const gifts = {
  pouch: {name: '随身绣囊', meaning: '把牵挂系在身边，愿你所行皆安。', alt: '米白绣囊，青绿系绳与珊瑚色流苏'},
  cloth: {name: '一方绣帕', meaning: '把温柔收进日常，愿你四季有暖。', alt: '层叠的米白与青绿绣布，饰有红绿几何绣纹'},
  hoop: {name: '案头绣框', meaning: '把好景留在眼前，愿你日日舒心。', alt: '木色绣框中的红绿菱形绣纹，配以针线'}
};
const select = selector => document.querySelector(selector);
const tiles = [...document.querySelectorAll('.tile')];
const preview = select('#gift-image');
const action = select('#action');
const dialog = select('.receipt');
const canvas = select('#gift-card');
let selectedGift = 'pouch';
let phase = 'editing';
let ready = false;

function updateRecipient() {
  select('#tag-recipient').textContent = select('#recipient').value.trim() || '心上之人';
  select('#count').textContent = `${select('#message').value.length} / 60`;
}

function editGift() {
  phase = 'editing';
  select('#gift-scene').classList.remove('sealed');
  select('#message-fields').hidden = false;
  select('#sealed-note').hidden = true;
  select('#edit').hidden = true;
  select('#step').textContent = '择物寄意 · 麻柳刺绣';
  select('#hint').textContent = '选一件喜欢的绣物，写下想说的话。';
  action.textContent = '封存这份心意';
  action.disabled = !ready;
}

function chooseGift(key) {
  selectedGift = key;
  const gift = gifts[key];
  preview.src = window.embroideryGiftArt[key];
  preview.alt = gift.alt;
  select('#gift-caption').textContent = gift.name;
  select('#gift-meaning').textContent = gift.meaning;
  tiles.forEach(tile => tile.setAttribute('aria-pressed', String(tile.dataset.gift === key)));
  editGift();
}

function drawCard() {
  const context = canvas.getContext('2d');
  const gift = gifts[selectedGift];
  const image = tiles.find(tile => tile.dataset.gift === selectedGift).querySelector('img');
  const recipient = select('#recipient').value.trim() || '心上之人';
  const message = select('#message').value.trim().replace(/\s+/g, ' ') || '愿你一程有暖，一岁无忧。';
  const gradient = context.createLinearGradient(0, 0, 1440, 1000);
  gradient.addColorStop(0, '#faf6ec');
  gradient.addColorStop(1, '#e1e9d9');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1440, 1000);
  context.lineWidth = 2;
  context.strokeStyle = '#9eae92';
  context.strokeRect(30, 30, 1380, 940);
  context.strokeStyle = '#cfb88c';
  context.strokeRect(41, 41, 1358, 918);
  context.fillStyle = '#61816b';
  context.font = '26px "STZhongsong", "华文中宋", serif';
  context.fillText('寄 情 居  /  麻 柳 刺 绣', 90, 122);
  context.fillStyle = '#39785c';
  context.font = '72px "STZhongsong", "华文中宋", serif';
  context.fillText('绣寄心意', 86, 242);
  context.fillStyle = '#b67555';
  context.font = '32px "STZhongsong", "华文中宋", serif';
  context.fillText('寄给 · ' + recipient, 90, 340, 580);
  context.fillStyle = '#365d4c';
  context.font = '34px "STZhongsong", "华文中宋", serif';
  let line = '';
  let y = 428;
  for (const character of message) {
    if (context.measureText(line + character).width > 510) {
      context.fillText(line, 90, y);
      y += 55;
      line = '';
    }
    line += character;
  }
  context.fillText(line, 90, y);
  context.fillStyle = '#f9f3e4';
  context.fillRect(695, 180, 635, 590);
  context.strokeStyle = '#c7c7a8';
  context.strokeRect(706, 191, 613, 568);
  const scale = Math.min(575 / image.naturalWidth, 545 / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  context.drawImage(image, 1012 - width / 2, 475 - height / 2, width, height);
  context.fillStyle = '#39785c';
  context.textAlign = 'center';
  context.font = '31px "STZhongsong", "华文中宋", serif';
  context.fillText(gift.name, 1012, 826);
  context.textAlign = 'left';
  context.font = '25px "STZhongsong", "华文中宋", serif';
  context.fillStyle = '#7f7658';
  context.fillText('一针一线，一份心意。', 90, 803);
  context.beginPath();
  context.moveTo(90, 865);
  context.lineTo(1350, 865);
  context.strokeStyle = '#afc1a9';
  context.stroke();
  context.fillStyle = '#527e6c';
  context.font = '23px "STZhongsong", "华文中宋", serif';
  context.fillText('四城五艺的材料之境 · 麻柳刺绣', 90, 921);
  const description = `寄给${recipient}的${gift.name}。${message}`;
  canvas.setAttribute('aria-label', description);
  select('#card-description').textContent = description;
}

action.addEventListener('click', () => {
  if (!ready) return;
  if (phase === 'editing') {
    phase = 'sealed';
    select('#gift-scene').classList.add('sealed');
    select('#message-fields').hidden = true;
    select('#sealed-note').hidden = false;
    select('#edit').hidden = false;
    select('#step').textContent = '封存心意 · 待你拆阅';
    select('#hint').textContent = '绣礼已封好，点击“拆开绣礼”读出祝福。';
    action.textContent = '拆开绣礼，读出心意';
    return;
  }
  drawCard();
  select('#download-status').textContent = '';
  dialog.showModal();
});

select('#recipient').addEventListener('input', updateRecipient);
select('#message').addEventListener('input', updateRecipient);
select('#edit').addEventListener('click', editGift);
select('#back').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { editGift(); action.focus(); });

select('#save').addEventListener('click', () => {
  const save = select('#save');
  save.disabled = true;
  select('#download-status').textContent = '正在生成图片…';
  try {
    canvas.toBlob(blob => {
      save.disabled = false;
      if (!blob) {
        select('#download-status').textContent = '图片生成失败，请重新保存。';
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const name = (select('#recipient').value.trim() || '一份心意').replace(/[<>:"/\\|?*\u0000-\u001f]/g, '');
      link.download = `绣寄心意-${name || '祝福'}.png`;
      link.href = url;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      select('#download-status').textContent = '心意卡已生成，可在浏览器下载记录中查看。';
    }, 'image/png');
  } catch (error) {
    save.disabled = false;
    select('#download-status').textContent = '图片保存失败，请重试。';
  }
});

async function initialize() {
  try {
    for (const tile of tiles) {
      tile.querySelector('img').src = window.embroideryGiftArt[tile.dataset.gift];
      tile.addEventListener('click', () => chooseGift(tile.dataset.gift));
    }
    chooseGift(selectedGift);
    await Promise.all(tiles.map(tile => tile.querySelector('img').decode()));
    ready = true;
    action.disabled = false;
  } catch (error) {
    select('#error').hidden = false;
    select('#error').textContent = '绣礼素材加载失败，请刷新页面重试。';
    action.textContent = '素材尚未就绪';
  }
}
updateRecipient();
initialize();
