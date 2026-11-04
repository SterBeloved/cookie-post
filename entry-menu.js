/* Cookie Post V1.6 -- entry/main navigation only, no other gameplay changes. */
(() => {
  const $el = id => document.getElementById(id);
  const entry=$el('entry'), home=$el('home'), studio=$el('studio');
  // The previous homepage SVG four-button mask is obsolete with object-based menu.
  const legacyMask=$el('home-hit-layer');
  if(legacyMask){ legacyMask.setAttribute('aria-hidden','true'); legacyMask.style.display='none'; }
  const originalShow=show;
  show=function(page){
    if(page==='entry'){
      state.page='entry';
      entry.classList.remove('hidden');home.classList.add('hidden');studio.classList.add('hidden');
      return;
    }
    entry.classList.add('hidden');
    originalShow(page);
  };
  let entryTransitioning=false;
  $el('entry-start').addEventListener('click',()=>{
    if(entryTransitioning)return;
    entryTransitioning=true;
    entry.classList.add('entry-leaving');
    const duration=window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:420;
    setTimeout(()=>{
      show('home');entry.classList.remove('entry-leaving');entryTransitioning=false;
    },duration);
  });
  $el('menu-start').addEventListener('click',()=>show('dough'));
  $el('menu-journal').addEventListener('click',()=>{
    const hasDraft=!!localStorage.getItem('cookie-post-draft-v1');
    modal('My Collection', hasDraft
      ? 'Your latest cookie draft is saved in this browser. Choose the cookie plate to continue creating, or export it from the studio.'
      : 'No saved cookie yet. Click the cookie plate to create one!');
  });
  $el('menu-gacha').addEventListener('click',()=>{
    const picks=shapeData.filter(x=>x.id!=='custom');
    const f=flavors[Math.floor(Math.random()*flavors.length)];
    const s=picks[Math.floor(Math.random()*picks.length)];
    state.flavor=f.id;state.shape=s.id;save();render();
    show('shape');
    toast('Cookie Gacha: '+f.name+' · '+s.name+'!');
  });
  $el('menu-copycat').addEventListener('click',()=>{
    modal('Cookie Copycat', 'Reference-image challenge scoring is coming later. For now, use Free Creation → Decorate → Image to Pattern.');
  });
  const homeBtn=$el('home-btn');
  if(homeBtn){const clean=homeBtn.cloneNode(true);homeBtn.replaceWith(clean);clean.addEventListener('click',()=>show('home'));}
  // Keep user data, poem generation, gifts, exports, and toppings modules unmodified.
  show('entry');
})();
