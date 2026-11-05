/* Cookie Post V2.21 | User-provided BGM; native HTMLAudioElement; no playback on entry screen. */
(() => {
  'use strict';
  const entry = document.getElementById('entry');
  const entryStart = document.getElementById('entry-start');
  const dock = document.getElementById('cookie-bgm-dock');
  const trigger = document.getElementById('cookie-bgm-trigger');
  const panel = document.getElementById('cookie-bgm-panel');
  const audio = document.getElementById('cookie-bgm-audio');
  const toggle = document.getElementById('cookie-bgm-toggle');
  const slider = document.getElementById('cookie-bgm-volume');
  const value = document.getElementById('cookie-bgm-volume-value');
  if (!entry || !dock || !trigger || !panel || !audio || !toggle || !slider || !value) return;

  // Always start at 15%, and keep music looping while navigating the site.
  audio.volume = 0.15;
  audio.loop = true;
  slider.value = '15';
  value.textContent = '15%';
  let userPaused = false;
  let hasEntered = false;
  let pendingPlay = false;

  function isEntryVisible() { return !entry.classList.contains('hidden'); }
  function refreshVisibility() {
    dock.hidden = isEntryVisible();
    if (dock.hidden) {
      dock.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      // Keep the entry screen silent even when returning there.
      if (!entry.classList.contains('entry-leaving') && !audio.paused) audio.pause();
    }
  }
  function refreshButton() {
    const playing = !audio.paused;
    toggle.textContent = playing ? 'Pause' : 'Play';
    toggle.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
  }
  async function playMusic() {
    if (userPaused || isEntryVisible()) return;
    if (pendingPlay) return;
    pendingPlay = true;
    try { await audio.play(); }
    catch (err) {
      // Browser gesture policies vary. A later interaction will retry.
      console.info('[Cookie Post Music] Waiting for a user gesture to start:', err?.name || err);
    } finally { pendingPlay = false; refreshButton(); }
  }

  // Press To Start is a user gesture. Don't start audio on initial page load.
  if (entryStart) entryStart.addEventListener('click', () => {
    hasEntered = true;
    // The navigation transition remains untouched. The sound starts during
    // the click gesture, and the dock appears as soon as entry is hidden.
    if (userPaused) return;
    pendingPlay = true;
    const attempt = audio.play();
    if (attempt && typeof attempt.then === 'function') {
      attempt.catch(err => console.info('[Cookie Post Music] Play unavailable:', err?.name || err))
        .finally(() => { pendingPlay = false; refreshButton(); });
    } else { pendingPlay = false; refreshButton(); }
  });

  const observer = new MutationObserver(() => {
    refreshVisibility();
    if (!dock.hidden && hasEntered && !userPaused && audio.paused) playMusic();
  });
  observer.observe(entry, {attributes:true, attributeFilter:['class']});

  // When landing on the home screen directly or after a denied autoplay,
  // retry only on an actual user pointer/key action.
  document.addEventListener('pointerdown', () => {
    if (!isEntryVisible() && !userPaused && audio.paused) { hasEntered = true; playMusic(); }
  }, {passive:true});
  document.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && !isEntryVisible() && !userPaused && audio.paused) {
      hasEntered = true; playMusic();
    }
  });

  toggle.addEventListener('click', () => {
    if (!audio.paused) { userPaused = true; audio.pause(); }
    else { userPaused = false; hasEntered = true; playMusic(); }
    refreshButton();
  });
  slider.addEventListener('input', () => {
    const volume = Math.min(100, Math.max(0, Number(slider.value)));
    audio.volume = volume / 100;
    value.textContent = `${volume}%`;
  });
  trigger.addEventListener('click', () => {
    const open = !dock.classList.contains('is-open');
    dock.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('pointerdown', event => {
    if (!dock.contains(event.target)) {
      dock.classList.remove('is-open');
      trigger.setAttribute('aria-expanded','false');
    }
  }, {passive:true});
  audio.addEventListener('play', refreshButton);
  audio.addEventListener('pause', refreshButton);
  audio.addEventListener('ended', refreshButton);
  refreshVisibility();
  refreshButton();
})();
