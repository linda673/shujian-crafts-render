window.EMBROIDERY_ASSETS={
 logo:'assets/embroidery/brand/logo.png',
 backgrounds:['assets/embroidery/backgrounds/bg-bamboo-left.png','assets/embroidery/backgrounds/bg-rock-right.png'],
 decorations:{stepsBadge:'assets/embroidery/decorations/steps-badge.png',patternsBadge:'assets/embroidery/decorations/patterns-badge.png',workTitle:'assets/embroidery/decorations/work-title.png',workCornerLeft:'assets/embroidery/decorations/work-corner-left.png',workCornerRight:'assets/embroidery/decorations/work-corner-right.png'},
 fabric:'assets/embroidery/backgrounds/fabric.png',
 patterns:[{id:'flower',name:'八瓣花开'},{id:'butterfly',name:'彩蝶迎春'},{id:'bouquet',name:'繁花枝叶'},{id:'knot',name:'四方如意'}].map(p=>({...p,line:`assets/embroidery/patterns/line/${p.id}.webp`,color:`assets/embroidery/patterns/color/${p.id}.webp`,thumb:`assets/embroidery/patterns/color/${p.id}.webp`,exampleLine:`assets/embroidery/examples/${p.id}-line.svg`,exampleColor:`assets/embroidery/examples/${p.id}-color.svg`}))
};

// Pattern-specific instructions share the eight-petal flower stitch engine.
const embroideryLessons={"butterfly": {"area": "蝶翼或蝶身", "help": "先从一侧蝶翼落针，再绣另一侧；外翼用桃粉，内翼用竹青，蝶身可用米金。一笔只绣当前闭合区域。", "guide": "彩蝶迎春：观察左右蝶翼的呼应，沿翼尖方向铺针，内外两层分区配色。"}, "bouquet": {"area": "花瓣、花心或叶片", "help": "先绣顶部主花，再绣两侧小花，最后铺出枝叶；花瓣交替用桃粉与米金，叶片用竹青。一笔只绣当前闭合区域。", "guide": "繁花枝叶：先主花，后侧花，再枝叶；短针细化小花，长短针表现叶片层次。"}, "knot": {"area": "如意瓣、内纹或菱形花心", "help": "从上方如意瓣开始，依次绣右、下、左四瓣；外缘用竹青，内纹用桃粉，中心用米金。一笔只绣当前闭合区域。", "guide": "四方如意：观察四向对称，分别填绣外缘与内纹，让针迹顺着瓣形展开。"}};
window.EMBROIDERY_ASSETS.patterns.forEach(p=>Object.assign(p,embroideryLessons[p.id]||{}));
