/* Cookie Post V2.22 — Clear Stamp means genuinely no stamp selected.
   Loaded after shape-layout.js and finish.js; does not alter other tools. */
(() => {
  'use strict';
  const clear = document.getElementById('stamp-clear');
  if (!clear) return;

  // The older click handler resets selection to "fu" (the first stamp).
  // Capture the click before it reaches that handler and clear the state instead.
  clear.addEventListener('click', (event) => {
    event.stopImmediatePropagation();
    event.preventDefault();
    state.stamped = null;
    stampState.selected = null;
    stampState.applied = false;
    stampState.depth = 50;
    stampState.rotation = 0;
    stampState.x = 180;
    stampState.y = 180;
    save();
    renderStamp();
    const info = document.getElementById('stamp-info');
    if (info) info.textContent = 'No stamp selected. Choose a motif to add a new stamp.';
    const notice = document.getElementById('stamp-notice');
    if (notice) notice.textContent = 'Stamp cleared. Your cookie is now blank unless other decorations are present.';
    toast('Stamp cleared.');
  }, true);

  // Existing rendering previously had a fallback "福" when no stamp was selected.
  const previousImprintGraphic = imprintGraphic;
  imprintGraphic = function (...args) {
    return stampState.selected ? previousImprintGraphic.apply(this, args) : '';
  };

  const previousRenderStamp = renderStamp;
  renderStamp = function (...args) {
    const result = previousRenderStamp.apply(this, args);
    if (!stampState.selected) {
      const info = document.getElementById('stamp-info');
      if (info) info.textContent = 'No stamp selected. Choose a motif to add a new stamp.';
      const notice = document.getElementById('stamp-notice');
      if (notice) notice.textContent = 'No traditional stamp selected.';
      document.querySelectorAll('#stamp-grid [data-stamp]').forEach(btn => btn.classList.remove('selected'));
    }
    return result;
  };
})();
