/* V2.19 -- Original user PNG art only. Never add text or animation. */
(() => {
  const home=document.getElementById('home');
  const art=home?.querySelector('.updated-home');
  if(!art)return;
  // Clean possible old DOM overlays if script is loaded twice during local previews.
  art.querySelectorAll('.home-hover-caption,.home-hover-outline').forEach(node=>node.remove());
  const entries=[
    ['menu-start','hover-free-creation.png'],
    ['menu-journal','hover-my-collection.png'],
    ['menu-gacha','hover-cookie-gacha.png'],
    ['menu-copycat','hover-cookie-copycat.png']
  ];
  let visible=null;
  const hide=()=>{if(visible){visible.classList.remove('is-visible');visible=null;}};
  const firstButton=art.querySelector('.menu-hotspot');
  for(const [id,filename] of entries){
    const button=document.getElementById(id);
    if(!button)continue;
    const overlay=document.createElement('img');
    overlay.src='assets/'+filename;
    overlay.alt='';overlay.decoding='async';
    overlay.setAttribute('aria-hidden','true');
    overlay.className='home-hover-outline';
    art.insertBefore(overlay,firstButton);
    button.addEventListener('pointerenter',event=>{
      if(event.pointerType==='touch'||home.classList.contains('hidden'))return;
      hide();visible=overlay;overlay.classList.add('is-visible');
    });
    button.addEventListener('pointerleave',hide);
    button.addEventListener('blur',hide);
    button.addEventListener('pointerdown',hide);
    button.addEventListener('click',hide);
  }
  new MutationObserver(()=>{if(home.classList.contains('hidden'))hide();})
    .observe(home,{attributes:true,attributeFilter:['class']});
})();
