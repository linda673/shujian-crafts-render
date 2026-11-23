(() => {
  'use strict';
  const entries={
    origin:['溯年 · 知来处','从一张年画，认识木版与手绘的相遇。画稿先转化为木版上的线条，印出轮廓，再添上颜色；门神、花鸟与吉祥纹样，也承载着生活中的祝愿。'],
    life:['迎福 · 入日常','年画把纸上的祝愿带进生活。门上的守护、花鸟的生机、节日的欢喜，都可以成为理解一幅画的入口。'],
    credits:['项目与出处','四城五艺的材料之境 · 绵竹木版年画。页面按项目设计稿搭建，图片、字体与作品的作者及授权信息请在项目发布前补充于此。']
  };
  document.querySelectorAll('[data-info]').forEach(button=>button.addEventListener('click',()=>{
    const [title,copy]=entries[button.dataset.info];
    document.querySelector('#dialog-title').textContent=title;
    document.querySelector('#dialog-copy').textContent=copy;
    document.querySelector('#intro-dialog').showModal();
  }));
})();
