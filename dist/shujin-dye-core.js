/* Region dyeing: bounded diffusion, translucent layers and a subtle woven texture. */
(function(root){
  function completeRegions(model){
    const labels=model.labels.slice(),regions=model.regions.slice(),seen=new Uint8Array(labels.length),queue=new Int32Array(labels.length);
    // Some supplied cutout contours have tiny openings. Their opaque interior is
    // still a safe dye boundary; transparent background must never join it.
    for(let start=0;start<labels.length;start++){
      if(seen[start]||labels[start]>0||!model.mask[start])continue;
      let head=0,tail=1,cx=0,cy=0;queue[0]=start;seen[start]=1;
      while(head<tail){
        const i=queue[head++],x=i%model.width,y=Math.floor(i/model.width);cx+=x;cy+=y;
        const visit=j=>{if(!seen[j]&&labels[j]<1&&model.mask[j]){seen[j]=1;queue[tail++]=j;}};
        if(x>0)visit(i-1);if(x+1<model.width)visit(i+1);if(y>0)visit(i-model.width);if(y+1<model.height)visit(i+model.width);
      }
      if(tail<12)continue;
      const id=regions.length+1,pixels=queue.slice(0,tail);
      for(const i of pixels)labels[i]=id;
      regions.push({id,pixels,cx:cx/tail,cy:cy/tail});
    }
    return {...model,labels,regions};
  }
  function pick(model,x,y){
    x=Math.round(x);y=Math.round(y);
    if(x<0||y<0||x>=model.width||y>=model.height)return null;
    let best=null,distance=26;
    for(let dy=-5;dy<=5;dy++)for(let dx=-5;dx<=5;dx++){
      const px=x+dx,py=y+dy,d=dx*dx+dy*dy;
      if(d>=distance||px<0||py<0||px>=model.width||py>=model.height)continue;
      const index=py*model.width+px,id=model.labels[index];
      if(id>0){best={id,index};distance=d;}
    }
    return best;
  }
  function protectCutout(model,rgba,hibiscusBounds=null){
    const labels=model.labels.slice();
    let transparent=0;for(let i=0;i<labels.length;i++)if(rgba[i*4+3]<30)transparent++;
    const cutout=transparent>labels.length*.05,partId=model.regions.length+1;
    let connectedPetalId=0;
    if(hibiscusBounds){
      const px=Math.round(hibiscusBounds.x+(432-67.7777778)*hibiscusBounds.width/764.4444444);
      const py=Math.round(hibiscusBounds.y+(154-16)*hibiscusBounds.height/688);
      connectedPetalId=model.labels[py*model.width+px];
    }
    // The supplied hibiscus has a broken contour at the petal/stamen junction.
    // These two outline polygons annotate only that original drawing's stamen;
    // source alpha still clips out all transparent gaps between its branches.
    const parts=[[[447,324],[442,310],[470,260],[499,215],[526,175],[554,138],[564,137],[542,177],[516,217],[491,262],[468,312],[460,324]],
      [[550,143],[539,122],[558,102],[563,83],[606,65],[635,75],[632,119],[612,148],[589,169],[570,166]]];
    function inside(x,y,polygon){let hit=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
      const [a,b]=polygon[i],[c,d]=polygon[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)hit=!hit;
    }return hit;}
    for(let i=0;i<labels.length;i++){
      const k=i*4;
      // Region expansion must not paint across antialiased outlines into the page.
      if(cutout&&rgba[k+3]<220){labels[i]=-2;continue;}
      if(hibiscusBounds){
        const x=67.7777778+(i%model.width-hibiscusBounds.x)*764.4444444/hibiscusBounds.width;
        const y=16+(Math.floor(i/model.width)-hibiscusBounds.y)*688/hibiscusBounds.height;
        if(parts.some(p=>inside(x,y,p))){
          const oldRegion=model.regions[labels[i]-1];
          const large=10000*hibiscusBounds.width*hibiscusBounds.height/(764.4444444*688);
          if(oldRegion&&oldRegion.id!==connectedPetalId&&oldRegion.pixels.length>large)continue;
          const lum=.2126*rgba[k]+.7152*rgba[k+1]+.0722*rgba[k+2];
          // Keep dark outlines intact, but include narrow pale stem interiors.
          labels[i]=rgba[k+3]>=220&&lum>170?partId:-1;
        }
      }
    }
    const regions=Array.from({length:partId},(_,i)=>({id:i+1,pixels:[],cx:0,cy:0}));
    for(let i=0;i<labels.length;i++)if(labels[i]>0){const r=regions[labels[i]-1];r.pixels.push(i);r.cx+=i%model.width;r.cy+=Math.floor(i/model.width);}
    for(const r of regions){if(r.pixels.length){r.cx/=r.pixels.length;r.cy/=r.pixels.length;}r.pixels=Int32Array.from(r.pixels);}
    const mask=Uint8Array.from(labels,id=>id>0?1:0);
    return {...model,labels,regions,mask};
  }
  function prepare(data,model,point,rgb,strength){
    const hit=pick(model,point[0],point[1]);if(!hit)return null;
    const pixels=model.regions[hit.id-1].pixels,dist=new Int32Array(model.width*model.height).fill(-1),queue=new Int32Array(pixels.length);
    let head=0,tail=1,max=0;queue[0]=hit.index;dist[hit.index]=0;
    while(head<tail){
      const i=queue[head++],x=i%model.width,y=Math.floor(i/model.width);
      const visit=j=>{if(model.labels[j]===hit.id&&dist[j]<0){dist[j]=dist[i]+1;max=Math.max(max,dist[j]);queue[tail++]=j;}};
      if(x>0)visit(i-1);if(x+1<model.width)visit(i+1);if(y>0)visit(i-model.width);if(y+1<model.height)visit(i+model.width);
    }
    const before=new Uint8ClampedArray(pixels.length*4),after=new Uint8ClampedArray(before.length),arrival=new Float32Array(pixels.length);
    const amount=.3+.5*Math.max(0,Math.min(1,(strength-8)/52));
    for(let j=0;j<pixels.length;j++){
      const i=pixels[j],k=i*4,t=j*4,x=i%model.width,y=Math.floor(i/model.width);
      // Fine warp/weft variation stays fixed in image coordinates when dye is layered.
      const weave=.96+.025*Math.sin(x*Math.PI/2)+.015*Math.sin(y*Math.PI/2);
      const wash=.96+.04*Math.sin(x*.033+y*.018)*Math.sin(y*.027);
      const a=amount*weave*wash,old=data[k+3]/255,alpha=old+a*(1-old);
      for(let c=0;c<4;c++)before[t+c]=data[k+c];
      for(let c=0;c<3;c++)after[t+c]=(rgb[c]*a+data[k+c]*old*(1-a))/alpha;
      after[t+3]=Math.round(alpha*255);arrival[j]=dist[i]<0?1:dist[i]/Math.max(1,max);
    }
    return {pixels,before,after,arrival,id:hit.id};
  }
  function apply(data,plan,progress=1){
    for(let j=0;j<plan.pixels.length;j++){
      let t=Math.max(0,Math.min(1,(progress*1.3-plan.arrival[j])/.3));t=t*t*(3-2*t);
      const k=plan.pixels[j]*4,s=j*4;
      // Use premultiplied interpolation to avoid dark fringes on transparent pigment.
      const a=plan.before[s+3],b=plan.after[s+3],alpha=a+(b-a)*t;
      for(let c=0;c<3;c++)data[k+c]=alpha?(plan.before[s+c]*a*(1-t)+plan.after[s+c]*b*t)/alpha:0;
      data[k+3]=alpha;
    }
  }
  function beginLocal(data,model,point,rgb,strength,size=75){
    const hit=pick(model,point[0],point[1]);if(!hit)return null;
    return {id:hit.id,base:data.slice(),coverage:new Float32Array(model.width*model.height),rgb,
      amount:.25+.4*Math.max(0,Math.min(1,(strength-8)/52)),size:Math.max(20,Math.min(120,size))};
  }
  function localDab(data,model,stroke,point){
    const [x,y]=point,hit=pick(model,x,y);if(!hit||hit.id!==stroke.id)return;
    const {size,base,coverage,rgb}=stroke;
    for(let py=Math.max(0,Math.floor(y-size));py<=Math.min(model.height-1,Math.ceil(y+size));py++){
      for(let px=Math.max(0,Math.floor(x-size));px<=Math.min(model.width-1,Math.ceil(x+size));px++){
        const i=py*model.width+px;if(model.labels[i]!==stroke.id)continue;
        const d=Math.hypot(px-x,py-y)/size;if(d>=1)continue;
        // A smooth falloff reaches zero with no hard circular edge. Use maximum
        // wet coverage per gesture so dense pointer events cannot make dark dots.
        const feather=(1-d*d)**3;
        if(feather<=coverage[i])continue;coverage[i]=feather;
        const k=i*4,weave=.98+.012*Math.sin(px*Math.PI/2)+.008*Math.sin(py*Math.PI/2);
        const amount=stroke.amount*feather*weave,old=base[k+3]/255,alpha=old+amount*(1-old);
        for(let c=0;c<3;c++)data[k+c]=(rgb[c]*amount+base[k+c]*old*(1-amount))/alpha;
        data[k+3]=Math.round(alpha*255);
      }
    }
  }
  function localSegment(data,model,stroke,a,b){
    const steps=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/4));
    for(let i=1;i<=steps;i++)localDab(data,model,stroke,[a[0]+(b[0]-a[0])*i/steps,a[1]+(b[1]-a[1])*i/steps]);
  }
  const api={completeRegions,protectCutout,pick,prepare,apply,beginLocal,localDab,localSegment};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ShujinDyeCore=api;
})(typeof window!=='undefined'?window:globalThis);
