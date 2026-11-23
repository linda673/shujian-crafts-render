(function(root){
function build(input,n){
 const keep=input.slice(),half=n/2;for(let y=0;y<n;y++)for(let x=0;x<half;x++)keep[y*n+x]=keep[y*n+n-1-x];
 const labels=new Int32Array(n*n),regions=[],points=[];
 for(let y=0;y<n;y++)for(let x=half;x<n;x++){const start=y*n+x;if(keep[start]||labels[start])continue;
  const id=regions.length+1,queue=[start],pixels=[],edge=[];labels[start]=id;
  for(let k=0;k<queue.length;k++){const i=queue[k],px=i%n,py=Math.floor(i/n);pixels.push(i);let border=false;
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=px+dx,yy=py+dy;if(xx<half||xx>=n||yy<0||yy>=n)continue;const j=yy*n+xx;if(keep[j])border=true;else if(!labels[j]){labels[j]=id;queue.push(j);}}
   if(border&&(px+py)%3===0)edge.push({x:px,y:py,id});
  }
  regions.push({id,pixels,edge});points.push(...edge);
 }
 return {n,keep,regions,points,visited:new Uint8Array(points.length)};
}
function dab(m,x,y,r){for(let i=0;i<m.points.length;i++){const p=m.points[i];if((x-p.x)**2+(y-p.y)**2<=r*r)m.visited[i]=1;}}
function segment(m,a,b,r){const steps=Math.max(1,Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)/5));for(let k=0;k<=steps;k++)dab(m,a.x+(b.x-a.x)*k/steps,a.y+(b.y-a.y)*k/steps,r);}
function progress(m){let done=0;const hits=new Int32Array(m.regions.length+1);m.points.forEach((p,i)=>{if(m.visited[i]){hits[p.id]++;done++;}});const completed=m.regions.filter(r=>!r.edge.length||hits[r.id]/r.edge.length>=.9);return {percent:m.points.length?done/m.points.length*100:0,completed:new Set(completed.map(r=>r.id)),total:m.regions.filter(r=>r.edge.length).length,done:completed.filter(r=>r.edge.length).length};}
const api={build,dab,segment,progress};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PaperFoldCore=api;
})(globalThis);
