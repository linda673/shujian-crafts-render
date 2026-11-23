/* Keep the most recently completed PNG locally, independently from editing state. */
(function(root){
  const KEY='yibanshengchun:latest-artwork:v1';
  function valid(value){return value&&typeof value.name==='string'&&typeof value.patternId==='string'&&Number.isFinite(value.savedAt)&&typeof value.png==='string'&&/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(value.png);}
  function save(artwork){
    if(!valid(artwork))return {ok:false};
    for(const storageName of ['localStorage','sessionStorage']){
      try{root[storageName].setItem(KEY,JSON.stringify(artwork));return {ok:true,persistent:storageName==='localStorage'};}catch{}
    }
    return {ok:false};
  }
  function latest(){
    const records=[];
    for(const storageName of ['localStorage','sessionStorage']){
      try{const record=JSON.parse(root[storageName].getItem(KEY)||'null');if(valid(record))records.push({...record,persistent:storageName==='localStorage'});}catch{}
    }
    return records.sort((a,b)=>b.savedAt-a.savedAt)[0]||null;
  }
  root.ArtworkStore={save,latest};
})(window);
