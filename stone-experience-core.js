/* Coverage is measured only on the actual motif, never on empty stone. */
(function(root){
 'use strict';
 class Coverage {
  constructor(points,threshold=.95){this.points=points;this.threshold=threshold;this.hits=new Uint8Array(points.length);this.count=0;this.strokes=[];this.current=null;}
  begin(){this.current=[];}
  dab(x,y,r){if(!this.current)this.begin();const sample={x,y,r};this.current.push(sample);this.apply(sample);}
  apply({x,y,r}){const rr=r*r;this.points.forEach((p,i)=>{if(!this.hits[i]&&(p.x-x)**2+(p.y-y)**2<=rr){this.hits[i]=1;this.count++;}});}
  segment(a,b,r){const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/(r*.4)));for(let i=1;i<=n;i++)this.dab(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n,r);}
  end(){if(this.current?.length)this.strokes.push(this.current);this.current=null;}
  undo(){this.end();this.strokes.pop();this.hits.fill(0);this.count=0;for(const stroke of this.strokes)for(const sample of stroke)this.apply(sample);}
  clear(){this.strokes=[];this.current=null;this.hits.fill(0);this.count=0;}
  get fraction(){return this.points.length?this.count/this.points.length:0;}
  get complete(){return this.points.length>0&&this.fraction>=this.threshold;}
  get percent(){return this.complete?100:Math.floor(this.fraction*100);}
  get regions(){const all=new Map();this.points.forEach((p,i)=>{const group=p.group??0;const g=all.get(group)||[0,0];g[0]++;g[1]+=this.hits[i];all.set(group,g);});return {total:all.size,done:[...all.values()].filter(([n,k])=>k/n>=this.threshold).length};}
 }
 function pointsFromRGBA(data,w,h,step=9){const points=[];for(let y=step;y<h-step;y+=step)for(let x=step;x<w-step;x+=step){if(data[(y*w+x)*4+3]>160)points.push({x,y,group:Math.min(4,Math.floor(y/h*5))*4+Math.min(3,Math.floor(x/w*4))});}return points;}
 root.StoneExperienceCore={Coverage,pointsFromRGBA};
})(typeof window!=='undefined'?window:globalThis);
