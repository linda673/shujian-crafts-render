// 文件名、格式不同时，在这里修改路径；支持 PNG、JPG、WebP、SVG。
window.ART_ASSETS = {
  logo: 'assets/brand/logo.png',
  background: 'assets/backgrounds/page-bg.png',
  roof: 'assets/decorations/roof.png',
  decorations: {
    stepsBadge: 'assets/decorations/steps-badge.png',
    patternsBadge: 'assets/decorations/patterns-badge.png',
    workTitle: 'assets/decorations/work-title.png',
    workCornerLeft: 'assets/decorations/work-corner-left.png',
    workCornerRight: 'assets/decorations/work-corner-right.png'
  },
  icons: { observe: 'assets/icons/observe.png', workshop: 'assets/icons/workshop.png', letters: 'assets/icons/letters.png' },
  patterns: [
    { id: 'birds', name: '花鸟', mark: '鸟' },
    { id: 'lotus', name: '莲花', mark: '莲' },
    { id: 'fortune', name: '福字', mark: '福' },
    { id: 'peony', name: '牡丹', mark: '牡' },
    { id: 'fish', name: '双鱼', mark: '鱼' },
    { id: 'plum', name: '梅枝', mark: '梅' }
  ].map(item => ({ ...item, line: `assets/patterns/line/${item.id}.png`, color: `assets/patterns/color/${item.id}.png`, thumb: `assets/patterns/thumb/${item.id}.png` }))
};

const nianhuaLessons = {
  "birds": {
    "observe": "观察双鸟与花叶的呼应，先看主轮廓，再看羽毛细节。",
    "carve": "先沿花枝与鸟身刻线，再处理羽毛和鸟喙。",
    "color": "花瓣用朱红、桃粉，叶片用石绿；双鸟可尝试呼应或对比的配色。",
    "detail": "适合鸟喙、羽毛等细节"
  },
  "lotus": {
    "observe": "观察莲花舒展的花瓣、花苞与荷叶的层次。",
    "carve": "先刻花瓣和荷叶外轮廓，再沿花茎与叶脉刻线。",
    "color": "花瓣可用桃粉与朱红，荷叶用石绿、竹青，花心点藤黄。",
    "detail": "适合花尖、叶脉等细节"
  },
  "fortune": {
    "observe": "观察福字笔画与菱形边框，辨认笔画之间的留白。",
    "carve": "先沿福字的笔画外缘刻线，再处理转角与边框花饰。",
    "color": "福字可用朱红，边框用藤黄；让字内留白与笔画形成对比。",
    "detail": "适合笔画转角、边框花饰等细节"
  },
  "peony": {
    "observe": "从花心向外观察牡丹花瓣的叠合，辨认花苞和叶片。",
    "carve": "先刻外层花瓣与叶片，再逐层处理花心的曲线。",
    "color": "由浅桃粉到朱红铺开花瓣，叶片用石绿，花心点藤黄。",
    "detail": "适合花心、瓣缘与叶齿等细节"
  },
  "fish": {
    "observe": "观察双鱼相向回游的构图，区分鱼身、鱼鳍与鳞片。",
    "carve": "先刻两条鱼的外形，再沿鱼鳍、鳞片与水纹刻线。",
    "color": "双鱼可分别用朱红和藤黄，鱼鳍用桃粉，水纹点石绿。",
    "detail": "适合鱼鳞、鱼眼与鳍尖等细节"
  },
  "plum": {
    "observe": "沿梅枝寻找花朵与花苞，观察五瓣花形和枝干转折。",
    "carve": "先沿主枝刻出走向，再刻花瓣、花苞和花蕊。",
    "color": "花瓣可用桃粉与朱红，花心点藤黄，枝叶用竹青、石绿。",
    "detail": "适合花蕊、花苞与枝梢等细节"
  }
};
window.ART_ASSETS.patterns.forEach(pattern => { pattern.lesson = nianhuaLessons[pattern.id]; });
