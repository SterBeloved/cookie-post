'use strict';
/* Cookie Post Collection: locally stored cards + editable source snapshots.
   Uses IndexedDB for image blobs, with no upload or remote storage. */
(() => {
  const $ = id => document.getElementById(id);
  const screen = $('collection-screen');
  const grid = $('collection-grid');
  const status = $('collection-status');
  const saveButton = $('collection-save');
  const saveStatus = $('collection-save-status');
  if (!screen || !grid || !saveButton) return;

  const DB_NAME = 'cookie-post-collection';
  const STORE = 'cards';
  const DRAFT_KEYS = [
    'cookie-post-draft-v1',
    'cookie-post-extras-v1',
    'cookie-post-journey-v11',
    'cookie-post-poetry-v12'
  ];
  let imageUrls=[];

  function openDB(){
    return new Promise((resolve,reject)=>{
      if(!window.indexedDB){reject(Error('Local collection storage is unavailable in this browser.'));return;}
      const request=indexedDB.open(DB_NAME,1);
      request.onupgradeneeded=()=>{
        const db=request.result;
        if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'id'});
      };
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error||Error('Cannot open collection storage.'));
      request.onblocked=()=>reject(Error('Close other Cookie Post tabs and try again.'));
    });
  }
  async function transaction(mode,operation){
    const db=await openDB();
    try {
      return await new Promise((resolve,reject)=>{
        const tx=db.transaction(STORE,mode);
        const request=operation(tx.objectStore(STORE));
        let value;
        request.onsuccess=()=>{value=request.result;};
        request.onerror=()=>reject(request.error||Error('Collection database failed.'));
        tx.oncomplete=()=>resolve(value);
        tx.onerror=()=>reject(tx.error||Error('Collection transaction failed.'));
        tx.onabort=()=>reject(tx.error||Error('Collection transaction was cancelled.'));
      });
    }finally{db.close();}
  }
  const list=()=>transaction('readonly',store=>store.getAll());
  const get=id=>transaction('readonly',store=>store.get(id));
  const put=card=>transaction('readwrite',store=>store.put(card));
  const remove=id=>transaction('readwrite',store=>store.delete(id));
  function collectDraft(){
    if(typeof save==='function')save();
    const result={};
    for(const key of DRAFT_KEYS) result[key]=localStorage.getItem(key);
    return result;
  }
  function makeDownload(blob,filename){
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=filename;
    document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1200);
  }
  function canvasBlob(canvas){
    return new Promise((resolve,reject)=>canvas.toBlob(blob=>{
      if(blob)resolve(blob);else reject(Error('Could not create your greeting card image.'));
    },'image/png'));
  }
  function labelFromDraft(){
    const raw=localStorage.getItem('cookie-post-draft-v1');
    try{
      const info=raw?JSON.parse(raw):{};
      const f=Array.isArray(flavors)?flavors.find(x=>x.id===info.flavor):null;
      const s=Array.isArray(shapeData)?shapeData.find(x=>x.id===info.shape):null;
      return [f?.name||'Cookie',s?.name||'Creation'].join(' · ');
    }catch{return 'My handmade cookie';}
  }
  saveButton.addEventListener('click', async()=>{
    if(saveButton.disabled)return;
    saveButton.disabled=true;
    saveStatus.textContent='Saving your cookie and greeting card…';
    try{
      const draft=collectDraft();
      const canvas=await window.CookiePostCreateCardCanvas();
      const blob=await canvasBlob(canvas);
      const created=new Date();
      const custom=$('collection-title').value.trim();
      const title=custom||labelFromDraft();
      const id=crypto.randomUUID?crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(36).slice(2);
      await put({id,title,createdAt:created.toISOString(),draft,blob});
      saveStatus.textContent='Saved to My Collection on this device.';
      if(typeof toast==='function')toast('Cookie saved to My Collection!');
    }catch(error){
      saveStatus.textContent='Could not save this cookie: '+(error?.message||'Storage unavailable.');
    }finally{saveButton.disabled=false;}
  });
  function releaseUrls(){imageUrls.forEach(URL.revokeObjectURL);imageUrls=[];}
  async function refresh(){
    status.textContent='Loading your saved cookies…';
    grid.replaceChildren();releaseUrls();
    try{
      const cards=(await list()).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
      if(!cards.length){
        status.textContent='No cookies saved yet. Create a cookie, go to Send, and choose Save to My Collection.';
        return;
      }
      status.textContent=cards.length+' saved '+(cards.length===1?'cookie':'cookies')+' · Only in this browser';
      for(const card of cards){
        const article=document.createElement('article');article.className='collection-card';
        const img=document.createElement('img');img.alt='Saved greeting card: '+card.title;
        const url=URL.createObjectURL(card.blob);imageUrls.push(url);img.src=url;
        const h=document.createElement('h3');h.textContent=card.title;
        const date=document.createElement('p');
        date.textContent=new Date(card.createdAt).toLocaleString();
        const actions=document.createElement('div');actions.className='collection-card-actions';
        function action(text,callback){const btn=document.createElement('button');btn.type='button';btn.textContent=text;btn.addEventListener('click',callback);actions.append(btn);}
        action('Edit',()=>restore(card.id));
        action('Download',()=>makeDownload(card.blob,'cookie-post-'+card.id+'.png'));
        action('Delete',async()=>{
          if(!confirm('Delete this saved cookie from My Collection?'))return;
          try{await remove(card.id);await refresh();}
          catch(e){status.textContent='Delete failed: '+e.message;}
        });
        article.append(img,h,date,actions);grid.append(article);
      }
    }catch(error){status.textContent='Collection is unavailable: '+(error?.message||'Storage error.');}
  }
  async function restore(id){
    try{
      const card=await get(id);
      if(!card){status.textContent='This saved cookie could not be found.';return;}
      // Retain the existing editing session until we know the saved snapshot exists.
      for(const key of DRAFT_KEYS){
        const content=card.draft?.[key];
        if(content==null)localStorage.removeItem(key);else localStorage.setItem(key,content);
      }
      sessionStorage.setItem('cookie-post-resume-from-collection','package');
      location.reload(); // Reinitialize all existing modules using the selected saved data.
    }catch(error){status.textContent='Could not reopen cookie: '+(error?.message||'Storage error.');}
  }

  // Replace the old placeholder click handler, not the menu art or clickable area.
  const journal=$('menu-journal');
  if(journal){
    const clean=journal.cloneNode(true);journal.replaceWith(clean);
    clean.addEventListener('click',()=>show('collection'));
  }
  const oldShow=show;
  show=function(page){
    if(page==='collection'){
      screen.classList.remove('hidden');
      $('entry').classList.add('hidden');$('home').classList.add('hidden');$('studio').classList.add('hidden');
      state.page='collection';
      refresh();window.scrollTo(0,0);
      return;
    }
    screen.classList.add('hidden');
    releaseUrls();
    return oldShow(page);
  };
  $('collection-back').addEventListener('click',()=>show('home'));

  const resume=sessionStorage.getItem('cookie-post-resume-from-collection');
  if(resume){
    sessionStorage.removeItem('cookie-post-resume-from-collection');
    if(state.shape)show(resume);else show('dough');
  }
})();
