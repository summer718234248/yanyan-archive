/* ============================================================
   seed.js · 示例数据与定义
   全部为本地演示数据（LOCAL_ONLY）。
   接入真实后端时，此文件可替换为 API 返回数据（NEED_BACKEND）。
   ============================================================ */
window.SEED = (function () {

  /* ---------- 滤镜定义 ----------
     b 亮度 c 对比 s 饱和 sep 暖调 h 色相偏移 g 灰度
     grain 颗粒 vig 暗角 leak 漏光                       */
  const F = (id, name, cat, v) => Object.assign({ id, name, cat }, v);
  const FILTERS = [
    // 人像
    F('soft-portrait', 'Soft Portrait', 'portrait', { b:1.06,c:.95,s:.9, sep:.10,h:-8, grain:.12,vig:.12 }),
    F('warm-skin',     'Warm Skin',     'portrait', { b:1.04,c:.98,s:1.05,sep:.18,h:-10,grain:.10 }),
    F('cream-light',   'Cream Light',   'portrait', { b:1.10,c:.92,s:.85,sep:.14, grain:.08,vig:.08 }),
    F('faded-beauty',  'Faded Beauty',  'portrait', { b:1.05,c:.88,s:.75,sep:.20, grain:.18,vig:.15 }),
    F('quiet-film',    'Quiet Film',    'portrait', { b:1.02,c:.96,s:.88,sep:.12, grain:.28,vig:.20 }),
    // 旅行
    F('sunlit-travel', 'Sunlit Travel', 'travel', { b:1.06,c:1.02,s:1.10,sep:.12,h:-6, grain:.10 }),
    F('mediterranean', 'Mediterranean', 'travel', { b:1.05,c:1.00,s:1.05,sep:.05,h:8,  grain:.12 }),
    F('old-postcard',  'Old Postcard',  'travel', { b:1.04,c:.92,s:.70,sep:.35, grain:.25,vig:.20 }),
    F('warm-horizon',  'Warm Horizon',  'travel', { b:1.05,c:1.00,s:1.08,sep:.22,h:-12,grain:.12 }),
    F('dusty-road',    'Dusty Road',    'travel', { b:1.02,c:.94,s:.80,sep:.28, grain:.30,vig:.18 }),
    // 咖啡与食物
    F('cafe-brown',    'Café Brown',    'cafe', { b:1.00,c:.98,s:.85,sep:.30, grain:.15,vig:.15 }),
    F('butter-table',  'Butter Table',  'cafe', { b:1.08,c:.96,s:1.00,sep:.20,h:-8, grain:.08 }),
    F('soft-grain',    'Soft Grain',    'cafe', { b:1.04,c:.94,s:.90,sep:.12, grain:.30 }),
    F('afternoon-light','Afternoon Light','cafe',{ b:1.10,c:.95,s:.95,sep:.15, grain:.10,leak:.25 }),
    F('editorial-food','Editorial Food','cafe', { b:1.03,c:1.06,s:1.12, grain:.06 }),
    // 街头
    F('urban-film',    'Urban Film',    'street', { b:.98,c:1.05,s:.85,sep:.10, grain:.25,vig:.20 }),
    F('concrete-gray', 'Concrete Gray', 'street', { b:1.00,c:1.02,s:.50, grain:.20 }),
    F('red-accent',    'Red Accent',    'street', { b:1.00,c:1.08,s:1.25, grain:.15,vig:.15 }),
    F('street-flash',  'Street Flash',  'street', { b:1.08,c:1.10,s:.95, grain:.20,vig:.25 }),
    F('documentary',   'Documentary',   'street', { b:.97,c:1.04,s:.80,sep:.08, grain:.30,vig:.20 }),
    // 自然
    F('sage-air',      'Sage Air',      'nature', { b:1.05,c:.96,s:.90,h:10, grain:.08 }),
    F('blue-hour',     'Blue Hour',     'nature', { b:1.00,c:1.00,s:.95,h:18,sep:.05,grain:.12,vig:.15 }),
    F('clean-sky',     'Clean Sky',     'nature', { b:1.07,c:1.00,s:1.10,h:6, grain:.05 }),
    F('dreamy-bloom',  'Dreamy Bloom',  'nature', { b:1.08,c:.92,s:1.05,sep:.10,grain:.10,leak:.15 }),
    F('soft-nature',   'Soft Nature',   'nature', { b:1.05,c:.95,s:.95,sep:.08, grain:.12 }),
    // 夜晚
    F('midnight-rose', 'Midnight Rose', 'night', { b:.95,c:1.05,s:.90,h:-15,sep:.10,grain:.20,vig:.30 }),
    F('deep-blue',     'Deep Blue',     'night', { b:.92,c:1.05,s:.90,h:25, grain:.20,vig:.25 }),
    F('neon-film',     'Neon Film',     'night', { b:1.00,c:1.10,s:1.30,h:10, grain:.25,vig:.20 }),
    F('dark-velvet',   'Dark Velvet',   'night', { b:.88,c:1.10,s:.85, grain:.25,vig:.40 }),
    F('quiet-night',   'Quiet Night',   'night', { b:.94,c:.98,s:.80,sep:.10, grain:.30,vig:.30 }),
    // 黑白
    F('classic-mono',  'Classic Mono',  'mono', { g:1,c:1.05,b:1.02, grain:.15 }),
    F('silver-grain',  'Silver Grain',  'mono', { g:1,c:.95,b:1.08, grain:.35 }),
    F('high-contrast', 'High Contrast', 'mono', { g:1,c:1.30,b:.98, grain:.10,vig:.20 }),
    F('newspaper',     'Newspaper',     'mono', { g:1,c:1.15,b:1.05,sep:.05,grain:.25 }),
    F('fine-art',      'Fine Art',      'mono', { g:1,c:1.10,b:1.00, grain:.20,vig:.30 })
  ];

  const FILTER_CATS = [
    { id:'portrait', name:'人像' }, { id:'travel', name:'旅行' }, { id:'cafe', name:'咖啡与食物' },
    { id:'street', name:'街头' }, { id:'nature', name:'自然' }, { id:'night', name:'夜晚' }, { id:'mono', name:'黑白' }
  ];

  /* ---------- 相框定义 ---------- */
  const FRAMES = [
    { id:'fr-polaroid', name:'拍立得白边' }, { id:'fr-cream', name:'奶油纸张' },
    { id:'fr-gallery', name:'黑色画廊画框' }, { id:'fr-film', name:'胶片边框' },
    { id:'fr-stamp', name:'复古邮票' }, { id:'fr-torn', name:'撕纸边缘' },
    { id:'fr-journal', name:'手账纸' }, { id:'fr-glass', name:'透明玻璃' },
    { id:'fr-soft', name:'柔和阴影' }, { id:'fr-pearl', name:'珍珠边框' },
    { id:'fr-metal', name:'银色金属边框' }, { id:'fr-rose', name:'细玫瑰色边框' },
    { id:'fr-postcard', name:'明信片' }, { id:'fr-ticket', name:'旅行票根' },
    { id:'fr-ribbon', name:'丝带包装' }, { id:'fr-tape', name:'胶带固定' },
    { id:'fr-label', name:'展览编号标签' }
  ];

  /* ---------- 照片分类 ---------- */
  const CATS = [
    { id:'daily',  name:'日常', en:'Daily life' },
    { id:'travel', name:'旅行', en:'Travel' },
    { id:'portrait', name:'人像', en:'Portrait' },
    { id:'cafe',   name:'咖啡与食物', en:'Cafe' },
    { id:'street', name:'街头', en:'Street' },
    { id:'nature', name:'自然', en:'Nature' },
    { id:'night',  name:'夜晚', en:'Night' },
    { id:'little', name:'微小事物', en:'Little things' }
  ];

  const MOODS = ['安静', '温柔', '明亮', '想念', '松弛', '浪漫'];

  /* ---------- 示例照片 ---------- */
  const P = (o) => o;
  const PHOTOS = [
    P({ id:'p1', src:'assets/photos/p1.jpg', title:'清晨窗边的光', date:'2026-03-14', city:'上海', place:'家里的窗台',
        cat:'daily', mood:'安静', album:'日常碎片', frame:'fr-tape', filter:'cream-light',
        desc:'七点一刻的光，落在杯沿上。我没有动，怕它走。', tags:['清晨','光','窗'] }),
    P({ id:'p2', src:'assets/photos/p2.jpg', title:'海边旅行', date:'2025-07-02', city:'厦门', place:'环岛路',
        cat:'travel', mood:'松弛', album:'夏天 2025', frame:'fr-polaroid', filter:'sunlit-travel',
        desc:'海风把一切都吹得很慢，慢到可以听见自己的呼吸。', tags:['海','夏天','风'] }),
    P({ id:'p3', src:'assets/photos/p3.jpg', title:'咖啡馆桌面', date:'2026-01-18', city:'上海', place:'愚园路 · 小咖啡馆',
        cat:'cafe', mood:'温柔', album:'咖啡地图', frame:'fr-cream', filter:'cafe-brown',
        desc:'固定的角落，固定的杯子。老板已经记得我不加糖。', tags:['咖啡','下午','角落'] }),
    P({ id:'p4', src:'assets/photos/p4.jpg', title:'花店门口', date:'2026-04-05', city:'杭州', place:'中山中路花店',
        cat:'little', mood:'明亮', album:'微小事物', frame:'fr-stamp', filter:'soft-nature',
        desc:'路过花店的时候，总觉得应该带一束什么回家。', tags:['花','春天','路过'] }),
    P({ id:'p5', src:'assets/photos/p5.jpg', title:'黄昏街道', date:'2025-10-21', city:'巴黎', place:'玛黑区小巷',
        cat:'street', mood:'想念', album:'巴黎十日', frame:'fr-film', filter:'warm-horizon',
        desc:'那条巷子安静得只剩下光，和一辆停了很多年的自行车。', tags:['黄昏','巷子','旅行'] }),
    P({ id:'p6', src:'assets/photos/p6.jpg', title:'机场候机', date:'2025-10-12', city:'巴黎', place:'戴高乐机场',
        cat:'travel', mood:'松弛', album:'巴黎十日', frame:'fr-ticket', filter:'mediterranean',
        desc:'候机的时候最适合发呆。所有出发和告别，都在这里发生。', tags:['机场','出发','窗'] }),
    P({ id:'p7', src:'assets/photos/p7.jpg', title:'雨天车窗', date:'2026-06-09', city:'上海', place:'回家的出租车上',
        cat:'night', mood:'安静', album:'夜晚合集', frame:'fr-glass', filter:'midnight-rose',
        desc:'雨落在车窗上的时候，城市变成了一幅化开的水彩。', tags:['雨','夜','车'] }),
    P({ id:'p8', src:'assets/photos/p8.jpg', title:'书桌和手写笔记', date:'2026-02-22', city:'上海', place:'我的书桌',
        cat:'daily', mood:'安静', album:'日常碎片', frame:'fr-journal', filter:'butter-table',
        desc:'写下来的事情，好像就没那么容易被风吹走了。', tags:['书桌','手写','下午'] }),
    P({ id:'p9', src:'assets/photos/p9.jpg', title:'周末的晚餐', date:'2026-05-30', city:'上海', place:'家里',
        cat:'cafe', mood:'浪漫', album:'日常碎片', frame:'fr-ribbon', filter:'afternoon-light',
        desc:'点了蜡烛的晚餐，和普通日子有一点不一样。', tags:['晚餐','蜡烛','周末'] }),
    P({ id:'p10', src:'assets/photos/p10.jpg', title:'一座陌生城市的建筑', date:'2025-10-16', city:'巴黎', place:'蒙马特高地',
        cat:'travel', mood:'想念', album:'巴黎十日', frame:'fr-label', filter:'old-postcard',
        desc:'在陌生城市醒来的早晨，连屋顶的烟囱都好看。', tags:['建筑','巴黎','屋顶'] }),
    P({ id:'p11', src:'assets/photos/p5.jpg', title:'黄昏之后', date:'2025-10-21', city:'巴黎', place:'玛黑区小巷',
        cat:'night', mood:'安静', album:'巴黎十日', frame:'fr-gallery', filter:'classic-mono',
        desc:'同一条巷子，光走了以后，剩下的是另一种安静。', tags:['黑白','黄昏','巷子'] }),
    P({ id:'p12', src:'assets/photos/p2.jpg', title:'海的颜色', date:'2025-07-03', city:'厦门', place:'黄厝海滩',
        cat:'nature', mood:'松弛', album:'夏天 2025', frame:'fr-soft', filter:'dreamy-bloom',
        desc:'我想把这个夏天留得久一点，再久一点。', tags:['海','夏天','梦'] })
  ];

  /* ---------- 示例笔记 ---------- */
  const NOTES = [
    { id:'n1', title:'在陌生城市醒来的早晨', date:'2025-10-17', city:'巴黎', mood:'想念',
      tags:['旅行','清晨'], status:'published', visibility:'public', photos:['p10','p6'],
      body:'巴黎的早晨是从屋顶开始的。\n我住在蒙马特附近的一间小公寓里，窗户外面是层层叠叠的锌皮屋顶和烟囱，光从侧面过来，把一切都镀上一层淡淡的蜂蜜色。\n> 陌生的地方，反而让人更清楚地看见自己。\n我去楼下的面包店买了可颂，店主用我听不懂的语速说了早安。我假装听懂了，也回了一句早安。\n~ 语言不通的时候，微笑是唯一的护照。\n[photo:p10]\n走在去美术馆的路上，我突然明白，旅行里最珍贵的从来不是风景，而是那些"第一次"——第一次走错路，第一次点错菜，第一次在陌生的街角站很久，只是因为光太好。\n[photo:p6]\n离开的那天早上，我把窗帘拉开到最大，把房间的样子记了下来。有些早晨只会出现一次。' },
    { id:'n2', title:'关于一杯咖啡的短暂记忆', date:'2026-01-18', city:'上海', mood:'温柔',
      tags:['咖啡','日常'], status:'published', visibility:'public', photos:['p3'],
      body:'愚园路的那家小咖啡馆，我去了一年多。\n位子固定在靠窗的第二张桌子，杯子是店主自己捏的粗陶杯，每一只都不一样。\n> 一杯咖啡的时间，刚好够把一天重新排列一次。\n[photo:p3]\n我不记得每一次都喝了什么，但记得很多个下午：下雨的下午、赶完稿的下午、什么都不想做的下午。咖啡只是容器，装的是那些慢下来的时间。\n~ 今天的风很轻。\n有些店不需要很好，只需要一直在。' },
    { id:'n3', title:'我想把这个夏天留得久一点', date:'2025-07-03', city:'厦门', mood:'松弛',
      tags:['海','夏天'], status:'published', visibility:'public', photos:['p2','p12'],
      body:'厦门的夏天是咸的。\n我们住在环岛路附近的民宿，早上去海边，傍晚也去。海在不同的时间里是完全不同的东西——早上是清醒的蓝，傍晚是温柔的粉，夜里是看不见的声音。\n[photo:p2]\n> 夏天不会结束，它只是被收起来了。\n我捡了一枚贝壳，放在外套口袋里带回了上海。后来每次把手伸进口袋碰到它，都会想起那几天的风。\n[photo:p12]\n~ 下次去看冬天的海。\n照片拍得不多，因为大部分时间，我只想用眼睛看。' },
    { id:'n4', title:'雨落在车窗上的时候', date:'2026-06-09', city:'上海', mood:'安静',
      tags:['雨','夜'], status:'published', visibility:'private', photos:['p7'],
      body:'加完班回家的出租车上，下雨了。\n我把额头贴在车窗边，看雨滴把整座城市揉成一片一片的光。红的、黄的、蓝的，都化开了，像谁打翻了调色盘又懒得收拾。\n[photo:p7]\n> 有些情绪只在雨夜的车窗上出现。\n司机放着很老的歌，我没有听清歌词，但觉得刚刚好。那一天其实挺累的，可那一刻忽然就原谅了所有事情。\n~ 辛苦了，今天。\n到家的时候雨停了。我有点舍不得下车。' },
    { id:'n5', title:'一些没有计划的周末', date:'2026-05-31', city:'上海', mood:'浪漫',
      tags:['周末','家'], status:'draft', visibility:'private', photos:['p9','p8'],
      body:'这个周末没有任何计划。\n睡了很长的觉，起来整理书桌，给干花换了位置，写了两页没有主题的手记。\n[photo:p8]\n晚上做了意面，开了上次没舍得开的酒，点了蜡烛。没有人过生日，也没有纪念日，只是想做一顿认真的晚餐。\n[photo:p9]\n~ 日子是自己的，不用等理由。\n> 把普通的日子过得郑重，是一种能力。\n（还没写完，先存着。）' },
    { id:'n6', title:'走过的地方，最后都变成了心情', date:'2026-06-30', city:'上海', mood:'温柔',
      tags:['旅行','随笔'], status:'published', visibility:'public', photos:['p5','p4'],
      body:'整理相册的时候发现，我去过的地方不算多，但每一个地方都留下了一种心情。\n巴黎是蜂蜜色的黄昏，厦门是咸味的风，杭州是花店门口的春天，上海是雨夜车窗上化开的光。\n[photo:p5]\n> 我去过的地方，和那些留下来的心情。\n地方会忘记我，但我不会忘记它们。这没关系。\n[photo:p4]\n下半年想去京都看一次秋天的寺庙，也想再去一次海边。\n~ Somewhere between here and there.\n走过的路最后都会变成人的一部分。我想，这就是记录的意义。' }
  ];

  /* ---------- 地点 ---------- */
  const PLACES = [
    { id:'sh', city:'上海', country:'中国', en:'SHANGHAI', lat:31.23, lng:121.47,
      dates:'2025 — 现在', stay:'日常', memory:'所有日常的发生地，雨夜和咖啡都在这里。', order:1 },
    { id:'hz', city:'杭州', country:'中国', en:'HANGZHOU', lat:30.27, lng:120.15,
      dates:'2026.04', stay:'2 天', memory:'春天的花店，和慢慢走的下午。', order:2 },
    { id:'xm', city:'厦门', country:'中国', en:'XIAMEN', lat:24.48, lng:118.08,
      dates:'2025.07', stay:'4 天', memory:'咸味的夏天，被海风吹得很慢。', order:3 },
    { id:'pa', city:'巴黎', country:'法国', en:'PARIS', lat:48.86, lng:2.35,
      dates:'2025.10', stay:'10 天', memory:'蜂蜜色的黄昏，和走不完的巷子。', order:4 },
    { id:'ky', city:'京都', country:'日本', en:'KYOTO', lat:35.01, lng:135.77,
      dates:'计划中', stay:'—', memory:'想去看一次秋天的寺庙。', order:5 }
  ];

  const SITE = {
    owner:'琰琰',
    ownerEn:'YAN',
    title:'把日子收进光里',
    subtitle:'照片、文字、路过的城市，以及一些不想忘记的瞬间。',
    since:'2025'
  };

  return { FILTERS, FILTER_CATS, FRAMES, CATS, MOODS, PHOTOS, NOTES, PLACES, SITE };
})();
