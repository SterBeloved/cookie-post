/* Cookie Post V2.22 — Clear Stamp means genuinely no stamp selected.
   Loaded after shape-layout.js and finish.js; does not alter other tools. */
(() => {
  'use strict';
  const clear = document.getElementById('stamp-clear');
  if (!clear) return;


  // A separate history for Traditional Stamps. Icing, Cream, Toppings
  // and Image to Pattern are never changed by stamp undo.
  const stampHistory = [];
  const stampSnapshot = () => JSON.stringify({
    selected: stampState.selected,
    depth: stampState.depth,
    rotation: stampState.rotation,
    x: stampState.x,
    y: stampState.y,
    size: stampState.size,
    applied: stampState.applied,
    stamped: state.stamped ? { ...state.stamped } : null
  });
  function rememberStampEdit() {
    const value = stampSnapshot();
    if (stampHistory[stampHistory.length - 1] !== value) {
      stampHistory.push(value);
      if (stampHistory.length > 60) stampHistory.shift();
    }
  }
  const track = (selector, type, predicate = () => true) => {
    document.querySelector(selector)?.addEventListener(type, event => {
      if (predicate(event)) rememberStampEdit();
    }, true);
  };
  track('#stamp-grid', 'click', e => !!e.target.closest('[data-stamp]'));
  track('#stamp-depth', 'input');
  track('#stamp-rotation', 'input');
  track('#stamp-scale', 'input');
  track('#stamp-center', 'click');
  track('#stamp-apply', 'click', () => !!stampState.selected);
  track('#stamp-canvas', 'click', () => state.page === 'decorate' && state.decorateTool === 'stamps');

  const undo = document.getElementById('stamp-undo');
  undo?.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation(); // block the old "restore last saved stamp" listener
    if (!stampHistory.length) {
      toast('No stamp edit to undo.');
      return;
    }
    const previous = JSON.parse(stampHistory.pop());
    state.stamped = previous.stamped;
    Object.assign(stampState, {
      selected: previous.selected,
      depth: previous.depth,
      rotation: previous.rotation,
      x: previous.x,
      y: previous.y,
      size: previous.size,
      applied: previous.applied
    });
    save();
    renderStamp();
    toast('Last stamp edit undone.');
  }, true);

  // The older click handler resets selection to "fu" (the first stamp).
  // Capture the click before it reaches that handler and clear the state instead.
  clear.addEventListener('click', (event) => {
    event.stopImmediatePropagation();
    event.preventDefault();
    rememberStampEdit();
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
