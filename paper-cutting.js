(() => {
  'use strict';
  const config=window.PAPER_CUTTING_ASSETS, shared=window.ART_ASSETS;
  const $=s=>document.querySelector(s), key='santai-paper-cutting:pattern:v1';
  let selected=config.patterns[0].id;
  try { const saved=sessionStorage.getItem(key);if(config.patterns.some(p=>p.id===saved))selected=saved; } catch {}
  const query=new URLSearchParams(location.search).get('pattern');
  if(config.patterns.some(p=>p.id===query))selected=query;
  // A new request invalidates prior handlers so rapid switching cannot display an old pattern.
  function load(img,paths,fallback=null,onDone=null) {
    const token=Symbol();img.requestToken=token;img.hidden=true;if(fallback)fallback.hidden=false;
    function attempt(i){
      if(img.requestToken!==token)return;
      if(i>=paths.length){img.hidden=true;onDone?.(false);return;}
      const probe=new Image();
      probe.onload=()=>{if(img.requestToken!==token)return;img.src=paths[i];img.hidden=false;img.parentElement.classList.add('has-image');if(fallback)fallback.hidden=true;onDone?.(true,i);};
      probe.onerror=()=>attempt(i+1);probe.src=paths[i];
    }attempt(0);
  }
  load($('#logo'),[config.logo],$('#logo-fallback'));
  load($('#roof'),[shared.roof],$('#roof-fallback'));
  load($('#pattern-badge'),[config.badge,'assets/paper-cutting/examples/flower.svg'],$('#pattern-badge').nextElementSibling);
  document.querySelectorAll('[data-icon]').forEach(img=>load(img,[shared.icons[img.dataset.icon]],img.nextElementSibling));
  document.querySelectorAll('[data-decoration]').forEach(img=>{
    const name=img.dataset.decoration;
    load(img,[shared.decorations[name],...(name.startsWith('workCorner')?['assets/paper-cutting/examples/corner.svg']:[])],img.parentElement.classList.contains('seal')?img.nextElementSibling:null,(_ok,index)=>img.classList.toggle('mirror-example',name==='workCornerRight'&&index===1));
  });
  config.backgrounds.forEach((path,i)=>{
    const probe=new Image();probe.onload=()=>document.body.style.setProperty(i?'--right-bg':'--left-bg',`url("${path}")`);probe.src=path;
  });
  config.patterns.forEach(pattern=>{
    const button=document.createElement('button');button.className='pattern';button.dataset.pattern=pattern.id;
    button.setAttribute('aria-label',`选择${pattern.name}纹样`);button.title=`${pattern.category} · ${pattern.name}`;
    const thumb=document.createElement('span');thumb.className='thumb';const img=document.createElement('img');img.alt='';thumb.append(img);
    const label=document.createElement('span');label.textContent=pattern.category;button.append(thumb,label);
    button.addEventListener('click',()=>{selected=pattern.id;render();});$('#patterns').append(button);
    load(img,[pattern.thumbnail,pattern.artwork,pattern.example]);
  });
  function render(){
    const p=config.patterns.find(p=>p.id===selected);
    document.querySelectorAll('[data-pattern]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pattern===selected)));
    $('#pattern-image').alt=`${p.name}剪纸纹样`;$('#reference-image').alt=`${p.name}剪纸参考效果`;
    $('#use-pattern').disabled=true;$('#next').disabled=true;$('#selection-status').textContent='';
    load($('#pattern-image'),[p.artwork,p.example],null,(ok,index)=>{
      $('#image-error').hidden=ok;$('#use-pattern').disabled=!ok;$('#next').disabled=!ok;
      $('#step-status').textContent=ok?(index?'当前为示意纹样，可替换为你的正式素材。':`已选：${p.name} · 请点击「选用此稿」进入剪纸。`):'纹样加载失败，请检查素材文件。';
    });
    load($('#reference-image'),[p.reference,p.artwork,p.example]);
    try{sessionStorage.setItem(key,selected);}catch{}
  }
  function info(title,body){$('#dialog-title').textContent=title;$('#dialog-body').textContent=body;$('#dialog').showModal();}
  function confirm(){
    const p=config.patterns.find(p=>p.id===selected);
    location.href=`paper-cut-workspace.html?pattern=${encodeURIComponent(p.id)}`;
  }
  $('#use-pattern').addEventListener('click',confirm);$('#next').addEventListener('click',confirm);
  $('#previous').addEventListener('click',()=>location.href='index.html');
  $('#reset').addEventListener('click',()=>{selected=config.patterns[0].id;render();});
  document.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>{
    if(button.dataset.step==='0'){$('#patterns button').focus();return;}
    if(button.dataset.step==='2'){confirm();return;}
    info(button.querySelector('strong').textContent,'请先选用纹样进入剪纸操作页。折叠动画尚未接入，当前支持平铺剪纸和效果预览。');
  }));
  document.querySelectorAll('[data-nav]').forEach(button=>button.addEventListener('click',()=>{
    if(button.dataset.nav==='习艺坊'){location.href='index.html';return;}
    info(button.dataset.nav,'该栏目入口已预留，内容待后续完善。');
  }));
  $('#credits').addEventListener('click',()=>info('项目与出处','三台剪纸体验页面，依据你提供的「纸间春信体验页1修改.png」搭建。当前 SVG 为界面示意，正式作品及作者出处可在素材接入后补充。'));
  render();
})();
