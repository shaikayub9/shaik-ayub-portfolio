/* Dark / light switch. Dark is the default; the visitor's choice is remembered on their device. */
(function () {
  var KEY = 'sa-theme', root = document.documentElement;
  function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function store(t) { try { localStorage.setItem(KEY, t); } catch (e) { /* private mode: just don't remember */ } }

  var bar = document.createElement('div');
  bar.className = 'theme-switch';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', 'Colour theme');
  bar.innerHTML =
    '<button type="button" data-theme-set="dark" aria-label="Dark mode"><i class="bi bi-moon-stars-fill" aria-hidden="true"></i><span>Dark</span></button>' +
    '<button type="button" data-theme-set="light" aria-label="Light mode"><i class="bi bi-sun-fill" aria-hidden="true"></i><span>Light</span></button>';
  document.body.appendChild(bar);

  var meta = document.querySelector('meta[name="theme-color"]');
  function apply(t, animate, remember) {
    if (animate) { root.classList.add('theme-anim'); setTimeout(function () { root.classList.remove('theme-anim'); }, 450); }
    if (t === 'light') root.setAttribute('data-theme', 'light'); else root.removeAttribute('data-theme');
    if (meta) meta.setAttribute('content', t === 'light' ? '#f3f6f8' : '#080c11');
    bar.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.themeSet === t)); });
    if (remember) store(t);
    window.dispatchEvent(new CustomEvent('themechange', { detail: t }));
  }
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-theme-set]');
    if (b) apply(b.dataset.themeSet, true, true);
  });
  apply(saved() === 'light' ? 'light' : 'dark', false, false);
})();
