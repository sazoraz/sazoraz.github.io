/* ساز و راز — core.js | رفتار مشترک همه صفحات (کوچک و بدون وابستگی)
   قرارداد یکپارچه: window.SR  →  SR.session(), SR.api, SR.login(s), SR.logout()
   نشست در localStorage با کلید sr_session ذخیره می‌شود: {token, username, name}  */
(function () {
  'use strict';
  var KEY = 'sr_session', CHK = 'sr_checked';
  var meta = document.querySelector('meta[name="sr-api"]');
  var API = ((meta && meta.content) || 'https://log.ttdiscorde23.workers.dev').replace(/\/$/, '');

  function read() { try { var s = JSON.parse(localStorage.getItem(KEY) || 'null'); return s && s.token ? s : null; } catch (e) { return null; } }
  function write(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); localStorage.removeItem(CHK); } catch (e) {} paint(); }
  function clear() { try { localStorage.removeItem(KEY); localStorage.removeItem(CHK); localStorage.removeItem('sr_panel'); } catch (e) {} paint(); }

  window.SR = {
    api: API,
    session: read,
    login: write,
    logout: clear,
    // فراخوانی امن API با توکن کاربر
    fetch: function (path, opt) {
      opt = opt || {}; opt.headers = opt.headers || {};
      var s = read(); if (s) opt.headers.Authorization = 'Bearer ' + s.token;
      return fetch(API + path, opt);
    }
  };

  /* ---- نمایش وضعیت ورود در هدر ---- */
  function paint() {
    var s = read();
    document.querySelectorAll('[data-auth]').forEach(function (a) {
      var t = a.querySelector('.t');
      if (s) {
        var name = s.name || s.username || 'کاربر';
        a.classList.add('in'); a.setAttribute('href', '/account/panel/');
        a.innerHTML = '<span class="av">' + esc(name.trim().charAt(0).toUpperCase()) + '</span><span class="t">' + esc(name) + '</span>';
        a.setAttribute('aria-label', 'پنل کاربری ' + name);
      } else {
        a.classList.remove('in'); a.setAttribute('href', '/account/');
        a.innerHTML = a.dataset.guest || a.innerHTML;
      }
    });
  }
  function esc(x) { return String(x).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ذخیره HTML حالت مهمان تا بعداً برگردد
  document.querySelectorAll('[data-auth]').forEach(function (a) { a.dataset.guest = a.innerHTML; });
  paint();

  /* اعتبارسنجی بی‌صدا توکن (حداکثر هر ۱۰ دقیقه) — اگر منقضی شده بود، خروج */
  (function validate() {
    var s = read(); if (!s || !API) return;
    var last = +localStorage.getItem(CHK) || 0;
    if (Date.now() - last < 600000) return;
    fetch(API + '/api/me', { headers: { Authorization: 'Bearer ' + s.token } }).then(function (r) {
      if (r.status === 401) return clear();
      return r.ok ? r.json().then(function (u) {
        localStorage.setItem(CHK, String(Date.now()));
        if (u && (u.name || u.username)) { s.name = u.name || s.name; s.username = u.username || s.username; localStorage.setItem(KEY, JSON.stringify(s)); paint(); }
      }) : null;
    }).catch(function () {});
  })();

  // همگام‌سازی بین تب‌ها
  window.addEventListener('storage', function (e) { if (e.key === KEY) paint(); });

  /* ---- منوی موبایل ---- */
  var b = document.querySelector('[data-burger]'), nav = document.getElementById('nav');
  if (b && nav) {
    b.addEventListener('click', function () {
      var o = nav.classList.toggle('open'); b.setAttribute('aria-expanded', o ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') nav.classList.remove('open'); });
  }

  /* ---- پست‌های خودکار: /data/posts.json (فایل استاتیک، بدون هزینه)
     فرمت: {"posts":[{"cat":"compose","title":"","desc":"","img":"","tag":"","meta":"","href":"","date":"2026-10-10"}]}
     جدیدترین پست هر دسته به ابتدای اسلایدر همان بخش اضافه می‌شود. */
  var secs = document.querySelectorAll('section[data-auto]:not([data-auto=""]):not([data-static])');
  if (secs.length && 'fetch' in window) {
    fetch('/data/posts.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d || !d.posts) return;
      secs.forEach(function (sec) {
        var cat = sec.dataset.auto, icon = sec.dataset.icon;
        var list = d.posts.filter(function (p) { return p.cat === cat; }).sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); }).slice(0, 4);
        if (!list.length) return;
        var grid = sec.querySelector('.grid'), keep = grid.querySelectorAll('.card'), html = '';
        list.forEach(function (p) {
          html += '<article class="card"><div class="thumb">' + (p.img ? '<img src="' + esc(p.img) + '" alt="' + esc(p.title) + '" width="640" height="360" loading="lazy" decoding="async">' : '<div class="ph"></div>') +
            (p.tag ? '<span class="chip">' + esc(p.tag) + '</span>' : '') + (p.meta ? '<span class="meta">' + esc(p.meta) + '</span>' : '') + '</div>' +
            '<div class="card-b"><h3><a class="stretch" href="' + esc(/^(https?:)?\/|^#/.test(p.href || '') ? p.href : '#') + '">' + esc(p.title) + '</a></h3><p>' + esc(p.desc || '') + '</p></div><span class="cta">مشاهده</span></article>';
        });
        grid.innerHTML = html; // فقط جدیدترین‌ها؛ پست‌های دستی بعد از آن‌ها حفظ می‌شوند
        for (var i = 0; i < keep.length && grid.children.length < 3; i++) grid.appendChild(keep[i]);
      });
    }).catch(function () {});
  }

  /* ---- آمار بازدید (سبک): یک درخواست کوچک برای هر صفحه، حداکثر هر ۳۰ دقیقه، بعد از بارگذاری ---- */
  try {
    var hp = location.pathname.replace(/index\.html$/, '');
    if (API && /^https?:$/.test(location.protocol) && !navigator.webdriver && hp.charAt(0) === '/' && !/^\/(admin|account)\//.test(hp)) {
      if (hp.slice(-1) !== '/') hp += '/';
      var hk = 'sr_h' + hp, hl = 0; try { hl = +sessionStorage.getItem(hk) || 0; } catch (e) {}
      if (Date.now() - hl > 1800000) {
        var hsend = function () {
          try { sessionStorage.setItem(hk, String(Date.now())); } catch (e) {}
          var hs = read(), hb = JSON.stringify({ p: hp, t: hs ? hs.token : '' });
          try { if (navigator.sendBeacon) navigator.sendBeacon(API + '/api/hit', hb); else fetch(API + '/api/hit', { method: 'POST', body: hb, keepalive: true }).catch(function () {}); } catch (e) {}
        };
        setTimeout(function () { if (document.visibilityState === 'hidden') document.addEventListener('visibilitychange', hsend, { once: true }); else hsend(); }, 1500);
      }
    }
  } catch (e) {}
})();
