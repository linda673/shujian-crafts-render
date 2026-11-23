(() => {
  'use strict';
  const $=s=>document.querySelector(s), config=window.PAPER_CUTTING_ASSETS, shared=window.ART_ASSETS;
  const id=new URLSearchParams(location.search).get('pattern');
  const pattern=config.patterns.find(p=>p.id===id)||config.patterns[0];
  const N=560,canvas=$('#cut-board'),ctx=canvas.getContext('2d'),cursor=$('#cut-cursor');
  const toolOptions={scissors:{name:'剪刀',radius:24},knife:{name:'刻刀',radius:11}};
  const storageKey=`santai:cut:v1:${pattern.id}`;
  let coverage,guide,basePixels,ready=false,active=null,strokes=[],stroke=null,last=null,pressed=false,pending=false,saveTimer,signature='';
  let keyboard={x:280,y:280};
  function info(title,body){$('#dialog-title').textContent=title;$('#dialog-body').textContent=body;$('#dialog').showModal();}
  function load(img,paths,fallback){
    img.hidden=true;
    const next=i=>{if(i>=paths.length)return;const probe=new Image();probe.onload=()=>{img.src=paths[i];img.hidden=false;img.parentElement.classList.add('has-image');if(fallback)fallback.hidden=true;if(img.dataset.decoration==='workCornerRight'&&i>0)img.classList.add('mirror-example');};probe.onerror=()=>next(i+1);probe.src=paths[i];};next(0);
  }
  load($('#logo'),[config.logo],$('#logo-fallback'));load($('#roof'),[shared.roof],$('#roof-fallback'));
  load($('#pattern-badge'),['assets/paper-cutting/decorations/tools-badge.png'],$('#pattern-badge').nextElementSibling);
  document.querySelectorAll('[data-icon]').forEach(img=>load(img,[shared.icons[img.dataset.icon]],img.nextElementSibling));
  document.querySelectorAll('[data-decoration]').forEach(img=>{const name=img.dataset.decoration;load(img,[shared.decorations[name],...(name.startsWith('workCorner')?['assets/paper-cutting/examples/corner.svg']:[])],img.parentElement.classList.contains('seal')?img.nextElementSibling:null);});
  config.backgrounds.forEach((path,i)=>{const img=new Image();img.onload=()=>document.body.style.setProperty(i?'--right-bg':'--left-bg',`url("${path}")`);img.src=path;});
  load($('#reference-image'),[pattern.reference,pattern.artwork,pattern.example]);$('#reference-image').alt=`${pattern.name}剪纸参考效果`;
  function save(){
    if(!ready)return;
    try{sessionStorage.setItem(storageKey,JSON.stringify({signature,strokes,active,guides:$('#show-guides').checked}));}catch{$('#step-status').textContent='本标签页存储空间不足，请及时保存 PNG。';}
  }
  function endStroke(){stroke=null;last=null;pressed=false;clearTimeout(saveTimer);save();}
  function render(){
    pending=false;if(!ready)return;
    const pixels=new Uint8ClampedArray(basePixels);
    for(let i=0;i<coverage.visited.length;i++)if(coverage.visited[i])pixels[i*4+3]=0;
    ctx.putImageData(new ImageData(pixels,N,N),0,0);
    if($('#show-guides').checked)ctx.drawImage(guide,0,0);
    const value=coverage.percent;$('#cut-progress').value=value;$('#progress-label').value=`${value.toFixed(1)}%`;
    $('#undo-cut').disabled=!strokes.length;$('#use-pattern').disabled=$('#next').disabled=coverage.count===0;
    $('#selection-status').textContent=value?`已镂空 ${value.toFixed(1)}%，可继续剪裁或完成并保存。`:'选择左侧工具开始剪纸。';
  }
  function schedule(){if(!pending){pending=true;requestAnimationFrame(render);}}
  function choose(name){endStroke();active=active===name?null:name;document.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tool===active)));canvas.classList.toggle('tool-active',!!active);cursor.dataset.tool=active||'';cursor.hidden=true;$('#tool-hint').textContent=active?`${toolOptions[active].name}已选：鼠标沿图案移动，触屏按住拖动。`:'选择工具，沿图案移动完成镂空。';save();}
  function cut(point){
    if(!ready||!active)return;
    if(last&&Math.hypot(point.x-last.x,point.y-last.y)<2)return;
    const radius=toolOptions[active].radius,before=coverage.count;
    if(last&&Math.hypot(point.x-last.x,point.y-last.y)<100)coverage.segment(last,point,radius);else coverage.dab(point.x,point.y,radius);
    if(!stroke){stroke={tool:active,points:[]};strokes.push(stroke);}
    stroke.points.push(point);last=point;
    // A bounded batch is also an undo unit for long mouse-hover gestures.
    if(stroke.points.length>=600){stroke=null;last=null;}
    if(coverage.count!==before)schedule();
    clearTimeout(saveTimer);saveTimer=setTimeout(save,350);
  }
  function move(e){
    if(!ready||!active)return;
    const bounds=canvas.getBoundingClientRect();
    if(e.clientX<bounds.left||e.clientX>bounds.right||e.clientY<bounds.top||e.clientY>bounds.bottom){last=null;cursor.hidden=true;return;}
    const p={x:Math.max(0,Math.min(N-1,(e.clientX-bounds.left)/bounds.width*N)),y:Math.max(0,Math.min(N-1,(e.clientY-bounds.top)/bounds.height*N))};
    cursor.style.left=`${p.x/N*100}%`;cursor.style.top=`${p.y/N*100}%`;cursor.hidden=false;
    if(e.pointerType==='mouse'||pressed)cut(p);
  }
  canvas.addEventListener('pointermove',move);
  canvas.addEventListener('pointerdown',e=>{if(!ready||!active)return;pressed=true;canvas.setPointerCapture(e.pointerId);move(e);});
  canvas.addEventListener('pointerup',endStroke);canvas.addEventListener('pointercancel',()=>{cursor.hidden=true;endStroke();});
  canvas.addEventListener('pointerleave',()=>{cursor.hidden=true;endStroke();});
  canvas.addEventListener('keydown',e=>{
    if(!ready||!active)return;
    const directions={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,-12],ArrowDown:[0,12]};
    if(directions[e.key]){e.preventDefault();keyboard.x=Math.max(0,Math.min(N-1,keyboard.x+directions[e.key][0]));keyboard.y=Math.max(0,Math.min(N-1,keyboard.y+directions[e.key][1]));}
    else if(e.key===' '){e.preventDefault();cut({...keyboard});}else return;
    cursor.hidden=false;cursor.style.left=`${keyboard.x/N*100}%`;cursor.style.top=`${keyboard.y/N*100}%`;
  });
  canvas.addEventListener('blur',()=>{cursor.hidden=true;endStroke();});
  document.querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.tool)));
  $('#show-guides').addEventListener('change',()=>{schedule();save();});
  function replay(){coverage.clear();for(const s of strokes){let prev=null;for(const p of s.points){if(prev&&Math.hypot(p.x-prev.x,p.y-prev.y)<100)coverage.segment(prev,p,toolOptions[s.tool].radius);else coverage.dab(p.x,p.y,toolOptions[s.tool].radius);prev=p;}}}
  $('#undo-cut').addEventListener('click',()=>{endStroke();strokes.pop();replay();render();save();});
  $('#reset').addEventListener('click',()=>{endStroke();strokes=[];coverage?.clear();render();save();});
  function result(){
    if(!ready||!coverage.count)return;endStroke();
    const out=document.createElement('canvas');out.width=N;out.height=N;const c=out.getContext('2d');
    const pixels=new Uint8ClampedArray(basePixels);for(let i=0;i<coverage.visited.length;i++)if(coverage.visited[i])pixels[i*4+3]=0;
    c.putImageData(new ImageData(pixels,N,N),0,0);const url=out.toDataURL('image/png');
    $('#result-image').src=url;$('#download-cut').href=url;$('#download-cut').download=`三台剪纸-${pattern.name}.png`;
    const result=window.ArtworkStore.save({craft:'paper-cutting',name:pattern.name,patternId:pattern.id,png:url,savedAt:Date.now(),editState:{signature,strokes,active,guides:$('#show-guides').checked}});
    if(result.ok){location.href='index.html?saved=1';return;}
    $('#result-summary').textContent='浏览器存储空间不足，作品尚未保存。请先点击「保存 PNG」下载留存，再返回首页。';
    $('#result-dialog').showModal();
  }
  $('#use-pattern').addEventListener('click',result);$('#next').addEventListener('click',result);
  function back(){endStroke();location.href=`paper-cutting.html?pattern=${encodeURIComponent(pattern.id)}`;}
  $('#previous').addEventListener('click',back);
  document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.step==='0')back();else if(b.dataset.step==='3')result();else if(b.dataset.step==='1')info('折纸藏形','当前直接在平铺红纸上体验剪裁，折叠动画尚未接入。');else canvas.focus();}));
  document.querySelectorAll('[data-nav]').forEach(b=>b.addEventListener('click',()=>{endStroke();if(b.dataset.nav==='习艺坊')location.href='index.html';else info(b.dataset.nav,'该栏目入口已预留。');}));
  $('#credits').addEventListener('click',()=>info('剪纸体验','根据提供的剪纸参考图制作。选择工具后沿辅助线或纹样内部移动即可逐步镂空；图案外部保留红纸。'));
  window.addEventListener('pagehide',save);
  async function imageFor(path){
    const source=location.protocol==='file:'&&window.PAPER_CUTTING_IMAGES[path]?window.PAPER_CUTTING_IMAGES[path]:path;
    return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=source;});
  }
  async function init(){
    $('#next').disabled=true;$('#step-status').textContent='正在生成纹样辅助线…';
    let img,sourcePath;
    for(const path of [pattern.artwork,pattern.example]){try{img=await imageFor(path);sourcePath=path;break;}catch{}}
    if(!img){$('#step-status').textContent='纹样加载失败，请返回选稿页检查素材。';return;}
    try{
      const off=document.createElement('canvas');off.width=N;off.height=N;const c=off.getContext('2d',{willReadFrequently:true});
      const scale=(N-48)/Math.max(img.naturalWidth,img.naturalHeight),w=img.naturalWidth*scale,h=img.naturalHeight*scale;
      c.drawImage(img,(N-w)/2,(N-h)/2,w,h);
      const mask=window.PaperCutCore.maskFromPixels(c.getImageData(0,0,N,N).data,N,N);
      coverage=new window.CarvingCoverage(mask,N,N);if(!coverage.total)throw new Error('blank');
      let hash=2166136261;for(const value of mask){hash=Math.imul(hash^value,16777619);}signature=String(hash>>>0);
      guide=document.createElement('canvas');guide.width=N;guide.height=N;const g=guide.getContext('2d');g.fillStyle='#fff3df';
      for(let y=1;y<N-1;y++)for(let x=1;x<N-1;x++){const i=y*N+x;if(mask[i]&&(!mask[i-1]||!mask[i+1]||!mask[i-N]||!mask[i+N])&&((x+y)%13<8))g.fillRect(x-0.5,y-0.5,1.5,1.5);}
      basePixels=new Uint8ClampedArray(N*N*4);let seed=91;
      for(let i=0;i<mask.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const grain=(seed>>>28)-8;const j=i*4;basePixels[j]=190+grain;basePixels[j+1]=66+grain;basePixels[j+2]=51+grain;basePixels[j+3]=255;}
      let restored=null;try{restored=JSON.parse(sessionStorage.getItem(storageKey));}catch{}
      if(!restored){const latest=window.ArtworkStore.latest();if(latest?.craft==='paper-cutting'&&latest.patternId===pattern.id)restored=latest.editState;}
      if(restored?.signature===signature&&Array.isArray(restored.strokes)){
        strokes=restored.strokes.filter(s=>toolOptions[s.tool]&&Array.isArray(s.points)&&s.points.length<=600&&s.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<N&&p.y>=0&&p.y<N));
        replay();$('#show-guides').checked=restored.guides!==false;
      }
      ready=true;if(toolOptions[restored?.active])choose(restored.active);render();
      $('#step-status').textContent=`${pattern.name} · 选工具后沿图案移动剪裁；点击工具可暂停。${sourcePath===pattern.example?' 当前使用示意纹样。':''}`;
    }catch(error){$('#step-status').textContent=error.name==='SecurityError'?'本地图片未打包：请运行 prepare-paper-assets.py 后刷新，或使用本地 HTTP 预览。':'无法识别纹样，请使用透明底或白底、深色图案的图片。';}
  }
  init();
})();
