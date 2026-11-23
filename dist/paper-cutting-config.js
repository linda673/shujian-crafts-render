// 放入对应 PNG 后刷新即可。缺图时自动使用 examples 中的 SVG 示意图。
window.PAPER_CUTTING_ASSETS = {
  logo: 'assets/paper-cutting/brand/logo.png',
  backgrounds: ['assets/paper-cutting/backgrounds/bg-bamboo-left.png', 'assets/paper-cutting/backgrounds/bg-rock-right.png'],
  badge: 'assets/paper-cutting/decorations/patterns-badge.png',
  patterns: [
    {id:'flower', name:'团花', category:'花草类'},
    {id:'bird', name:'喜鹊', category:'动物类'},
    {id:'figure', name:'仕女', category:'人物类'},
    {id:'fortune', name:'福字', category:'文字类'},
    {id:'basket', name:'花篮', category:'器物类'},
    {id:'pavilion', name:'亭阁', category:'建筑类'}
  ].map(item => ({...item,
    artwork:`assets/paper-cutting/patterns/${item.id}.png`,
    reference:`assets/paper-cutting/references/${item.id}.png`,
    thumbnail:`assets/paper-cutting/thumbnails/${item.id}.png`,
    example:`assets/paper-cutting/examples/${item.id}.svg`
  }))
};

// Fold-ready symmetrical teaching patterns.
const foldPatterns={"flower": {"name": "双鸟迎春", "category": "花草类", "cutHelp": "先剪花叶外缘，再刻花心与鸟羽；保留枝叶连接。", "foldHelp": "选择纸色，将左侧纸角向中央虚线拖动，完成左右对折。", "artwork": "assets/paper-cutting/fold/flower.webp", "reference": "assets/paper-cutting/fold/flower.webp", "thumbnail": "assets/paper-cutting/fold/flower.webp"}, "bird": {"name": "双鹊报喜", "category": "动物类", "cutHelp": "先剪双鹊和枝头外缘，再刻羽毛、眼睛与花饰。", "foldHelp": "选择纸色，将左侧纸角向中央虚线拖动，完成左右对折。", "artwork": "assets/paper-cutting/fold/bird.webp", "reference": "assets/paper-cutting/fold/bird.webp", "thumbnail": "assets/paper-cutting/fold/bird.webp"}, "figure": {"name": "对舞迎春", "category": "人物类", "cutHelp": "先剪人物衣袖轮廓，再刻裙摆纹饰；保留手臂与花枝连接。", "foldHelp": "选择纸色，将左侧纸角向中央虚线拖动，完成左右对折。", "artwork": "assets/paper-cutting/fold/figure.webp", "reference": "assets/paper-cutting/fold/figure.webp", "thumbnail": "assets/paper-cutting/fold/figure.webp"}, "fortune": {"name": "双喜临门", "category": "文字类", "cutHelp": "先剪花边外缘，再刻字内留白；保留笔画连接。", "foldHelp": "选择纸色，将左侧纸角向中央虚线拖动，完成左右对折。", "artwork": "assets/paper-cutting/fold/fortune.webp", "reference": "assets/paper-cutting/fold/fortune.webp", "thumbnail": "assets/paper-cutting/fold/fortune.webp"}, "basket": {"name": "花篮纳福", "category": "器物类", "cutHelp": "先剪花篮与花朵外缘，再刻篮身编织孔与花瓣。", "foldHelp": "选择纸色，将左侧纸角向中央虚线拖动，完成左右对折。", "artwork": "assets/paper-cutting/fold/basket.webp", "reference": "assets/paper-cutting/fold/basket.webp", "thumbnail": "assets/paper-cutting/fold/basket.webp"}, "pavilion": {"name": "亭阁春景", "category": "建筑类", "cutHelp": "先剪飞檐外缘，再刻窗格与立柱间隙；保留屋架连接。", "foldHelp": "选择纸色，将左侧纸角向中央虚线拖动，完成左右对折。", "artwork": "assets/paper-cutting/fold/pavilion.webp", "reference": "assets/paper-cutting/fold/pavilion.webp", "thumbnail": "assets/paper-cutting/fold/pavilion.webp"}};
window.PAPER_CUTTING_ASSETS.patterns.forEach(p=>Object.assign(p,foldPatterns[p.id]));
