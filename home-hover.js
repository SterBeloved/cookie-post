/* V2.17 — hover-only home outlines and labels. No navigation changes. */
(() => {
  const home = document.getElementById('home');
  const art = home && home.querySelector('.updated-home');
  if (!art) return;
  const items = [
    ['menu-start', 'free-creation', 'Free Creation'],
    ['menu-journal', 'my-collection', 'My Collection'],
    ['menu-gacha', 'cookie-gacha', 'Cookie Gacha'],
    ['menu-copycat', 'cookie-copycat', 'Cookie Copycat']
  ];
  let active = null;
  const elements = new Map();
  const hide = () => {
    if (!active) return;
    active.outline.classList.remove('is-visible');
    active.caption.classList.remove('is-visible');
    active = null;
  };
  for (const [id, key, label] of items) {
    const hotspot = document.getElementById(id);
    if (!hotspot) continue;
    const outline = document.createElement('img');
    outline.src = 'assets/hover-' + key + '.png';
    outline.alt = '';
    outline.setAttribute('aria-hidden', 'true');
    outline.decoding = 'async';
    outline.className = 'home-hover-outline home-hover-outline--' + key;
    const caption = document.createElement('span');
    caption.className = 'home-hover-caption home-hover-caption--' + key;
    caption.textContent = label;
    caption.setAttribute('aria-hidden', 'true');
    // Put noninteractive overlays before buttons; labels remain positioned above buttons.
    art.insertBefore(outline, art.querySelector('.menu-hotspot'));
    art.appendChild(caption);
    elements.set(id, {outline, caption});
    const show = () => {
      if (home.classList.contains('hidden')) return;
      hide();
      active = elements.get(id);
      active.outline.classList.add('is-visible');
      active.caption.classList.add('is-visible');
    };
    hotspot.addEventListener('pointerenter', e => {
      if (e.pointerType !== 'touch') show();
    });
    hotspot.addEventListener('pointerleave', hide);
    hotspot.addEventListener('focus', show);
    hotspot.addEventListener('blur', hide);
    hotspot.addEventListener('pointerdown', hide);
    hotspot.addEventListener('click', hide);
  }
  // When returning home, do not retain hover state from previous navigation.
  const watcher = new MutationObserver(() => {
    if (home.classList.contains('hidden')) hide();
  });
  watcher.observe(home, {attributes:true, attributeFilter:['class']});
})();
