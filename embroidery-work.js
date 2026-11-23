(() => {
 'use strict';
 const $=s=>document.querySelector(s),assets=window.EMBROIDERY_ASSETS,shared=window.ART_ASSETS,core=window.EmbroideryStitchCore;
 const query=new URLSearchParams(location.search),pattern=assets.patterns.find(p=>p.id===query.get('pattern'))||assets.patterns[0];
 const colors=[['桃粉','#edaaa1'],['胭脂','#cc6e79'],['米金','#ddbd78'],['竹青','#73986a'],['石绿','#53a18b'],['墨绿','#3c6657']];
 const canvas=$('#embroidery-canvas'),ctx=canvas.getContext('2d'),W=canvas.width,H=canvas.height,key='embroidery:stitch:'+pattern.id;
 const base=document.createElement('canvas'),layer=document.createElement('canvas'),mask=document.createElement('canvas');
 for(const c of [base,layer,mask]){c.width=W;c.height=H;}
 const bc=base.getContext('2d',{willReadFrequently:true}),lc=layer.getContext('2d'),mc=mask.getContext('2d');
 let model,sourceId,ready=false,review=false,strokes=[],active=null,threads=new Map(),pointer=[W/2,H/2],frame=null;
 let settings={color:Math.max(0,Math.min(5,Number(query.get('color'))||0)),method:'flat',length:18};
 const help=pattern.help||'选择丝线，在花瓣或叶片内按住拖动铺针；一笔只绣当前区域。';
 function status(text){$('#step-status').textContent=text;}
 function info(title,text){$('#dialog-title').textContent=title;$('#dialog-body').textContent=text;$('#dialog').showModal();}
 function load(paths){return new Promise((resolve,reject)=>{const next=i=>{if(i>=paths.length){reject(new Error('未找到素材'));return;}const path=paths[i],img=new Image();img.onload=()=>resolve(img);img.onerror=()=>next(i+1);img.src=location.protocol==='file:'&&window.EMBROIDERY_IMAGES[path]?window.EMBROIDERY_IMAGES[path]:path;};next(0);});}
 function decorate(img,paths,fallback){load(paths.filter(Boolean)).then(loaded=>{img.src=loaded.src;img.hidden=false;img.parentElement.classList.add('has-image');if(fallback)fallback.hidden=true;if(img.dataset.decoration==='workCornerRight'&&loaded.src.endsWith('/corner.svg'))img.classList.add('mirror');}).catch(()=>{});}
 decorate($('#logo'),[assets.logo],$('#logo-fallback'));decorate($('#roof'),[shared.roof],$('#roof-fallback'));
 document.querySelectorAll('[data-icon]').forEach(img=>decorate(img,[shared.icons[img.dataset.icon]],img.nextElementSibling));
 document.querySelectorAll('[data-decoration]').forEach(img=>{const k=img.dataset.decoration;decorate(img,[assets.decorations[k],shared.decorations[k],...(k.startsWith('workCorner')?['assets/paper-cutting/examples/corner.svg']:[])],img.parentElement.classList.contains('seal')?img.nextElementSibling:null);});
 assets.backgrounds.forEach((path,i)=>load([path]).then(img=>document.body.style.setProperty(i?'--right-bg':'--left-bg',`url("${img.src}")`)).catch(()=>{}));
 if(pattern.guide){$('.reference .description').textContent=pattern.guide;$('.stitch-help').textContent=help;}
 $('#color-image').alt=pattern.name+'参考效果';$('#color-placeholder code').textContent=pattern.color;decorate($('#color-image'),[pattern.color,pattern.exampleColor],$('#color-placeholder'));
 function persist(){if(!ready)return;const value=JSON.stringify({sourceId,strokes,settings,updatedAt:Date.now()});try{sessionStorage.setItem(key,value);}catch{try{localStorage.setItem(key,value);}catch{status('当前可继续刺绣，离开前请完成并保存。');}}}
 function read(){let values=[];for(const storage of [sessionStorage,localStorage])try{const s=JSON.parse(storage.getItem(key));if(s)values.push(s);}catch{}return values.sort((a,b)=>b.updatedAt-a.updatedAt)[0];}
 function finish(){if(active){if(active.threads.size)strokes.push({settings:active.settings,region:active.region,points:active.points});active=null;persist();}$('#undo').disabled=!strokes.length;}
 function drawThread(t){
  const hex=colors[t.color][1],rgb=[1,3,5].map(n=>parseInt(hex.slice(n,n+2),16)),shade=d=>'rgb('+rgb.map(v=>Math.max(0,Math.min(255,v+d))).join(',')+')';
  const line=(offset,width,color)=>{lc.beginPath();lc.moveTo(t.a[0],t.a[1]+offset);lc.lineTo(t.b[0],t.b[1]+offset);lc.lineWidth=width;lc.strokeStyle=color;lc.stroke();};
  line(.7,2.4,shade(-43));line(0,1.9,hex);line(-.5,.7,shade(42));
 }
 function render(){frame=null;if(!ready)return;lc.clearRect(0,0,W,H);lc.lineCap='round';lc.globalCompositeOperation='source-over';for(const t of threads.values())drawThread(t);lc.globalCompositeOperation='destination-in';lc.drawImage(mask,0,0);lc.globalCompositeOperation='source-over';ctx.clearRect(0,0,W,H);ctx.drawImage(base,0,0);ctx.drawImage(layer,0,0);$('#undo').disabled=!strokes.length&&!active?.threads.size;}
 function requestRender(){if(!frame)frame=requestAnimationFrame(render);}
 function replay(){threads.clear();for(const s of strokes){const part=new Map();core.stitchAt(model,s.points[0],s.settings,s.region,-Math.PI/3,part);for(let i=1;i<s.points.length;i++)core.segment(model,s.points[i-1],s.points[i],s.settings,s.region,part);for(const [k,t] of part)threads.set(k,t);}render();}
 function start(p){
  if(!ready||review)return;finish();const region=window.ColoringCore.regionAt(model,...p);
  if(!region){status('请在轮廓围住的'+(pattern.area||'花瓣或叶片')+'内部落针。');return;}
  active={settings:{...settings},region,points:[p],threads:new Map()};core.stitchAt(model,p,active.settings,region,-Math.PI/3,active.threads);for(const [k,t] of active.threads)threads.set(k,t);requestRender();status(help);
 }
 function move(p){if(!active)return;const a=active.points.at(-1);if(Math.hypot(p[0]-a[0],p[1]-a[1])<2)return;core.segment(model,a,p,active.settings,active.region,active.threads);active.points.push(p);for(const [k,t] of active.threads)threads.set(k,t);requestRender();}
 function position(e){const r=canvas.getBoundingClientRect();return [Math.max(0,Math.min(W-1,(e.clientX-r.left)*W/r.width)),Math.max(0,Math.min(H-1,(e.clientY-r.top)*H/r.height))];}
 function cursor(p){pointer=p;const el=$('#needle-cursor');el.hidden=!ready||review;el.style.left=p[0]/W*100+'%';el.style.top=p[1]/H*100+'%';}
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);const p=position(e);cursor(p);start(p);});
 canvas.addEventListener('pointermove',e=>{const p=position(e);cursor(p);if(e.buttons>0)move(p);});
 for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,finish);
 canvas.addEventListener('pointerleave',()=>{$('#needle-cursor').hidden=true;});
 canvas.addEventListener('keydown',e=>{const delta={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[e.key];if(delta){e.preventDefault();cursor([Math.max(0,Math.min(W-1,pointer[0]+delta[0])),Math.max(0,Math.min(H-1,pointer[1]+delta[1]))]);}else if(e.code==='Space'||e.key==='Enter'){e.preventDefault();start(pointer);finish();}else if(e.key==='Escape'){finish();setReview(!review);}});
 function controls(){document.querySelectorAll('[data-color]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.color===settings.color)));document.querySelectorAll('[data-method]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.method===settings.method)));$('#thread-color-label').textContent='丝线 · '+colors[settings.color][0];$('#stitch-length').value=settings.length;$('#length-value').value=settings.length;}
 colors.forEach(([name,hex],i)=>{const b=document.createElement('button');b.className='swatch';b.dataset.color=i;b.style.setProperty('--swatch',hex);b.setAttribute('aria-label',name+'丝线');b.onclick=()=>{finish();settings.color=i;controls();setReview(false);persist();};$('#thread-colors').append(b);});
 document.querySelectorAll('[data-method]').forEach(b=>b.onclick=()=>{finish();settings.method=b.dataset.method;controls();setReview(false);persist();});
 $('#stitch-length').oninput=e=>{finish();settings.length=+e.target.value;controls();persist();};
 function setReview(value){finish();review=value;$('#review').textContent=review?'继续运针':'查看作品';$('#needle-cursor').hidden=true;document.querySelectorAll('[data-step]').forEach(b=>{if(+b.dataset.step===(review?3:2))b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});status(review?'可以查看作品，满意后点击“完成并保存”，或继续运针细化。':help);}
 $('#review').onclick=()=>setReview(!review);$('#next').onclick=()=>setReview(!review);
 $('#undo').onclick=()=>{finish();strokes.pop();replay();persist();status('已撤销上一笔绣线。');};
 $('#reset').onclick=()=>{if(!ready)return;finish();strokes=[];replay();persist();setReview(false);status('已清除绣线，可以重新开始。');};
 function back(){finish();location.href='embroidery.html?pattern='+encodeURIComponent(pattern.id);}
 $('#previous').onclick=back;$('#change-pattern').onclick=back;
 document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{if(+b.dataset.step===0)back();else{setReview(+b.dataset.step===3);if(+b.dataset.step===1)$('#thread-colors button').focus();}});
 $('#use-pattern').onclick=()=>{if(!ready)return;finish();render();persist();const png=canvas.toDataURL('image/png');const result=window.ArtworkStore.save({craft:'embroidery',stage:'stitch',name:pattern.name,patternId:pattern.id,png,savedAt:Date.now(),editState:{sourceId,strokes,settings}});if(result.ok)location.href='index.html?saved=1';else{info('作品尚未保存','浏览器存储空间不足，请先下载作品留存。');const a=document.createElement('a');a.href=png;a.download='麻柳刺绣-'+pattern.name+'.png';a.textContent='下载作品 PNG';$('#dialog-body').append(document.createElement('br'),a);}};
 document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{if(b.dataset.nav==='习艺坊'){finish();location.href='index.html';}else info(b.dataset.nav,'此栏目入口已预留，内容待完善。');});
 $('#credits').onclick=()=>info('项目与出处','麻柳刺绣数字体验：使用提供的纹样素材，在布面上模拟平针、长短针的针向、色彩与丝线光泽。');
 window.addEventListener('pagehide',finish);window.addEventListener('blur',finish);
 const validSettings=s=>s&&Number.isInteger(s.color)&&s.color>=0&&s.color<colors.length&&['flat','long-short'].includes(s.method)&&Number.isFinite(s.length)&&s.length>=8&&s.length<=32;
 function valid(s){return s&&s.sourceId===sourceId&&validSettings(s.settings)&&Array.isArray(s.strokes)&&s.strokes.length<20000&&s.strokes.every(t=>validSettings(t.settings)&&Number.isInteger(t.region)&&t.region>0&&t.region<=model.regions.length&&Array.isArray(t.points)&&t.points.length>0&&t.points.length<100000&&t.points.every(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&p[0]>=0&&p[0]<W&&p[1]>=0&&p[1]<H));}
 async function init(){
  const line=await load([pattern.line,pattern.exampleLine]);
  const ratio=Math.min(W/line.naturalWidth,H/line.naturalHeight),w=line.naturalWidth*ratio,h=line.naturalHeight*ratio;
  mc.drawImage(line,(W-w)/2,(H-h)/2,w,h);const original=mc.getImageData(0,0,W,H);
  model=window.ColoringCore.segmentRegions(original.data,W,H);let hash=2166136261;for(let i=0;i<original.data.length;i+=17)hash=Math.imul(hash^original.data[i],16777619);sourceId=(hash>>>0).toString(16);
  const clip=mc.createImageData(W,H);for(let i=0;i<model.labels.length;i++)clip.data[i*4+3]=model.labels[i]>0&&model.ink[i*4+3]<60?255:0;mc.clearRect(0,0,W,H);mc.putImageData(clip,0,0);
  bc.fillStyle='#faf7e9';bc.fillRect(0,0,W,H);bc.fillStyle='#b9ad8d18';for(let i=0;i<W;i+=4){bc.fillRect(i,0,1,H);bc.fillRect(0,i,W,1);}
  try{const fabric=await load([assets.fabric]);bc.drawImage(fabric,0,0,W,H);$('.paper').style.setProperty('--fabric',`url("${fabric.src}")`);}catch{}
  bc.drawImage(line,(W-w)/2,(H-h)/2,w,h);
  const latest=window.ArtworkStore.latest(),saved=latest?.craft==='embroidery'&&latest.stage==='stitch'&&latest.patternId===pattern.id?latest.editState:null,stored=read(),restored=valid(stored)?stored:valid(saved)?saved:null;
  if(restored){strokes=restored.strokes;settings=restored.settings;}
  ready=true;controls();replay();setReview(false);$('#loading').hidden=true;$('#use-pattern').disabled=false;$('#selection-status').textContent=pattern.name+' · 布面运针';
  if(!model.regions.length)status('当前线稿没有可识别的闭合区域，请换一稿或补齐轮廓后重试。');
 }
 init().catch(()=>{$('#loading').textContent='绣布加载失败，请返回重新选稿。';status('如以本地文件打开，请先运行 prepare-embroidery-assets.py 更新素材包。');});
})();
