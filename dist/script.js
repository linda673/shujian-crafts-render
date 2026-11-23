const assets = window.ART_ASSETS;
const state = { pattern: 0, step: 0, color: 0 };
const selectedId = new URLSearchParams(location.search).get('pattern');
const selectedIndex = assets.patterns.findIndex(item => item.id === selectedId);
if (selectedIndex >= 0) state.pattern = selectedIndex;
const $ = selector => document.querySelector(selector);
const stepDescriptions = ['第 1 步 · 择稿迎喜：请在左侧选择画稿。','第 2 步 · 刻线成形：当前为步骤预览，刻线交互待素材确认后接入。','第 3 步 · 印墨留形：当前为步骤预览，印墨交互待素材确认后接入。','第 4 步 · 敷彩生春：可预选颜色，区域填色待素材确认后接入。'];
const colors = [['朱红','#c95e4e'],['桃粉','#e8a79b'],['藤黄','#dcb455'],['竹青','#59846c'],['石绿','#5da896'],['赭石','#a96b45'],['墨色','#3a3024'],['米白','#f4ecd6']];
function loadAsset(image, path, fallback, alternatePath) {
  image.hidden = true;
  if (fallback) fallback.hidden = false;
  image.onload = () => { image.hidden = false; image.parentElement.classList.add('has-image'); if (fallback) fallback.hidden = true; if(image.id==='line-image'){$('#use-pattern').disabled=false;$('#next').disabled=false;} };
  image.onerror = () => { if(alternatePath){loadAsset(image,alternatePath,fallback);return;} image.hidden = true; image.parentElement.classList.remove('has-image'); if (fallback) fallback.hidden = false; if(image.id==='line-image'){$('#use-pattern').disabled=true;$('#next').disabled=true;$('#selection-status').textContent='请先放入这幅画稿的线稿素材。';} };
  image.src = path;
}
loadAsset($('#logo'),assets.logo,$('#logo-fallback'));
loadAsset($('#roof'),assets.roof,$('#roof-fallback'));
document.querySelectorAll('[data-decoration]').forEach(img => {
  const fallback = img.parentElement.classList.contains('seal') ? img.nextElementSibling : null;
  loadAsset(img, assets.decorations[img.dataset.decoration], fallback);
});
document.querySelectorAll('[data-icon]').forEach(img => loadAsset(img,assets.icons[img.dataset.icon],img.nextElementSibling));
const background = new Image();
background.onload = () => { document.body.style.backgroundImage = `url("${assets.background}")`; };
background.src = assets.background;
assets.patterns.forEach((pattern,index) => {
  const button = document.createElement('button'); button.className='pattern';
  button.setAttribute('aria-label',`选择${pattern.name}画稿`);
  button.innerHTML=`<span class="thumb"><img alt="" hidden><span class="thumb-fallback" aria-hidden="true">${pattern.mark}</span></span><span>${pattern.name}</span>`;
  button.addEventListener('click',() => {state.pattern=index;state.step=0;renderPattern();renderStep();$('#selection-status').textContent='';});
  $('#patterns').append(button); loadAsset(button.querySelector('img'),pattern.thumb,button.querySelector('.thumb-fallback'),pattern.line);
});
function renderPattern() {
  $('#use-pattern').disabled=true;$('#next').disabled=true;
  const pattern=assets.patterns[state.pattern];
  document.querySelectorAll('.pattern').forEach((button,index) => button.setAttribute('aria-pressed',String(index===state.pattern)));
  $('#line-image').alt=`${pattern.name}线稿`; $('#color-image').alt=`${pattern.name}彩色参考效果`;
  $('#line-placeholder h3').textContent=`${pattern.name} · 线稿预留区`;
  $('#line-placeholder code').textContent=pattern.line; $('#color-placeholder code').textContent=pattern.color;
  loadAsset($('#line-image'),pattern.line,$('#line-placeholder'));
  loadAsset($('#color-image'),pattern.color,$('#color-placeholder'));
  document.querySelector('.reference .description').textContent=pattern.lesson.observe;
}
function showPalette(show) {
  $('#patterns').hidden=show; $('#palette').hidden=!show;
  $('#palette-tab').classList.toggle('active',show); $('#patterns-tab').classList.toggle('active',!show);
  $('#palette-tab').setAttribute('aria-pressed',String(show)); $('#patterns-tab').setAttribute('aria-pressed',String(!show));
}
function renderStep() {
  document.querySelectorAll('[data-step]').forEach(button => {if(Number(button.dataset.step)===state.step)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
  $('#step-status').textContent=[assets.patterns[state.pattern].lesson.observe, assets.patterns[state.pattern].lesson.carve, '刻板完成后，以线稿呈现印墨效果，继续敷彩。', assets.patterns[state.pattern].lesson.color][state.step]; $('#previous').disabled=state.step===0; $('#next').disabled=$('#line-image').hidden;
  showPalette(state.step===3);
}
function selectColor(index) {
  state.color=index;
  document.querySelectorAll('.swatch').forEach((button,i)=>button.setAttribute('aria-pressed',String(index===i)));
  $('#color-label').textContent=`当前颜色：${colors[index][0]}`;
}
colors.forEach(([name,color],index)=>{const button=document.createElement('button');button.className='swatch';button.style.setProperty('--swatch',color);button.setAttribute('aria-label',name);button.title=name;button.addEventListener('click',()=>selectColor(index));$('#swatches').append(button);});
$('#palette-tab').addEventListener('click',()=>showPalette(true)); $('#patterns-tab').addEventListener('click',()=>showPalette(false));
function openCarving() {
  const line=$('#line-image');
  if(line.hidden||!line.complete||!line.naturalWidth){$('#selection-status').textContent='请先选择已有线稿的画稿。';return;}
  location.href=`carve.html?pattern=${encodeURIComponent(assets.patterns[state.pattern].id)}`;
}
document.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>{const step=Number(button.dataset.step);if(step===1)openCarving();else if(step===0){state.step=0;renderStep();}else showInfo('体验步骤','先选择画稿进入刻板页，再点击「完成刻板」进入闭合区域上色。');}));
$('#previous').addEventListener('click',()=>{state.step=Math.max(0,state.step-1);renderStep();});
$('#next').addEventListener('click',openCarving);
$('#reset').addEventListener('click',()=>{state.pattern=0;state.step=0;renderPattern();renderStep();selectColor(0);$('#selection-status').textContent='';});
$('#use-pattern').addEventListener('click',openCarving);
function showInfo(title,body){$('#dialog-title').textContent=title;$('#dialog-body').textContent=body;$('#dialog').showModal();}
document.querySelectorAll('[data-nav]').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.nav==='习艺坊'){location.href='index.html';return;}showInfo(button.dataset.nav,'此入口已预留。当前实现的是「习艺坊 · 施彩体验」页面，后续可接入对应页面地址。');}));
$('#credits').addEventListener('click',()=>showInfo('项目与出处','页面根据你提供的「绵竹岁华体验页2.png」搭建。目前为待接入正式素材的布局版本。年画、字体及装饰素材的作者与出处将在素材确认后补齐。'));
renderPattern();renderStep();selectColor(0);
