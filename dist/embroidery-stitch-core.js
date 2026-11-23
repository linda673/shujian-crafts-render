/* Needle paths stay inside the enclosed region where each gesture starts. */
(function(root){
  function stitchAt(model,point,settings,region,angle,threads){
    const {width,height,labels,ink}=model,[x,y]=point;
    if(!region||x<0||y<0||x>=width||y>=height)return 0;
    const spacing=4,radius=25;let added=0;
    const safe=(px,py)=>{px=Math.round(px);py=Math.round(py);if(px<0||py<0||px>=width||py>=height)return false;const i=py*width+px;return labels[i]===region&&(!ink||ink[i*4+3]<60);};
    for(let gy=Math.floor((y-radius)/spacing);gy<=Math.ceil((y+radius)/spacing);gy++)for(let gx=Math.floor((x-radius)/spacing);gx<=Math.ceil((x+radius)/spacing);gx++){
      const px=gx*spacing+(gy%2)*1.5,py=gy*spacing,key=gx+':'+gy;
      if(threads.has(key)||Math.hypot(px-x,py-y)>radius||!safe(px,py))continue;
      const half=settings.length/2*(settings.method==='long-short'&&Math.abs(gx+gy)%3===0?.55:1);
      const dx=Math.cos(angle),dy=Math.sin(angle);
      const end=sign=>{let distance=0;for(let d=.5;d<=half;d+=.5){const qx=px+sign*dx*d,qy=py+sign*dy*d;if(!safe(qx,qy)||!safe(qx-dy,qy+dx)||!safe(qx+dy,qy-dx))break;distance=d;}return [px+sign*dx*distance,py+sign*dy*distance];};
      const a=end(-1),b=end(1);if(Math.hypot(a[0]-b[0],a[1]-b[1])<2)continue;
      threads.set(key,{a,b,color:settings.color,region});added++;
    }return added;
  }
  function segment(model,a,b,settings,region,threads){
    const dist=Math.hypot(b[0]-a[0],b[1]-a[1]),angle=dist>.1?Math.atan2(b[1]-a[1],b[0]-a[0]):-Math.PI/3,n=Math.max(1,Math.ceil(dist/6));let count=0;
    for(let j=1;j<=n;j++)count+=stitchAt(model,[a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n],settings,region,angle,threads);
    return count;
  }
  const api={stitchAt,segment};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.EmbroideryStitchCore=api;
})(typeof window!=='undefined'?window:globalThis);
