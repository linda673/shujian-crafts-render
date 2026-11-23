(function(root){
  // Ignore white backgrounds and low-alpha PNG noise; soften isolated edge specks.
  function maskFromPixels(data,w,h){
    const raw=new Uint8Array(w*h),mask=new Uint8Array(w*h);
    for(let i=0;i<raw.length;i++)raw[i]=data[i*4+3]>120&&Math.min(data[i*4],data[i*4+1],data[i*4+2])<175?1:0;
    for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
      let n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)n+=raw[(y+dy)*w+x+dx];
      mask[y*w+x]=n>=5?1:0;
    }
    return mask;
  }
  const api={maskFromPixels};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PaperCutCore=api;
})(typeof window!=='undefined'?window:globalThis);
