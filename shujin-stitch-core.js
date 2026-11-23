(function(root){
  function generate(model,rgba,point,settings,angle,threads){
    const {width,height,labels}=model,[x,y]=point,cx=Math.round(x),cy=Math.round(y);
    if(cx<0||cy<0||cx>=width||cy>=height)return 0;
    const region=labels[cy*width+cx];if(region<1)return 0;
    const spacing=[7,5,3.5][settings.density-1],radius=30;
    let count=0;
    for(let gy=Math.floor((y-radius)/spacing);gy<=Math.ceil((y+radius)/spacing);gy++)for(let gx=Math.floor((x-radius)/spacing);gx<=Math.ceil((x+radius)/spacing);gx++){
      const px=gx*spacing+(gy%2)*spacing*.35,py=gy*spacing;
      if(Math.hypot(px-x,py-y)>radius||px<1||py<1||px>=width-1||py>=height-1)continue;
      const i=Math.round(py)*width+Math.round(px);if(labels[i]!==region||(model.ink&&model.ink[i*4+3]>100))continue;
      const key=gx+':'+gy+':'+spacing;if(threads.has(key))continue;
      const stagger=settings.method==='long-short'?((gx+gy)%3===0?.55:1):1;
      const half=settings.length*stagger/2,dx=Math.cos(angle),dy=Math.sin(angle);
      const endpoint=sign=>{let d=0;for(let s=1;s<=half;s++){
        const tx=Math.round(px+sign*dx*s),ty=Math.round(py+sign*dy*s);
        if(tx<0||ty<0||tx>=width||ty>=height||labels[ty*width+tx]!==region||(model.ink&&model.ink[(ty*width+tx)*4+3]>100))break;d=s;
      }return [px+sign*dx*d,py+sign*dy*d];};
      const a=endpoint(-1),b=endpoint(1);if(Math.hypot(a[0]-b[0],a[1]-b[1])<2)continue;
      threads.set(key,{a,b,rgb:[rgba[i*4],rgba[i*4+1],rgba[i*4+2]],region});count++;
    }
    return count;
  }
  function segment(model,rgba,a,b,settings,threads){
    const dist=Math.hypot(b[0]-a[0],b[1]-a[1]),angle=dist>1?Math.atan2(b[1]-a[1],b[0]-a[0]):-Math.PI/3;
    let count=0;const n=Math.max(1,Math.ceil(dist/8));
    for(let j=1;j<=n;j++)count+=generate(model,rgba,[a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n],settings,angle,threads);
    return count;
  }
  const api={generate,segment};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ShujinStitchCore=api;
})(typeof window!=='undefined'?window:globalThis);
