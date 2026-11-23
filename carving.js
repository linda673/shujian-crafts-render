'use strict';
const $ = selector => document.querySelector(selector);
const assets = window.ART_ASSETS;
const requested = new URLSearchParams(location.search).get('pattern');
const pattern = assets.patterns.find(item => item.id === requested) || assets.patterns[0];
const W=1000,H=700;
const canvas=$('#carving-board'),ctx=canvas.getContext('2d');
const shell=$('#board-shell'),cursor=$('#chisel-cursor');
const tools={flat:{name:'平刀',radius:18,help:'适合长线与较宽的纹样'},round:{name:'圆刀',radius:26,help:'适合花瓣、叶片等弧线'},slant:{name:'斜刀',radius:10,help:pattern.lesson.detail}};
let ready=false,activeTool=null,coverage,strokes=[],currentStroke=null,lastPoint=null,finished=false;
let drawPending=false,saveTimer,chipTime=0,keyboardPoint={x:W/2,y:H/2};
document.querySelector('.reference .description').textContent=pattern.lesson.carve;
const storageKey=`yibanshengchun:carving:v1:${pattern.id}`;
function layer(){const c=document.createElement('canvas');c.width=W;c.height=H;return c;}
const wood=layer(),mask=layer(),relief=layer(),reveal=layer(),revealedRelief=layer();
const revealCtx=reveal.getContext('2d');
function loadAsset(img,path,fallback) {
  img.onload=()=>{img.hidden=false;img.parentElement.classList.add('has-image');if(fallback)fallback.hidden=true;};
  img.onerror=()=>{img.hidden=true;img.parentElement.classList.remove('has-image');if(fallback)fallback.hidden=false;};
  img.src=path;
}
loadAsset($('#logo'),assets.logo,$('#logo-fallback'));
loadAsset($('#roof'),assets.roof,$('#roof-fallback'));
document.querySelectorAll('[data-icon]').forEach(img=>loadAsset(img,assets.icons[img.dataset.icon],img.nextElementSibling));
document.querySelectorAll('[data-decoration]').forEach(img=>loadAsset(img,assets.decorations[img.dataset.decoration],img.parentElement.classList.contains('seal')?img.nextElementSibling:null));
const bg=new Image();bg.onload=()=>document.body.style.backgroundImage=`url("${assets.background}")`;bg.src=assets.background;
loadAsset($('#color-image'),pattern.color,$('#color-placeholder'));
$('#color-image').alt=`${pattern.name}彩色参考图`;$('#color-placeholder code').textContent=pattern.color;
$('#pattern-name').textContent=`${pattern.name} · 刻线成形`;
document.querySelector('[data-step="1"]').setAttribute('aria-current','step');
function showInfo(title,body){$('#dialog-title').textContent=title;$('#dialog-body').textContent=body;$('#dialog').showModal();}
function backToPatterns(){endStroke();save();location.href=`nianhua.html?pattern=${encodeURIComponent(pattern.id)}`;}
function makeWood(){
  const c=wood.getContext('2d');
  const gradient=c.createLinearGradient(0,0,W,H);gradient.addColorStop(0,'#f4d7ae');gradient.addColorStop(.45,'#e8bb86');gradient.addColorStop(1,'#efc897');c.fillStyle=gradient;c.fillRect(0,0,W,H);
  let seed=821;function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
  for(let i=0;i<450;i++){
    const y=random()*H,amp=2+random()*12,phase=random()*6.28;
    c.beginPath();for(let x=-10;x<=W+10;x+=10){const yy=y+Math.sin(x/120+phase)*amp+Math.sin(x/360+phase)*5;x===-10?c.moveTo(x,yy):c.lineTo(x,yy);}
    c.lineWidth=.3+random()*1.7;c.strokeStyle=i%4===0?'rgba(255,241,206,.32)':`rgba(151,94,45,${.025+random()*.065})`;c.stroke();
  }
  c.strokeStyle='#fff0d280';c.lineWidth=4;c.strokeRect(2,2,W-4,H-4);
}
function tint(source,color){const c=layer(),g=c.getContext('2d');g.fillStyle=color;g.fillRect(0,0,W,H);g.globalCompositeOperation='destination-in';g.drawImage(source,0,0);return c;}
function makePattern(image){
  const scratch=layer(),g=scratch.getContext('2d',{willReadFrequently:true});
  const scale=Math.min((W-110)/image.naturalWidth,(H-65)/image.naturalHeight);
  const dw=image.naturalWidth*scale,dh=image.naturalHeight*scale;g.drawImage(image,(W-dw)/2,(H-dh)/2,dw,dh);
  const pixels=g.getImageData(0,0,W,H),output=g.createImageData(W,H),binary=new Uint8Array(W*H);
  for(let i=0;i<W*H;i++){
    const k=i*4,lum=pixels.data[k]*.2126+pixels.data[k+1]*.7152+pixels.data[k+2]*.0722;
    const alpha=Math.min(255,Math.max(0,(205-lum)*4))*pixels.data[k+3]/255;
    output.data[k+3]=alpha;binary[i]=alpha>70?1:0;
  }
  mask.getContext('2d').putImageData(output,0,0);coverage=new CarvingCoverage(binary,W,H);
  if(!coverage.total)throw new Error('画稿没有可识别的深色线条。');
  const r=relief.getContext('2d');
  r.shadowColor='#714019';r.shadowBlur=3;r.shadowOffsetX=2;r.shadowOffsetY=3;r.drawImage(tint(mask,'#9b5b28'),1,2);
  r.shadowColor='transparent';r.shadowBlur=0;r.shadowOffsetX=0;r.shadowOffsetY=0;
  r.drawImage(tint(mask,'#fff0c9'),-2,-2);
  r.drawImage(tint(mask,'#9d5a24'),0,1);
  r.globalAlpha=.5;r.drawImage(tint(mask,'#e7b574'),0,0);r.globalAlpha=1;
}
const guide=layer();
function render(){
  drawPending=false;ctx.clearRect(0,0,W,H);ctx.drawImage(wood,0,0);ctx.drawImage(guide,0,0);
  const r=revealedRelief.getContext('2d');r.clearRect(0,0,W,H);r.globalCompositeOperation='source-over';r.drawImage(relief,0,0);r.globalCompositeOperation='destination-in';r.drawImage(reveal,0,0);r.globalCompositeOperation='source-over';ctx.drawImage(revealedRelief,0,0);
  const value=coverage?coverage.percent:0;
  $('#carving-progress').value=value;$('#progress-label').textContent=`${value.toFixed(1)}%`;
  $('#finish-carving').disabled=!coverage?.count;$('#next').disabled=!coverage?.count;$('#undo').disabled=!strokes.length;
}
function queueRender(){if(!drawPending){drawPending=true;requestAnimationFrame(render);}}
function drawSegment(a,b,radius){
  revealCtx.strokeStyle='#fff';revealCtx.fillStyle='#fff';revealCtx.lineWidth=radius*2;revealCtx.lineCap='round';revealCtx.lineJoin='round';
  revealCtx.beginPath();revealCtx.moveTo(a.x,a.y);revealCtx.lineTo(b.x,b.y);revealCtx.stroke();
  revealCtx.beginPath();revealCtx.arc(b.x,b.y,radius,0,Math.PI*2);revealCtx.fill();coverage.segment(a,b,radius);
}
function replay(){
  revealCtx.clearRect(0,0,W,H);coverage.clear();
  for(const stroke of strokes){let prior=stroke.points[0];for(const point of stroke.points){drawSegment(prior,point,stroke.radius);prior=point;}}
  render();
}
function save(){
  clearTimeout(saveTimer);
  if(!ready)return;
  try{sessionStorage.setItem(storageKey,JSON.stringify({strokes,finished,sourceLength:(window.CARVING_IMAGES?.[pattern.id]||pattern.line).length}));}
  catch{ $('#step-status').textContent='本次刻痕仍在页面中；浏览器未能保存，刷新后可能丢失。'; }
}
function restore(){
  try{
    const saved=JSON.parse(sessionStorage.getItem(storageKey)||'null');
    if(!saved||saved.sourceLength!==(window.CARVING_IMAGES?.[pattern.id]||pattern.line).length)return;
    if(!Array.isArray(saved.strokes)||saved.strokes.length>10000)return;
    strokes=saved.strokes.filter(s=>[10,18,26].includes(s.radius)&&Array.isArray(s.points)&&s.points.length>0&&s.points.length<=50000&&s.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=W&&p.y>=0&&p.y<=H));
    finished=!!saved.finished;replay();
  }catch{strokes=[];}
}
function endStroke(){currentStroke=null;lastPoint=null;if(ready)save();}
function chooseTool(key){
  endStroke();activeTool=key;finished=false;
  document.querySelectorAll('.tool-choice').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.tool===key)));
  shell.classList.add('armed');cursor.dataset.tool=key;
  $('#tool-help').textContent=`${tools[key].name} · ${tools[key].help}。沿线移动即可刻下；触屏按住拖动。`;
  $('#step-status').textContent=pattern.lesson.carve+' 按 Escape 收刀。';
}
function showCursor(point){cursor.hidden=false;cursor.style.left=`${point.x/W*100}%`;cursor.style.top=`${point.y/H*100}%`;}
function chip(point){
  const now=performance.now();if(now-chipTime<70)return;chipTime=now;
  const node=document.createElement('span');node.className='wood-chip';node.style.left=`${point.x/W*100}%`;node.style.top=`${point.y/H*100}%`;node.style.setProperty('--dx',`${-10+Math.random()*25}px`);node.style.setProperty('--dy',`${10+Math.random()*20}px`);shell.append(node);setTimeout(()=>node.remove(),550);
}
function carve(point){
  if(!ready||!activeTool||finished)return;
  showCursor(point);keyboardPoint=point;
  if(lastPoint&&Math.hypot(point.x-lastPoint.x,point.y-lastPoint.y)<2)return;
  if(!currentStroke){currentStroke={radius:tools[activeTool].radius,points:[]};strokes.push(currentStroke);}
  const before=coverage.count;drawSegment(lastPoint||point,point,currentStroke.radius);currentStroke.points.push(point);lastPoint=point;
  if(coverage.count>before)chip(point);
  queueRender();clearTimeout(saveTimer);saveTimer=setTimeout(save,400);
}
function pointFromEvent(event){const rect=canvas.getBoundingClientRect();return{x:Math.max(0,Math.min(W,(event.clientX-rect.left)/rect.width*W)),y:Math.max(0,Math.min(H,(event.clientY-rect.top)/rect.height*H))};}
canvas.addEventListener('pointermove',event=>{
  if(event.pointerType!=='mouse'&&event.buttons===0)return;
  carve(pointFromEvent(event));
});
canvas.addEventListener('pointerdown',event=>{
  if(!activeTool||!ready)return;event.preventDefault();canvas.focus({preventScroll:true});canvas.setPointerCapture(event.pointerId);carve(pointFromEvent(event));
});
canvas.addEventListener('pointerup',event=>{if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);endStroke();});
canvas.addEventListener('pointercancel',()=>{endStroke();cursor.hidden=true;});
canvas.addEventListener('pointerleave',()=>{endStroke();cursor.hidden=true;});
function putDownTool(){endStroke();activeTool=null;shell.classList.remove('armed');cursor.hidden=true;document.querySelectorAll('.tool-choice').forEach(b=>b.setAttribute('aria-pressed','false'));$('#step-status').textContent='已收刀。选择刻刀即可继续。';}
canvas.addEventListener('keydown',event=>{
  if(!ready||!activeTool)return;
  const delta={ArrowLeft:[-8,0],ArrowRight:[8,0],ArrowUp:[0,-8],ArrowDown:[0,8]}[event.key];
  if(delta){event.preventDefault();keyboardPoint={x:Math.max(0,Math.min(W,keyboardPoint.x+delta[0])),y:Math.max(0,Math.min(H,keyboardPoint.y+delta[1]))};showCursor(keyboardPoint);}
  if(event.code==='Space'){event.preventDefault();carve(keyboardPoint);endStroke();}
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')putDownTool();});
document.querySelectorAll('.tool-choice').forEach(button=>button.addEventListener('click',()=>chooseTool(button.dataset.tool)));
$('#undo').addEventListener('click',()=>{endStroke();strokes.pop();finished=false;replay();save();$('#step-status').textContent='已撤销上一笔刻痕。';});
$('#reset').addEventListener('click',()=>{endStroke();strokes=[];finished=false;replay();putDownTool();save();$('#step-status').textContent='木板已重置，请重新选择刻刀。';});
function finish(){
  if(!ready||!coverage.count)return;endStroke();finished=true;putDownTool();save();
  location.href=`color.html?pattern=${encodeURIComponent(pattern.id)}`;
}
$('#finish-carving').addEventListener('click',finish);$('#next').addEventListener('click',finish);
$('#previous').addEventListener('click',backToPatterns);$('#change-pattern').addEventListener('click',backToPatterns);
document.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>{const step=Number(button.dataset.step);if(step===0)backToPatterns();else if(step>1){if(coverage?.count)finish();else showInfo('先刻下第一笔','选择刻刀并沿图案移动，留下刻痕后即可进入施彩页面。');}}));
document.querySelectorAll('[data-nav]').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.nav==='习艺坊'){endStroke();save();location.href='index.html';}else showInfo(button.dataset.nav,'此页面入口尚未接入。');}));
$('#credits').addEventListener('click',()=>showInfo('项目与出处','花鸟画稿与配色采用你提供的素材。木纹、刻刀与刻痕由网页实时绘制。'));
window.addEventListener('pagehide',save);
makeWood();render();
const lineImage=new Image();
lineImage.onload=()=>{
  try{
    makePattern(lineImage);const g=guide.getContext('2d');g.globalAlpha=.48;g.drawImage(tint(mask,'#66543d'),0,0);
    ready=true;restore();render();$('#board-message').hidden=true;
    document.querySelectorAll('.tool-choice').forEach(button=>button.disabled=false);
    $('#step-status').textContent=strokes.length?'已恢复这幅画稿的刻痕。选择刻刀继续。':pattern.lesson.carve+' 请在左侧选择刻刀。';
  }catch(error){$('#board-message').textContent=location.protocol==='file:'?'这幅画稿需要更新离线素材包，请运行 prepare-carving-assets.py，或通过本地服务器打开页面。':`无法读取画稿：${error.message}`;}
};
lineImage.onerror=()=>{$('#board-message').textContent=`还没有「${pattern.name}」线稿，请返回选稿或补充对应素材。`;};
lineImage.src=window.CARVING_IMAGES?.[pattern.id]||pattern.line;
