/* ============================================================
   core.js · 数据层 / 路由 / 通用组件
   存储为 LOCAL_ONLY（localStorage），接口预留 NEED_BACKEND：
   将 Store 的实现替换为 Supabase / Firebase 适配器即可上云。
   ============================================================ */
window.Core = (function () {
  const S = window.SEED;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  /* ---------------- 本地存储（LOCAL_ONLY） ---------------- */
  const KEY = 'yanyan-archive-v1';
  let db = { userPhotos: [], userNotes: [], noteEdits: {}, photoEdits: {}, presets: [], templates: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) db = Object.assign(db, JSON.parse(raw));
  } catch (e) { /* 隐私模式等场景下静默降级为内存态 */ }

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); return true; }
    catch (e) { toast('本地空间不足，照片仅保存在本次会话'); return false; }
  }

  /* ---------------- 数据 API（NEED_BACKEND：替换为远程实现） ---------------- */
  const DB = {
    photos() {
      const seeded = S.PHOTOS.map(p => Object.assign({}, p, db.photoEdits[p.id] || {}));
      return db.userPhotos.concat(seeded);
    },
    photo(id) { return this.photos().find(p => p.id === id); },
    addPhoto(p) { db.userPhotos.unshift(p); persist(); },
    removePhoto(id) { db.userPhotos = db.userPhotos.filter(p => p.id !== id); persist(); },
    editPhoto(id, patch) {
      if (db.userPhotos.some(p => p.id === id)) {
        const p = db.userPhotos.find(p => p.id === id); Object.assign(p, patch);
      } else { db.photoEdits[id] = Object.assign(db.photoEdits[id] || {}, patch); }
      persist();
    },
    notes() {
      const seeded = S.NOTES.map(n => Object.assign({}, n, db.noteEdits[n.id] || {}));
      return db.userNotes.concat(seeded).sort((a, b) => b.date.localeCompare(a.date));
    },
    note(id) { return this.notes().find(n => n.id === id); },
    saveNote(n) {
      if (S.NOTES.some(s => s.id === n.id)) { db.noteEdits[n.id] = n; }
      else {
        const i = db.userNotes.findIndex(x => x.id === n.id);
        i >= 0 ? db.userNotes[i] = n : db.userNotes.unshift(n);
      }
      persist();
    },
    deleteNote(id) { db.userNotes = db.userNotes.filter(n => n.id !== id); delete db.noteEdits[id]; persist(); },
    places() { return S.PLACES; },
    presets() { return db.presets; },
    addPreset(p) { db.presets.unshift(p); db.presets = db.presets.slice(0, 12); persist(); },
    templates() { return db.templates; },
    addTemplate(t) { db.templates.unshift(t); db.templates = db.templates.slice(0, 12); persist(); },
    photosOfCity(city) { return this.photos().filter(p => p.city === city); },
    notesOfCity(city) { return this.notes().filter(n => n.city === city && n.status === 'published'); }
  };

  /* ---------------- 滤镜 / 相框 工具 ---------------- */
  const filterOf = (id) => S.FILTERS.find(f => f.id === id) || S.FILTERS[0];
  function filterVars(f, extra) {
    const v = Object.assign({}, f, extra || {});
    return {
      '--fb': v.b != null ? v.b : 1, '--fc': v.c != null ? v.c : 1, '--fs': v.s != null ? v.s : 1,
      '--fsep': v.sep || 0, '--fh': (v.h || 0) + 'deg', '--fgr': v.g || 0,
      '--grain': v.grain || 0, '--vig': v.vig || 0, '--leak': v.leak || 0
    };
  }
  function varsStyle(obj) {
    return Object.keys(obj).map(k => k + ':' + obj[k]).join(';');
  }

  /* ---------------- 照片组件 ---------------- */
  function photoFigure(p, opts) {
    opts = opts || {};
    const f = filterOf(p.filter);
    const tilt = p.tilt != null ? p.tilt : (opts.tilt != null ? opts.tilt : 0);
    const cap = (p.frame === 'fr-polaroid' || p.frame === 'fr-label')
      ? '<figcaption class="fcap">' + (p.frame === 'fr-label'
          ? '<span>NO.' + p.id.replace(/\D/g, '').padStart(2, '0') + ' / ' + esc(p.city) + '</span><span>' + p.date.slice(0, 7).replace('-', '.') + '</span>'
          : esc(p.title)) + '</figcaption>'
      : '';
    const meta = opts.meta === false ? '' :
      '<span class="pmeta"><b>' + esc(p.title) + '</b><i>' + p.date.slice(0, 7).replace('-', '.') + ' · ' + esc(p.city) + '</i></span>';
    const href = opts.noLink ? 'javascript:void(0)' : '#/photo/' + p.id;
    return '<figure class="pcard ' + p.frame + '" style="--tilt:' + tilt + 'deg;' + varsStyle(filterVars(f, p.fx)) + '"' +
      (opts.style ? ' style="' + opts.style + '"' : '') + ' data-id="' + p.id + '">' +
      '<a class="plink" href="' + href + '" aria-label="' + esc(p.title) + '，查看照片详情">' +
      '<span class="pimg"><img loading="lazy" src="' + p.src + '" alt="' + esc(p.title) + '，拍摄于' + esc(p.city) + '" ' +
      'onload="this.classList.add(\'ld\')" onerror="this.parentNode.innerHTML=\'<span class=ph-miss>照片暂时走丢了</span>\'">' +
      '<span class="lay grain"></span><span class="lay vig"></span><span class="lay leak"></span></span>' + cap + '</a>' + meta + '</figure>';
  }

  /* ---------------- 小工具 ---------------- */
  function fmtDate(d) {
    const [y, m, day] = d.split('-');
    return y + '.' + m + '.' + day;
  }
  function fmtMY(d) { return d.slice(0, 7).replace('-', '.'); }

  const ICONS = {
    home: '<svg viewBox="0 0 24 24"><path d="M4 11l8-7 8 7v9h-5v-6h-6v6H4z"/></svg>',
    grid: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="9"/><rect x="13" y="4" width="7" height="5"/><rect x="13" y="11" width="7" height="9"/><rect x="4" y="15" width="7" height="5"/></svg>',
    pen: '<svg viewBox="0 0 24 24"><path d="M4 20l1-4L16 5l3 3L8 19l-4 1z"/><path d="M14 7l3 3"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    studio: '<svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7l2-3h4l2 3"/><circle cx="12" cy="13" r="3.5"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l6 6"/></svg>',
    arrowL: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    arrowR: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>'
  };

  function toast(msg) {
    const box = $('#toasts');
    const t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg;
    box.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, 2400);
  }

  /* ---------------- 滚动显现 ---------------- */
  let io;
  function watchReveal(root) {
    if (!io) io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: .12 });
    $$('.rv', root || document).forEach(el => io.observe(el));
  }

  /* ---------------- 路由 ---------------- */
  const routes = [];
  function route(pattern, fn) { routes.push({ pattern, fn }); }
  function match(hash) {
    const path = hash.replace(/^#/, '') || '/home';
    for (const r of routes) {
      const keys = [];
      const re = new RegExp('^' + r.pattern.replace(/:[^/]+/g, m => { keys.push(m.slice(1)); return '([^/]+)'; }) + '$');
      const m = path.match(re);
      if (m) { const params = {}; keys.forEach((k, i) => params[k] = m[i + 1]); return { fn: r.fn, params }; }
    }
    return null;
  }

  let currentRender = null;
  function navigate() {
    const app = $('#app');
    const hit = match(location.hash) || match('/home');
    const doRender = () => {
      currentRender = hit;
      app.innerHTML = '';
      const page = document.createElement('div');
      page.className = 'page';
      app.appendChild(page);
      hit.fn(page, hit.params);
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
      watchReveal(page);
      syncNav();
    };
    const old = $('.page');
    if (old) { old.classList.add('leaving'); setTimeout(doRender, 170); } else doRender();
  }

  function syncNav() {
    const seg = (location.hash || '#/home').replace('#/', '').split('/')[0] || 'home';
    $$('#topnav a, #mobilenav a').forEach(a =>
      a.classList.toggle('on', a.dataset.nav === seg));
  }

  /* ---------------- 视差（仅桌面、尊重低动效） ---------------- */
  function parallax(container, items) {
    const ok = matchMedia('(hover:hover) and (pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!ok) return;
    container.addEventListener('mousemove', e => {
      const r = container.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      items.forEach(el => {
        const d = parseFloat(el.dataset.depth || 1);
        el.style.translate = (x * -14 * d) + 'px ' + (y * -10 * d) + 'px';
      });
    });
    container.addEventListener('mouseleave', () => items.forEach(el => el.style.translate = '0px 0px'));
  }

  /* markdown-lite 渲染 */
  function renderBody(text, ctx) {
    const lines = esc(text).split(/\n/);
    let html = '', open = false;
    const closeP = () => { if (open) { html += '</p>'; open = false; } };
    for (const ln of lines) {
      const l = ln.trim();
      if (!l) { closeP(); continue; }
      if (l.startsWith('&gt; ')) { closeP(); html += '<blockquote>' + inline(l.slice(5)) + '</blockquote>'; continue; }
      if (l.startsWith('~ ')) { closeP(); html += '<div class="handnote">' + inline(l.slice(2)) + '</div>'; continue; }
      if (l.startsWith('## ')) { closeP(); html += '<h3 class="display">' + inline(l.slice(3)) + '</h3>'; continue; }
      const pm = l.match(/^\[photo:([^\]]+)\]$/);
      if (pm) {
        closeP();
        const p = ctx && ctx.photo(pm[1]);
        if (p) html += photoFigure(Object.assign({}, p, { frame: 'fr-tape', tilt: (html.length % 2 ? -1.5 : 1.5) }), { meta: false });
        continue;
      }
      if (!open) { html += '<p>'; open = true; }
      else html += '<br>';
      html += inline(l);
    }
    closeP();
    return html;
    function inline(s) {
      return s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
    }
  }

  return { $, $$, esc, DB, filterOf, filterVars, varsStyle, photoFigure, fmtDate, fmtMY, ICONS, toast, watchReveal, route, navigate, parallax, renderBody, persist };
})();
