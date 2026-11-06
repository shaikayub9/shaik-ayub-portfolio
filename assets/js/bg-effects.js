/* Constellation background: drifting points joined by thin lines; points ease away from the cursor and
   the cursor links to nearby points. Colours follow the dark / light theme. Pauses when the tab is hidden
   and stays still for visitors who prefer reduced motion. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var rnd = function (a, b) { return a + Math.random() * (b - a); };

  var host = document.createElement('div');
  host.className = 'bgfx';
  host.setAttribute('aria-hidden', 'true');
  document.body.prepend(host);
  var c = document.createElement('canvas');
  host.appendChild(c);
  var ctx = c.getContext('2d');
  var w = 0, h = 0, ps = [];

  var DARK  = { line: '3,255,255',   lineK: 1,   mouse: '160,255,255', dot: 'rgba(3,255,255,0.75)',  glow: '#03ffff', blur: 7 };
  var LIGHT = { line: '0,113,126',   lineK: 1.15, mouse: '0,90,105',    dot: 'rgba(0,113,126,0.62)',  glow: '',        blur: 0 };
  var pal = function () { return root.getAttribute('data-theme') === 'light' ? LIGHT : DARK; };

  var mouse = { x: 0, y: 0, on: false };
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true;
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', function () { mouse.on = false; });

  function fit() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.min(80, Math.round((w * h) / (w < 576 ? 17000 : 15000)));
    while (ps.length < n) ps.push({ x: rnd(0, w), y: rnd(0, h), vx: rnd(-0.22, 0.22), vy: rnd(-0.22, 0.22), r: rnd(0.8, 1.9) });
    ps.length = Math.min(ps.length, n);
  }

  /* Points, lines and the cursor link, drawn in one palette inside a horizontal band of the screen. */
  function render(P, y0, y1) {
    if (y1 <= y0) return;
    var link = w < 576 ? 95 : 135, i, j, d;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, y0, w, y1 - y0); ctx.clip();
    ctx.lineWidth = 1;
    for (i = 0; i < ps.length; i++) {
      for (j = i + 1; j < ps.length; j++) {
        d = Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y);
        if (d < link) {
          ctx.strokeStyle = 'rgba(' + P.line + ',' + ((1 - d / link) * 0.2 * P.lineK).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(ps[i].x, ps[i].y); ctx.lineTo(ps[j].x, ps[j].y); ctx.stroke();
        }
      }
      if (mouse.on) {
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
    ctx.restore();
  }

  var footerEl = document.querySelector('.footer');
  root.classList.add('has-bgfx');

  function draw() {
    var i, p, d;
    ctx.clearRect(0, 0, w, h);
    for (i = 0; i < ps.length; i++) {
      p = ps[i];
      if (!reduce) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
      }
      if (mouse.on) {
        var dx = p.x - mouse.x, dy = p.y - mouse.y; d = Math.hypot(dx, dy);
        if (d < 110 && d > 0.1) { p.x += (dx / d) * 0.7; p.y += (dy / d) * 0.7; }
      }
    }
    if (root.getAttribute('data-theme') !== 'light') { render(DARK, 0, h); return; }
    /* Light mode: the page uses teal, but the footer is a dark band, so it is painted here and gets its own cyan points. */
    var fy = h, fb = h;
    if (footerEl) {
      var r = footerEl.getBoundingClientRect();
      if (r.top < h && r.bottom > 0) { fy = Math.max(0, r.top); fb = Math.min(h, r.bottom); }
    }
    render(LIGHT, 0, fy);
    if (fy < h) { ctx.fillStyle = '#0a0f14'; ctx.fillRect(0, fy, w, fb - fy); render(DARK, fy, fb); }
  }

  var raf = 0;
  function loop() { draw(); raf = document.hidden ? 0 : requestAnimationFrame(loop); }
  function start() { if (!reduce && !raf) raf = requestAnimationFrame(loop); }

  fit();
  window.addEventListener('resize', function () { fit(); if (reduce) draw(); });
  window.addEventListener('themechange', function () { if (reduce) draw(); });
  if (reduce) window.addEventListener('scroll', draw, { passive: true });
  document.addEventListener('visibilitychange', start);
  if (reduce) draw(); else start();
})();
