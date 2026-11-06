/* Start-up helpers. Kept in a file (not inline) so the Content-Security-Policy can block all inline scripts. */
(function () {
  var root = document.documentElement;
  /* 1. Remember the visitor's colour theme before the first paint, so the page never flashes the wrong colours. */
  try { if (localStorage.getItem('sa-theme') === 'light') root.setAttribute('data-theme', 'light'); } catch (e) { /* storage blocked: stay on dark */ }
  /* 2. Safety net: if anything stops the loading screen from finishing, remove it after 15 seconds. */
  root.classList.add('pl-lock');
  setTimeout(function () {
    var p = document.getElementById('preloader');
    if (p) p.remove();
    root.classList.remove('pl-lock');
  }, 15000);
})();
