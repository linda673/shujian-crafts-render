(() => {
  'use strict';
  const $=s=>document.querySelector(s),assets=window.SHUJIN_ASSETS,shared=window.ART_ASSETS,flow=window.ShujinFlow;
  const pattern=assets.patterns.find(p=>p.id===new URLSearchParams(location.search).get('pattern'))||assets.patterns.find(p=>p.id==='hibiscus');
  const canvas=$('#silk-canvas'),ctx=canvas.getContext('2d'),W=canvas.width,H=canvas.height;
  const base=document.createElement('canvas'),layer=document.createElement('canvas'),mask=document.createElement('canvas');
  for(const c of [base,layer,mask]){c.width=W;c.height=H;}
  const bc=base.getContext('2d',{willReadFrequently:true}),lc=layer.getContext('2d'),mc=mask.getContext('2d'),preview=$('#stitch-preview').getContext('2d');
  const core=window.ShujinStitchCore,stateKey='shujin:stitch:'+pattern.id;
  let source,model,rgba,ready=false,paused=false,strokes=[],current=null,frame=null,timer=null;
  let settings={method:'flat',length:18,density:2},threads=new Map(),pointer=[W/2,H/2];
  const help=(pattern.lesson?pattern.lesson.stitch+' ':'')+'鼠标沿色稿滑动即可铺出丝线，丝线随原配色与滑动方向变化；触屏请按住滑动。';
  function status(s){$('#step-status').textContent=s;}
  function info(title,body){$('#dialog-title').textContent=title;$('#dialog-body').textContent=body;$('#dialog').showModal();}
  function load(paths){return new Promise((resolve,reject)=>{const next=i=>{if(i>=paths.length){reject(new Error('素材加载失败'));return;}const img=new Image(),path=paths[i];img.onload=()=>resolve({img,index:i});img.onerror=()=>next(i+1);img.src=location.protocol==='file:'&&window.SHUJIN_IMAGES[path]?window.SHUJIN_IMAGES[path]:path;};next(0);});}
  function decorate(img,paths,fallback){load(paths.filter(Boolean)).then(({img:loaded,index})=>{img.src=loaded.src;img.hidden=false;img.parentElement.classList.add('has-image');if(fallback)fallback.hidden=true;if(img.dataset.decoration==='workCornerRight'&&index)img.classList.add('mirror');}).catch(()=>{});}
  decorate($('#logo'),[assets.logo],$('#logo-fallback'));decorate($('#roof'),[shared.roof],$('#roof-fallback'));
  document.querySelectorAll('[data-icon]').forEach(img=>decorate(img,[shared.icons[img.dataset.icon]],img.nextElementSibling));
  document.querySelectorAll('[data-decoration]').forEach(img=>{const k=img.dataset.decoration;decorate(img,[shared.decorations[k],...(k.startsWith('workCorner')?['assets/paper-cutting/examples/corner.svg']:[])],img.parentElement.classList.contains('seal')?img.nextElementSibling:null);});
  assets.backgrounds.forEach((path,i)=>load([path]).then(({img})=>document.body.style.setProperty(i?'--right-bg':'--left-bg',`url("${img.src}")`)).catch(()=>{}));
  document.querySelector('.reference .description').textContent=pattern.lesson?.stitch||'同一画稿，也能呈现不同配色。';
  $('#color-image').alt=pattern.name+'参考效果';$('#color-placeholder code').textContent=pattern.color;decorate($('#color-image'),[pattern.color,pattern.exampleColor],$('#color-placeholder'));
  function persist(){if(!ready)return false;return flow.write(stateKey,{sourceId:source.id,strokes,settings});}
  function finish(){clearTimeout(timer);if(current){if(current.added)strokes.push({settings:current.settings,points:current.points});current=null;persist();}$('#undo').disabled=!strokes.length;}
  function drawThread(t){
    const [r,g,b]=t.rgb,shade=(v,n)=>Math.max(0,Math.min(255,Math.round(v+n)));
    const line=(offset,width,color)=>{lc.beginPath();lc.moveTo(t.a[0],t.a[1]+offset);lc.lineTo(t.b[0],t.b[1]+offset);lc.lineWidth=width;lc.strokeStyle=color;lc.stroke();};
    line(.8,2.1,`rgba(${shade(r,-60)},${shade(g,-60)},${shade(b,-60)},.33)`);
    line(0,1.65,`rgb(${shade(r,-10)},${shade(g,-10)},${shade(b,-10)})`);
    line(-.45,.65,`rgba(${shade(r,45)},${shade(g,45)},${shade(b,45)},.86)`);
  }
  function render(){
    frame=null;if(!ready)return;
    lc.clearRect(0,0,W,H);lc.globalCompositeOperation='source-over';lc.lineCap='round';
    for(const t of threads.values())drawThread(t);
    lc.globalCompositeOperation='destination-in';lc.drawImage(mask,0,0);lc.globalCompositeOperation='source-over';
    ctx.clearRect(0,0,W,H);ctx.drawImage(base,0,0);ctx.drawImage(layer,0,0);
    const sx=Math.max(0,Math.min(W-100,pointer[0]-50)),sy=Math.max(0,Math.min(H-46,pointer[1]-23));
    preview.clearRect(0,0,260,120);preview.imageSmoothingEnabled=true;preview.drawImage(canvas,sx,sy,100,46,0,0,260,120);
    $('#undo').disabled=!strokes.length&&!current?.added;
  }
  function replay(){threads.clear();for(const s of strokes){core.generate(model,rgba,s.points[0],s.settings,-Math.PI/3,threads);for(let i=1;i<s.points.length;i++)core.segment(model,rgba,s.points[i-1],s.points[i],s.settings,threads);}render();}
  function weave(p){
    if(!ready||paused||p[0]<0||p[1]<0||p[0]>=W||p[1]>=H)return;
    pointer=p;
    if(!current){current={settings:{...settings},points:[p],added:core.generate(model,rgba,p,settings,-Math.PI/3,threads)};}
    else {const a=current.points.at(-1);if(Math.hypot(p[0]-a[0],p[1]-a[1])<3)return;current.added+=core.segment(model,rgba,a,p,current.settings,threads);current.points.push(p);}
    if(!frame)frame=requestAnimationFrame(render);clearTimeout(timer);timer=setTimeout(finish,450);
  }
  function position(e){const r=canvas.getBoundingClientRect();return [(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height];}
  function cursor(p){pointer=p;const el=$('#brush-cursor'),width=canvas.getBoundingClientRect().width;el.hidden=paused||!ready;el.style.left=p[0]/W*100+'%';el.style.top=p[1]/H*100+'%';el.style.width=el.style.height=60*width/W+'px';}
  canvas.addEventListener('pointermove',e=>{const p=position(e);cursor(p);if(e.pointerType==='mouse'||e.buttons>0)weave(p);});
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);const p=position(e);cursor(p);weave(p);});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,finish);
  canvas.addEventListener('pointerleave',()=>{finish();$('#brush-cursor').hidden=true;});
  canvas.addEventListener('keydown',e=>{const v={ArrowLeft:[-8,0],ArrowRight:[8,0],ArrowUp:[0,-8],ArrowDown:[0,8]}[e.key];if(v){e.preventDefault();cursor([Math.max(0,Math.min(W-1,pointer[0]+v[0])),Math.max(0,Math.min(H-1,pointer[1]+v[1]))]);}else if(e.code==='Space'||e.key==='Enter'){e.preventDefault();weave(pointer);}else if(e.key==='Escape')$('#pause').click();});
  function controls(){document.querySelectorAll('[data-method]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.method===settings.method)));$('#stitch-length').value=settings.length;$('#length-value').value=settings.length;$('#stitch-density').value=settings.density;$('#density-value').value=['疏朗','适中','细密'][settings.density-1];}
  document.querySelectorAll('[data-method]').forEach(b=>b.onclick=()=>{finish();settings.method=b.dataset.method;controls();persist();status('已选择'+(settings.method==='flat'?'平针':'长短针')+'，继续沿色稿滑动铺针。');});
  $('#stitch-length').oninput=e=>{finish();settings.length=+e.target.value;controls();persist();};$('#stitch-density').oninput=e=>{finish();settings.density=+e.target.value;controls();persist();};
  $('#pause').onclick=()=>{finish();paused=!paused;$('#pause').textContent=paused?'继续织线':'暂停织线';$('#pause').setAttribute('aria-pressed',String(paused));$('#brush-cursor').hidden=true;canvas.style.cursor=paused?'default':'none';status(paused?'已暂停织线。':help);};
  $('#undo').onclick=()=>{finish();strokes.pop();replay();persist();status('已撤销上一段织线。');};
  $('#reset').onclick=()=>{if(!ready)return;finish();strokes=[];replay();persist();status('已清除针迹，保留上一步的色稿。');};
  function back(){finish();if(source?.editState)try{sessionStorage.setItem('shujin:color:'+pattern.id,JSON.stringify(source.editState));}catch{}location.href='shujin-color.html?pattern='+encodeURIComponent(pattern.id);}
  $('#previous').onclick=back;$('#change-pattern').onclick=()=>{finish();location.href='shujin.html?pattern='+encodeURIComponent(pattern.id);};
  document.querySelectorAll('[data-step]').forEach(b=>{if(b.dataset.step==='3')b.setAttribute('aria-current','step');b.onclick=()=>{if(+b.dataset.step<2)back();else status(pattern.lesson?pattern.lesson.stitch:+b.dataset.step===2?'沿花瓣或叶脉方向滑动，丝线会跟随你的针向。':'调整针迹长度与密度，在色稿上逐步铺出丝线光泽。');};});
  function save(){
    if(!ready)return;finish();render();persist();const png=canvas.toDataURL('image/png');
    const result=window.ArtworkStore.save({craft:'shujin',stage:'stitch',name:pattern.name,patternId:pattern.id,png,savedAt:Date.now(),editState:{source,sourceId:source.id,strokes,settings}});
    if(result.ok)location.href='index.html?saved=1';else{info('作品尚未保存','浏览器存储空间不足，请下载当前作品留存。');const link=document.createElement('a');link.href=png;link.download='成都蜀锦-'+pattern.name+'织线.png';link.textContent='下载作品 PNG';$('#dialog-body').append(document.createElement('br'),link);}
  }
  $('#use-pattern').onclick=save;$('#next').onclick=save;$('#next').disabled=true;
  document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{if(b.dataset.nav==='习艺坊'){finish();location.href='index.html';}else info(b.dataset.nav,'此栏目入口已预留，内容待完善。');});
  $('#credits').onclick=()=>info('项目与出处','沿你自己的色稿铺针，模拟丝线的针向、长短与光泽。参考图用于教学示意。');
  window.addEventListener('pagehide',finish);window.addEventListener('blur',finish);
  const validSettings=s=>s&&['flat','long-short'].includes(s.method)&&Number.isFinite(s.length)&&s.length>=8&&s.length<=32&&[1,2,3].includes(s.density);
  const validState=s=>s&&s.sourceId===source.id&&Array.isArray(s.strokes)&&s.strokes.length<20000&&s.strokes.every(v=>validSettings(v.settings)&&Array.isArray(v.points)&&v.points.length>0&&v.points.length<100000&&v.points.every(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&p[0]>=0&&p[0]<W&&p[1]>=0&&p[1]<H));
  async function init(){
    const latest=window.ArtworkStore.latest(),saved=latest?.craft==='shujin'&&latest.stage==='stitch'&&latest.patternId===pattern.id?latest.editState:null;
    source=flow.read('shujin:stitch-source:'+pattern.id)||saved?.source;
    if(!source||(pattern.revision&&source.revision!==pattern.revision)||source.patternId!==pattern.id||!/^data:image\/png;base64,/.test(source.png)){
      $('#loading').textContent='请先完成上色';status('尚未找到色稿，请点击“上一步”返回上色页面。');return;
    }
    const [{img:colored},{img:line,index}]=await Promise.all([load([source.png]),load([pattern.line,pattern.exampleLine])]);
    bc.drawImage(colored,0,0,W,H);rgba=bc.getImageData(0,0,W,H).data;
    const scale=Math.min((W-40)/line.naturalWidth,(H-32)/line.naturalHeight),width=line.naturalWidth*scale,height=line.naturalHeight*scale,x=(W-width)/2,y=(H-height)/2;
    mc.drawImage(line,x,y,width,height);const original=mc.getImageData(0,0,W,H);
    model=window.ShujinDyeCore.protectCutout(window.ShujinDyeCore.completeRegions(window.ShujinPaintCore.model(original.data,W,H)),original.data,pattern.id==='hibiscus'&&index===0&&line.naturalWidth===2200&&line.naturalHeight===1980?{x,y,width,height}:null);
    const clip=mc.createImageData(W,H);for(let i=0;i<model.labels.length;i++)clip.data[i*4+3]=model.labels[i]>0&&model.ink[i*4+3]<=100?255:0;mc.clearRect(0,0,W,H);mc.putImageData(clip,0,0);
    const stored=flow.read(stateKey),restored=validState(stored)?stored:validState(saved)?saved:null;
    if(restored){strokes=restored.strokes;if(validSettings(restored.settings))settings=restored.settings;}
    ready=true;controls();replay();$('#loading').hidden=true;$('#use-pattern').disabled=false;$('#next').disabled=false;$('#selection-status').textContent=pattern.name+' · 沿用你的上色稿';status(help);
  }
  init().catch(()=>{status('色稿加载失败，请返回上一步重新点击“完成上色”。');$('#loading').textContent='色稿暂时无法加载';});
})();
