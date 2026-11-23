'use strict';
const $=selector=>document.querySelector(selector),assets=window.ART_ASSETS;
const requested=new URLSearchParams(location.search).get('pattern');
const pattern=assets.patterns.find(item=>item.id===requested)||assets.patterns[0];
const W=1000,H=700,canvas=$('#coloring-canvas'),ctx=canvas.getContext('2d');
const palette=[['桃粉','#f8cbbf'],['藤黄','#dfbc7c'],['石绿','#5aa78a'],['朱红','#ef8c89'],['米黄','#f0dfb7'],['竹青','#819270']];
let model,ready=false,currentColor=palette[0][1],erase=false,fills={},history=[],future=[],hovered=0;
document.querySelector('.reference .description').textContent=pattern.lesson.color;
const storageKey=`yibanshengchun:coloring:v1:${pattern.id}`;
function layer(){const c=document.createElement('canvas');c.width=W;c.height=H;return c;}
const paper=layer(),paint=layer(),ink=layer(),highlight=layer();
function loadAsset(img,path,fallback){img.onload=()=>{img.hidden=false;img.parentElement.classList.add('has-image');if(fallback)fallback.hidden=true;};img.onerror=()=>{img.hidden=true;if(fallback)fallback.hidden=false;};img.src=path;}
loadAsset($('#logo'),assets.logo,$('#logo-fallback'));loadAsset($('#roof'),assets.roof,$('#roof-fallback'));
document.querySelectorAll('[data-icon]').forEach(img=>loadAsset(img,assets.icons[img.dataset.icon],img.nextElementSibling));
document.querySelectorAll('[data-decoration]').forEach(img=>loadAsset(img,assets.decorations[img.dataset.decoration],img.parentElement.classList.contains('seal')?img.nextElementSibling:null));
const bg=new Image();bg.onload=()=>document.body.style.backgroundImage=`url("${assets.background}")`;bg.src=assets.background;
loadAsset($('#color-image'),pattern.color,$('#color-placeholder'));$('#color-image').alt=`${pattern.name}参考配色`;$('#color-placeholder code').textContent=pattern.color;
$('#pattern-name').textContent=`${pattern.name} · 敷彩生春`;
document.querySelector('[data-step="3"]').setAttribute('aria-current','step');
function showInfo(title,body){$('#dialog-title').textContent=title;$('#dialog-body').textContent=body;$('#dialog').showModal();}
function save(){if(!ready)return;try{sessionStorage.setItem(storageKey,JSON.stringify({fills,currentColor,sourceLength:(window.CARVING_IMAGES?.[pattern.id]||pattern.line).length}));}catch{$('#step-status').textContent='当前颜色仍保留在页面中；请下载作品，刷新后可能丢失。';}}
function restore(){try{
  let saved=null;
  try{saved=JSON.parse(sessionStorage.getItem(storageKey)||'null');}catch{}
  if(!saved){const latest=window.ArtworkStore.latest();if(latest?.craft!=='paper-cutting'&&latest?.patternId===pattern.id)saved=latest.editState;}
  if(!saved||saved.sourceLength!==(window.CARVING_IMAGES?.[pattern.id]||pattern.line).length)return;
  for(const [id,color] of Object.entries(saved.fills||{}))if(Number.isInteger(+id)&&+id>0&&+id<=model.regions.length&&/^#[0-9a-f]{6}$/i.test(color))fills[id]=color;
  if(/^#[0-9a-f]{6}$/i.test(saved.currentColor))currentColor=saved.currentColor;
}catch{fills={};}}
function makePaper(){const g=paper.getContext('2d');g.fillStyle='#fbf9ef';g.fillRect(0,0,W,H);for(let y=0;y<H;y+=3){g.fillStyle=`rgba(133,118,85,${y%9===0?.017:.008})`;g.fillRect(0,y,W,1);}}
function rgb(hex){return [parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)];}
function paintRegions(){
  const g=paint.getContext('2d'),pixels=g.createImageData(W,H);
  for(const region of model.regions){
    const color=fills[region.id];if(!color)continue;const channels=rgb(color);
    for(const index of region.pixels){
      const x=index%W,y=Math.floor(index/W),grain=((Math.imul(index+1,2654435761)>>>16)&255)/255;
      const wash=.025+.025*Math.sin(x*.047+y*.018)+.015*Math.sin(y*.081-x*.013);
      const offset=(grain-.5)*7;
      for(let j=0;j<3;j++)pixels.data[index*4+j]=Math.max(0,Math.min(255,channels[j]+(255-channels[j])*wash+offset));
      pixels.data[index*4+3]=255;
    }
  }
  g.putImageData(pixels,0,0);render();
}
function render(){
  ctx.clearRect(0,0,W,H);ctx.drawImage(paper,0,0);ctx.drawImage(paint,0,0);if(hovered)ctx.drawImage(highlight,0,0);ctx.drawImage(ink,0,0);
  const count=Object.keys(fills).length,total=model?.regions.length||0;
  $('#progress-label').textContent=`${count} / ${total} 区域`;$('#coloring-progress').value=total?count/total*100:0;
  $('#paint-undo').disabled=!history.length;$('#paint-redo').disabled=!future.length;
  $('#finish-coloring').disabled=!count;$('#next').disabled=!count;$('#fill-region').disabled=!ready;
}
function setHighlight(id){
  if(id===hovered)return;hovered=id;const g=highlight.getContext('2d');g.clearRect(0,0,W,H);
  if(id){const pixels=g.createImageData(W,H);for(const index of model.regions[id-1].pixels){pixels.data[index*4]=80;pixels.data[index*4+1]=140;pixels.data[index*4+2]=110;pixels.data[index*4+3]=30;}g.putImageData(pixels,0,0);}
  render();
}
function chooseColor(color,name){
  currentColor=color;erase=false;$('#erase-region').setAttribute('aria-pressed','false');
  document.querySelectorAll('.paint-color').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.color===color)));
  $('#custom-color').value=color;$('#selected-color').textContent=`当前颜色：${name||'自选色'}`;
  if(ready)save();
}
palette.forEach(([name,color])=>{const button=document.createElement('button');button.className='paint-color';button.style.setProperty('--paint',color);button.dataset.color=color;button.setAttribute('aria-label',name);button.title=name;button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>chooseColor(color,name));$('#paint-colors').append(button);});
$('#custom-color').addEventListener('input',event=>chooseColor(event.target.value,'自选色'));
function remember(){history.push({...fills});if(history.length>100)history.shift();future=[];}
function fillRegion(id){
  if(!ready)return;
  if(!id){$('#step-status').textContent='请点击图案的闭合区域内部，空白背景不会上色。';return;}
  if(erase&&!fills[id]||!erase&&fills[id]===currentColor)return;
  remember();if(erase)delete fills[id];else fills[id]=currentColor;
  setHighlight(0);paintRegions();save();$('#region-select').value=String(id);
  $('#step-status').textContent=erase?`已清除第 ${id} 个区域的颜色。`:`第 ${id} 个区域已上色，可继续选择颜色并点击其他区域。`;
}
function hit(event){const rect=canvas.getBoundingClientRect();return ColoringCore.regionAt(model,(event.clientX-rect.left)/rect.width*W,(event.clientY-rect.top)/rect.height*H);}
canvas.addEventListener('click',event=>{if(ready)fillRegion(hit(event));});
canvas.addEventListener('pointermove',event=>{if(ready&&event.pointerType==='mouse')setHighlight(hit(event));});
canvas.addEventListener('pointerleave',()=>{if(ready)setHighlight(0);});
$('#erase-region').addEventListener('click',()=>{erase=!erase;$('#erase-region').setAttribute('aria-pressed',String(erase));$('#step-status').textContent=erase?'清除模式：点击一个已上色区域即可清除。':'选择颜色后点击闭合区域上色。';});
$('#paint-undo').addEventListener('click',()=>{if(!history.length)return;future.push({...fills});fills=history.pop();setHighlight(0);paintRegions();save();$('#step-status').textContent='已撤销上一次上色。';});
$('#paint-redo').addEventListener('click',()=>{if(!future.length)return;history.push({...fills});fills=future.pop();setHighlight(0);paintRegions();save();$('#step-status').textContent='已恢复上一次上色。';});
$('#reset').addEventListener('click',()=>{if(!ready)return;remember();fills={};erase=false;$('#erase-region').setAttribute('aria-pressed','false');setHighlight(0);paintRegions();save();$('#step-status').textContent='已清空当前画稿的颜色，线稿保留。可撤销恢复。';});
$('#region-select').addEventListener('change',event=>{if(ready)setHighlight(Number(event.target.value));});
$('#fill-region').addEventListener('click',()=>fillRegion(Number($('#region-select').value)));
canvas.addEventListener('keydown',event=>{if(event.key==='Enter'&&ready){event.preventDefault();fillRegion(Number($('#region-select').value));}});
function finish(){
  if(!ready||!Object.keys(fills).length)return;save();setHighlight(0);
  const output=layer(),g=output.getContext('2d');g.drawImage(paper,0,0);g.drawImage(paint,0,0);g.drawImage(ink,0,0);
  const url=output.toDataURL('image/png');$('#saved-preview').src=url;
  const download=$('#download-artwork');download.href=url;download.download=`一版生春-${pattern.name}.png`;
  const result=window.ArtworkStore.save({
    name:pattern.name,patternId:pattern.id,png:url,savedAt:Date.now(),
    editState:{fills:{...fills},currentColor,sourceLength:(window.CARVING_IMAGES?.[pattern.id]||pattern.line).length}
  });
  if(result.ok){location.href='index.html?saved=1';return;}
  $('#save-summary').textContent='浏览器暂时无法保存作品。请先下载 PNG 留存，再点击返回首页。';
  $('#save-dialog').showModal();
}
$('#finish-coloring').addEventListener('click',finish);$('#next').addEventListener('click',finish);
$('#continue-painting').addEventListener('click',()=>$('#save-dialog').close());
function navigate(page){save();location.href=`${page}?pattern=${encodeURIComponent(pattern.id)}`;}
$('#previous').addEventListener('click',()=>navigate('carve.html'));$('#change-pattern').addEventListener('click',()=>navigate('nianhua.html'));
document.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>{const step=Number(button.dataset.step);if(step===0)navigate('nianhua.html');else if(step===1)navigate('carve.html');else if(step===2)showInfo('印墨留形','刻板完成后，当前页面以完整线稿作为印墨结果，供你施彩。');}));
document.querySelectorAll('[data-nav]').forEach(button=>button.addEventListener('click',()=>button.dataset.nav==='习艺坊'?navigate('index.html'):showInfo(button.dataset.nav,'此页面入口尚未接入。')));
$('#credits').addEventListener('click',()=>showInfo('项目与出处','画稿与配色参考采用你提供的素材。闭合区域识别、纸面纹理和施彩效果由网页实现。'));
window.addEventListener('pagehide',save);
makePaper();chooseColor(currentColor,palette[0][0]);render();
const image=new Image();image.onload=()=>{
  try{
    const sample=layer(),g=sample.getContext('2d',{willReadFrequently:true});
    const scale=Math.min((W-80)/image.naturalWidth,(H-45)/image.naturalHeight),dw=image.naturalWidth*scale,dh=image.naturalHeight*scale;
    g.drawImage(image,(W-dw)/2,(H-dh)/2,dw,dh);model=ColoringCore.segmentRegions(g.getImageData(0,0,W,H).data,W,H);
    if(!model.regions.length)throw new Error('这张线稿没有可填色的闭合区域，请检查线条是否闭合。');
    ink.getContext('2d').putImageData(new ImageData(model.ink,W,H),0,0);
    for(const region of model.regions){const option=document.createElement('option');option.value=String(region.id);option.textContent=`区域 ${region.id}`;$('#region-select').append(option);}
    restore();ready=true;chooseColor(currentColor,palette.find(item=>item[1]===currentColor)?.[0]);paintRegions();$('#sheet-message').hidden=true;
    $('#step-status').textContent=`已识别 ${model.regions.length} 个闭合区域。${pattern.lesson.color} 点击闭合区域即可上色。`;
  }catch(error){$('#sheet-message').textContent=location.protocol==='file:'?'无法识别画稿。请运行 prepare-carving-assets.py 更新离线素材，或通过本地服务器打开。':error.message;}
};
image.onerror=()=>$('#sheet-message').textContent=`还没有「${pattern.name}」线稿，请返回选稿或补充素材。`;
image.src=window.CARVING_IMAGES?.[pattern.id]||pattern.line;
