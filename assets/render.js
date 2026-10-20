/* ساز و راز — render.js | موتور رندر مشترک (هم در مرورگر/صفحه‌ساز، هم در Node) */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SRR = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  var ICONS = {
    music: 'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM21 16a3 3 0 11-6 0 3 3 0 016 0z',
    search: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',
    user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
    menu: 'M3 6h18M3 12h18M3 18h18',
    close: 'M18 6L6 18M6 6l12 12',
    play: 'M6 4l14 8-14 8z',
    download: 'M12 3v12m0 0l-4-4m4 4l4-4M4 21h16',
    arrow: 'M19 12H5m0 0l6-6m-6 6l6 6',
    bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
    eq: 'M4 20V10M9 20V4M14 20v-8M19 20V7',
    grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
    file: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M8 13h8M8 17h8',
    headphones: 'M3 18v-6a9 9 0 0118 0v6M3 18a2 2 0 002 2h1v-6H5a2 2 0 00-2 2zM21 18a2 2 0 01-2 2h-1v-6h1a2 2 0 012 2z',
    cart: 'M6 6h15l-2 9H8zM6 6L5 3H2M9 20a1 1 0 100-2 1 1 0 000 2zM18 20a1 1 0 100-2 1 1 0 000 2z',
    mega: 'M3 11v2a1 1 0 001 1h3l5 4V6L7 10H4a1 1 0 00-1 1zM16 8a5 5 0 010 8',
    sliders: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
    forum: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
    star: 'M12 2l3 7 7 .6-5.3 4.7 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.6 9 9z'
  };
  var ICON_NAMES = Object.keys(ICONS);

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ic(n, c) { return '<svg class="ic' + (c ? ' ' + c : '') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + (ICONS[n] || ICONS.music) + '"/></svg>'; }
  function href(u) { u = String(u || '').trim(); return /^(javascript|data|vbscript):/i.test(u) ? '#' : (u || '#'); }

  var DEFAULTS = {
    site: {
      name: 'ساز و راز', tagline: 'استودیو ملودی و هارمونی', badge: 'PRO',
      url: 'https://sazoraz.github.io', noindex: false, title: 'ساز و راز | آهنگسازی، میکس و مسترینگ، آکورد و نت',
      desc: 'مرجع فارسی آهنگسازی و تنظیم، میکس و مسترینگ، آکوردهای مدرن و نت‌های پیانو و گیتار با دانلود رایگان.',
      ogImage: '', favicon: '/assets/favicon.svg', api: 'https://log.ttdiscorde23.workers.dev'
    },
    fonts: { heading: 'Vazirmatn', body: 'Vazirmatn', customCss: '' },
    themes: { compose: '#ffd166', mix: '#70d6bc', chords: '#9d8df1', sheets: '#ff70a6', extra: '#ff9770' },
    ui: { bg: '#0e1118', card: '#1b202c', text: '#f4f3f7', muted: '#a9b0c0', radius: 16, shadow: 5, shadowColor: '#000000', dots: true },
    menu: [
      { label: 'آهنگسازی', href: '/compose/', theme: 'compose' },
      { label: 'میکس و مسترینگ', href: '/mixing/', theme: 'mix' },
      { label: 'آکوردها', href: '/chords/', theme: 'chords' },
      { label: 'نت‌ها', href: '/sheets/', theme: 'sheets' },
      { label: 'فروشگاه', href: '/shop/', theme: 'extra' }
    ],
    hero: {
      eyebrow: 'مرجع فارسی خلاقیت موسیقی',
      title1: 'جهان بیت، آکورد و صدا', title2: 'به سبک نئوممفیس!',
      text: 'نت‌های فاخر، آکوردهای مدرن، تنظیم مستقل در استودیو خانگی و مسترکلاس‌های عملی میکس و مسترینگ؛ همه در یک‌جا و به زبان فارسی.',
      btn1: 'کاوش پرطرفدارها', btn1Href: '#compose', btn2: 'ورود به فروشگاه', btn2Href: '/shop/',
      deckTitle: 'تلفیق ماهور و نئوسول', deckSub: 'سمپل‌پک اختصاصی استودیو', deckBadge: 'موتور صوتی v۴'
    },
    sections: [
      {
        id: 'compose', theme: 'compose', icon: 'headphones', title: 'آهنگسازی، تنظیم و ریتم‌سازی', badge: 'DAW Lab',
        sub: 'پروژه‌های قابل ویرایش و دوره‌های تخصصی ریتم', viewAll: 'مشاهده همه', href: '/compose/', auto: 'compose', short: 'آهنگسازی', shortSub: 'پروژه‌های باز',
        cards: [
          { title: 'اصول چیدمان ریتم درامز در سبک ترپ و هیپ‌هاپ مدرن', desc: 'بررسی توزیع فرکانسی های‌هت و کیک ۸۰۸ به همراه فایل لایه‌باز پروژه.', tag: 'پروژه ابلتون', meta: '۶ دقیقه مطالعه', cta: 'دانلود پروژه', href: '#', img: '' },
          { title: 'تکنیک‌های تنظیم هارمونی پیانو در پاپ ایرانی', desc: 'وویسینگ کروماتیک و پیوندهای خط باس در قطعات ماندگار معاصر.', tag: 'مسترکلاس ویدیویی', meta: '۱۴ دقیقه', cta: 'شروع آموزش', href: '#', img: '' },
          { title: 'معرفی ۵ سینتی‌سایزر برتر رایگان برای سبک رترو', desc: 'پریست‌های درخشان آنالوگ برای فضاسازی‌های دهه هشتادی.', tag: 'پلاگین و پریست', meta: '۵ دقیقه', cta: 'دریافت لیست', href: '#', img: '' }
        ]
      },
      {
        id: 'mixing', theme: 'mix', icon: 'eq', title: 'میکس و مسترینگ', badge: 'Sound Eng',
        sub: 'مهندسی صدا، اکولایزر و کمپرسور', viewAll: 'کتابخانه ترفندها', href: '/mixing/', auto: 'mixing', short: 'میکس و مستر', shortSub: 'زنجیره پلاگین‌ها',
        cards: [
          { title: 'کنترل فرکانس‌های بم با کمپرسور چندبانده', desc: 'حل تداخل ساب‌بیس و کیک با داکینگ داینامیک.', tag: 'کمپرسور چندبانده', meta: '۲۰ تا ۲۵۰ هرتز', cta: 'مشاهده ترفند', href: '#', img: '' },
          { title: 'راز شفافیت و درخشش (Air) وکال در میکس نهایی', desc: 'اکولایزر و سچوریشن نواری برای زنده‌تر شدن صدای خواننده.', tag: 'ترفند وکال', meta: '', cta: 'شنیدن نمونه', href: '#', img: '' },
          { title: 'آموزش گین‌استیجینگ اصولی در استودیو', desc: 'تنظیم هدروم مناسب پیش از ورود به شبیه‌سازهای آنالوگ.', tag: 'آموزش پایه', meta: '', cta: 'مطالعه مقاله', href: '#', img: '' }
        ]
      },
      {
        id: 'chords', theme: 'chords', icon: 'music', title: 'مرجع تخصصی آکوردها', badge: 'Harmonics',
        sub: 'دیاگرام انگشت‌گذاری و توالی‌های هارمونیک', viewAll: 'بانک آکورد', href: '/chords/', auto: 'chords', short: 'آکوردها', shortSub: 'دیاگرام زنده',
        cards: [
          { title: 'آکوردهای احساسی مینور ۷ برای گیتار و کیبورد', desc: 'تسلسل هارمونیک مناسب پاپ احساسی ایرانی.', chord: 'Am7', notes: 'لا مینور هفت', tag: '', meta: '', cta: 'نمایش دیاگرام', href: '#', img: '' },
          { title: 'آکوردهای پیشرفته جز و نئوسول', desc: 'افزودن تنشن‌های ۹، ۱۱ و ۱۳ برای حس مدرن.', chord: 'Fmaj9#11', notes: 'فا ماژور ۹ اکستندد', tag: '', meta: '', cta: 'تحلیل تئوری', href: '#', img: '' },
          { title: 'تنش و حل در آواز دشتی', desc: 'کاربرد E7♭9 در سبک ایرانی-مدرن.', chord: 'E7♭9', notes: 'می هفت با نهم بمل', tag: '', meta: '', cta: 'دریافت آکورد', href: '#', img: '' }
        ]
      },
      {
        id: 'sheets', theme: 'sheets', icon: 'file', title: 'آخرین نت‌ها و پارتیتورها', badge: 'PDF Sheets',
        sub: 'پارتیتور پیانو، تبلچر گیتار و علائم زینت', viewAll: 'آرشیو نت‌ها', href: '/sheets/', auto: 'sheets', short: 'نت‌ها', shortSub: 'دانلود PDF',
        cards: [
          { title: 'نت پیانو قطعه «خواب‌های طلایی»', desc: 'نسخه ویرایش‌شده با انگشت‌گذاری دقیق دست چپ و راست.', tag: 'پیانو • متوسط', meta: '۴ صفحه', cta: 'دانلود PDF', href: '#', img: '' },
          { title: 'تبلچر و ملودی سولو گیتار نوستالژیک', desc: 'مجموعه ۱۰ قطعه آرامش‌بخش برای هنرجویان مبتدی.', tag: 'گیتار • مقدماتی', meta: '۳ صفحه', cta: 'دریافت تبلچر', href: '#', img: '' },
          { title: 'پارتیتور کامل ارکستر زهی', desc: 'تفکیک ویولن، آلتو و ویولنسل.', tag: 'زهی • پیشرفته', meta: '۵ صفحه', cta: 'دریافت پارتیتور', href: '#', img: '' }
        ]
      }
    ],
    banner: {
      on: true, mode: 'text', img: '', code: '', height: 260, icon: 'forum', title: 'آهنگساز یا تنظیم‌کننده مستقل هستید؟',
      text: 'آثار و سمپل‌های خودتان را در فروشگاه ساز و راز با حفظ کپی‌رایت منتشر کنید.', btn: 'ثبت‌نام هنرمند', href: '/account/?mode=register'
    },
    tunerBanner: {
      on: true, mode: 'text', icon: 'music', title: 'کلاس‌های گیتار دامون آرمانی‌نژاد',
      text: 'برای شرکت در کلاس‌های گیتار دامون آرمانی‌نژاد، به‌صورت خصوصی، آنلاین یا در آموزشگاه، کلیک کنید.',
      btn: 'اطلاعات و ثبت‌نام کلاس‌ها', href: '/', img: '', alt: '', code: '', height: 160, newTab: false
    },
    footer: {
      title: 'تابلو اعلانات', sub: 'فراخوان‌ها، دوره‌ها و به‌روزرسانی‌های ماهانه',
      about: 'ساز و راز؛ جایی برای ساختن، شنیدن و یاد گرفتن موسیقی.',
      copyright: '© ۱۴۰۵ تمامی حقوق برای استودیو ساز و راز محفوظ است.',
      ann: [
        { theme: 'compose', label: 'اطلاعیه', title: 'راه‌اندازی سرور دانلود استم‌ها', text: 'اعضای ویژه می‌توانند فایل‌های چندترک را مستقیم دریافت کنند.', foot: '۴ دقیقه مطالعه', href: '#' },
        { theme: 'mix', label: 'رویداد ویژه', title: 'مسابقه بیت‌سازی «شور و ریتم»', text: 'ریتم مدرن خود را تا پایان هفته ارسال کنید.', foot: 'مهلت: پایان هفته', href: '#' },
        { theme: 'sheets', label: 'آپدیت مسترکلاس', title: 'فصل چهارم: اسرار سایدچین', text: 'آنالیز پروژه واقعی با پرکاشن سنتی و درام‌کیت.', foot: '۹ قسمت جدید', href: '#' }
      ],
      cols: [
        { title: 'بخش‌ها', links: [{ label: 'آهنگسازی', href: '/compose/' }, { label: 'میکس و مسترینگ', href: '/mixing/' }, { label: 'آکوردها', href: '/chords/' }, { label: 'نت‌ها', href: '/sheets/' }] },
        { title: 'حساب کاربری', links: [{ label: 'ورود / ثبت‌نام', href: '/account/' }, { label: 'پنل کاربری', href: '/account/panel/' }, { label: 'فروشگاه', href: '/shop/' }] },
        { title: 'پشتیبانی', links: [{ label: 'تماس با ما', href: '/contact/' }, { label: 'قوانین', href: '/terms/' }, { label: 'حریم خصوصی', href: '/privacy/' }] }
      ]
    }
  };

  function cssVars(s) {
    var t = s.themes, u = s.ui;
    var fh = "'" + s.fonts.heading + "',Tahoma,system-ui,sans-serif", fb = "'" + s.fonts.body + "',Tahoma,system-ui,sans-serif";
    return ':root{--c-compose:' + t.compose + ';--c-mix:' + t.mix + ';--c-chords:' + t.chords + ';--c-sheets:' + t.sheets + ';--c-extra:' + t.extra +
      ';--bg:' + u.bg + ';--card:' + u.card + ';--text:' + u.text + ';--muted:' + u.muted + ';--r:' + u.radius + 'px;--sh:' + u.shadow + 'px;--shc:' + u.shadowColor +
      ';--fh:' + fh + ';--fb:' + fb + '}';
  }

  function fontLink(s) {
    if (s.fonts.customCss) return s.fonts.customCss;
    var std = { Vazirmatn: 1, Lalezar: 1, Tahoma: 1 }, fam = [];
    [s.fonts.heading, s.fonts.body].forEach(function (f) { if (f && !std[f] && fam.indexOf(f) < 0) fam.push(f); });
    if (!fam.length) return '';
    return 'https://fonts.googleapis.com/css2?' + fam.map(function (f) { return 'family=' + encodeURIComponent(f).replace(/%20/g, '+') + ':wght@400;700;900'; }).join('&') + '&display=swap';
  }

  function header(s, active) {
    var m = s.menu.map(function (i) {
      return '<a href="' + esc(href(i.href)) + '" class="t-' + esc(i.theme || 'compose') + (active && active === i.href ? ' on' : '') + '">' + esc(i.label) + '</a>';
    }).join('');
    return '<header class="hdr"><div class="wrap hdr-in">' +
      '<a class="brand" href="/" aria-label="' + esc(s.site.name) + '"><span class="logo">' + ic('eq') + '</span><span class="bt"><b>' + esc(s.site.name) +
      (s.site.badge ? '<i>' + esc(s.site.badge) + '</i>' : '') + '</b><small>' + esc(s.site.tagline) + '</small></span></a>' +
      '<nav class="nav" id="nav" aria-label="منوی اصلی">' + m + '</nav>' +
      '<div class="hdr-act"><a class="ib" href="/search/" aria-label="جستجو">' + ic('search') + '</a>' +
      '<a class="ib hide-m" href="/shop/cart/" aria-label="سبد خرید" data-cart>' + ic('cart') + '</a>' +
      '<a class="auth" href="/account/" data-auth>' + ic('user') + '<span class="t">' + esc(s.site.loginLabel || 'ورود / ثبت‌نام') + '</span></a>' +
      '<button class="ib burger" type="button" aria-label="منو" aria-controls="nav" aria-expanded="false" data-burger>' + ic('menu') + '</button></div>' +
      '</div></header>';
  }

  function footer(s) {
    var f = s.footer;
    var ann = f.ann.map(function (a, i) {
      return '<article class="an t-' + esc(a.theme) + '"><div class="top"><span class="lbl">' + esc(a.label) + '</span><span class="no">' + (i + 1) + '</span></div>' +
        '<h4>' + esc(a.title) + '</h4><p>' + esc(a.text) + '</p><div class="ft"><span>' + esc(a.foot) + '</span><a href="' + esc(href(a.href)) + '">' + esc(f.moreLabel || 'ادامه') + ic('arrow') + '</a></div></article>';
    }).join('');
    var cols = f.cols.map(function (c) {
      return '<div><h5>' + esc(c.title) + '</h5>' + c.links.map(function (l) { return '<a href="' + esc(href(l.href)) + '">' + esc(l.label) + '</a>'; }).join('') + '</div>';
    }).join('');
    return '<footer class="ftr"><div class="wrap">' +
      '<div class="ftr-h"><div class="l"><span class="logo">' + ic('mega') + '</span><div><h3>' + esc(f.title) + '</h3><small>' + esc(f.sub) + '</small></div></div></div>' +
      '<div class="ann">' + ann + '</div>' +
      '<div class="cols"><div><h5>' + esc(s.site.name) + '</h5><p>' + esc(f.about) + '</p></div>' + cols + '</div>' +
      '<div class="copy"><span>' + esc(f.copyright) + '</span><span>' + esc(s.site.tagline) + '</span></div></div></footer>';
  }

  function card(c, sec) {
    var vis;
    if (c.chord) {
      vis = '<div class="chord"><div><b>' + esc(c.chord) + '</b><small>' + esc(c.notes) + '</small></div>' + ic(sec.icon) + '</div>';
    } else {
      vis = '<div class="thumb">' +
        (c.img ? '<img src="' + esc(c.img) + '" alt="' + esc(c.title) + '" width="640" height="360" loading="lazy" decoding="async">' : '<div class="ph">' + ic(sec.icon) + '</div>') +
        (c.tag ? '<span class="chip">' + esc(c.tag) + '</span>' : '') + (c.meta ? '<span class="meta">' + esc(c.meta) + '</span>' : '') + '</div>';
    }
    return '<article class="card">' + vis + '<div class="card-b"><h3><a class="stretch" href="' + esc(href(c.href)) + '">' + esc(c.title) + '</a></h3><p>' + esc(c.desc) + '</p></div>' +
      '<span class="cta">' + esc(c.cta || 'مشاهده') + ic('arrow') + '</span></article>';
  }

  function robotsMeta(s, force) { return (s.site.noindex || force) ? 'noindex,nofollow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'; }
  function byDate(a, b) { return String(b.date).localeCompare(String(a.date)); }
  function pcard(p, sec) {
    return '<article class="card"><div class="thumb">' + (p.img ? '<img src="' + esc(p.img) + '" alt="' + esc(p.title) + '" width="640" height="360" loading="lazy" decoding="async">' : '<div class="ph">' + (sec && sec.icon ? ic(sec.icon) : '') + '</div>') +
      (p.tag ? '<span class="chip">' + esc(p.tag) + '</span>' : '') + (p.meta ? '<span class="meta">' + esc(p.meta) + '</span>' : '') + '</div>' +
      '<div class="card-b"><h3><a class="stretch" href="' + esc(/^(https?:)?\/|^#/.test(p.href || '') ? p.href : '#') + '">' + esc(p.title) + '</a></h3><p>' + esc(p.desc || '') + '</p></div><span class="cta">مشاهده' + ic('arrow') + '</span></article>';
  }
  function section(sec, posts) {
    var ac = (sec.auto && posts) ? posts.filter(function (p) { return p.cat === sec.auto; }).sort(byDate).slice(0, 3) : [];
    var cards = ac.length ? ac.map(function (p) { return pcard(p, sec); }).concat(sec.cards.slice(0, Math.max(0, 3 - ac.length)).map(function (c) { return card(c, sec); })) : sec.cards.map(function (c) { return card(c, sec); });
    return '<section class="sec t-' + esc(sec.theme) + '" id="' + esc(sec.id) + '" data-auto="' + esc(sec.auto || '') + '"' + (ac.length ? ' data-static="1"' : '') + ' data-theme-key="' + esc(sec.theme) + '" data-icon="' + esc(sec.icon) + '">' +
      '<div class="sec-h"><div class="sec-t"><span class="sec-i">' + ic(sec.icon) + '</span><div><h2>' + esc(sec.title) + (sec.badge ? '<span class="tag">' + esc(sec.badge) + '</span>' : '') + '</h2><p>' + esc(sec.sub) + '</p></div></div>' +
      '<a class="btn btn-w" href="' + esc(href(sec.href)) + '">' + esc(sec.viewAll) + ic('arrow') + '</a></div>' +
      '<div class="grid">' + cards.join('') + '</div></section>';
  }

  function hero(s) {
    var h = s.hero;
    var bars = [45, 80, 60, 95, 35, 70, 50, 88, 65, 40].map(function (v, i) { return '<i style="--h:' + v + '%;--d:' + (i * 0.13).toFixed(2) + 's"></i>'; }).join('');
    var quick = s.sections.map(function (x) {
      return '<a class="q t-' + esc(x.theme) + '" href="#' + esc(x.id) + '"><span class="qi">' + ic(x.icon) + '</span><span><b>' + esc(x.short) + '</b><small>' + esc(x.shortSub) + '</small></span></a>';
    }).join('');
    return '<section class="hero"><span class="sh a"></span><span class="sh b"></span><span class="sh c"></span>' +
      '<div class="hero-in"><div><span class="eyebrow">' + esc(h.eyebrow) + '</span>' +
      '<h1>' + esc(h.title1) + '<br><span class="hl">' + esc(h.title2) + '</span></h1><p>' + esc(h.text) + '</p>' +
      '<div class="hero-btns"><a class="btn" href="' + esc(href(h.btn1Href)) + '">' + ic('bolt') + esc(h.btn1) + '</a><a class="btn alt" href="' + esc(href(h.btn2Href)) + '">' + ic('cart') + esc(h.btn2) + '</a></div></div>' +
      '<div class="deck" aria-hidden="true"><div class="deck-top"><div class="dots3"><i></i><i></i><i></i></div><span>' + esc(h.deckBadge) + '</span></div><div class="eq">' + bars + '</div>' +
      '<div class="now"><span class="logo">' + ic('eq') + '</span><div><b>' + esc(h.deckTitle) + '</b><small>' + esc(h.deckSub) + '</small></div><span class="ib">' + ic('play') + '</span></div></div></div>' +
      '<div class="quick">' + quick + '</div></section>';
  }

  function sandbox(code, h, title, extra) {
    var d = '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;min-height:100%;background:transparent;color:#f4f3f7;font-family:system-ui,Tahoma,sans-serif}' + (extra || '') + '</style>' + code;
    return '<iframe sandbox="allow-scripts allow-popups" loading="lazy" title="' + esc(title || 'محتوای تعاملی') + '" style="height:' + Math.max(60, Math.min(1200, parseInt(h) || 260)) + 'px" srcdoc="' + esc(d) + '"></iframe>';
  }
  function banner(s) {
    var b = s.banner;
    if (!b.on) return '';
    if (b.mode === 'html') return b.code ? '<section class="banner-x">' + sandbox(b.code, b.height, b.title) + '</section>' : '';
    var vis = (b.mode === 'image' && b.img) ? '<img class="bimg" src="' + esc(href(b.img)) + '" alt="' + esc(b.title) + '" loading="lazy">' : '<span class="logo">' + ic(b.icon) + '</span>';
    return '<section class="banner' + (b.mode === 'image' ? ' has-img' : '') + '"><div class="l">' + vis + '<div><h3>' + esc(b.title) + '</h3><p>' + esc(b.text) + '</p></div></div>' +
      (b.btn ? '<a class="btn" href="' + esc(href(b.href)) + '">' + esc(b.btn) + ic('arrow') + '</a>' : '') + '</section>';
  }

  /* بنر کوچک صفحهٔ تیونر: متن + دکمه / تصویر یا گیف با لینک / کد دلخواه */
  function miniBanner(b) {
    if (!b || !b.on) return '';
    var tg = b.newTab ? ' target="_blank" rel="noopener"' : '';
    if (b.mode === 'html') return b.code ? '<aside class="banner-x tbn-x">' + sandbox(b.code, b.height || 160, b.title || 'بنر') + '</aside>' : '';
    if (b.mode === 'image') {
      if (!b.img) return '';
      var im = '<img src="' + esc(href(b.img)) + '" alt="' + esc(b.alt || b.title || 'بنر') + '" loading="lazy" decoding="async">';
      return '<aside class="tbn-img">' + (b.href ? '<a href="' + esc(href(b.href)) + '"' + tg + '>' + im + '</a>' : im) + '</aside>';
    }
    return '<aside class="tbn"><span class="tbn-ic">' + ic(b.icon || 'music') + '</span><div class="tbn-t"><h2>' + esc(b.title) + '</h2><p>' + esc(b.text) + '</p></div>' +
      (b.btn ? '<a class="btn" href="' + esc(href(b.href)) + '"' + tg + '>' + esc(b.btn) + ic('arrow') + '</a>' : '') + '</aside>';
  }

  function main(s, posts) { return hero(s) + s.sections.map(function (x) { return section(x, posts); }).join('') + banner(s); }

  function jsonld(s) {
    var u = s.site.url.replace(/\/$/, '');
    return JSON.stringify({ '@context': 'https://schema.org', '@graph': [
      { '@type': 'WebSite', name: s.site.name, url: u + '/', inLanguage: 'fa-IR', description: s.site.desc },
      { '@type': 'Organization', name: s.site.name, url: u + '/', logo: u + s.site.favicon }
    ] }).replace(/</g, '\\u003c');
  }

  function page(s, posts) {
    var u = s.site.url.replace(/\/$/, ''), fl = fontLink(s);
    var img = s.site.ogImage ? '<meta property="og:image" content="' + esc(s.site.ogImage) + '"><meta name="twitter:image" content="' + esc(s.site.ogImage) + '">' : '';
    return '<!DOCTYPE html>\n<html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' +
      '<title>' + esc(s.site.title) + '</title><meta name="description" content="' + esc(s.site.desc) + '">' +
      '<link rel="canonical" href="' + esc(u) + '/"><meta name="robots" content="' + robotsMeta(s) + '">' +
      '<meta name="theme-color" content="' + esc(s.ui.bg) + '"><meta name="sr-api" content="' + esc(s.site.api) + '">' +
      '<meta property="og:type" content="website"><meta property="og:locale" content="fa_IR"><meta property="og:site_name" content="' + esc(s.site.name) + '">' +
      '<meta property="og:title" content="' + esc(s.site.title) + '"><meta property="og:description" content="' + esc(s.site.desc) + '"><meta property="og:url" content="' + esc(u) + '/">' +
      '<meta name="twitter:card" content="summary_large_image">' + img +
      '<link rel="icon" href="' + esc(s.site.favicon) + '">' +
      '<link rel="preload" href="/assets/fonts/Vazirmatn.woff2" as="font" type="font/woff2" crossorigin>' +
      (fl ? '<link rel="stylesheet" href="' + esc(fl) + '">' : '') +
      '<link rel="stylesheet" href="/assets/theme.css"><style id="cfg">' + cssVars(s) + '</style>' +
      '<script type="application/ld+json">' + jsonld(s) + '</script></head>' +
      '<body class="' + (s.ui.dots ? 'dots' : '') + '"><a class="skip" href="#main">پرش به محتوا</a>' +
      header(s) + '<main id="main" class="wrap">' + main(s, posts) + '</main>' + footer(s) +
      '<script src="/assets/core.js" defer></script></body></html>';
  }


  /* ================= صفحهٔ پست ================= */
  var CATS = {
    compose: { theme: 'compose', name: 'آهنگسازی و تنظیم', dir: '/compose/' },
    mixing: { theme: 'mix', name: 'میکس و مسترینگ', dir: '/mixing/' },
    chords: { theme: 'chords', name: 'آکوردها', dir: '/chords/' },
    sheets: { theme: 'sheets', name: 'نت‌ها', dir: '/sheets/' },
    extra: { theme: 'extra', name: 'متفرقه', dir: '/blog/' }
  };
  var POST_DEFAULT = { slug: '', cat: 'compose', title: '', desc: '', img: '', imgAlt: '', tag: '', readTime: '', date: '', updated: '', author: 'ساز و راز', comments: true, blocks: [], related: [], align: 'justify', seo: { title: '', desc: '', noindex: false, kw: '' } };
  var BLOCK_NAMES = { paragraph: 'پاراگراف', heading: 'عنوان', image: 'تصویر', video: 'ویدیوی یوتیوب', soundcloud: 'ساندکلاد', audio: 'فایل صوتی', highlight: 'نکتهٔ مهم', list: 'فهرست', button: 'دکمه / دانلود', divider: 'جداکننده', aparat: 'ویدیوی آپارات', lottie: 'انیمیشن لوتی (Lottie)', embed: 'انیمیشن / کد HTML-CSS-JS', anchors: 'لنگر (فهرست پیوند به بلوک‌ها)', adbanner: 'بنر تبلیغاتی (گیف / تصویر / کد متحرک)', gate: 'بلوک مادر — فقط اعضا / پرمیوم (شامل چند بلوک بعدی)' };
  function catInfo(s, cat) {
    var c = CATS[cat] || CATS.extra, sec = (s.sections || []).filter(function (x) { return x.auto === cat; })[0];
    return { theme: c.theme, dir: c.dir, name: (sec && sec.short) || c.name };
  }
  function postUrl(s, p) { return s.site.url.replace(/\/$/, '') + catInfo(s, p.cat).dir + p.slug + '/'; }
  function absUrl(s, u) { return !u ? '' : /^https?:\/\//.test(u) ? u : s.site.url.replace(/\/$/, '') + (u.charAt(0) === '/' ? u : '/' + u); }
  function inline(t) {
    return esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g, '<a href="$2" rel="noopener">$1</a>').replace(/\n/g, '<br>');
  }
  function ytId(u) {
    u = String(u || '').trim(); var m = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/.exec(u);
    return m ? m[1] : (/^[A-Za-z0-9_-]{11}$/.test(u) ? u : '');
  }
  function words(p) {
    var t = [p.desc || ''];
    (p.blocks || []).forEach(function (b) { t.push(b.text || '', b.caption || '', b.title || ''); });
    return t.join(' ').split(/\s+/).filter(Boolean).length;
  }
  function readMin(p) { return p.readTime ? p.readTime : Math.max(1, Math.ceil(words(p) / 170)) + ' دقیقه مطالعه'; }
  function faDate(d) { try { return d ? new Date(d + 'T12:00:00').toLocaleDateString('fa-IR') : ''; } catch (e) { return ''; } }
  function apId(u) {
    u = String(u || '').trim(); var m = /aparat\.com\/(?:v\/|video\/video\/embed\/videohash\/)([A-Za-z0-9]+)/.exec(u);
    return m ? m[1] : (/^[A-Za-z0-9]{4,12}$/.test(u) ? u : '');
  }
  function blabel(b) {
    if (b.alabel) return b.alabel;
    var t = b.text || b.title || b.label || ''; t = String(t).split('\n')[0].replace(/\*\*/g, '').trim();
    return t ? t.slice(0, 48) : (BLOCK_NAMES[b.t] || 'بخش');
  }
  function wrapBlock(b, h) {
    if (!h) return h; var c = [];
    if (/^(right|center|left|justify)$/.test(b.align || '')) c.push('a-' + b.align);
    if (/^(lg|md|sm)$/.test(b.w || '')) c.push('w-' + b.w);
    if (/^(right|center|left|justify)$/.test(b.alignD || '')) c.push('d-a-' + b.alignD);
    if (/^(full|lg|md|sm)$/.test(b.wD || '')) c.push('d-w-' + b.wD);
    if (/^(right|center|left|justify)$/.test(b.alignM || '')) c.push('m-a-' + b.alignM);
    if (/^(full|lg|md|sm)$/.test(b.wM || '')) c.push('m-w-' + b.wM);
    return c.length ? '<div class="bw ' + c.join(' ') + '">' + h + '</div>' : h;
  }
  function blockHtml(b, i, all) {
    switch (b.t) {
      case 'paragraph': return (b.text || '').split(/\n{2,}/).filter(function (x) { return x.trim(); }).map(function (x) { return '<p>' + inline(x.trim()) + '</p>'; }).join('');
      case 'heading': var l = Math.max(2, Math.min(6, parseInt(b.level, 10) || 2)); return '<h' + l + ' id="h' + i + '">' + esc(b.text) + '</h' + l + '>';
      case 'image': return b.src ? '<figure class="fig"><img src="' + esc(href(b.src)) + '" alt="' + esc(b.alt || b.caption || '') + '" loading="lazy" decoding="async">' + (b.caption ? '<figcaption>' + esc(b.caption) + '</figcaption>' : '') + '</figure>' : '';
      case 'video': var id = ytId(b.url); return id ? '<div class="vid"><iframe src="https://www.youtube-nocookie.com/embed/' + id + '" title="' + esc(b.title || 'ویدیو') + '" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>' : '';
      case 'soundcloud': return /^https:\/\/soundcloud\.com\//.test(b.url || '') ? '<div class="sc"><iframe src="https://w.soundcloud.com/player/?url=' + encodeURIComponent(b.url) + '&color=%23ff9770&hide_related=true&show_comments=false" title="' + esc(b.title || 'SoundCloud') + '" loading="lazy"></iframe></div>' : '';
      case 'aparat': var ai = apId(b.url); return ai ? '<div class="vid"><iframe src="https://www.aparat.com/video/video/embed/videohash/' + ai + '/vt/frame" title="' + esc(b.title || 'ویدیو آپارات') + '" loading="lazy" allowfullscreen></iframe></div>' : '';
      case 'adbanner':
        var inner = '';
        if (b.mode === 'code') inner = b.code ? sandbox(b.code, b.height || 200, b.title || 'بنر') : '';
        else if (b.src) { var im = '<img src="' + esc(href(b.src)) + '" alt="' + esc(b.alt || b.title || 'بنر') + '" loading="lazy" decoding="async">'; inner = b.href ? '<a href="' + esc(href(b.href)) + '" target="_blank" rel="sponsored noopener">' + im + '</a>' : im; }
        return inner ? '<aside class="adb">' + (b.label === '-' ? '' : '<span class="adb-l">' + esc(b.label || 'تبلیغات') + '</span>') + inner + '</aside>' : '';
      case 'embed': return b.code ? '<div class="emb">' + sandbox(b.code, b.height, b.title) + '</div>' : '';
      case 'lottie': return /^https:\/\//.test(b.url || '') ? '<div class="emb">' + sandbox('<script src="https://unpkg.com/@lottiefiles/lottie-player@2.0.8/dist/lottie-player.js"><\/script><lottie-player src="' + esc(b.url) + '" background="transparent" speed="1" style="width:100%;height:100%" loop autoplay></lottie-player>', b.height || 280, b.title || 'انیمیشن', 'html,body{height:100%}') + '</div>' : '';
      case 'anchors':
        var its = (b.targets || []).map(function (id) { var t = (all || []).filter(function (x) { return x.id === id; })[0]; return t ? '<li><a href="#a-' + esc(id) + '">' + esc(blabel(t)) + '</a></li>' : ''; }).join('');
        return its ? '<nav class="anc" aria-label="' + esc(b.title || 'پیوندهای این صفحه') + '"><b>' + ic('arrow') + esc(b.title || 'پرش سریع به بخش‌ها') + '</b><ul>' + its + '</ul></nav>' : '';
      case 'audio': return b.src ? '<div class="aud"><span class="aud-i">' + ic('play') + '</span><div class="aud-b">' + (b.title ? '<b>' + esc(b.title) + '</b>' : '') + '<audio controls preload="none" src="' + esc(href(b.src)) + '"></audio></div>' + (b.dl ? '<a class="aud-d" href="' + esc(href(b.src)) + '" download rel="noopener">دانلود</a>' : '') + '</div>' : '';
      case 'highlight': return '<aside class="hl-box"><span class="hl-t">' + ic('bolt') + esc(b.label || 'نکتهٔ مهم') + '</span><div>' + inline(b.text || '') + '</div></aside>';
      case 'list': return '<ul>' + (b.text || '').split('\n').filter(function (x) { return x.trim(); }).map(function (x) { return '<li>' + inline(x.trim()) + '</li>'; }).join('') + '</ul>';
      case 'button': return '<p><a class="btn" href="' + esc(href(b.href)) + '" rel="noopener">' + ic('arrow') + esc(b.label || 'دانلود') + '</a>' + (b.note ? ' <small class="muted">' + esc(b.note) + '</small>' : '') + '</p>';
      case 'divider': return '<hr class="dv">';
    }
    return '';
  }
  function relCard(r) {
    return '<article class="card"><div class="thumb">' + (r.img ? '<img src="' + esc(href(r.img)) + '" alt="' + esc(r.title) + '" loading="lazy" decoding="async">' : '<div class="ph"></div>') + '</div><div class="card-b"><h3><a class="stretch" href="' + esc(href(r.href)) + '">' + esc(r.title) + '</a></h3>' + (r.desc ? '<p>' + esc(r.desc) + '</p>' : '') + '</div><span class="cta">مشاهده</span></article>';
  }
  var GATE_LV = { login: 'همهٔ کاربران واردشده', premium: 'فقط کاربران پرمیوم' };
  function gateRange(blocks, i) { var n = parseInt(blocks[i].count, 10) || 0; return Math.max(0, Math.min(n, blocks.length - i - 1)); }
  function renderOne(b, i, all, tg) { var h = wrapBlock(b, blockHtml(b, i, all)); return (b.id && tg[b.id] && h) ? '<div class="atg" id="a-' + esc(b.id) + '">' + h + '</div>' : h; }
  function anchorTargets(p) { var tg = {}; (p.blocks || []).forEach(function (b) { if (b.t === 'anchors') (b.targets || []).forEach(function (id) { tg[id] = 1; }); }); return tg; }
  function gateBox(b) {
    var lv = b.level === 'premium' ? 'premium' : 'login', ttl = lv === 'premium' ? 'این بخش ویژهٔ کاربران پرمیوم است' : 'این بخش ویژهٔ کاربران عضو است';
    var msg = b.gmsg || (lv === 'premium' ? 'برای دیدن این بخش باید حساب پرمیوم داشته باشید.' : 'برای دیدن این بخش وارد حساب کاربری خود شوید یا ثبت‌نام کنید.');
    return '<div class="gate" id="g-' + esc(b.id) + '" data-gid="' + esc(b.id) + '" data-lv="' + lv + '"><div class="gate-box"><span class="gate-ic" aria-hidden="true">🔒</span><b>' + ttl + '</b><p>' + esc(msg) + '</p>' +
      '<div class="gate-act">' + (lv === 'premium' ? '<a class="btn" href="/shop/">دریافت پرمیوم</a>' : '') + '<a class="btn" href="/account/">ورود / ثبت‌نام</a></div></div></div>';
  }
  /* محتوای بلوک‌های مادر برای ارسال به ورکر (در خود صفحه نمی‌آید) */
  function gateParts(s, p) {
    var all = p.blocks || [], tg = anchorTargets(p), out = [];
    all.forEach(function (b, i) { if (b.t !== 'gate' || !b.id) return; var n = gateRange(all, i), h = ''; for (var k = i + 1; k <= i + n; k++) h += renderOne(all[k], k, all, tg); out.push({ id: b.id, level: b.level === 'premium' ? 'premium' : 'login', html: h }); });
    return out;
  }
  function postBody(s, p, opt) {
    var all = p.blocks || [], tg = anchorTargets(p), ci = catInfo(s, p.cat), heads = [], bodyHtml = '', i, k, n, h, b;
    for (i = 0; i < all.length; i++) {
      b = all[i];
      if (b.t === 'gate') {
        n = gateRange(all, i);
        if (opt && opt.preview) {
          h = ''; for (k = i + 1; k <= i + n; k++) h += renderOne(all[k], k, all, tg);
          bodyHtml += '<div class="gate gate-pv"><div class="gate-tag">🔒 ' + GATE_LV[b.level === 'premium' ? 'premium' : 'login'] + ' — پیش‌نمایش (' + n + ' بلوک)</div>' + h + '</div>';
        } else bodyHtml += gateBox(b);
        i += n; continue;
      }
      if (b.t === 'heading' && b.text) heads.push({ id: 'h' + i, text: b.text, l: Math.max(2, Math.min(6, parseInt(b.level, 10) || 2)) });
      bodyHtml += renderOne(b, i, all, tg);
    }
    var toc = heads.length >= 3 ? '<nav class="toc" aria-label="فهرست مطالب"><b>فهرست مطالب</b><ol>' + heads.map(function (h) { return '<li' + (h.l > 2 ? ' style="margin-right:' + ((h.l - 2) * 16) + 'px;opacity:.85"' : '') + '><a href="#' + h.id + '">' + esc(h.text) + '</a></li>'; }).join('') + '</ol></nav>' : '';
    var meta = [faDate(p.date), readMin(p), p.author].filter(Boolean).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('');
    var rel = (p.related || []).filter(function (r) { return r.title && r.href; });
    return '<div class="art-wrap t-' + ci.theme + '"><article class="art">' +
      '<nav class="crumbs" aria-label="مسیر صفحه"><a href="/">خانه</a><span>›</span><a href="' + ci.dir + '">' + esc(ci.name) + '</a><span>›</span><span>' + esc(p.title) + '</span></nav>' +
      '<header class="art-h">' + (p.tag ? '<span class="chip">' + esc(p.tag) + '</span>' : '') + '<h1>' + esc(p.title) + '</h1>' + (p.desc ? '<p class="lead">' + esc(p.desc) + '</p>' : '') + '<div class="art-meta">' + meta + '</div></header>' +
      (p.img ? '<figure class="cover"><img src="' + esc(href(p.img)) + '" alt="' + esc(p.imgAlt || p.title) + '" width="1200" height="675" fetchpriority="high" decoding="async"></figure>' : '') +
      toc + '<div class="prose' + (p.align === 'right' ? '' : ' j') + '">' + bodyHtml + '</div>' +
      '<div class="art-foot"><button class="btn btn-w" type="button" data-share>' + ic('arrow') + 'اشتراک‌گذاری</button><a class="btn btn-dark" href="' + ci.dir + '">بیشتر در ' + esc(ci.name) + '</a></div></article>' +
      '<section class="related" data-cat="' + esc(p.cat) + '" data-slug="' + esc(p.slug) + '" data-manual="' + (rel.length ? 1 : 0) + '"' + (rel.length ? '' : ' hidden') + '><h2>مطالب مرتبط</h2><div class="grid v">' + rel.map(relCard).join('') + '</div></section>' +
      (p.comments !== false ? '<section class="box cm" id="comments" data-post="' + esc(p.slug) + '"><h2>نظرات</h2>' + (opt && opt.preview ? '<div class="list"><div class="li"><div><b>نمونه</b><small class="muted"> · امروز</small><p>اینجا نظرهای تأییدشدهٔ کاربران نمایش داده می‌شود. (پیش‌نمایش)</p></div></div></div><a class="btn" href="#comments">برای ثبت نظر وارد شوید</a>' : '<div id="cm-list" class="list"><div class="muted">در حال بارگذاری نظرات...</div></div><div id="cm-form"></div>') + '</section>' : '') + '</div>';
  }
  function postJsonLd(s, p) {
    var ci = catInfo(s, p.cat), u = s.site.url.replace(/\/$/, ''), url = postUrl(s, p);
    var art = { '@type': 'Article', headline: p.title, description: p.seo && p.seo.desc || p.desc, inLanguage: 'fa-IR', mainEntityOfPage: url, author: { '@type': 'Person', name: p.author || s.site.name }, publisher: { '@type': 'Organization', name: s.site.name, logo: { '@type': 'ImageObject', url: absUrl(s, s.site.favicon) } } };
    if ((p.blocks || []).some(function (b) { return b.t === 'gate'; })) { art.isAccessibleForFree = false; art.hasPart = [{ '@type': 'WebPageElement', isAccessibleForFree: false, cssSelector: '.gate' }]; }
    art.wordCount = words(p); art.articleSection = ci.name; var kw = (p.seo && p.seo.kw) || p.tag; if (kw) art.keywords = kw; if (p.img) art.image = [absUrl(s, p.img)]; if (p.date) art.datePublished = p.date; art.dateModified = p.updated || p.date || undefined;
    var bc = { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'خانه', item: u + '/' }, { '@type': 'ListItem', position: 2, name: ci.name, item: u + ci.dir }, { '@type': 'ListItem', position: 3, name: p.title, item: url }] };
    return JSON.stringify({ '@context': 'https://schema.org', '@graph': [art, bc] }).replace(/</g, '\\u003c');
  }
  function postHtml(s, p) {
    var ci = catInfo(s, p.cat), url = postUrl(s, p), fl = fontLink(s), seo = p.seo || {};
    var ttl = seo.title || (p.title + ' | ' + s.site.name), dsc = seo.desc || p.desc || s.site.desc, img = p.img ? absUrl(s, p.img) : absUrl(s, s.site.ogImage);
    return '<!DOCTYPE html>\n<html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' +
      '<title>' + esc(ttl) + '</title><meta name="description" content="' + esc(dsc) + '">' +
      '<link rel="canonical" href="' + esc(url) + '"><meta name="robots" content="' + (seo.noindex || s.site.noindex ? 'noindex,follow' : robotsMeta(s)) + '">' +
      '<meta name="theme-color" content="' + esc(s.ui.bg) + '"><meta name="sr-api" content="' + esc(s.site.api) + '">' +
      '<meta property="og:type" content="article"><meta property="og:locale" content="fa_IR"><meta property="og:site_name" content="' + esc(s.site.name) + '"><meta property="og:title" content="' + esc(ttl) + '"><meta property="og:description" content="' + esc(dsc) + '"><meta property="og:url" content="' + esc(url) + '">' +
      (img ? '<meta property="og:image" content="' + esc(img) + '"><meta name="twitter:image" content="' + esc(img) + '">' : '') + (p.date ? '<meta property="article:published_time" content="' + esc(p.date) + '">' : '') + '<meta property="article:modified_time" content="' + esc(p.updated || p.date || '') + '"><meta property="article:section" content="' + esc(ci.name) + '"><meta name="author" content="' + esc(p.author || s.site.name) + '">' + (img ? '<meta property="og:image:alt" content="' + esc(p.imgAlt || p.title) + '">' : '') + (seo.kw ? '<meta name="keywords" content="' + esc(seo.kw) + '">' : '') +
      '<meta name="twitter:card" content="summary_large_image"><link rel="icon" href="' + esc(s.site.favicon) + '">' +
      '<link rel="preload" href="/assets/fonts/Vazirmatn.woff2" as="font" type="font/woff2" crossorigin>' + (p.img ? '<link rel="preload" as="image" href="' + esc(href(p.img)) + '" fetchpriority="high">' : '') + (fl ? '<link rel="stylesheet" href="' + esc(fl) + '">' : '') +
      '<link rel="stylesheet" href="/assets/theme.css"><style id="cfg">' + cssVars(s) + '</style><script type="application/ld+json">' + postJsonLd(s, p) + '</script></head>' +
      '<body class="' + (s.ui.dots ? 'dots ' : '') + 't-' + ci.theme + '"><div class="pbar" id="pbar"></div><a class="skip" href="#main">پرش به محتوا</a>' + header(s, ci.dir) +
      '<main id="main" class="wrap">' + postBody(s, p) + '</main>' + footer(s) +
      '<script src="/assets/core.js" defer></script><script src="/assets/post.js" defer></script></body></html>';
  }
  function archivePage(s, cat, posts) {
    var ci = catInfo(s, cat), u = s.site.url.replace(/\/$/, ''), t = ci.name + ' | ' + s.site.name, url = u + ci.dir;
    var list = (posts || []).filter(function (p) { return p.cat === cat; }).sort(byDate), first = list.slice(0, 12);
    var desc = 'آرشیو مطالب ' + ci.name + ' در ' + s.site.name + (list.length ? ' — ' + list.slice(0, 3).map(function (p) { return p.title; }).join('، ') : '');
    var ld = { '@context': 'https://schema.org', '@graph': [
      { '@type': 'CollectionPage', name: ci.name, url: url, inLanguage: 'fa-IR', isPartOf: { '@type': 'WebSite', name: s.site.name, url: u + '/' }, mainEntity: { '@type': 'ItemList', itemListElement: first.map(function (p, i) { return { '@type': 'ListItem', position: i + 1, url: u + p.href, name: p.title }; }) } },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'خانه', item: u + '/' }, { '@type': 'ListItem', position: 2, name: ci.name, item: url }] }] };
    var fl = fontLink(s);
    return '<!DOCTYPE html>\n<html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' +
      '<title>' + esc(t) + '</title><meta name="description" content="' + esc(desc.slice(0, 200)) + '"><link rel="canonical" href="' + esc(url) + '"><meta name="robots" content="' + robotsMeta(s) + '">' +
      '<meta property="og:type" content="website"><meta property="og:locale" content="fa_IR"><meta property="og:site_name" content="' + esc(s.site.name) + '"><meta property="og:title" content="' + esc(t) + '"><meta property="og:url" content="' + esc(url) + '">' +
      (s.site.ogImage ? '<meta property="og:image" content="' + esc(absUrl(s, s.site.ogImage)) + '">' : '') + '<meta name="twitter:card" content="summary_large_image">' +
      '<meta name="theme-color" content="' + esc(s.ui.bg) + '"><meta name="sr-api" content="' + esc(s.site.api) + '"><link rel="icon" href="' + esc(s.site.favicon) + '"><link rel="preload" href="/assets/fonts/Vazirmatn.woff2" as="font" type="font/woff2" crossorigin>' +
      (fl ? '<link rel="stylesheet" href="' + esc(fl) + '">' : '') + '<link rel="stylesheet" href="/assets/theme.css"><style id="cfg">' + cssVars(s) + '</style>' +
      '<script type="application/ld+json">' + JSON.stringify(ld).replace(/</g, '\\u003c') + '</script></head>' +
      '<body class="' + (s.ui.dots ? 'dots ' : '') + 't-' + ci.theme + '" data-cat="' + esc(cat) + '"><a class="skip" href="#main">پرش به محتوا</a>' + header(s, ci.dir) +
      '<main id="main" class="wrap"><div class="pg wide"><nav class="crumbs" aria-label="مسیر صفحه"><a href="/">خانه</a><span>›</span><span>' + esc(ci.name) + '</span></nav><div class="pg-h"><h1>' + esc(ci.name) + '</h1></div>' +
      '<div id="list" class="grid v"' + (first.length ? ' data-static="' + first.length + '"' : '') + '>' + (first.length ? first.map(function (p) { return pcard(p, null); }).join('') : '<div class="box">هنوز مطلبی در این بخش منتشر نشده است.</div>') + '</div><div class="acts"><button class="btn" type="button" id="more" hidden>نمایش بیشتر</button></div></div></main>' + footer(s) +
      '<script src="/assets/render.js"></script><script src="/assets/shell.js" data-active="' + esc(ci.dir) + '"></script><script src="/assets/archive.js" defer></script></body></html>';
  }

  return { DEFAULTS: DEFAULTS, ICON_NAMES: ICON_NAMES, esc: esc, ic: ic, cssVars: cssVars, fontLink: fontLink, header: header, footer: footer, main: main, section: section, card: card, page: page, CATS: CATS, POST_DEFAULT: POST_DEFAULT, BLOCK_NAMES: BLOCK_NAMES, catInfo: catInfo, postUrl: postUrl, postBody: postBody, postHtml: postHtml, archivePage: archivePage, readMin: readMin, ytId: ytId, byDate: byDate, miniBanner: miniBanner, robotsMeta: robotsMeta, apId: apId, blabel: blabel, gateParts: gateParts };
});
