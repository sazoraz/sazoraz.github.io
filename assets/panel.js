/* ساز و راز — panel.js | پنل کاربری: پروفایل، محصولات، پیام‌ها (مثل ایمیل)، سفارش‌ها، حساب
   سرعت: یک درخواست واحد /api/panel + نمایش فوری از حافظهٔ مرورگر (stale-while-revalidate) */
(function () {
  'use strict';
  var SR, app, DAY = 864e5, CK = 'sr_panel';
  var S = { ann: null, tab: 'products', thread: null, compose: false, d: null, draft: { subject: '', body: '', reply: {} }, err: '' };
  var P = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var IC = {
    box: P + '<path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"/></svg>',
    mail: P + '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    rec: P + '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></svg>',
    user: P + '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
    back: P + '<path d="M9 6l6 6-6 6"/></svg>',
    plus: P + '<path d="M12 5v14M5 12h14"/></svg>',
    send: P + '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>',
    star: P + '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/></svg>',
    bell: P + '<path d="M6 9a6 6 0 0112 0c0 6 2 7 2 7H4s2-1 2-7z"/><path d="M10 20a2 2 0 004 0"/></svg>',
    out: P + '<path d="M9 21H5V3h4M16 17l5-5-5-5M21 12H9"/></svg>'
  };
  var TABS = [['products', 'محصولات من', 'box'], ['messages', 'پیام‌ها', 'mail'], ['orders', 'سفارش‌ها', 'rec'], ['board', 'اعلانات', 'bell'], ['account', 'حساب', 'user']];
  var ST = { pending: 'در حال تایید', approved: 'تایید شده', rejected: 'رد شده' };

  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function ic(n, c) { var s = el('span', 'ic' + (c ? ' ' + c : '')); s.innerHTML = IC[n]; return s; }
  function btn(c, txt, icon, fn) { var b = el('button', c); b.type = 'button'; if (icon) b.appendChild(ic(icon)); if (txt) b.appendChild(document.createTextNode(txt)); if (fn) b.onclick = fn; return b; }
  function fd(ts) { return ts ? new Date(ts).toLocaleDateString('fa-IR') : '—'; }
  function ft(ts) { var d = new Date(ts); return d.toLocaleDateString('fa-IR') + ' ' + d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }); }
  function num(n) { return Number(n || 0).toLocaleString('fa-IR'); }
  function money(n) { return num(n) + ' تومان'; }
  function api(path, opt) {
    return SR.fetch(path, opt).then(function (r) {
      if (r.status === 401) { wipe(); SR.logout(); location.replace('/account/?next=/account/panel/'); throw new Error('401'); }
      return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok) throw new Error(d.error || 'خطا در ارتباط'); return d; });
    });
  }
  function post(path, body) { return api(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) }); }
  function wipe() { try { localStorage.removeItem(CK); } catch (e) {} }
  function save() { try { localStorage.setItem(CK, JSON.stringify({ u: SR.session().username, d: S.d })); } catch (e) {} }
  function load() { try { var c = JSON.parse(localStorage.getItem(CK) || 'null'); return c && c.u === SR.session().username ? c.d : null; } catch (e) { return null; } }

  /* ---------- مدل پیام‌ها ---------- */
  function threads() {
    var m = {}, order = [];
    (S.d.messages || []).slice().sort(function (a, b) { return a.id - b.id; }).forEach(function (x) { if (!m[x.thread]) { m[x.thread] = { id: x.thread, msgs: [], bc: x.broadcast }; order.push(x.thread); } m[x.thread].msgs.push(x); });
    var arr = order.map(function (k) { return m[k]; });
    arr.forEach(function (t) { t.last = t.msgs[t.msgs.length - 1]; t.subject = (t.msgs[0].subject || t.msgs[0].body).slice(0, 60); t.unread = t.msgs.some(function (x) { return !x.read && !x.dir; }); });
    arr.sort(function (a, b) { return b.last.id - a.last.id; });
    return arr;
  }
  function unreadN() { return (S.d.messages || []).filter(function (x) { return !x.read && !x.dir; }).length; }
  function openThread(id) {
    S.thread = id; S.compose = false;
    var t = threads().filter(function (x) { return x.id === id; })[0];
    if (t && t.unread) {
      t.msgs.forEach(function (x) { x.read = true; });
      S.d.messages.forEach(function (x) { if (x.thread === id) x.read = true; });
      save(); post('/api/messages/read', t.bc ? { broadcast: t.last.id } : { thread: id }).catch(function () {});
    }
    render();
  }

  /* ---------- بخش‌ها ---------- */
  function hero() {
    var s = SR.session(), d = S.d, me = d && d.me, name = (me && me.name) || s.name || s.username;
    var h = el('section', 'pn-hero'), top = el('div', 'pn-id');
    var av = el('div', 'pn-av', name.trim().charAt(0).toUpperCase()); if (me && me.premium) av.appendChild(el('i', 'pn-pro', 'PRO'));
    top.appendChild(av);
    var t = el('div', 'pn-who'); t.appendChild(el('h1', null, name)); t.appendChild(el('div', 'muted', '@' + s.username + (me && me.email ? ' · ' + me.email : ''))); top.appendChild(t);
    h.appendChild(top);
    var sub = el('div', 'pn-sub');
    if (!me) { sub.appendChild(el('div', 'sk')); }
    else if (me.premium) {
      var days = Math.max(1, Math.ceil((me.premium_until - Date.now()) / DAY));
      var l = el('div', 'pn-subt'); l.appendChild(ic('star')); l.appendChild(el('b', null, 'اشتراک پرمیوم فعال')); l.appendChild(el('span', null, num(days) + ' روز مانده · تا ' + fd(me.premium_until))); sub.appendChild(l);
      var bar = el('div', 'pn-bar'), i = el('i'); i.style.width = Math.min(100, Math.round(days / 30 * 100)) + '%'; bar.appendChild(i); sub.appendChild(bar);
      var a = el('a', 'btn', 'تمدید اشتراک'); a.href = '/shop/'; sub.appendChild(a);
    } else {
      var l2 = el('div', 'pn-subt'); l2.appendChild(ic('star')); l2.appendChild(el('b', null, 'حساب عادی')); l2.appendChild(el('span', null, 'با پرمیوم به محتوای ویژه دسترسی پیدا کنید')); sub.appendChild(l2);
      var a2 = el('a', 'btn', 'ارتقا به پرمیوم'); a2.href = '/shop/'; sub.appendChild(a2);
    }
    h.appendChild(sub); return h;
  }
  function metrics() {
    var d = S.d, w = el('div', 'pn-mx');
    [['products', 'محصول فعال', d && d.items.length, 'box'], ['orders', 'سفارش', d && d.orders.length, 'rec'], ['messages', 'پیام جدید', d && unreadN(), 'mail']].forEach(function (m) {
      var b = el('button', 'pn-m'); b.type = 'button'; b.appendChild(ic(m[3])); b.appendChild(el('b', null, d ? num(m[2]) : '·')); b.appendChild(el('small', null, m[1]));
      b.onclick = function () { setTab(m[0]); }; w.appendChild(b);
    });
    return w;
  }
  function setTab(t) { S.tab = t; S.thread = null; S.compose = false; try { history.replaceState(null, '', '#' + t); } catch (e) {} render(); window.scrollTo(0, 0); }
  function tabsBar() {
    var w = el('div', 'pn-tabs'); w.setAttribute('role', 'tablist');
    TABS.forEach(function (t) { var b = btn('', t[1], t[2], function () { setTab(t[0]); }); if (t[0] === 'board') b.className += ' pn-mob'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', S.tab === t[0] ? 'true' : 'false'); if (t[0] === 'messages' && S.d && unreadN()) b.appendChild(el('em', 'pn-bd', num(unreadN()))); w.appendChild(b); });
    return w;
  }
  function bottomNav() {
    var w = el('nav', 'pn-nav'); w.setAttribute('aria-label', 'منوی پنل');
    TABS.forEach(function (t) { var b = btn(S.tab === t[0] ? 'on' : '', null, t[2], function () { setTab(t[0]); }); b.appendChild(el('span', null, t[1].replace('محصولات من', 'محصولات'))); if (t[0] === 'messages' && S.d && unreadN()) b.appendChild(el('em', 'pn-bd', num(unreadN()))); w.appendChild(b); });
    return w;
  }
  function empty(txt, link, lt) { var e = el('div', 'pn-empty'); e.appendChild(el('p', 'muted', txt)); if (link) { var a = el('a', 'btn', lt); a.href = link; e.appendChild(a); } return e; }

  function products() {
    var d = S.d, w = el('div'); if (!d) return skel(3);
    if (!d.items.length) return empty('هنوز محصولی برای شما فعال نشده است.', '/shop/', 'رفتن به فروشگاه');
    var g = el('div', 'pn-grid');
    d.items.forEach(function (p) { var c = el('div', 'pn-prod'); var i = el('div', 'pn-pi'); i.appendChild(ic('box')); c.appendChild(i); c.appendChild(el('b', null, p.title)); if (p.link && /^https:\/\//.test(p.link)) { var a = el('a', 'btn', 'باز کردن / دانلود'); a.href = p.link; a.target = '_blank'; a.rel = 'noopener noreferrer'; c.appendChild(a); } g.appendChild(c); });
    w.appendChild(g); return w;
  }
  function orders() {
    var d = S.d; if (!d) return skel(2);
    if (!d.orders.length) return empty('سفارشی ثبت نشده است.', '/shop/', 'رفتن به فروشگاه');
    var l = el('div', 'list');
    d.orders.forEach(function (o) { var r = el('div', 'li'), c = el('div'); c.appendChild(el('b', null, 'سفارش #' + num(o.id))); c.appendChild(el('div', 'muted', o.names.join('، '))); c.appendChild(el('small', 'muted', money(o.amount) + ' · ' + fd(o.created))); r.appendChild(c); r.appendChild(el('span', 'st ' + o.status, ST[o.status] || o.status)); l.appendChild(r); });
    return l;
  }
  function account() {
    var s = SR.session(), me = S.d && S.d.me, w = el('div', 'pn-acc'), l = el('div', 'list');
    [['نام', me ? me.name : s.name], ['نام‌کاربری', '@' + s.username], ['ایمیل', me && me.email || '—'], ['عضویت از', me ? fd(me.created) : '—']].forEach(function (x) { var r = el('div', 'li'); r.appendChild(el('span', 'muted', x[0])); r.appendChild(el('b', null, x[1])); l.appendChild(r); });
    w.appendChild(l);
    w.appendChild(editForm(me));
    w.appendChild(el('p', 'muted', 'کد بازیابی فقط هنگام ثبت‌نام (یا بعد از هر بازیابی) نمایش داده می‌شود و برای امنیت رمزشده نگهداری می‌شود؛ بنابراین قابل نمایش دوباره نیست.'));
    w.appendChild(btn('btn btn-dark', 'خروج از حساب', 'out', function () { SR.fetch('/api/logout', { method: 'POST' }).catch(function () {}).then(function () { wipe(); SR.logout(); location.replace('/'); }); }));
    return w;
  }
  function editForm(me) {
    var s = SR.session(), f = el('form', 'fm pn-edit'); f.appendChild(el('h3', null, 'ویرایش حساب کاربری'));
    function fld(lb, type, val, ac) { var l = el('label', null, lb), i = el('input'); i.type = type; i.value = val || ''; if (ac) i.autocomplete = ac; l.appendChild(i); f.appendChild(l); return i; }
    var n = fld('نام نمایشی', 'text', me ? me.name : s.name); n.maxLength = 40;
    var e = fld('ایمیل', 'email', me && me.email, 'email'); e.dir = 'ltr';
    f.appendChild(el('h4', null, 'تغییر رمز عبور (اختیاری)'));
    var o = fld('رمز فعلی', 'password', '', 'current-password'), np = fld('رمز جدید (حداقل ۸ نویسه)', 'password', '', 'new-password');
    var nt = el('div', 'note-msg'), sb = btn('btn', 'ذخیرهٔ تغییرات', 'user'); sb.type = 'submit'; f.appendChild(nt); f.appendChild(sb);
    f.onsubmit = function (ev) {
      ev.preventDefault(); sb.disabled = true; nt.className = 'note-msg';
      var body = { name: n.value.trim(), email: e.value.trim() }; if (np.value) { body.new_password = np.value; body.old_password = o.value; }
      post('/api/profile', body).then(function (r) {
        S.d.me.name = r.name; S.d.me.email = r.email; save(); var t = SR.session(); SR.login({ token: t.token, username: t.username, name: r.name });
        o.value = np.value = ''; sb.disabled = false; nt.className = 'note-msg show ok'; nt.textContent = 'تغییرات ذخیره شد.';
        var h = document.querySelector('.pn-who h1'); if (h) h.textContent = r.name;
      }).catch(function (er) { sb.disabled = false; if (er.message !== '401') { nt.className = 'note-msg show err'; nt.textContent = er.message; } });
    };
    return f;
  }
  function skel(n) { var w = el('div', 'list'); for (var i = 0; i < n; i++) w.appendChild(el('div', 'sk sk-r')); return w; }

  /* ---------- پیام‌ها (چیدمان ایمیل) ---------- */
  function mail() {
    if (!S.d) return skel(3);
    var ts = threads(), w = el('div', 'mail' + (S.thread || S.compose ? ' open' : ''));
    var lp = el('div', 'ml'), hd = el('div', 'ml-h'); hd.appendChild(btn('btn', 'پیام جدید', 'plus', function () { S.compose = true; S.thread = null; render(); }));
    lp.appendChild(hd);
    if (!ts.length) lp.appendChild(el('p', 'muted pn-pad', 'هنوز پیامی ندارید. هر سؤالی دارید برای ما بنویسید.'));
    ts.forEach(function (t) {
      var b = el('button', 'mi' + (t.unread ? ' unread' : '') + (S.thread === t.id ? ' act' : '')); b.type = 'button';
      var top = el('div', 'mi-t'); top.appendChild(el('b', null, t.subject)); top.appendChild(el('small', null, fd(t.last.created))); b.appendChild(top);
      var sn = el('div', 'mi-s'); sn.appendChild(el('span', 'mi-k', t.bc ? 'اعلان' : (t.last.dir ? 'شما' : 'پشتیبانی'))); sn.appendChild(document.createTextNode(' ' + t.last.body.slice(0, 70))); b.appendChild(sn);
      if (t.unread) b.appendChild(el('i', 'mi-dot'));
      b.onclick = function () { openThread(t.id); }; lp.appendChild(b);
    });
    w.appendChild(lp);
    var dp = el('div', 'md');
    if (S.compose) dp.appendChild(composer());
    else { var cur = ts.filter(function (t) { return t.id === S.thread; })[0]; if (cur) dp.appendChild(threadView(cur)); else dp.appendChild(el('p', 'muted pn-pad pn-ph', 'یک پیام را انتخاب کنید یا پیام جدید بنویسید.')); }
    w.appendChild(dp); return w;
  }
  function backBtn() { return btn('pn-back', 'بازگشت', 'back', function () { S.thread = null; S.compose = false; render(); }); }
  function threadView(t) {
    var w = el('div', 'tv'), h = el('div', 'tv-h'); h.appendChild(backBtn()); h.appendChild(el('h3', null, t.subject)); w.appendChild(h);
    var l = el('div', 'tv-l');
    t.msgs.forEach(function (m) { var b = el('div', 'bb ' + (m.dir ? 'me' : 'ad')); b.appendChild(el('small', null, (t.bc ? 'اعلان همگانی' : m.dir ? 'شما' : 'پشتیبانی') + ' · ' + ft(m.created))); b.appendChild(el('p', null, m.body)); l.appendChild(b); });
    w.appendChild(l);
    if (!t.bc) {
      var f = el('form', 'fm tv-f'), ta = el('textarea'); ta.rows = 3; ta.maxLength = 1500; ta.placeholder = 'پاسخ شما...'; ta.value = S.draft.reply[t.id] || ''; ta.oninput = function () { S.draft.reply[t.id] = ta.value; };
      var nt = el('div', 'note-msg'), sb = btn('btn', 'ارسال پاسخ', 'send'); sb.type = 'submit';
      f.appendChild(ta); f.appendChild(nt); f.appendChild(sb);
      f.onsubmit = function (e) {
        e.preventDefault(); var v = ta.value.trim(); if (v.length < 2) { nt.className = 'note-msg show err'; nt.textContent = 'متن پاسخ را بنویسید.'; return; }
        sb.disabled = true;
        post('/api/messages', { thread: t.id, body: v }).then(function (r) { S.d.messages.unshift({ id: r.id, thread: t.id, dir: 1, subject: '', body: v, created: r.created, broadcast: false, read: true }); S.draft.reply[t.id] = ''; save(); render(); })
          .catch(function (er) { sb.disabled = false; if (er.message !== '401') { nt.className = 'note-msg show err'; nt.textContent = er.message; } });
      };
      w.appendChild(f);
    }
    return w;
  }
  function composer() {
    var w = el('div', 'tv'), h = el('div', 'tv-h'); h.appendChild(backBtn()); h.appendChild(el('h3', null, 'ارسال پیام به پشتیبانی')); w.appendChild(h);
    var f = el('form', 'fm tv-f'), l1 = el('label', null, 'موضوع'), si = el('input'), l2 = el('label', null, 'متن پیام'), ta = el('textarea');
    si.maxLength = 80; si.value = S.draft.subject; si.oninput = function () { S.draft.subject = si.value; }; ta.rows = 6; ta.maxLength = 1500; ta.value = S.draft.body; ta.oninput = function () { S.draft.body = ta.value; };
    l1.appendChild(si); l2.appendChild(ta);
    var nt = el('div', 'note-msg'), sb = btn('btn', 'ارسال پیام', 'send'); sb.type = 'submit';
    f.appendChild(l1); f.appendChild(l2); f.appendChild(nt); f.appendChild(sb);
    f.onsubmit = function (e) {
      e.preventDefault(); var s = si.value.trim(), v = ta.value.trim();
      if (s.length < 2 || v.length < 2) { nt.className = 'note-msg show err'; nt.textContent = 'موضوع و متن پیام را بنویسید.'; return; }
      sb.disabled = true;
      post('/api/messages', { subject: s, body: v }).then(function (r) { S.d.messages.unshift({ id: r.id, thread: r.thread, dir: 1, subject: s, body: v, created: r.created, broadcast: false, read: true }); S.draft.subject = S.draft.body = ''; S.compose = false; S.thread = r.thread; save(); render(); })
        .catch(function (er) { sb.disabled = false; if (er.message !== '401') { nt.className = 'note-msg show err'; nt.textContent = er.message; } });
    };
    w.appendChild(f); return w;
  }
  function annCard(a) {
    var c = el('article', 'pn-an pn-an-' + a.type);
    if (a.title) c.appendChild(el('h3', null, a.title));
    var safe = function (u) { return /^(https:\/\/|\/)/.test(u || '') && !/^\/\//.test(u); };
    if ((a.type === 'image' || a.type === 'gif') && safe(a.img)) {
      var im = el('img'); im.src = a.img; im.alt = a.title || 'اعلان'; im.loading = 'lazy'; im.decoding = 'async';
      if (safe(a.link)) { var l = el('a'); l.href = a.link; l.appendChild(im); c.appendChild(l); } else c.appendChild(im);
    } else if (a.type === 'html' && a.code) {
      var w = el('div', 'pn-frame'); var fr = el('iframe'); fr.setAttribute('sandbox', 'allow-scripts allow-popups'); fr.loading = 'lazy'; fr.title = a.title || 'اعلان'; fr.style.height = Math.max(60, Math.min(1200, parseInt(a.height) || 260)) + 'px'; fr.srcdoc = a.code; w.appendChild(fr); c.appendChild(w);
    }
    if (a.text) c.appendChild(el('p', null, a.text));
    if (a.type === 'text' && safe(a.link)) { var b = el('a', 'btn', a.btn || 'مشاهده'); b.href = a.link; c.appendChild(b); }
    return c;
  }
  function annList() {
    var w = el('div', 'pn-anl'), n = 0;
    (S.ann || []).forEach(function (a) { if (a.on !== false) { w.appendChild(annCard(a)); n++; } });
    var ts = S.d ? threads().filter(function (t) { return t.bc; }).slice(0, 3) : [];
    ts.forEach(function (t) { var r = el('button', 'pn-sm' + (t.unread ? ' unread' : '')); r.type = 'button'; r.appendChild(el('b', null, t.subject)); r.appendChild(el('small', 'muted', t.last.body.slice(0, 50))); r.onclick = function () { S.tab = 'messages'; S.thread = t.id; openThread(t.id); }; w.appendChild(r); n++; });
    if (!n) w.appendChild(el('p', 'muted', S.d && S.ann ? 'اعلان تازه‌ای نیست.' : '...'));
    return w;
  }
  function helpBox() {
    var s = el('section', 'box pn-help'); s.appendChild(el('h2', null, 'نیاز به کمک دارید؟')); s.appendChild(el('p', 'muted', 'سؤال یا مشکلتان را برای ما بنویسید؛ پاسخ در همین پنل می‌آید.'));
    s.appendChild(btn('btn', 'ارسال پیام به پشتیبانی', 'send', function () { S.tab = 'messages'; S.compose = true; S.thread = null; render(); window.scrollTo(0, 0); })); return s;
  }
  function board() { var w = el('div', 'pn-board'); w.appendChild(el('h2', null, 'تابلو اعلانات')); w.appendChild(annList()); w.appendChild(helpBox()); return w; }
  function side() {
    var w = el('aside', 'pn-side'), b = el('section', 'box'); b.appendChild(el('h2', null, 'تابلو اعلانات')); b.appendChild(annList()); w.appendChild(b);
    w.appendChild(helpBox()); return w;
  }

  function render() {
    app.textContent = '';
    app.appendChild(hero()); app.appendChild(metrics());
    var lay = el('div', 'pn-lay'), main = el('div', 'pn-main'); main.appendChild(tabsBar());
    var c = el('section', 'box pn-c'); c.appendChild(S.tab === 'messages' ? mail() : S.tab === 'orders' ? orders() : S.tab === 'board' ? board() : S.tab === 'account' ? account() : products());
    if (S.err) c.insertBefore(el('p', 'muted', S.err), c.firstChild);
    main.appendChild(c); lay.appendChild(main); lay.appendChild(side()); app.appendChild(lay); app.appendChild(bottomNav());
  }

  function init() {
    SR = window.SR; app = document.getElementById('app');
    if (!SR.session()) return location.replace('/account/?next=/account/panel/');
    if (!SR.api) { app.textContent = 'آدرس سرور در تنظیمات سایت ثبت نشده است.'; return; }
    document.body.classList.add('pn-on');
    var h = (location.hash || '').slice(1); if (TABS.some(function (t) { return t[0] === h; })) S.tab = h;
    var cached = load(); S.d = cached; render();
    fetch('/data/announcements.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : { items: [] }; }).catch(function () { return { items: [] }; }).then(function (a) { S.ann = (a && a.items) || []; if (S.tab === 'board' || document.querySelector('.pn-side')) render(); });
    api('/api/panel').then(function (d) {
      var changed = !cached || JSON.stringify(cached) !== JSON.stringify(d);
      S.d = d; S.err = ''; save(); try { localStorage.setItem('sr_checked', String(Date.now())); } catch (e) {}
      var s = SR.session(); if (s && d.me.name && d.me.name !== s.name) { SR.login({ token: s.token, username: s.username, name: d.me.name }); try { localStorage.setItem('sr_checked', String(Date.now())); } catch (e) {} }
      if (changed) render();
    }).catch(function (e) {
      if (e.message === '401') return;
      if (!cached) { app.textContent = ''; var b = el('div', 'box'); b.appendChild(el('p', null, 'بارگذاری پنل ناموفق بود: ' + e.message)); b.appendChild(btn('btn', 'تلاش دوباره', null, function () { location.reload(); })); app.appendChild(b); }
      else { S.err = 'اتصال برقرار نشد؛ اطلاعات ذخیره‌شده نمایش داده می‌شود.'; render(); }
    });
  }
  window.SRReady(init);
})();
