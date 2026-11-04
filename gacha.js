/* Cookie Post V2.1 Gacha. Does not alter the existing editor, mail, poetry or collection code. */
'use strict';
(()=>{
 const $=id=>document.getElementById(id);
 const screen=$('gacha-screen'),note=$('gacha-recipe-note'),capsule=$('gacha-capsule');
 const knob=$('gacha-knob'),floating=$('gacha-floating');
 let recipes=[],busy=false,current=null,runId=0;
 const weights={common:60,uncommon:30,rare:10};
 const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 const random=arr=>arr[Math.floor(Math.random()*arr.length)];
 async function loadRecipes(){
   try{const res=await fetch('gacha-recipes.json');if(!res.ok)throw Error('Missing recipe file');const data=await res.json();recipes=data.recipes||[];}
   catch(err){
     // file:// browsers often block JSON fetch. Use the bundled JS copy as a local fallback.
     recipes=Array.isArray(window.CookieGachaRecipes)?window.CookieGachaRecipes:[];
   }
 }
 function pick(){const n=Math.random()*100;let tier=n<weights.rare?'rare':n<weights.rare+weights.uncommon?'uncommon':'common';let available=recipes.filter(r=>r.rarity===tier);return random(available.length?available:recipes);}
 const rows=r=>[['Dough',r.flavor.name],['Shape',r.shape.name],['Stamp',r.stamp?.name||'None'],['Icing',r.icing.name],['Toppings',r.topping?.name||'None']];
 function fill(){
   if(!current)return;
   $('gacha-recipe-title').textContent=current.name;
   $('gacha-rarity').textContent=(current.rarity||'common').toUpperCase()+' · '+current.id;
   const grid=$('gacha-recipe-fields');grid.replaceChildren();
   rows(current).forEach(([key,val])=>{const d=document.createElement('div'),s=document.createElement('small'),b=document.createElement('strong');s.textContent=key;b.textContent=val;d.append(s,b);grid.append(d);});
   $('gacha-recipe-hint').textContent=current.design_hint||'';
   $('gacha-float-title').textContent=current.name;
   const guide=$('gacha-float-fields');guide.replaceChildren();
   rows(current).forEach(([key,val])=>{const line=document.createElement('div'),b=document.createElement('b');b.textContent=key+': ';line.append(b,document.createTextNode(val));guide.append(line);});
 }
 function reset(){busy=false;knob.disabled=false;capsule.className='gacha-capsule hidden';note.className='gacha-recipe-note hidden';$('gacha-hint').classList.remove('hidden');}
 async function draw(){
   if(busy)return;
   if(!recipes.length){toast('Recipe list is unavailable. Open with a local server or check the included files.');return;}
   busy=true;const active=++runId;knob.disabled=true;current=pick();
   note.className='gacha-recipe-note hidden';capsule.className='gacha-capsule hidden';$('gacha-hint').classList.add('hidden');
   void capsule.offsetWidth;capsule.className='gacha-capsule popping';
   await sleep(650);if(active!==runId)return;
   capsule.className='gacha-capsule shaking';await sleep(720);if(active!==runId)return;
   fill();capsule.className='gacha-capsule hidden';note.className='gacha-recipe-note reveal';
   busy=false;knob.disabled=false;
 }
 $('gacha-back').addEventListener('click',()=>{runId++;reset();show('home');});
 knob.addEventListener('click',draw);
 $('gacha-redraw').addEventListener('click',draw);
 $('gacha-note-close').addEventListener('click',reset);
 $('gacha-create').addEventListener('click',()=>{
   if(!current)return;
   state.flavor=current.flavor.id;state.shape=current.shape.id;
   // The recipe is a guide. We do not pretend that drawn icing/toppings are auto-applied.
   if(current.stamp?.id && typeof stampCatalog!=='undefined' && stampCatalog.some(s=>s.id===current.stamp.id)){
     stampState.selected=current.stamp.id;stampState.applied=false;
   }
   save();
   window.CookieGachaCurrent=current;
   floating.classList.remove('hidden');$('gacha-float-content').classList.remove('hidden');
   show('dough');
   if(typeof toast==='function')toast('Your recipe is pinned. Follow the ingredients as you create!');
 });
 $('gacha-float-close').addEventListener('click',()=>floating.classList.add('hidden'));
 $('gacha-collapse').addEventListener('click',()=>{const area=$('gacha-float-content');const fold=area.classList.toggle('hidden');$('gacha-collapse').textContent=fold?'+':'−';});
 // Drag the floating recipe guide without moving any other UI elements.
 const bar=$('gacha-float-header');let pointer=null;
 bar.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;const rect=floating.getBoundingClientRect();pointer={id:e.pointerId,dx:e.clientX-rect.left,dy:e.clientY-rect.top};bar.setPointerCapture(e.pointerId);});
 bar.addEventListener('pointermove',e=>{if(!pointer||e.pointerId!==pointer.id)return;floating.style.right='auto';floating.style.bottom='auto';floating.style.left=Math.max(0,Math.min(innerWidth-floating.offsetWidth,e.clientX-pointer.dx))+'px';floating.style.top=Math.max(0,Math.min(innerHeight-floating.offsetHeight,e.clientY-pointer.dy))+'px';});
 const end=e=>{if(pointer&&pointer.id===e.pointerId)pointer=null;};bar.addEventListener('pointerup',end);bar.addEventListener('pointercancel',end);
 // Replace only the old gacha button handler, which otherwise skips directly to Shape.
 const old=$('menu-gacha'),fresh=old.cloneNode(true);old.replaceWith(fresh);
 fresh.addEventListener('click',()=>show('gacha'));
 const oldShow=show;
 show=function(page){
   if(page==='gacha'){
     $('entry').classList.add('hidden');$('home').classList.add('hidden');$('studio').classList.add('hidden');$('collection-screen').classList.add('hidden');
     screen.classList.remove('hidden');floating.classList.add('hidden');state.page='gacha';reset();window.scrollTo(0,0);return;
   }
   screen.classList.add('hidden');
   if(page==='home'||page==='entry'||page==='collection')floating.classList.add('hidden');
   return oldShow(page);
 };
 loadRecipes();
})();
