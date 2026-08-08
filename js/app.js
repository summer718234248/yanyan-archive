/* ============================================================
   app.js · 页面渲染与交互
   ============================================================ */
(function () {
  const C = window.Core, S = window.SEED;
  const $ = C.$, $$ = C.$$;

  const cssFilter = (f, fx) => {
    const v = Object.assign({}, f, fx || {});
    return 'brightness(' + (v.b != null ? v.b : 1) + ') contrast(' + (v.c != null ? v.c : 1) + ') saturate(' + (v.s != null ? v.s : 1) +
      ') sepia(' + (v.sep || 0) + ') hue-rotate(' + (v.h || 0) + 'deg) grayscale(' + (v.g || 0) + ')';
  };

  /* ================= 首页 ================= */
  C.route('/home', home); C.route('/', home);
  function home(page) {
    const photos = C.DB.photos().filter(p => !p.draft);
    const notes = C.DB.notes().filter(n => n.status === 'published');
    const places = C.DB.places();
    const pick = id => photos.find(p => p.id === id) || photos[0];
    const heroPicks = [
      { p: pick('p1'),  pos: 'left:1%;top:3%;--w:33%;--d:.15s;--i:0',  tilt: -3,   depth: 1.1 },
      { p: pick('p10'), pos: 'right:3%;top:0;--w:29%;--d:.3s;--i:1',   tilt: 2.5,  depth: .8 },
      { p: pick('p2'),  pos: 'left:27%;top:33%;--w:36%;--d:.45s;--i:2', tilt: 1.5, depth: 1.3 },
      { p: pick('p4'),  pos: 'right:0;top:46%;--w:25%;--d:.6s;--i:3',  tilt: -2,   depth: 1 },
      { p: pick('p7'),  pos: 'left:0;top:55%;--w:24%;--d:.75s;--i:4',  tilt: 3,    depth: .9 }
    ];
    const latestNote = notes[0];
    page.innerHTML =
      '<div class="wrap hero">' +
      ' <div class="hero-copy">' +
      '  <span class="overline">Private Archive / 生活档案 · Since ' + S.SITE.since + '</span>' +
      '  <h1 class="display">把日子收进<em>光</em>里</h1>' +
      '  <p class="sub">' + S.SITE.subtitle + '</p>' +
      '  <div class="hero-meta">' +
      '   <div><b>' + photos.length + '</b><span>PHOTOS 照片</span></div>' +
      '   <div><b>' + notes.length + '</b><span>NOTES 笔记</span></div>' +
      '   <div><b>' + places.length + '</b><span>CITIES 城市</span></div>' +
      '  </div>' +
      '  <div class="hero-cta">' +
      '   <a class="btn solid" href="#/archive">进入我的生活档案</a>' +
      '   <a class="link" href="#/journal">读最近的笔记</a>' +
      '  </div>' +
      ' </div>' +
      ' <div class="hero-photos" id="heroPhotos">' +
      heroPicks.map(h => '<div class="hphoto" style="' + h.pos + '" data-depth="' + h.depth + '">' +
        C.photoFigure(Object.assign({}, h.p, { tilt: h.tilt }), { meta: false }) + '</div>').join('') +
      ' </div>' +
      ' <div class="scroll-cue">SCROLL</div>' +
      '</div>' +

      '<section class="home-sec wrap rv"><div class="sec-head"><span class="overline">Collected Moments / 最近的照片</span><a href="#/archive">全部照片 →</a></div>' +
      '<div class="strip">' + photos.slice(0, 7).map((p, i) => C.photoFigure(p, { tilt: (i % 2 ? 1.4 : -1.4) })).join('') + '</div></section>' +

      '<section class="home-sec wrap rv"><div class="sec-head"><span class="overline">Notes from ordinary days / 最近的笔记</span><a href="#/journal">全部笔记 →</a></div>' +
      '<div class="home-split">' +
      (latestNote ? '<article class="note-card"><span class="date">' + C.fmtDate(latestNote.date) + ' · ' + C.esc(latestNote.city) + '</span>' +
        '<h3>' + C.esc(latestNote.title) + '</h3><p>' + C.esc(latestNote.body.replace(/\[photo:[^\]]*\]/g, '').replace(/[\n>\[\]~*#]/g, ' ').replace(/\s+/g, ' ').slice(0, 110)) + '……</p>' +
        '<a class="more" href="#/note/' + latestNote.id + '">阅读全文</a></article>' : '') +
      ' <div class="city-stamps">' + places.slice(0, 4).map(pl =>
        '<a class="stamp-row" href="#/places"><span class="dot">' + C.esc(pl.city[0]) + '</span><span><b>' + C.esc(pl.city) + '</b><i>' + C.esc(pl.dates) + ' · ' + C.DB.photosOfCity(pl.city).length + ' PHOTOS</i></span></a>').join('') +
      ' </div></div></section>' +

      '<footer><div class="wrap"><span class="sig">用光与文字，收集普通的日子。 —— ' + S.SITE.owner + '</span>' +
      '<span class="mono">YAN\'S PRIVATE ARCHIVE · ' + new Date().getFullYear() + '</span></div></footer>';

    C.parallax($('#heroPhotos', page), $$('.hphoto', page));
  }

  /* ================= 照片档案 ================= */
  C.route('/archive', archive);
  const arState = { cat: 'all', year: 'all', q: '' };
  function archive(page) {
    const photos = C.DB.photos().filter(p => !p.draft);
    const years = Array.from(new Set(photos.map(p => p.date.slice(0, 4)))).sort().reverse();
    page.innerHTML =
      '<div class="wrap"><div class="page-head"><span class="overline">Photo Archive / 照片档案</span>' +
      '<h2 class="display">被收藏的瞬间</h2><p class="lede">每一张照片都是一件小藏品，带着它自己的相框、滤镜和那天的天气。</p></div>' +
      '<div class="filterbar">' +
      ' <div class="frow" id="catRow"><button class="chip on" data-cat="all">全部</button>' +
      S.CATS.map(c => '<button class="chip" data-cat="' + c.id + '">' + c.name + ' <span style="opacity:.5;font-size:10px">' + c.en + '</span></button>').join('') + '</div>' +
      ' <div class="frow"><span class="sep"></span><button class="chip on" data-year="all">所有年份</button>' +
      years.map(y => '<button class="chip" data-year="' + y + '">' + y + '</button>').join('') +
      ' <span class="sep"></span><div class="searchbox"><input class="inp" id="arSearch" placeholder="搜索标题、城市、标签…" aria-label="搜索照片">' + C.ICONS.search + '</div></div>' +
      '</div><div class="masonry" id="masonry"></div><div id="arEmpty"></div></div>';

    const render = () => {
      const list = photos.filter(p =>
        (arState.cat === 'all' || p.cat === arState.cat) &&
        (arState.year === 'all' || p.date.startsWith(arState.year)) &&
        (!arState.q || (p.title + p.city + p.desc + (p.tags || []).join('')).toLowerCase().includes(arState.q)));
      $('#masonry', page).innerHTML = list.map(p => C.photoFigure(p)).join('');
      $('#arEmpty', page).innerHTML = list.length ? '' :
        '<div class="empty"><span class="hand">这里还空着。</span><p>换个筛选条件，或者去工作台放入新的照片。</p><a class="btn small" href="#/studio">去上传照片</a></div>';
    };
    render();
    $('#catRow', page).addEventListener('click', e => {
      const b = e.target.closest('[data-cat]'); if (!b) return;
      arState.cat = b.dataset.cat;
      $$('#catRow .chip', page).forEach(x => x.classList.toggle('on', x === b)); render();
    });
    page.querySelector('.frow:nth-of-type(2)').addEventListener('click', e => {
      const b = e.target.closest('[data-year]'); if (!b) return;
      arState.year = b.dataset.year;
      $$('[data-year]', page).forEach(x => x.classList.toggle('on', x === b)); render();
    });
    $('#arSearch', page).addEventListener('input', e => { arState.q = e.target.value.trim().toLowerCase(); render(); });
  }

  /* ================= 照片详情 ================= */
  C.route('/photo/:id', photoDetail);
  function photoDetail(page, params) {
    const all = C.DB.photos().filter(p => !p.draft);
    const idx = all.findIndex(p => p.id === params.id);
    if (idx < 0) { page.innerHTML = '<div class="wrap"><div class="empty"><span class="hand">这张照片不在档案里。</span><p>它可能被移走了。</p><a class="btn small" href="#/archive">回到照片档案</a></div></div>'; return; }
    const p = all[idx];
    const cat = S.CATS.find(c => c.id === p.cat) || S.CATS[0];
    const rel = all.filter(x => x.id !== p.id && (x.city === p.city || x.cat === p.cat)).slice(0, 3);
    const prev = all[idx - 1], next = all[idx + 1];
    page.innerHTML =
      '<div class="wrap"><div class="photo-detail">' +
      ' <div class="pd-figure" id="pdFig">' + C.photoFigure(p, { meta: false, noLink: true }) + '</div>' +
      ' <div class="pd-side">' +
      '  <span class="overline">' + cat.en + ' / ' + cat.name + ' · NO.' + String(idx + 1).padStart(2, '0') + '</span>' +
      '  <h1>' + C.esc(p.title) + '</h1>' +
      '  <div class="pd-meta">' +
      '   <div><span>Date 日期</span><b>' + C.fmtDate(p.date) + '</b></div>' +
      '   <div><span>City 城市</span><b>' + C.esc(p.city) + '</b></div>' +
      '   <div><span>Place 地点</span><b>' + C.esc(p.place || '—') + '</b></div>' +
      '   <div><span>Mood 心情</span><b>' + C.esc(p.mood || '—') + '</b></div>' +
      '  </div>' +
      '  <p class="pd-desc">' + C.esc(p.desc || '') + '</p>' +
      '  <div class="tagrow">' + (p.tags || []).map(t => '<span class="chip"># ' + C.esc(t) + '</span>').join('') +
      (p.album ? '<span class="chip">相册 · ' + C.esc(p.album) + '</span>' : '') + '</div>' +
      '  <div class="pd-block"><h4>包装 / Packaging</h4><div class="frame-sw" id="frSw">' +
      S.FRAMES.map(f => '<button data-fr="' + f.id + '" class="' + (f.id === p.frame ? 'on' : '') + '">' + f.name + '</button>').join('') + '</div></div>' +
      '  <div class="pd-block"><h4>滤镜 / Filter</h4><p class="mono" style="margin:0">' + C.esc((S.FILTERS.find(f => f.id === p.filter) || {}).name || 'Original') + ' · ' + (p.visibility === 'private' ? '仅自己可见' : '公开') + '</p></div>' +
      (rel.length ? '<div class="pd-block"><h4>相关记录 / Related</h4><div class="rel-row">' +
        rel.map(r => '<a href="#/photo/' + r.id + '" title="' + C.esc(r.title) + '"><img src="' + r.src + '" alt="' + C.esc(r.title) + '" decoding="async"></a>').join('') + '</div></div>' : '') +
      '  <div class="pd-nav">' +
      (prev ? '<a class="btn small" href="#/photo/' + prev.id + '">← 前一张</a>' : '<span></span>') +
      (next ? '<a class="btn small" href="#/photo/' + next.id + '">后一张 →</a>' : '<span></span>') +
      '  </div></div></div></div>';

    $('#frSw', page).addEventListener('click', e => {
      const b = e.target.closest('[data-fr]'); if (!b) return;
      p.frame = b.dataset.fr; C.DB.editPhoto(p.id, { frame: p.frame });
      $$('#frSw button', page).forEach(x => x.classList.toggle('on', x === b));
      const fig = $('#pdFig', page);
      fig.innerHTML = C.photoFigure(p, { meta: false, noLink: true });
    });
    page._keys = (e) => {
      if (e.key === 'ArrowLeft' && prev) location.hash = '#/photo/' + prev.id;
      if (e.key === 'ArrowRight' && next) location.hash = '#/photo/' + next.id;
    };
    window.addEventListener('keydown', page._keys);
  }

  /* ================= 日记列表 ================= */
  C.route('/journal', journal);
  function journal(page) {
    const notes = C.DB.notes();
    const tags = Array.from(new Set(notes.flatMap(n => n.tags || []))).slice(0, 8);
    const st = { q: '', tag: '' };
    page.innerHTML =
      '<div class="wrap-narrow"><div class="page-head" style="display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap">' +
      '<div><span class="overline">Journal / 日记与笔记</span><h2 class="display">安静写下的日子</h2></div>' +
      '<a class="btn" href="#/edit/new">写新笔记</a></div>' +
      '<div class="filterbar"><div class="frow"><div class="searchbox" style="width:260px"><input class="inp" id="jSearch" placeholder="搜索笔记…" aria-label="搜索笔记">' + C.ICONS.search + '</div><span class="sep"></span>' +
      tags.map(t => '<button class="chip" data-tag="' + C.esc(t) + '">' + C.esc(t) + '</button>').join('') + '</div></div>' +
      '<div class="j-list" id="jList"></div></div>';
    const render = () => {
      const list = notes.filter(n => (!st.q || (n.title + n.body).toLowerCase().includes(st.q)) && (!st.tag || (n.tags || []).includes(st.tag)));
      $('#jList', page).innerHTML = list.length ? list.map(n =>
        '<a class="j-item" href="#/note/' + n.id + '">' +
        '<div class="j-date"><b>' + n.date.slice(8, 10) + '</b><span>' + n.date.slice(0, 7).replace('-', '.') + '</span></div>' +
        '<div class="j-main"><h3>' + C.esc(n.title) + '</h3><p>' + C.esc(n.body.replace(/\[photo:[^\]]*\]/g, '').replace(/[\n>\[\]~*#]/g, ' ').replace(/\s+/g, ' ').slice(0, 72)) + '…</p>' +
        '<div class="j-tags">' + (n.tags || []).map(t => '<i>' + C.esc(t) + '</i>').join('') + '</div></div>' +
        '<div class="j-side">' + (n.status === 'draft' ? '<span class="draft">草稿</span><br>' : '') + C.esc(n.city) + '<br>' + C.esc(n.mood || '') + '</div></a>').join('')
        : '<div class="empty"><span class="hand">还没有笔记。</span><p>写下第一页，日子就有了目录。</p><a class="btn small" href="#/edit/new">写新笔记</a></div>';
    };
    render();
    $('#jSearch', page).addEventListener('input', e => { st.q = e.target.value.trim().toLowerCase(); render(); });
    page.addEventListener('click', e => {
      const b = e.target.closest('[data-tag]'); if (!b) return;
      st.tag = st.tag === b.dataset.tag ? '' : b.dataset.tag;
      $$('[data-tag]', page).forEach(x => x.classList.toggle('on', x.dataset.tag === st.tag)); render();
    });
  }

  /* ================= 笔记详情 ================= */
  C.route('/note/:id', noteDetail);
  function noteDetail(page, params) {
    const n = C.DB.note(params.id);
    if (!n) { page.innerHTML = '<div class="wrap"><div class="empty"><span class="hand">这篇笔记不在。</span><a class="btn small" href="#/journal">回到日记</a></div></div>'; return; }
    const phs = (n.photos || []).map(id => C.DB.photo(id)).filter(Boolean);
    page.innerHTML =
      '<div class="wrap"><div class="note-page">' +
      '<aside class="note-meta">' +
      ' <div class="blk"><span>Date</span>' + C.fmtDate(n.date) + '</div>' +
      ' <div class="blk"><span>City</span>' + C.esc(n.city || '—') + '</div>' +
      ' <div class="blk"><span>Mood</span>' + C.esc(n.mood || '—') + '</div>' +
      ' <div class="blk"><span>Tags</span>' + (n.tags || []).map(t => '# ' + C.esc(t)).join(' ') + '</div>' +
      ' <div class="blk"><span>可见性</span>' + (n.visibility === 'private' ? '仅自己可见' : '公开') + (n.status === 'draft' ? ' · 草稿' : '') + '</div>' +
      ' <a class="btn small" href="#/edit/' + n.id + '">编辑</a>' +
      '</aside>' +
      '<article class="note-body"><span class="overline">Journal / 私人信件</span><h1>' + C.esc(n.title) + '</h1>' +
      C.renderBody(n.body, { photo: id => C.DB.photo(id) }) + '</article>' +
      '<aside class="note-photos">' + phs.map(p => C.photoFigure(p, { meta: false, tilt: 1.5 })).join('') + '</aside>' +
      '</div></div>';
  }

  /* ================= 笔记编辑器 ================= */
  C.route('/edit/:id', editor);
  function editor(page, params) {
    const isNew = params.id === 'new';
    const src = isNew ? null : C.DB.note(params.id);
    const n = src ? JSON.parse(JSON.stringify(src)) :
      { id: 'un' + Date.now(), title: '', date: new Date().toISOString().slice(0, 10), city: '上海', mood: '安静', tags: [], body: '', status: 'draft', visibility: 'private', photos: [] };
    let savedAt = null, timer = null;
    page.innerHTML =
      '<div class="wrap"><div class="editor">' +
      '<span class="overline">' + (isNew ? 'New Note / 新笔记' : 'Edit / 编辑笔记') + '</span>' +
      '<input class="title-inp" id="eTitle" placeholder="标题，比如：今天的风很轻。" value="' + C.esc(n.title) + '">' +
      '<div class="ed-meta">' +
      ' <label class="f"><span class="fl">Date 日期</span><input class="inp" type="date" id="eDate" value="' + n.date + '"></label>' +
      ' <label class="f"><span class="fl">City 城市</span><input class="inp" id="eCity" value="' + C.esc(n.city) + '"></label>' +
      ' <label class="f"><span class="fl">Mood 心情</span><select class="inp" id="eMood">' + S.MOODS.map(m => '<option' + (m === n.mood ? ' selected' : '') + '>' + m + '</option>').join('') + '</select></label>' +
      ' <label class="f"><span class="fl">Tags 标签（逗号分隔）</span><input class="inp" id="eTags" value="' + C.esc((n.tags || []).join('，')) + '"></label>' +
      ' <label class="f"><span class="fl">可见性</span><select class="inp" id="eVis"><option value="private"' + (n.visibility === 'private' ? ' selected' : '') + '>仅自己可见</option><option value="public"' + (n.visibility === 'public' ? ' selected' : '') + '>公开</option></select></label>' +
      '</div>' +
      '<div class="toolbar"><button class="btn small" id="tQuote">插入引文</button><button class="btn small" id="tHand">手写批注</button><button class="btn small" id="tPhoto">插入照片</button></div>' +
      '<textarea class="inp" id="eBody" placeholder="正文。支持：&#10;&gt; 引文&#10;~ 手写批注&#10;[photo:p1] 插入照片">' + C.esc(n.body) + '</textarea>' +
      '<div class="savebar"><button class="btn" id="eDraft">存为草稿</button><button class="btn solid" id="ePub">发布</button>' +
      (src ? '<button class="btn small" id="eDel" style="border-color:var(--cherry);color:var(--cherry)">删除</button>' : '') +
      '<span class="state" id="eState"></span></div></div></div>';

    const ta = $('#eBody', page);
    const collect = () => {
      n.title = $('#eTitle', page).value.trim() || '无题';
      n.date = $('#eDate', page).value || n.date;
      n.city = $('#eCity', page).value.trim();
      n.mood = $('#eMood', page).value;
      n.tags = $('#eTags', page).value.split(/[,，]/).map(s => s.trim()).filter(Boolean);
      n.visibility = $('#eVis', page).value;
      n.body = ta.value;
      const refs = [...n.body.matchAll(/\[photo:([^\]]+)\]/g)].map(m => m[1]);
      n.photos = Array.from(new Set(refs));
      return n;
    };
    const autosave = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        collect(); n.status = n.status === 'published' ? 'published' : 'draft';
        C.DB.saveNote(n); savedAt = new Date();
        $('#eState', page).textContent = '已自动保存 ' + savedAt.toTimeString().slice(0, 5);
      }, 800);
    };
    ['eTitle', 'eDate', 'eCity', 'eMood', 'eTags', 'eVis'].forEach(id => $('#' + id, page).addEventListener('input', autosave));
    ta.addEventListener('input', autosave);
    const insert = (txt) => {
      const s = ta.selectionStart, e = ta.selectionEnd;
      ta.value = ta.value.slice(0, s) + txt + ta.value.slice(e);
      ta.focus(); ta.selectionStart = ta.selectionEnd = s + txt.length;
      autosave();
    };
    $('#tQuote', page).onclick = () => insert('\n> ');
    $('#tHand', page).onclick = () => insert('\n~ ');
    $('#tPhoto', page).onclick = () => openPhotoPicker(ph => insert('\n[photo:' + ph.id + ']\n'));
    $('#eDraft', page).onclick = () => { collect(); n.status = 'draft'; C.DB.saveNote(n); C.toast('已存为草稿'); location.hash = '#/journal'; };
    $('#ePub', page).onclick = () => { collect(); n.status = 'published'; C.DB.saveNote(n); C.toast('已发布到日记'); location.hash = '#/note/' + n.id; };
    const del = $('#eDel', page);
    if (del) del.onclick = () => { if (confirm('删除这篇笔记？')) { C.DB.deleteNote(n.id); C.toast('已删除'); location.hash = '#/journal'; } };
  }

  function openPhotoPicker(onPick) {
    const photos = C.DB.photos().filter(p => !p.draft);
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(36,35,33,.45);z-index:140;display:grid;place-items:center;padding:20px';
    ov.innerHTML = '<div style="background:var(--warm-white);border-radius:16px;max-width:640px;width:100%;max-height:76vh;overflow:auto;padding:24px;box-shadow:var(--shadow-lift)">' +
      '<span class="overline">选择一张照片插入</span>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:12px;margin-top:16px">' +
      photos.map(p => '<button data-p="' + p.id + '" style="border:none;background:none;padding:0;cursor:pointer"><img src="' + p.src + '" alt="' + C.esc(p.title) + '" style="aspect-ratio:1;object-fit:cover;border-radius:8px;width:100%;box-shadow:var(--shadow-paper)"></button>').join('') +
      '</div></div>';
    ov.addEventListener('click', e => {
      const b = e.target.closest('[data-p]');
      if (b) { onPick(C.DB.photo(b.dataset.p)); ov.remove(); return; }
      if (e.target === ov) ov.remove();
    });
    const esc = e => { if (e.key === 'Escape') { ov.remove(); window.removeEventListener('keydown', esc); } };
    window.addEventListener('keydown', esc);
    document.body.appendChild(ov);
  }

  /* ================= 地点与旅行 ================= */
  C.route('/places', places);
  function places(page) {
    const P = C.DB.places();
    const proj = (lat, lng) => [60 + (lng + 10) / 155 * 800, 460 - (lat - 18) / 36 * 400];
    page.innerHTML =
      '<div class="wrap"><div class="page-head"><span class="overline">Places / 地点与旅行</span><h2 class="display">我去过的地方，和那些留下来的心情</h2></div>' +
      '<div class="view-toggle"><button id="vMap" class="on">地图视图</button><button id="vTl">时间线视图</button></div>' +
      '<div id="placeView"></div></div>';

    const view = $('#placeView', page);
    const ordered = P.slice().sort((a, b) => a.order - b.order);
    const routePts = ordered.map(pl => proj(pl.lat, pl.lng));

    function mapView() {
      view.innerHTML = '<div class="map-wrap"><div class="map-panel">' +
        '<span class="mtitle">Collected Cities · ' + P.length + '</span><span class="mlegend">PRIVATE ATLAS / 私人地图</span>' +
        '<svg viewBox="0 0 920 520" role="img" aria-label="去过的城市地图">' +
        Array.from({ length: 8 }, (_, i) => '<line x1="' + (60 + i * 114) + '" y1="40" x2="' + (60 + i * 114) + '" y2="480" stroke="rgba(36,35,33,.05)"/>').join('') +
        Array.from({ length: 5 }, (_, i) => '<line x1="40" y1="' + (60 + i * 100) + '" x2="880" y2="' + (60 + i * 100) + '" stroke="rgba(36,35,33,.05)"/>').join('') +
        '<polyline points="' + routePts.slice(0, 4).map(p => p.join(',')).join(' ') + '" fill="none" stroke="var(--cherry)" stroke-width="1.2" stroke-dasharray="1 7" stroke-linecap="round" opacity=".7"/>' +
        '<polyline points="' + routePts.slice(3).map(p => p.join(',')).join(' ') + '" fill="none" stroke="var(--brown)" stroke-width="1" stroke-dasharray="1 8" stroke-linecap="round" opacity=".4"/>' +
        ordered.map((pl, i) => {
          const [x, y] = routePts[i];
          const lx = pl.id === 'hz' ? x - 12 : x + 14;
          const ly = pl.id === 'hz' ? y + 26 : y + 6;
          const anch = pl.id === 'hz' ? 'end' : 'start';
          return '<g class="mk" data-pl="' + pl.id + '" tabindex="0" role="button" aria-label="' + C.esc(pl.city) + '">' +
            '<circle class="halo" cx="' + x + '" cy="' + y + '" r="7"/>' +
            '<circle class="core" cx="' + x + '" cy="' + y + '" r="5"/>' +
            '<text x="' + lx + '" y="' + ly + '" text-anchor="' + anch + '">' + C.esc(pl.city) + '</text></g>';
        }).join('') +
        '<g opacity=".55"><circle cx="866" cy="66" r="17" fill="none" stroke="var(--brown)"/><path d="M866 52v28M852 66h28" stroke="var(--brown)"/><text x="861" y="48" style="font:10px var(--mono);fill:var(--brown)">N</text></g>' +
        '</svg></div><div id="placeCard"></div></div>';
      const show = (id) => {
        const pl = P.find(x => x.id === id);
        const phs = C.DB.photosOfCity(pl.city);
        const nts = C.DB.notesOfCity(pl.city);
        $$('.mk', view).forEach(g => g.classList.toggle('on', g.dataset.pl === id));
        $('#placeCard', view).innerHTML = '<div class="place-card">' +
          '<span class="overline">' + C.esc(pl.en) + ' / ' + C.esc(pl.country) + '</span><h3>' + C.esc(pl.city) + '</h3>' +
          '<div class="mem">“' + C.esc(pl.memory) + '”</div>' +
          '<div class="stats"><div><b>' + phs.length + '</b><span>PHOTOS</span></div><div><b>' + nts.length + '</b><span>NOTES</span></div><div><b>' + C.esc(pl.stay) + '</b><span>STAY</span></div></div>' +
          (phs.length ? '<div class="phs">' + phs.slice(0, 4).map(p => '<a href="#/photo/' + p.id + '"><img src="' + p.src + '" alt="' + C.esc(p.title) + '"></a>').join('') + '</div>'
            : '<p class="mono" style="margin:6px 0">相册整理中 · COMING SOON</p>') +
          (nts.length ? '<div style="margin-top:16px">' + nts.map(n => '<a class="link" style="display:block;font-size:12px;letter-spacing:.1em;color:var(--brown);padding:6px 0;border-bottom:1px dashed var(--line-soft)" href="#/note/' + n.id + '">✎ ' + C.esc(n.title) + '</a>').join('') + '</div>' : '') +
          '<p class="mono" style="margin-top:14px">' + C.esc(pl.dates) + '</p></div>';
      };
      view.addEventListener('click', e => { const g = e.target.closest('.mk'); if (g) show(g.dataset.pl); });
      show('pa');
    }

    function tlView() {
      const groups = {};
      ordered.forEach(pl => {
        const y = pl.dates.match(/\d{4}/) ? pl.dates.match(/\d{4}/)[0] : '计划中';
        (groups[y] = groups[y] || []).push(pl);
      });
      view.innerHTML = '<div class="wrap-narrow"><div class="tl">' + Object.keys(groups).sort().reverse().map(y =>
        '<div class="tl-year rv">' + y + '</div>' + groups[y].map(pl => {
          const phs = C.DB.photosOfCity(pl.city);
          return '<div class="tl-item rv"><span class="when">' + C.esc(pl.dates) + ' · ' + C.esc(pl.country) + '</span>' +
            '<h3>' + C.esc(pl.city) + '</h3><p class="mem">' + C.esc(pl.memory) + '</p>' +
            (phs.length ? '<div class="phs">' + phs.slice(0, 3).map(p => '<a href="#/photo/' + p.id + '"><img src="' + p.src + '" alt="' + C.esc(p.title) + '" decoding="async"></a>').join('') + '</div>' : '') +
            '</div>';
        }).join('')).join('') + '</div></div>';
      C.watchReveal(view);
    }

    mapView();
    $('#vMap', page).onclick = () => { $('#vMap', page).classList.add('on'); $('#vTl', page).classList.remove('on'); mapView(); };
    $('#vTl', page).onclick = () => { $('#vTl', page).classList.add('on'); $('#vMap', page).classList.remove('on'); tlView(); };
  }

  /* ================= 上传工作台 ================= */
  C.route('/studio', studio);
  function studio(page) {
    const uploads = [];
    let sel = null;
    const undoStacks = {};

    page.innerHTML =
      '<div class="wrap"><div class="page-head"><span class="overline">Upload Studio / 上传工作台</span><h2 class="display">照片编辑工作室</h2>' +
      '<p class="lede">把照片放进来，选一个相框、一种滤镜，像整理桌面一样整理记忆。</p></div>' +
      '<div class="studio">' +
      ' <div><div class="dropzone" id="dz" tabindex="0" role="button" aria-label="上传照片"><span class="hand">把照片拖进来</span>或点击选择文件 · 支持多张</div>' +
      ' <input type="file" id="file" accept="image/*" multiple hidden>' +
      ' <div class="filmstrip" id="fs"></div></div>' +
      ' <div class="st-preview" id="pv"><div class="hint">暗房准备就绪。<br>先放一张照片进来吧。</div><span class="compare-hint">按住“对比”可查看原图</span></div>' +
      ' <div class="st-panel"><div class="st-tabs"><button data-t="info" class="on">信息</button><button data-t="deco">装饰</button><button data-t="filter">滤镜</button></div>' +
      '  <div id="tabInfo"></div><div id="tabDeco" hidden></div><div id="tabFilter" hidden></div></div>' +
      '</div></div>';

    const dz = $('#dz', page), file = $('#file', page);
    dz.onclick = () => file.click();
    dz.onkeydown = e => { if (e.key === 'Enter') file.click(); };
    ['dragover', 'dragenter'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('drag'); }));
    ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove('drag'); }));
    dz.addEventListener('drop', e => handleFiles(e.dataTransfer.files));
    file.onchange = () => handleFiles(file.files);

    function handleFiles(files) {
      Array.from(files).forEach(f => {
        if (!f.type.startsWith('image/')) { C.toast('只支持图片文件哦'); return; }
        const rd = new FileReader();
        rd.onload = () => {
          const img = new Image();
          img.onload = () => {
            const cv = document.createElement('canvas');
            const k = Math.min(1, 1400 / Math.max(img.width, img.height));
            cv.width = img.width * k; cv.height = img.height * k;
            cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
            const u = {
              id: 'u' + Date.now() + Math.floor(Math.random() * 999), src: cv.toDataURL('image/jpeg', .82),
              title: f.name.replace(/\.[^.]+$/, ''), date: new Date().toISOString().slice(0, 10),
              city: '上海', place: '', desc: '', tags: '', mood: '安静', cat: 'daily', album: '',
              visibility: 'public', draft: false, frame: 'fr-polaroid', filter: null, fx: {}, intensity: .85, tilt: 0
            };
            uploads.push(u); sel = u; renderStrip(); renderPreview(); renderTabs();
            C.toast('照片已放入工作台');
          };
          img.src = rd.result;
        };
        rd.readAsDataURL(f);
      });
    }

    function renderStrip() {
      $('#fs', page).innerHTML = uploads.map(u =>
        '<div class="fs-item' + (u === sel ? ' on' : '') + '" data-id="' + u.id + '"><img src="' + u.src + '" alt="">' +
        '<span><b>' + C.esc(u.title || '未命名') + '</b><i>' + (u.draft ? '草稿 · ' : '') + C.fmtMY(u.date) + '</i></span>' +
        '<button class="rm" data-rm="' + u.id + '" aria-label="移除">×</button></div>').join('');
      $$('.fs-item', page).forEach(el => {
        el.onclick = e => {
          if (e.target.closest('.rm')) {
            const i = uploads.findIndex(x => x.id === e.target.closest('.rm').dataset.rm);
            if (i >= 0) uploads.splice(i, 1);
            if (sel && sel.id === e.target.closest('.rm').dataset.rm) sel = uploads[0] || null;
            renderStrip(); renderPreview(); renderTabs(); return;
          }
          sel = uploads.find(x => x.id === el.dataset.id); renderStrip(); renderPreview(); renderTabs();
        };
      });
    }

    function pushUndo() {
      if (!sel) return;
      (undoStacks[sel.id] = undoStacks[sel.id] || { past: [], future: [] }).past.push(JSON.stringify({ fx: sel.fx, filter: sel.filter, intensity: sel.intensity, frame: sel.frame, tilt: sel.tilt }));
    }
    function undo() {
      const st = undoStacks[sel.id]; if (!st || !st.past.length) return;
      st.future.push(JSON.stringify({ fx: sel.fx, filter: sel.filter, intensity: sel.intensity, frame: sel.frame, tilt: sel.tilt }));
      Object.assign(sel, JSON.parse(st.past.pop())); renderPreview(); renderTabs();
    }
    function redo() {
      const st = undoStacks[sel.id]; if (!st || !st.future.length) return;
      st.past.push(JSON.stringify({ fx: sel.fx, filter: sel.filter, intensity: sel.intensity, frame: sel.frame, tilt: sel.tilt }));
      Object.assign(sel, JSON.parse(st.future.pop())); renderPreview(); renderTabs();
    }

    function renderPreview() {
      const pv = $('#pv', page);
      if (!sel) { pv.innerHTML = '<div class="hint">暗房准备就绪。<br>先放一张照片进来吧。</div>'; return; }
      const f = sel.filter ? C.filterOf(sel.filter) : null;
      const vars = f ? C.varsStyle(C.filterVars(f, sel.fx)) : C.varsStyle(C.filterVars({ id: 'x' }, sel.fx));
      pv.innerHTML = '<figure class="pcard ' + sel.frame + '" style="--tilt:' + sel.tilt + 'deg;' + vars + '">' +
        '<span class="pimg"><img src="' + sel.src + '" alt="预览">' +
        (f ? '<img class="fx" src="' + sel.src + '" alt="" style="filter:' + cssFilter(f, sel.fx) + ';opacity:' + sel.intensity + '">' : '') +
        '<span class="lay grain"></span><span class="lay vig"></span><span class="lay leak"></span></span>' +
        (sel.frame === 'fr-polaroid' ? '<figcaption class="fcap">' + C.esc(sel.title || 'untitled') + '</figcaption>' : '') +
        '</figure>';
    }

    function renderTabs() {
      if (!sel) { ['tabInfo', 'tabDeco', 'tabFilter'].forEach(id => $('#' + id, page).innerHTML = '<p class="mono">先上传一张照片。</p>'); return; }
      /* 信息 */
      $('#tabInfo', page).innerHTML =
        '<label class="f"><span class="fl">Title 标题</span><input class="inp" data-k="title" value="' + C.esc(sel.title) + '"></label>' +
        '<label class="f"><span class="fl">Date 日期</span><input class="inp" type="date" data-k="date" value="' + sel.date + '"></label>' +
        '<label class="f"><span class="fl">City 城市</span><input class="inp" data-k="city" value="' + C.esc(sel.city) + '"></label>' +
        '<label class="f"><span class="fl">Place 地点</span><input class="inp" data-k="place" value="' + C.esc(sel.place) + '"></label>' +
        '<label class="f"><span class="fl">描述</span><textarea class="inp" data-k="desc" style="min-height:80px">' + C.esc(sel.desc) + '</textarea></label>' +
        '<label class="f"><span class="fl">Tags（逗号分隔）</span><input class="inp" data-k="tags" value="' + C.esc(sel.tags) + '"></label>' +
        '<label class="f"><span class="fl">心情</span><select class="inp" data-k="mood">' + S.MOODS.map(m => '<option' + (m === sel.mood ? ' selected' : '') + '>' + m + '</option>').join('') + '</select></label>' +
        '<label class="f"><span class="fl">类型</span><select class="inp" data-k="cat">' + S.CATS.map(c => '<option value="' + c.id + '"' + (c.id === sel.cat ? ' selected' : '') + '>' + c.name + '</option>').join('') + '</select></label>' +
        '<label class="f"><span class="fl">相册</span><input class="inp" data-k="album" value="' + C.esc(sel.album) + '" placeholder="比如：夏天 2026"></label>' +
        '<label class="f"><span class="fl">可见性</span><select class="inp" data-k="visibility"><option value="public"' + (sel.visibility === 'public' ? ' selected' : '') + '>公开</option><option value="private"' + (sel.visibility === 'private' ? ' selected' : '') + '>仅自己可见</option></select></label>' +
        '<div class="btnrow"><button class="btn solid" id="pub">发布到档案</button><button class="btn" id="draft">存为草稿</button></div>' +
        '<div class="btnrow"><button class="btn small" id="undoB">撤销</button><button class="btn small" id="redoB">重做</button><button class="btn small" id="resetB">恢复原图</button><button class="btn small" id="cmpB">按住对比</button></div>';
      $$('[data-k]', $('#tabInfo', page)).forEach(el => el.addEventListener('input', () => {
        sel[el.dataset.k] = el.value; if (el.dataset.k === 'title' || el.dataset.k === 'cat') { renderStrip(); renderPreview(); }
      }));
      $('#pub', page).onclick = () => save(false);
      $('#draft', page).onclick = () => save(true);
      $('#undoB', page).onclick = undo; $('#redoB', page).onclick = redo;
      $('#resetB', page).onclick = () => { pushUndo(); sel.fx = {}; sel.filter = null; sel.intensity = .85; renderPreview(); renderTabs(); };
      const cmp = $('#cmpB', page);
      const hide = () => { const fx = $('.pimg .fx', page); const lays = $$('.pimg .lay', page); if (fx) fx.style.opacity = 0; lays.forEach(l => l.style.opacity = 0); };
      const show = () => { renderPreview(); };
      cmp.addEventListener('mousedown', hide); cmp.addEventListener('mouseup', show); cmp.addEventListener('mouseleave', show);
      cmp.addEventListener('touchstart', e => { e.preventDefault(); hide(); }); cmp.addEventListener('touchend', show);

      /* 装饰 */
      $('#tabDeco', page).innerHTML =
        '<div class="frame-sw" id="frPick">' + S.FRAMES.map(f => '<button data-fr="' + f.id + '" class="' + (f.id === sel.frame ? 'on' : '') + '">' + f.name + '</button>').join('') + '</div>' +
        '<div class="slider"><label><span>旋转角度 TILT</span><span>' + sel.tilt + '°</span></label><input type="range" min="-6" max="6" step=".5" value="' + sel.tilt + '" id="tiltR"></div>' +
        '<div class="btnrow"><button class="btn small" id="randB">一键随机搭配</button><button class="btn small" id="tplSave">保存为模板</button></div>' +
        (C.DB.templates().length ? '<h4 style="font-family:var(--mono);font-size:10px;letter-spacing:.2em;color:var(--brown)">我的模板</h4><div class="btnrow">' + C.DB.templates().map((t, i) => '<button class="chip" data-tpl="' + i + '">' + C.esc(t.name) + '</button>').join('') + '</div>' : '');
      $('#frPick', page).addEventListener('click', e => {
        const b = e.target.closest('[data-fr]'); if (!b) return;
        pushUndo(); sel.frame = b.dataset.fr;
        $$('#frPick button', page).forEach(x => x.classList.toggle('on', x === b)); renderPreview();
      });
      $('#tiltR', page).addEventListener('input', e => { sel.tilt = parseFloat(e.target.value); e.target.previousElementSibling.lastElementChild.textContent = sel.tilt + '°'; renderPreview(); });
      $('#randB', page).onclick = () => {
        pushUndo();
        sel.frame = S.FRAMES[Math.floor(Math.random() * S.FRAMES.length)].id;
        const rec = S.FILTERS.filter(f => f.cat === sel.cat || f.cat === 'travel');
        sel.filter = rec[Math.floor(Math.random() * rec.length)].id;
        sel.tilt = Math.round((Math.random() * 6 - 3) * 2) / 2; sel.fx = {};
        renderPreview(); renderTabs(); C.toast('换了一种感觉');
      };
      $('#tplSave', page).onclick = () => {
        const name = prompt('模板名字：', '我的搭配 ' + (C.DB.templates().length + 1));
        if (!name) return;
        C.DB.addTemplate({ name, frame: sel.frame, filter: sel.filter, tilt: sel.tilt });
        C.toast('模板已保存'); renderTabs();
      };
      $$('[data-tpl]', $('#tabDeco', page)).forEach(b => b.onclick = () => {
        const t = C.DB.templates()[+b.dataset.tpl]; pushUndo();
        sel.frame = t.frame; sel.filter = t.filter; sel.tilt = t.tilt; renderPreview(); renderTabs();
      });

      /* 滤镜 */
      const recCat = sel.cat === 'cafe' ? 'cafe' : sel.cat === 'travel' ? 'travel' : sel.cat === 'night' ? 'night' : sel.cat === 'street' ? 'street' : sel.cat === 'nature' ? 'nature' : 'portrait';
      const rec = S.FILTERS.filter(f => f.cat === recCat);
      $('#tabFilter', page).innerHTML =
        '<p class="mono" style="margin:0 0 8px">为「' + (S.CATS.find(c => c.id === sel.cat) || {}).name + '」推荐</p>' +
        '<div class="fgrid">' + rec.map(f => fThumb(f)).join('') + '</div>' +
        '<p class="mono" style="margin:14px 0 8px">全部滤镜</p>' +
        '<div class="fgrid">' + S.FILTERS.filter(f => f.cat !== recCat).map(f => fThumb(f)).join('') + '</div>' +
        '<div class="slider"><label><span>强度 INTENSITY</span><span>' + Math.round(sel.intensity * 100) + '%</span></label><input type="range" min="0" max="1" step=".05" value="' + sel.intensity + '" id="intR"></div>' +
        '<div class="slider"><label><span>亮度 BRIGHT</span><span>' + (sel.fx.b != null ? sel.fx.b : 1) + '</span></label><input type="range" min=".7" max="1.3" step=".02" value="' + (sel.fx.b != null ? sel.fx.b : 1) + '" data-fx="b"></div>' +
        '<div class="slider"><label><span>对比 CONTRAST</span><span>' + (sel.fx.c != null ? sel.fx.c : 1) + '</span></label><input type="range" min=".7" max="1.3" step=".02" value="' + (sel.fx.c != null ? sel.fx.c : 1) + '" data-fx="c"></div>' +
        '<div class="slider"><label><span>饱和 SATURATE</span><span>' + (sel.fx.s != null ? sel.fx.s : 1) + '</span></label><input type="range" min="0" max="1.6" step=".05" value="' + (sel.fx.s != null ? sel.fx.s : 1) + '" data-fx="s"></div>' +
        '<div class="slider"><label><span>暖调 WARMTH</span><span>' + (sel.fx.sep != null ? sel.fx.sep : 0) + '</span></label><input type="range" min="0" max=".6" step=".02" value="' + (sel.fx.sep != null ? sel.fx.sep : (C.filterOf(sel.filter || 'soft-portrait').sep || 0)) + '" data-fx="sep"></div>' +
        '<div class="slider"><label><span>颗粒 GRAIN</span><span>' + (sel.fx.grain != null ? sel.fx.grain : 0) + '</span></label><input type="range" min="0" max=".6" step=".02" value="' + (sel.fx.grain != null ? sel.fx.grain : 0) + '" data-fx="grain"></div>' +
        '<div class="slider"><label><span>暗角 VIGNETTE</span><span>' + (sel.fx.vig != null ? sel.fx.vig : 0) + '</span></label><input type="range" min="0" max=".6" step=".02" value="' + (sel.fx.vig != null ? sel.fx.vig : 0) + '" data-fx="vig"></div>' +
        '<div class="btnrow"><button class="btn small" id="preSave">保存为预设</button></div>' +
        (C.DB.presets().length ? '<div class="btnrow">' + C.DB.presets().map((p, i) => '<button class="chip" data-pre="' + i + '">' + C.esc(p.name) + '</button>').join('') + '</div>' : '');
      function fThumb(f) {
        return '<button data-f="' + f.id + '" class="' + (f.id === sel.filter ? 'on' : '') + '"><img src="' + sel.src + '" style="filter:' + cssFilter(f) + '" alt=""><span>' + f.name + '</span></button>';
      }
      $('#tabFilter', page).addEventListener('click', e => {
        const b = e.target.closest('[data-f]'); if (!b) return;
        pushUndo(); sel.filter = b.dataset.f; sel.fx = {};
        renderPreview(); renderTabs();
      });
      $('#intR', page).addEventListener('input', e => { sel.intensity = parseFloat(e.target.value); e.target.previousElementSibling.lastElementChild.textContent = Math.round(sel.intensity * 100) + '%'; renderPreview(); });
      $$('[data-fx]', $('#tabFilter', page)).forEach(r => r.addEventListener('input', e => {
        pushUndoThrottled(); sel.fx[r.dataset.fx] = parseFloat(r.value);
        r.previousElementSibling.lastElementChild.textContent = r.value; renderPreview();
      }));
      let pt = null;
      function pushUndoThrottled() { clearTimeout(pt); pt = setTimeout(pushUndo, 500); }
      $('#preSave', page).onclick = () => {
        const name = prompt('预设名字：', (C.filterOf(sel.filter || 'soft-portrait').name) + ' 改');
        if (!name) return;
        C.DB.addPreset({ name, filter: sel.filter, fx: Object.assign({}, sel.fx) });
        C.toast('预设已保存');
      };
      $$('[data-pre]', $('#tabFilter', page)).forEach(b => b.onclick = () => {
        const p = C.DB.presets()[+b.dataset.pre]; pushUndo();
        sel.filter = p.filter; sel.fx = Object.assign({}, p.fx); renderPreview(); renderTabs();
      });
    }

    let pushed = false;
    function save(asDraft) {
      if (!sel) return;
      sel.draft = asDraft;
      const photo = {
        id: sel.id, src: sel.src, title: sel.title || '未命名', date: sel.date, city: sel.city, place: sel.place,
        desc: sel.desc, tags: String(sel.tags).split(/[,，]/).map(s => s.trim()).filter(Boolean),
        mood: sel.mood, cat: sel.cat, album: sel.album, visibility: sel.visibility, draft: asDraft,
        frame: sel.frame, filter: sel.filter, fx: sel.fx, tilt: sel.tilt
      };
      C.DB.addPhoto(photo);
      const i = uploads.indexOf(sel); if (i >= 0) uploads.splice(i, 1); sel = uploads[0] || null;
      renderStrip(); renderPreview(); renderTabs();
      if (!asDraft) flyArchive();
      C.toast(asDraft ? '已存为草稿' : '已放入档案盒');
    }
    function flyArchive() {
      const img = $('.pimg img', page);
      const target = $('#topnav a[href="#/archive"]') || $('.brand');
      if (!img || !target) return;
      const a = img.getBoundingClientRect(), b = target.getBoundingClientRect();
      const fl = document.createElement('img');
      fl.src = img.src; fl.className = 'fly';
      fl.style.cssText += 'left:' + a.left + 'px;top:' + a.top + 'px;width:' + a.width + 'px;height:' + a.height + 'px;object-fit:cover';
      document.body.appendChild(fl);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        fl.style.left = b.left + b.width / 2 - 14 + 'px'; fl.style.top = b.top + b.height / 2 - 14 + 'px';
        fl.style.width = '28px'; fl.style.height = '28px'; fl.style.opacity = '.2'; fl.style.borderRadius = '50%';
      }));
      setTimeout(() => fl.remove(), 900);
    }

    page.querySelector('.st-tabs').addEventListener('click', e => {
      const b = e.target.closest('[data-t]'); if (!b) return;
      $$('.st-tabs button', page).forEach(x => x.classList.toggle('on', x === b));
      ['info', 'deco', 'filter'].forEach(t => $('#tab' + t[0].toUpperCase() + t.slice(1), page).hidden = t !== b.dataset.t);
    });
  }

  /* 启动 */
  window.addEventListener('hashchange', () => { cleanup(); C.navigate(); });
  function cleanup() {
    const old = $('#app .page');
    if (old && old._keys) window.removeEventListener('keydown', old._keys);
  }
  window.addEventListener('scroll', () => $('#topbar').classList.toggle('scrolled', scrollY > 8), { passive: true });
  C.navigate();
})();
