/* Find enclosed paper regions without allowing paint to escape into the background. */
(function(root){
  function segmentRegions(rgba,width,height){
    const n=width*height,wall=new Uint8Array(n),labels=new Int32Array(n),queue=new Int32Array(n);
    const ink=new Uint8ClampedArray(n*4);
    for(let i=0;i<n;i++){
      const k=i*4,lum=rgba[k]*.2126+rgba[k+1]*.7152+rgba[k+2]*.0722;
      const alpha=Math.min(255,Math.max(0,(205-lum)*4))*rgba[k+3]/255;
      ink[k]=rgba[k];ink[k+1]=rgba[k+1];ink[k+2]=rgba[k+2];ink[k+3]=alpha;
      wall[i]=alpha>60?1:0;
    }
    // A one-pixel safety border seals small antialiasing gaps in raster line art.
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      const i=y*width+x;if(!wall[i])continue;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        if(x+dx>=0&&x+dx<width&&y+dy>=0&&y+dy<height)labels[(y+dy)*width+x+dx]=-1;
      }
    }
    let count=0;
    for(let start=0;start<n;start++){
      if(labels[start]!==0)continue;
      let head=0,tail=1,touchesEdge=false;queue[0]=start;labels[start]=-3;
      while(head<tail){
        const i=queue[head++],x=i%width,y=Math.floor(i/width);
        if(x===0||x===width-1||y===0||y===height-1)touchesEdge=true;
        const visit=j=>{if(labels[j]===0){labels[j]=-3;queue[tail++]=j;}};
        if(x>0)visit(i-1);if(x<width-1)visit(i+1);if(y>0)visit(i-width);if(y<height-1)visit(i+width);
      }
      const id=touchesEdge||tail<12?-2:++count;
      for(let j=0;j<tail;j++)labels[queue[j]]=id;
    }
    // Extend fills underneath the original ink to avoid pale seams at the edge.
    for(let pass=0;pass<3;pass++){
      const next=labels.slice();
      for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
        const i=y*width+x;if(labels[i]!==-1)continue;
        for(const j of [i-width,i-1,i+1,i+width])if(labels[j]>0){next[i]=labels[j];break;}
      }
      labels.set(next);
    }
    const regions=Array.from({length:count},(_,i)=>({id:i+1,pixels:[],cx:0,cy:0}));
    for(let i=0;i<n;i++)if(labels[i]>0){const r=regions[labels[i]-1];r.pixels.push(i);r.cx+=i%width;r.cy+=Math.floor(i/width);}
    for(const r of regions){r.cx/=r.pixels.length;r.cy/=r.pixels.length;r.pixels=Int32Array.from(r.pixels);}
    return {labels,regions,ink,width,height};
  }
  function regionAt(model,x,y){
    x=Math.floor(x);y=Math.floor(y);if(x<0||y<0||x>=model.width||y>=model.height)return 0;
    return Math.max(0,model.labels[y*model.width+x]);
  }
  const api={segmentRegions,regionAt};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ColoringCore=api;
})(typeof window!=='undefined'?window:globalThis);
