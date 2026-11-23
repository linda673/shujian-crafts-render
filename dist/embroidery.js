(() => {
 'use strict';
 const $=s=>document.querySelector(s),assets=window.EMBROIDERY_ASSETS,shared=window.ART_ASSETS;
 const colors=[['桃粉','#edaaa1'],['胭脂','#cc6e79'],['米金','#ddbd78'],['竹青','#73986a'],['石绿','#53a18b'],['墨绿','#3c6657']];
 let selected='flower',color=0,step=0;
 try{const s=JSON.parse(sessionStorage.getItem('embroidery:draft')||'null');if(s){selected=s.selected;color=s.color||0;}}catch{}
 const query=new URLSearchParams(location.search).get('pattern');if(query)selected=query;
 if(!assets.patterns.some(p=>p.id===selected))selected='flower';if(!colors[color])color=0;
 function remember(){try{sessionStorage.setItem('embroidery:draft',JSON.stringify({selected,color}));}catch{}}
 function load(img,paths,fallback,done){
  const token=Symbol();img.token=token;img.hidden=true;if(fallback)fallback.hidden=false;
  const next=i=>{if(img.token!==token)return;if(i===paths.length){done?.(false);return;}
   const path=paths[i],src=location.protocol==='file:'&&window.EMBROIDERY_IMAGES[path]?window.EMBROIDERY_IMAGES[path]:path;
   const probe=new Image();probe.onload=()=>{if(img.token!==token)return;img.src=src;img.hidden=false;img.parentElement.classList.add('has-image');if(fallback)fallback.hidden=true;if(img.dataset.decoration==='workCornerRight'&&i>0)img.classList.add('mirror');done?.(true,i);};probe.onerror=()=>next(i+1);probe.src=src;
  };next(0);
 }
 load($('#logo'),[assets.logo],$('#logo-fallback'));load($('#roof'),[shared.roof],$('#roof-fallback'));
 document.querySelectorAll('[data-icon]').forEach(img=>load(img,[shared.icons[img.dataset.icon]],img.nextElementSibling));
 document.querySelectorAll('[data-decoration]').forEach(img=>{const key=img.dataset.decoration;load(img,[assets.decorations[key],shared.decorations[key],...(key.startsWith('workCorner')?['assets/paper-cutting/examples/corner.svg']:[])],img.parentElement.classList.contains('seal')?img.nextElementSibling:null);});
 assets.backgrounds.forEach((path,i)=>{const img=new Image();img.onload=()=>document.body.style.setProperty(i?'--right-bg':'--left-bg',`url("${path}")`);img.src=path;});
 assets.patterns.forEach(p=>{const b=document.createElement('button');b.className='pattern';b.dataset.pattern=p.id;b.setAttribute('aria-label',`选择${p.name}纹样`);b.innerHTML='<span class="thumb"><img alt=""></span><span></span>';b.lastElementChild.textContent=p.name;b.onclick=()=>{selected=p.id;step=0;render();};$('#patterns').append(b);load(b.querySelector('img'),[p.thumb,p.color,p.exampleColor]);});
 function palette(show){$('#palette').hidden=!show;$('#patterns').hidden=show;$('#palette-tab').classList.toggle('active',show);$('#patterns-tab').classList.toggle('active',!show);$('#palette-tab').setAttribute('aria-pressed',String(show));$('#patterns-tab').setAttribute('aria-pressed',String(!show));}
 function setColor(i){color=i;document.querySelectorAll('.swatch').forEach((b,n)=>b.setAttribute('aria-pressed',String(n===i)));$('#color-label').textContent=`预选丝线：${colors[i][0]}（预选）`;remember();}
 colors.forEach(([name,hex],i)=>{const b=document.createElement('button');b.className='swatch';b.style.setProperty('--swatch',hex);b.setAttribute('aria-label',name);b.onclick=()=>setColor(i);$('#swatches').append(b);});
 const descriptions=['择纹寄意：选择喜欢的吉祥纹样，点击“选用此稿”开始刺绣。','观形辨色：预选丝线颜色，观察右侧参考效果。','运针起形：选用纹样后，在布面上拖动铺出绣线。','修纹见韵：调整针迹，完成后保存作品。'];
 function renderStep(){document.querySelectorAll('[data-step]').forEach(b=>{if(+b.dataset.step===step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});palette(step===1);$('#step-status').textContent=descriptions[step];$('#next').disabled=false;}
 function render(){const p=assets.patterns.find(p=>p.id===selected);document.querySelectorAll('[data-pattern]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pattern===selected)));$('#line-image').alt=`${p.name}线稿`;$('#color-image').alt=`${p.name}参考配色`;$('#line-placeholder h3').textContent=p.name;$('#line-placeholder code').textContent=p.line;$('#color-placeholder code').textContent=p.color;$('#use-pattern').disabled=true;
  load($('#line-image'),[p.line,p.exampleLine],$('#line-placeholder'),(ok,index)=>{$('#use-pattern').disabled=!ok;$('#selection-status').textContent=!ok?'纹样加载失败，请检查素材。':index?'已选示意纹样，点击选用此稿开始刺绣。':'已选纹样，点击选用此稿开始刺绣。';});
  load($('#color-image'),[p.color,p.exampleColor],$('#color-placeholder'));renderStep();remember();
 }
 function info(title,body){$('#dialog-title').textContent=title;$('#dialog-body').textContent=body;$('#dialog').showModal();}
 $('#patterns-tab').onclick=()=>palette(false);$('#palette-tab').onclick=()=>palette(true);
 $('#change-pattern').onclick=()=>{selected=assets.patterns[(assets.patterns.findIndex(p=>p.id===selected)+1)%assets.patterns.length].id;render();};
 $('#previous').onclick=()=>{if(step){step--;renderStep();}else location.href='index.html';};$('#next').onclick=()=>$('#use-pattern').click();
 document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{step=+b.dataset.step;renderStep();});
 $('#reset').onclick=()=>{selected='flower';color=0;step=0;setColor(0);render();};
 $('#use-pattern').onclick=()=>{
  const p=assets.patterns.find(p=>p.id===selected),img=$('#line-image');if(img.hidden||!img.complete)return;
  remember();location.href='embroidery-work.html?pattern='+encodeURIComponent(p.id)+'&color='+color;
 };
 document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{if(b.dataset.nav==='习艺坊')location.href='index.html';else info(b.dataset.nav,'此栏目入口已预留，内容待完善。');});
 $('#credits').onclick=()=>info('项目与出处','麻柳刺绣体验。选择纹样后，进入布面运针，选择丝线颜色与针法，逐步完成作品。');
 const fabric=new Image();fabric.onload=()=>document.querySelector('.paper').style.setProperty('--fabric',`url("${assets.fabric}")`);fabric.src=assets.fabric;
 setColor(color);render();
})();
