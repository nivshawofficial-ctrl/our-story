(() => {
  const $ = (s, scope = document) => scope.querySelector(s);
  const $$ = (s, scope = document) => [...scope.querySelectorAll(s)];
  const loader = $('#loader'), profiles = $('#profiles'), site = $('#site');
  const modal = $('#episode-modal'), lightbox = $('#lightbox'), secret = $('#secret');
  const audio = $('#our-song'), music = $('#music-toggle'), toast = $('#toast');
  let lastFocus, logoClicks = 0, logoTimer;

  window.addEventListener('load', () => setTimeout(() => loader.classList.add('is-gone'), 1550));
  $('#enter-site').addEventListener('click', () => { profiles.hidden = true; site.hidden = false; window.scrollTo(0, 0); $('#home').focus?.(); });

  const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); observer.unobserve(e.target); } }), { threshold: .12 });
  $$('.reveal').forEach(el => observer.observe(el));
  let scrollFrame;
  window.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      $('#nav').classList.toggle('is-solid', scrollY > 40);
      document.documentElement.style.setProperty('--page-scroll', `${Math.min(scrollY * .035, 24)}px`);
      scrollFrame = null;
    });
  }, { passive: true });

  function open(el) {
    lastFocus = document.activeElement;
    site.inert = true;
    el.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => el.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    $('.modal-close', el).focus();
  }
  function close(el) {
    el.classList.remove('is-open');
    el.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    site.inert = false;
    lastFocus?.focus();
  }
  $$('.episode-open').forEach(button => button.addEventListener('click', () => {
    $$('.episode-view', modal).forEach(v => v.classList.remove('is-active'));
    const episode = $('#' + button.dataset.episode);
    episode.classList.add('is-active');
    modal.setAttribute('aria-label', $('h2', episode).textContent);
    open(modal);
  }));
  $$('.memory').forEach(button => button.addEventListener('click', () => { $('img', lightbox).src = button.dataset.full; $('img', lightbox).alt = $('img', button).alt; open(lightbox); }));
  $$('.memory-rail').forEach(rail => rail.addEventListener('wheel', event => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) { rail.scrollLeft += event.deltaY; event.preventDefault(); }
  }, { passive: false }));
  [modal, lightbox, secret].forEach(el => { $('.modal-close', el).addEventListener('click', () => close(el)); el.addEventListener('click', e => { if (e.target === el) close(el); }); });
  document.addEventListener('keydown', e => {
    const activeDialog = [modal, lightbox, secret].find(x => x.classList.contains('is-open'));
    if (e.key === 'Escape' && activeDialog) close(activeDialog);
    if (e.key === 'Tab' && activeDialog) {
      const focusable = $$('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])', activeDialog).filter(el => !el.hidden);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  $$('.logo-trigger').forEach(logo => logo.addEventListener('click', () => { clearTimeout(logoTimer); logoClicks++; logoTimer = setTimeout(() => logoClicks = 0, 1800); if (logoClicks === 5) { logoClicks = 0; open(secret); } }));
  $('#favourite').addEventListener('click', () => showToast('Akshita is already at the top of the list. ♥'));
  function showToast(text) { toast.textContent = text; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3000); }

  audio.addEventListener('canplay', () => music.hidden = false, { once: true });
  audio.addEventListener('error', () => music.hidden = true);
  audio.load();
  music.addEventListener('click', async () => { try { if (audio.paused) { await audio.play(); music.classList.add('is-playing'); $('.music-label', music).textContent = 'Pause Our Song'; music.setAttribute('aria-label', 'Pause our song'); } else { audio.pause(); music.classList.remove('is-playing'); $('.music-label', music).textContent = 'Play Our Song'; music.setAttribute('aria-label', 'Play our song'); } } catch { music.hidden = true; } });
  audio.addEventListener('ended', () => { music.classList.remove('is-playing'); $('.music-label', music).textContent = 'Play Our Song'; });
  document.addEventListener('visibilitychange', () => { if (document.hidden && !audio.paused) audio.pause(); });
})();
