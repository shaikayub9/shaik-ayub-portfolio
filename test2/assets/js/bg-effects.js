/* Constellation background: drifting points joined by thin lines; points ease away from the cursor and the
   cursor links to nearby points. Colours follow the dark / light theme. One field fills the page; in light
   mode the (dark) footer gets its own field so it keeps animating without any scroll-time repainting.
   Everything pauses when hidden and stays still for visitors who prefer reduced motion. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var DARK  = { line: '3,255,255', lineK: 1,    mouse: '160,255,255', dot: 'rgba(3,255,255,0.75)', glow: '#03ffff', blur: 7 };
  var LIGHT = { line: '0,113,126', lineK: 1.15, mouse: '0,90,105',    dot: 'rgba(0,113,126,0.62)', glow: '',        blur: 0 };
  var isLight = function () { return root.getAttribute('data-theme') === 'light'; };

  var mouse = { x: 0, y: 0, on: false };
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true;
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', function () { mouse.on = false; });

  /* A field of points inside one element. cfg: host, size(), pal(), follow (cursor links), area (px per point), max */
  function Field(cfg) {
    var c = document.createElement('canvas');
    cfg.host.appendChild(c);
    var ctx = c.getContext('2d'), w = 0, h = 0, ps = [];
    var self = {
      fit: function () {
        var s = cfg.size(), dpr = Math.min(window.devicePixelRatio || 1, 2);
        if (!s.w || !s.h) return;
        w = s.w; h = s.h;
        c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var n = Math.min(cfg.max, Math.round((w * h) / (w < 576 ? cfg.area * 1.15 : cfg.area)));
        while (ps.length < n) ps.push({ x: rnd(0, w), y: rnd(0, h), vx: rnd(-0.22, 0.22), vy: rnd(-0.22, 0.22), r: rnd(0.8, 1.9) });
        ps.length = Math.min(ps.length, n);
      },
      step: function () {
        for (var i = 0; i < ps.length; i++) {
          var p = ps[i];
          if (!reduce) {
            p.x += p.vx; p.y += p.vy;
            if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
            if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
          }
          if (cfg.follow && mouse.on) {
            var dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
            if (d < 110 && d > 0.1) { p.x += (dx / d) * 0.7; p.y += (dy / d) * 0.7; }
          }
        }
      },
      render: function () {
        var P = cfg.pal(), link = w < 576 ? 95 : 135, i, j, d;
        ctx.clearRect(0, 0, w, h);
        ctx.lineWidth = 1;
        for (i = 0; i < ps.length; i++) {
          for (j = i + 1; j < ps.length; j++) {
            d = Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y);
            if (d < link) {
              ctx.strokeStyle = 'rgba(' + P.line + ',' + ((1 - d / link) * 0.2 * P.lineK).toFixed(3) + ')';
              ctx.beginPath(); ctx.moveTo(ps[i].x, ps[i].y); ctx.lineTo(ps[j].x, ps[j].y); ctx.stroke();
            }
          }
          if (cfg.follow && mouse.on) {
            d = Math.hypot(ps[i].x - mouse.x, ps[i].y - mouse.y);
            if (d < 170) {
              ctx.strokeStyle = 'rgba(' + P.mouse + ',' + ((1 - d / 170) * 0.45).toFixed(3) + ')';
              ctx.beginPath(); ctx.moveTo(ps[i].x, ps[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
            }
          }
        }
        if (P.blur) { ctx.shadowColor = P.glow; ctx.shadowBlur = P.blur; }
        ctx.fillStyle = P.dot;
        for (i = 0; i < ps.length; i++) { ctx.beginPath(); ctx.arc(ps[i].x, ps[i].y, ps[i].r, 0, 6.2832); ctx.fill(); }
        ctx.shadowBlur = 0;
      }
    };
    return self;
  }

  /* ---- page-wide field ---- */
  var host = document.createElement('div');
  host.className = 'bgfx';
  host.setAttribute('aria-hidden', 'true');
  document.body.prepend(host);
  var page = Field({ host: host, size: function () { return { w: host.clientWidth, h: host.clientHeight }; },
    pal: function () { return isLight() ? LIGHT : DARK; }, follow: true, area: 15000, max: 80 });

  /* ---- footer field (shown in light mode only; CSS hides it in dark mode) ---- */
  var footerEl = document.querySelector('.footer'), foot = null, footVisible = false;
  if (footerEl) {
    var fx = document.createElement('div');
    fx.className = 'footer-fx';
    fx.setAttribute('aria-hidden', 'true');
    footerEl.prepend(fx);
    foot = Field({ host: fx, size: function () { return { w: footerEl.offsetWidth, h: footerEl.offsetHeight }; },
      pal: function () { return DARK; }, follow: false, area: 14000, max: 60 });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { footVisible = e[0].isIntersecting; }, { threshold: 0 }).observe(footerEl);
    } else { footVisible = true; }
    if ('ResizeObserver' in window) new ResizeObserver(function () { foot.fit(); if (reduce) foot.render(); }).observe(footerEl);
  }

  var lastW = 0, lastH = 0;
  function fitPage() { page.fit(); lastW = host.clientWidth; lastH = host.clientHeight; if (reduce) page.render(); }
  /* On phones the address bar sliding away fires resize events; ignore those small height-only changes. */
  window.addEventListener('resize', function () {
    if (host.clientWidth !== lastW || Math.abs(host.clientHeight - lastH) > 150) fitPage();
  });

  var raf = 0;
  function frame() {
    page.step(); page.render();
    if (foot && footVisible && isLight()) { foot.step(); foot.render(); }
    raf = document.hidden ? 0 : requestAnimationFrame(frame);
  }
  function start() { if (!reduce && !raf) raf = requestAnimationFrame(frame); }
  window.addEventListener('themechange', function () { if (reduce) { page.render(); if (foot) foot.render(); } });
  document.addEventListener('visibilitychange', start);
  fitPage(); if (foot) foot.fit();
  if (reduce) { page.render(); if (foot) foot.render(); } else start();
})();
