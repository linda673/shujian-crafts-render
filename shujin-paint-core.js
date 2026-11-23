/* Soft silk-color brush, clipped to the line drawing's enclosed regions. */
(function(root){
  const segmentation=typeof module!=='undefined'&&module.exports?require('./coloring-core.js'):root.ColoringCore;
  function model(rgba,width,height){
    const result=segmentation.segmentRegions(rgba,width,height);
    const mask=new Uint8Array(width*height);
    // Filled transparent cutouts also retain thin stems whose contours may be open.
    let transparent=0,light=0;
    for(let i=0;i<mask.length;i++){
      const k=i*4;
      if(rgba[k+3]<30)transparent++;
      if(rgba[k+3]>180&&Math.min(rgba[k],rgba[k+1],rgba[k+2])>210)light++;
    }
    const cutout=transparent>mask.length*.05&&light>mask.length*.03;
    for(let i=0;i<mask.length;i++){
      const k=i*4;
      mask[i]=result.labels[i]>0||(cutout&&rgba[k+3]>180&&Math.min(rgba[k],rgba[k+1],rgba[k+2])>180)?1:0;
    }
    return {...result,mask};
  }
  function dab(data,model,x,y,radius,rgb){
    const {width,height,mask}=model;
    let changed=false;
    for(let py=Math.max(0,Math.floor(y-radius));py<=Math.min(height-1,Math.ceil(y+radius));py++){
      for(let px=Math.max(0,Math.floor(x-radius));px<=Math.min(width-1,Math.ceil(x+radius));px++){
        const i=py*width+px;if(!mask[i])continue;
        const d=Math.hypot(px-x,py-y)/radius;if(d>=1)continue;
        const k=i*4,amount=Math.min(.24,(1-d)*.65),old=data[k+3]/255;
        const alpha=old+amount*(1-old);
        for(let c=0;c<3;c++)data[k+c]=(rgb[c]*amount+data[k+c]*old*(1-amount))/alpha;
        data[k+3]=Math.min(245,Math.round(alpha*255));changed=true;
      }
    }
    return changed;
  }
  function segment(data,model,a,b,radius,rgb){
    const distance=Math.hypot(b.x-a.x,b.y-a.y),steps=Math.max(1,Math.ceil(distance/Math.max(1,radius/5)));
    let changed=false;
    for(let i=1;i<=steps;i++)changed=dab(data,model,a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps,radius,rgb)||changed;
    return changed;
  }
  const api={model,dab,segment};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ShujinPaintCore=api;
})(typeof window!=='undefined'?window:globalThis);
