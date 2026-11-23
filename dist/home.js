'use strict';
const brandImage=document.querySelector('.home-brand img');
brandImage.onload=()=>{brandImage.hidden=false;document.querySelector('.brand-text').hidden=true;};
brandImage.onerror=()=>{brandImage.hidden=true;};
brandImage.src='assets/brand/logo.png';
const grid=document.querySelector('#craft-grid');
if(grid){
  const homeIllustrations = {
    nianhua: { src: 'assets/home/nianhua-card-transparent.webp', description: '刻版施彩，绘出新岁祝愿。' },
    shujin: { src: 'assets/shujin/intro/hero.webp', description: '经纬交织，织就花叶芳华。' },
    'paper-cutting': { src: 'assets/paper-cutting/intro/hero.webp', description: '折纸剪花，感受对称之美。' },
    'stone-carving': { src: 'assets/stone-carving/intro/hero.webp', description: '循纹雕琢，刻出石上花韵。' },
    embroidery: { src: 'assets/maliu-pages/embroidery/intro/hero.webp', description: '一针一线，绣出花叶心意。' }
  };
  const illustratedHome = document.body.classList.contains('home-redesign');
  window.CRAFTS.forEach((craft, index) => {
    const card = document.createElement('a');
    card.href = craft.url;
    card.className = `craft-card${craft.available ? ' featured' : ''}`;
    card.setAttribute('aria-label', `进入${craft.name}体验`);
    const artwork = homeIllustrations[craft.id];
    if (illustratedHome && artwork) {
      const art = document.createElement('span');
      art.className = 'craft-art';
      art.setAttribute('aria-hidden', 'true');
      if (artwork.poster) {
        const image = document.createElement('span');
        image.className = 'craft-hero-nianhua';
        art.append(image);
      } else {
        const image = document.createElement('img');
        image.src = artwork.src;
        image.alt = '';
        image.decoding = 'async';
        art.append(image);
      }
      card.append(art);
    } else {
      const number = document.createElement('span');
      number.className = 'craft-number';
      number.textContent = `手艺 / 0${index + 1}`;
      const mark = document.createElement('span');
      mark.className = 'craft-mark';
      mark.textContent = craft.mark;
      mark.setAttribute('aria-hidden', 'true');
      card.append(number, mark);
    }
    const title = document.createElement('h2');
    title.textContent = craft.name;
    const description = document.createElement('p');
    description.textContent = illustratedHome && artwork ? artwork.description : craft.description;
    const enter = document.createElement('span');
    enter.className = 'enter';
    enter.innerHTML = '<span>进入体验</span><span aria-hidden="true">→</span>';
    card.append(title, description, enter);
    grid.append(card);
  });
  const latest=window.ArtworkStore.latest();
  if(latest){
    const isPaper=latest.craft==='paper-cutting';
    const isShujin=latest.craft==='shujin';
    const isEmbroidery=latest.craft==='embroidery';
    document.querySelector('#latest-work').hidden=false;
    const image=document.querySelector('#latest-image');image.src=latest.png;image.alt=`最近保存的${latest.name}${isPaper?'剪纸':isShujin||isEmbroidery?'':'年画'}`;
    document.querySelector('#latest-title').textContent=`最近完成 · ${latest.name}`;
    document.querySelector('#latest-description').textContent=latest.persistent?'作品已保存在当前浏览器，可随时下载 PNG。':'作品暂存在当前标签页，建议下载 PNG 留存。';
    const download=document.querySelector('#latest-download');download.href=latest.png;download.download=`${isEmbroidery?'麻柳刺绣':isPaper?'三台剪纸':isShujin?'成都蜀锦':'一版生春'}-${latest.name}.png`;
    document.querySelector('#latest-edit').href=`${isEmbroidery?(latest.stage==='stitch'?'embroidery-work.html':'embroidery.html'):isPaper?'paper-cut-workspace.html':isShujin?(latest.stage==='stitch'?'shujin-stitch.html':latest.stage==='color'?'shujin-color.html':'shujin.html'):'color.html'}?pattern=${encodeURIComponent(latest.patternId)}`;
    document.querySelector('#latest-edit').textContent=isEmbroidery?(latest.stage==='stitch'?'继续刺绣':'返回刺绣纹样'):isPaper?'继续剪纸':isShujin?(latest.stage==='stitch'?'继续织线':latest.stage==='color'?'继续丝线上色':'返回蜀锦画稿'):'继续配色';
    if(new URLSearchParams(location.search).get('saved')==='1'){
      const notice=document.querySelector('#save-notice');notice.textContent=`「${latest.name}」作品已保存。可以继续体验其他手艺，或在下方下载作品。`;notice.hidden=false;
    }
  }
}else{
  const craft=window.CRAFTS.find(item=>item.id===document.body.dataset.craft);
  if(craft){document.title=`${craft.name} · 手艺体验`;document.querySelector('#craft-title').textContent=craft.name;document.querySelector('#craft-mark').textContent=craft.mark;document.querySelector('#craft-description').textContent=`已进入${craft.name}体验。`;}
}
