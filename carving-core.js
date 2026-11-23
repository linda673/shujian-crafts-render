/* Pixel coverage is independent of drawing, allowing real progress and undo. */
(function(root) {
  class CarvingCoverage {
    constructor(mask, width, height) {
      this.mask = mask; this.width = width; this.height = height;
      this.visited = new Uint8Array(mask.length);
      this.total = mask.reduce((sum, value) => sum + (value ? 1 : 0), 0);
      this.count = 0;
    }
    dab(x, y, radius) {
      const x0 = Math.max(0, Math.floor(x-radius)), x1 = Math.min(this.width-1, Math.ceil(x+radius));
      const y0 = Math.max(0, Math.floor(y-radius)), y1 = Math.min(this.height-1, Math.ceil(y+radius));
      for(let py=y0;py<=y1;py++) for(let px=x0;px<=x1;px++) {
        const i=py*this.width+px;
        if(this.mask[i] && !this.visited[i] && (px-x)**2+(py-y)**2<=radius**2) {this.visited[i]=1;this.count++;}
      }
    }
    segment(a,b,radius) {
      const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/Math.max(1,radius/2)));
      for(let i=0;i<=n;i++) this.dab(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n,radius);
    }
    clear() {this.visited.fill(0);this.count=0;}
    get percent() {return this.total ? this.count/this.total*100 : 0;}
  }
  if(typeof module!=='undefined' && module.exports) module.exports=CarvingCoverage;
  else root.CarvingCoverage=CarvingCoverage;
})(typeof window!=='undefined'?window:globalThis);
