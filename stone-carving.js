(() => {
 'use strict';
 const $=s=>document.querySelector(s),assets=window.STONE_ASSETS,shared=window.ART_ASSETS;
 let selected='peony',step=0;
 try{const saved=JSON.parse(sessionStorage.getItem('stone-carving:draft'));if(saved)selected=saved.selected;}catch{}
 const query=new URLSearchParams(location.search).get('pattern');if(query)selected=query;
 if(!assets.patterns.some(p=>p.id===selected))selected='peony';
 const descriptions=['选择纹样，观察中央刻稿与右侧参考效果。','观石辨白：观察石面肌理，辨认纹样与留白。','运刀起形：沿轮廓细刻，让花叶从石面浮现。','修纹见韵：修整细节，感受黑白层次之美。'];
 function remember(){try{sessionStorage.setItem('stone-carving:draft',JSON.stringify({selected,step}));}catch{}}
 function load(img,paths,done){const token=Symbol();img.token=token;img.hidden=true;const next=i=>{if(img.token!==token)return;if(i>=paths.length){done?.(false);return;}const probe=new Image();probe.onload=()=>{if(img.token!==token)return;img.src=probe.src;img.hidden=false;done?.(true,paths[i]);};probe.onerror=()=>next(i+1);probe.src=paths[i];};next(0);}
 function decorate(img,paths,fallback){load(img,paths.filter(Boolean),(ok,path)=>{if(!ok)return;img.parentElement.classList.add('has-image');if(fallback)fallback.hidden=true;if(img.dataset.decoration==='workCornerRight'&&path.endsWith('/corner.svg'))img.classList.add('mirror');});}
 decorate($('#logo'),[assets.logo],$('#logo-fallback'));decorate($('#roof'),[shared.roof],$('#roof-fallback'));
 document.querySelectorAll('[data-icon]').forEach(img=>decorate(img,[shared.icons[img.dataset.icon]],img.nextElementSibling));
 document.querySelectorAll('[data-decoration]').forEach(img=>{const key=img.dataset.decoration;decorate(img,[assets.decorations[key],shared.decorations[key],...(key.startsWith('workCorner')?['assets/paper-cutting/examples/corner.svg']:[])],img.parentElement.classList.contains('seal')?img.nextElementSibling:null);});
 assets.backgrounds.forEach((path,i)=>{const img=new Image();img.onload=()=>document.body.style.setProperty(i?'--right-bg':'--left-bg',`url("${path}")`);img.src=path;});
 const surface=new Image();surface.onload=()=>$('.paper').style.setProperty('--work-surface',`url("${assets.paper}")`);surface.src=assets.paper;
 // Display selected portions of the supplied reference sheet. Formal PNGs take priority.
 function sprite(el,box){const [x,y,w,h]=box;el.style.setProperty('--sprite-image',`url("${assets.sheet}")`);el.style.setProperty('--sprite-size',`${1672/w*100}% ${941/h*100}%`);el.style.setProperty('--sprite-position',`${x/(1672-w)*100}% ${y/(941-h)*100}%`);el.parentElement.style.setProperty('--art-ratio',w/h);}
 function art(container,p,slot){const img=container.querySelector('img'),fallback=container.querySelector('.sprite');img.alt=p.name+(slot==='draft'?'刻稿':slot==='reference'?'石刻参考效果':'缩略图');fallback.setAttribute('aria-label',img.alt);fallback.hidden=false;sprite(fallback,p.preview[slot]);load(img,[p[slot]],ok=>{fallback.hidden=ok;container.style.setProperty('--art-ratio',ok?img.naturalWidth/img.naturalHeight:p.preview[slot][2]/p.preview[slot][3]);});}
 assets.patterns.forEach(p=>{const b=document.createElement('button');b.className='pattern';b.dataset.pattern=p.id;b.setAttribute('aria-label','选择'+p.name);b.innerHTML='<span class="thumb"><img alt="" hidden><span class="sprite" role="img"></span></span><span></span>';b.lastElementChild.textContent=p.name;b.onclick=()=>{selected=p.id;step=0;render();};$('#patterns').append(b);art(b.querySelector('.thumb'),p,'thumb');});
 function steps(){document.querySelectorAll('[data-step]').forEach(b=>{if(+b.dataset.step===step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});$('#step-status').textContent=descriptions[step];remember();}
 function render(){const p=assets.patterns.find(p=>p.id===selected);document.querySelectorAll('[data-pattern]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pattern===selected)));art($('#draft-art'),p,'draft');art($('#reference-art'),p,'reference');$('#selection-status').textContent=p.name;steps();}
 function info(title,body){$('#dialog-title').textContent=title;$('#dialog-body').textContent=body;$('#dialog').showModal();}
 function choose(){step=1;steps();const p=assets.patterns.find(p=>p.id===selected);$('#selection-status').textContent='已选用 · '+p.name;if(window.STONE_NEXT_PAGE){location.href=window.STONE_NEXT_PAGE+(window.STONE_NEXT_PAGE.includes('?')?'&':'?')+'pattern='+encodeURIComponent(selected);}else info('已选用 · '+p.name,'画稿选择已记录。当前版本为选稿与参考展示页，刻刀操作将在后续体验页接入。');}
 $('#use-pattern').onclick=choose;$('#next').onclick=choose;
 $('#previous').onclick=()=>{if(step){step--;steps();}else location.href='index.html';};
 $('#reset').onclick=()=>{selected='peony';step=0;render();};
 $('#change-pattern').onclick=()=>{selected=assets.patterns[(assets.patterns.findIndex(p=>p.id===selected)+1)%assets.patterns.length].id;step=0;render();};
 document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{step=+b.dataset.step;steps();});
 $('#patterns-tab').onclick=()=>{step=0;steps();};
 $('#material-info').onclick=()=>info('素材说明','中央刻稿放入 assets/stone-carving/patterns/draft，右侧成品放入 reference，缩略图放入 thumb。文件名见素材命名清单；缺失时使用参考效果图中的预览。');
 document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{if(b.dataset.nav==='习艺坊')location.href='index.html';else info(b.dataset.nav,'栏目入口已预留。');});
 $('#credits').onclick=()=>info('项目与出处','白花石刻选稿页面，按提供的效果图搭建。预览图来自提供的参考图，正式独立素材可按清单替换。');
 render();
})();
