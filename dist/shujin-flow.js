(function(root){
  function hash(text){let n=2166136261;for(let i=0;i<text.length;i++)n=Math.imul(n^text.charCodeAt(i),16777619);return (n>>>0).toString(16);}
  function write(key,value){const text=JSON.stringify({...value,updatedAt:Date.now()});for(const name of ['sessionStorage','localStorage'])try{root[name].setItem(key,text);return true;}catch{}return false;}
  function read(key){const values=[];for(const name of ['sessionStorage','localStorage'])try{const v=JSON.parse(root[name].getItem(key)||'null');if(v)values.push(v);}catch{}return values.sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0))[0]||null;}
  root.ShujinFlow={hash,write,read};
})(window);
