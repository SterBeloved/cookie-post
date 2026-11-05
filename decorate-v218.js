/* V2.18: UI-only bridge to the two working pen tools. */
(() => {
  const stamp = document.getElementById('stamp-workspace');
  const icingTab = document.querySelector('.decorate-tab[data-tool="icing"]');
  const creamTab = document.querySelector('.decorate-tab[data-tool="cream"]');
  const pens = document.querySelectorAll('.decorating-pen-mode');
  if (!stamp || !icingTab || !creamTab || !pens.length) return;
  function syncPenButtons() {
    const creamActive = !document.getElementById('cream-panel').classList.contains('hidden');
    const icingActive = !document.getElementById('icing-panel').classList.contains('hidden');
    const mode = creamActive ? 'cream' : (icingActive ? 'icing' : null);
    for (const button of pens) button.setAttribute('aria-pressed', String(button.dataset.penMode === mode));
    // The original script sees cream as a separate tab; mirror its state on the shared tab.
    icingTab.classList.toggle('active', mode !== null);
  }
  for (const button of pens) {
    button.addEventListener('click', () => {
      const target = button.dataset.penMode === 'cream' ? creamTab : icingTab;
      target.click(); // Reuse working painting, persistence and export logic.
      syncPenButtons();
    });
  }
  const panels = [document.getElementById('cream-panel'), document.getElementById('icing-panel')];
  for (const panel of panels) {
    new MutationObserver(syncPenButtons).observe(panel, {attributes:true,attributeFilter:['class']});
  }
  for (const tab of document.querySelectorAll('.decorate-tab')) tab.addEventListener('click',syncPenButtons);
  syncPenButtons();
})();
