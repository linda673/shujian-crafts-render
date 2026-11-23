(() => {
  'use strict';
  const $=s=>document.querySelector(s),assets=window.SHUJIN_ASSETS,shared=window.ART_ASSETS;
  const pattern=assets.patterns.find(p=>p.id===new URLSearchParams(location.search).get('pattern'))||assets.patterns.find(p=>p.id==='hibiscus');
  const groups=pattern.lesson?.groups||[['花瓣丝线',[['浅色','#fac8c7'],['中色','#f7958c'],['深色','#e77585']]],['叶片丝线',[['浅色','#a3c598'],['中色','#629370'],['深色','#3c6657']]],['花蕊丝线',[['金色','#e8b844']]]];
  const colors=groups.flatMap(([group,items])=>items.map(([name,hex])=>({name:group+' · '+name,hex,rgb:hex.match(/\w\w/g).map(v=>parseInt(v,16))})));
  const canvas=$('#silk-canvas'),ctx=canvas.getContext('2d'),W=canvas.width,H=canvas.height,core=window.ShujinPaintCore,dye=window.ShujinDyeCore;
  const base=document.createElement('canvas'),pigment=document.createElement('canvas');base.width=pigment.width=W;base.height=pigment.height=H;
  const baseCtx=base.getContext('2d',{willReadFrequently:true}),pigmentCtx=pigment.getContext('2d');
  const key='shujin:color:'+pattern.id;
  let model,paint,signature,strokes=[],current=null,color=0,radius=28,paused=false,ready=false,frame,localStroke;
  let dragging=false;
  let dyeSize=75, cursorPoint=null;
  const help=(pattern.lesson?pattern.lesson.color+" ":"")+"按住鼠标局部晕染：中心浓、边缘淡；松开后再次涂染可加深，每一笔限制在起笔区域内。";
  let keyboard={x:W/2,y:H/2};
  function status(text){$('#step-status').textContent=text;}
  function imageAt(paths){return new Promise((resolve,reject)=>{
    const next=i=>{if(i>=paths.length){reject(new Error('图片加载失败'));return;}
      const image=new Image(),path=paths[i];image.onload=()=>resolve({image,index:i});image.onerror=()=>next(i+1);
      image.src=location.protocol==='file:'&&window.SHUJIN_IMAGES[path]?window.SHUJIN_IMAGES[path]:path;
    };next(0);
  });}
  function decorative(img,paths,fallback){imageAt(paths.filter(Boolean)).then(({image,index})=>{img.src=image.src;img.hidden=false;img.parentElement.classList.add('has-image');if(fallback)fallback.hidden=true;if(img.dataset.decoration==='workCornerRight'&&index)img.classList.add('mirror');}).catch(()=>{});}
  decorative($('#logo'),[assets.logo],$('#logo-fallback'));decorative($('#roof'),[shared.roof],$('#roof-fallback'));
  document.querySelectorAll('[data-icon]').forEach(img=>decorative(img,[shared.icons[img.dataset.icon]],img.nextElementSibling));
  document.querySelectorAll('[data-decoration]').forEach(img=>{const k=img.dataset.decoration;decorative(img,[shared.decorations[k],...(k.startsWith('workCorner')?['assets/paper-cutting/examples/corner.svg']:[])],img.parentElement.classList.contains('seal')?img.nextElementSibling:null);});
  assets.backgrounds.forEach((path,i)=>imageAt([path]).then(({image})=>document.body.style.setProperty(i?'--right-bg':'--left-bg',`url("${image.src}")`)).catch(()=>{}));
  document.querySelector('.reference .description').textContent=pattern.lesson?.color||'同一画稿，也能呈现不同配色。';
  $('#color-image').alt=pattern.name+'参考配色';$('#color-placeholder code').textContent=pattern.color;
  decorative($('#color-image'),[pattern.color,pattern.exampleColor],$('#color-placeholder'));
  let n=0;
  groups.forEach(([title,items])=>{
    const row=document.createElement('div');row.className='silk-row';const label=document.createElement('span');label.textContent=title;row.append(label);
    items.forEach(([name,hex])=>{const i=n++,b=document.createElement('button');b.className='silk-color';b.style.setProperty('--color',hex);b.setAttribute('aria-label',colors[i].name);b.innerHTML='<i aria-hidden="true"></i><span></span>';b.lastElementChild.textContent=name;b.onclick=()=>{finishStroke();setColor(i);persist();};row.append(b);});$('#silk-palette').append(row);
  });
  function setColor(i){color=i;document.querySelectorAll('.silk-color').forEach((b,j)=>b.setAttribute('aria-pressed',String(j===i)));$('#color-label').textContent=colors[i].name;$('#brush-cursor').style.borderColor=colors[i].hex;}
  function render(){frame=null;pigmentCtx.putImageData(paint,0,0);ctx.globalCompositeOperation='source-over';ctx.fillStyle='#fcfaf4';ctx.fillRect(0,0,W,H);ctx.drawImage(base,0,0);ctx.globalCompositeOperation='multiply';ctx.drawImage(pigment,0,0);ctx.globalCompositeOperation='source-over';$('#undo').disabled=!strokes.length&&!current;}
  
  function editState(){return {signature,strokes,color,radius,dyeSize};}
  function persist(){if(!ready)return;try{sessionStorage.setItem(key,JSON.stringify(editState()));}catch{status('临时存储空间不足，请释放浏览器存储空间后继续。');}}
  function finishStroke(){
    if(current){strokes.push(current);current=null;localStroke=null;render();persist();}
    $('#undo').disabled=!strokes.length;
  }
  function replay(){
    paint.data.fill(0);
    for(const s of strokes){
      const rgb=colors[s.color].rgb;
      if(s.type==='local-dye'){
        const wet=dye.beginLocal(paint.data,model,s.points[0],rgb,s.radius,s.size ?? 75);
        if(wet){dye.localDab(paint.data,model,wet,s.points[0]);for(let i=1;i<s.points.length;i++)dye.localSegment(paint.data,model,wet,s.points[i-1],s.points[i]);}
      }else if(s.type==='dye'){
        const plan=dye.prepare(paint.data,model,s.points[0],rgb,s.radius);if(plan)dye.apply(paint.data,plan,1);
      }else{
        core.dab(paint.data,model,s.points[0][0],s.points[0][1],s.radius,rgb);
        for(let i=1;i<s.points.length;i++)core.segment(paint.data,model,{x:s.points[i-1][0],y:s.points[i-1][1]},{x:s.points[i][0],y:s.points[i][1]},s.radius,rgb);
      }
    }
    render();
  }
  function validState(s){return s&&s.signature===signature&&Array.isArray(s.strokes)&&s.strokes.length<20000&&s.strokes.every(t=>Number.isInteger(t.color)&&!!colors[t.color]&&Number.isFinite(t.radius)&&t.radius>=8&&t.radius<=60&&(t.size===undefined||(Number.isFinite(t.size)&&t.size>=20&&t.size<=120))&&Array.isArray(t.points)&&t.points.length>0&&t.points.length<100000&&t.points.every(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&p[0]>=0&&p[0]<=W&&p[1]>=0&&p[1]<=H));}
  function immerse(p,once=false){
    if(!ready||paused||p.x<0||p.y<0||p.x>=W||p.y>=H)return;
    if(once)finishStroke();
    const point=[p.x,p.y];
    if(!current){
      localStroke=dye.beginLocal(paint.data,model,point,colors[color].rgb,radius,dyeSize);
      if(!localStroke){if(once)status('请在'+(pattern.lesson?.parts||'花瓣、叶片或花蕊')+'内部落笔。');return;}
      current={type:'local-dye',color,radius,size:dyeSize,points:[point]};dye.localDab(paint.data,model,localStroke,point);
    }else{
      const last=current.points.at(-1);if(Math.hypot(p.x-last[0],p.y-last[1])<2)return;
      dye.localSegment(paint.data,model,localStroke,last,point);current.points.push(point);
    }
    if(!frame)frame=requestAnimationFrame(render);
    status('局部晕染中：轻扫形成柔和渐变；松开后叠染可加深，换一个区域请重新落笔。');
  }
  function point(event){const r=canvas.getBoundingClientRect();return {x:(event.clientX-r.left)*W/r.width,y:(event.clientY-r.top)*H/r.height};}
  function cursor(p){cursorPoint=p;const el=$('#brush-cursor');el.hidden=!ready||paused;el.style.left=p.x/W*100+'%';el.style.top=p.y/H*100+'%';el.style.width=el.style.height=(dyeSize*2*canvas.getBoundingClientRect().width/W)+'px';el.style.background='radial-gradient(circle,'+colors[color].hex+'18,transparent 70%)';}
  canvas.addEventListener('pointermove',e=>{const p=point(e);cursor(p);if(dragging&&(e.buttons&1))immerse(p);});
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);dragging=true;const p=point(e);cursor(p);immerse(p,true);});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{dragging=false;finishStroke();});
  canvas.addEventListener('pointerleave',()=>{cursorPoint=null;$('#brush-cursor').hidden=true;});
  canvas.addEventListener('keydown',e=>{const directions={ArrowLeft:[-8,0],ArrowRight:[8,0],ArrowUp:[0,-8],ArrowDown:[0,8]};if(directions[e.key]){e.preventDefault();const [x,y]=directions[e.key];keyboard.x=Math.max(0,Math.min(W-1,keyboard.x+x));keyboard.y=Math.max(0,Math.min(H-1,keyboard.y+y));cursor(keyboard);}else if(e.code==='Space'||e.key==='Enter'){e.preventDefault();if(!e.repeat){immerse(keyboard,true);finishStroke();}}else if(e.key==='Escape')$('#pause').click();});
  function showStrength(){$('#brush-value').value=Math.round(25+40*(radius-8)/52)+'%';}
  function showBrushSize(){$('#brush-diameter').value=dyeSize*2;$('#brush-diameter-value').value=(dyeSize*2)+' px';$('#brush-diameter').setAttribute('aria-valuetext',(dyeSize*2)+' 像素');}
  $('#brush-diameter').oninput=e=>{finishStroke();dyeSize=Math.max(20,Math.min(120,Number(e.target.value)/2));showBrushSize();if(cursorPoint)cursor(cursorPoint);persist();};
  showBrushSize();
  $('#brush-size').oninput=e=>{finishStroke();radius=Number(e.target.value);showStrength();persist();};
  $('#pause').onclick=()=>{finishStroke();dragging=false;paused=!paused;$('#pause').textContent=paused?'继续上色':'暂停上色';$('#pause').setAttribute('aria-pressed',String(paused));$('#brush-cursor').hidden=true;canvas.style.cursor=paused?'default':'none';status(paused?'已暂停，点击“继续上色”恢复。':help);};
  $('#undo').onclick=()=>{finishStroke();strokes.pop();replay();persist();status('已撤销上一次染色。');};
  $('#reset').onclick=()=>{if(!ready)return;finishStroke();strokes=[];replay();persist();status('已清空当前画稿的颜色，可以重新上色。');};
  const back=()=>{finishStroke();persist();location.href='shujin.html?pattern='+encodeURIComponent(pattern.id);};
  $('#previous').onclick=back;$('#change-pattern').onclick=back;
  document.querySelectorAll('[data-step]').forEach(b=>{if(b.dataset.step==='1')b.setAttribute('aria-current','step');b.onclick=()=>{if(b.dataset.step==='0')back();else status(pattern.lesson?[pattern.lesson.observe,pattern.lesson.color,pattern.lesson.stitch,'松开后重复涂染可加深，每笔限定在当前区域。'][+b.dataset.step]:['','选择颜色，在花瓣或叶片内按住鼠标局部晕染。','沿花瓣或叶脉轻扫，颜色由浓到淡自然过渡。','松开后重复涂染可加深，降低染色浓度可获得更柔和的渐变。'][+b.dataset.step]);};});
  function info(title,text){$('#dialog-title').textContent=title;$('#dialog-body').textContent=text;$('#dialog').showModal();}
  function save(){
    if(!ready)return;finishStroke();render();persist();
    const source={revision:pattern.revision,patternId:pattern.id,png:canvas.toDataURL('image/png'),editState:editState()};
    source.id=window.ShujinFlow.hash(source.png);
    if(window.ShujinFlow.write('shujin:stitch-source:'+pattern.id,source))location.href='shujin-stitch.html?pattern='+encodeURIComponent(pattern.id);
    else info('暂时无法进入织线页','浏览器存储空间不足，色稿尚未传递。请释放空间后再次点击“完成上色”。');
  }
  $('#use-pattern').onclick=save;$('#next').onclick=save;$('#next').disabled=true;
  document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{if(b.dataset.nav==='习艺坊'){finishStroke();location.href='index.html';}else info(b.dataset.nav,'此栏目入口已预留，内容待完善。');});
  $('#credits').onclick=()=>info('项目与出处','按照丝上芳华参考图制作的成都蜀锦体验。按住鼠标模拟局部渐变晕染，保留原画稿线条；作品保存在当前浏览器。');
  window.addEventListener('pagehide',()=>{finishStroke();persist();});window.addEventListener('blur',finishStroke);
  setColor(0);
  imageAt([pattern.line,pattern.exampleLine]).then(({image,index})=>{
    const scale=Math.min((W-40)/image.naturalWidth,(H-32)/image.naturalHeight),w=image.naturalWidth*scale,h=image.naturalHeight*scale;
    baseCtx.drawImage(image,(W-w)/2,(H-h)/2,w,h);
    const pixels=baseCtx.getImageData(0,0,W,H);let hash=2166136261;for(let i=0;i<pixels.data.length;i++)hash=Math.imul(hash^pixels.data[i],16777619);signature=(hash>>>0).toString(16);
    model=dye.protectCutout(dye.completeRegions(core.model(pixels.data,W,H)),pixels.data,pattern.id==='hibiscus'&&index===0&&image.naturalWidth===2200&&image.naturalHeight===1980?{x:(W-w)/2,y:(H-h)/2,width:w,height:h}:null);paint=pigmentCtx.createImageData(W,H);ready=true;
    let saved;try{saved=JSON.parse(sessionStorage.getItem(key)||'null');}catch{}
    if(!saved){const latest=window.ArtworkStore.latest();if(latest?.craft==='shujin'&&latest.stage==='color'&&latest.patternId===pattern.id)saved=latest.editState;}
    if(validState(saved)){strokes=saved.strokes;if(colors[saved.color])setColor(saved.color);if(Number.isFinite(saved.radius))radius=Math.max(8,Math.min(60,saved.radius));if(Number.isFinite(saved.dyeSize))dyeSize=Math.max(20,Math.min(120,saved.dyeSize));}
    $('#brush-size').value=radius;showStrength();showBrushSize();replay();$('#loading').hidden=true;$('#use-pattern').disabled=false;$('#next').disabled=false;
    $('#selection-status').textContent=pattern.name+(index?' · 示意画稿':'');
    status(help);
  }).catch(()=>{ready=false;$('#loading').textContent='画稿暂时无法加载';status('请检查素材路径；双击 HTML 使用前，请运行 prepare-shujin-assets.py 更新本地素材包。');});
})();
