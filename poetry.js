'use strict';
/* Cookie Post — Poetry in a Letter, live Cloudflare Worker integration.
 * Existing form, local save, editable poem, card export, and email draft remain unchanged.
 * The browser calls the user's Worker only; it never contains a model provider API key.
 */
(() => {
  const $ = id => document.getElementById(id);
  const ENDPOINT = 'https://cookiepost-poetry-api.shianqi1116.workers.dev/api/poetry';
  const STORAGE_KEY = 'cookie-post-poetry-v12'; // Keep existing saved drafts.
  const TIMEOUT_MS = 30000;
  // Preserve the user's older dropdown choice when upgrading to a free-text field.
  const legacyOccasions = {
    auto: '', midautumn: 'Mid-Autumn Festival', qixi: 'Qixi Festival',
    birthday: 'Birthday', newyear: 'Spring Festival',
    anniversary: 'Anniversary', encourage: 'Encouragement', everyday: 'Everyday'
  };
  function getStored(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  }
  const data = Object.assign({occasion:'', wish:'', title:'', text:'', include:false}, getStored());
  const occasion = $('poetry-occasion');
  const wish = $('poetry-wish');
  const title = $('poetry-title');
  const poemText = $('poetry-text');
  const include = $('poetry-include');
  const note = $('poetry-note');
  const generate = $('poetry-generate');
  const remove = $('poetry-remove');
  if (![occasion,wish,poemText,include,note,generate,remove].every(Boolean)) return;
  // The current V1.6 HTML has no poetry-title field; treat it as optional.

  occasion.value = Object.prototype.hasOwnProperty.call(legacyOccasions, data.occasion)
    ? legacyOccasions[data.occasion] : String(data.occasion || '').slice(0,40);
  wish.value = data.wish || '';
  if (title) title.value = data.title || '';
  poemText.value = data.text || '';
  include.checked = !!data.include;
  note.setAttribute('role','status');
  note.setAttribute('aria-live','polite');
  note.textContent = 'AI-powered poetry · Enter a wish, then Generate Poem. You can edit the result before exporting.';

  function save(){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
    catch { note.textContent = 'Browser storage is unavailable; the poem can still be used in this session.'; }
  }
  function normalizePoem(value){
    if(typeof value !== 'string') throw new Error('The API response did not contain a poem.');
    let poem = value.trim().replace(/^```(?:text|json|markdown)?\s*/i,'').replace(/\s*```$/,'').trim();
    // Accept conventional Chinese punctuation or line breaks, but never invent a missing line.
    let lines = poem.split(/[\r\n，,。；;！？!?]+/).map(s=>s.trim()).filter(Boolean);
    // Some models put all four five-character lines in one paragraph without punctuation.
    if(lines.length===1 && /^[\p{Script=Han}]{20}$/u.test(lines[0]))
      lines = lines[0].match(/.{5}/gu);
    if(lines.length!==4 || lines.some(s=>[...s].length!==5 || !/^[\p{Script=Han}]{5}$/u.test(s))) {
      throw new Error('The AI response was not four five-character Chinese lines. Please generate again.');
    }
    return lines.join('\n');
  }

  let requestController = null;
  let requestNumber = 0;
  function setBusy(busy){
    generate.disabled = busy;
    generate.textContent = busy ? 'Generating…' : 'Generate Poem';
    generate.setAttribute('aria-busy',String(busy));
  }
  async function compose(){
    if(requestController) return;
    const userMessage = wish.value.trim() || $('gift-message')?.value.trim() || '';
    if(!userMessage){note.textContent = 'Please enter a wish or message first.';wish.focus();return;}
    // Backend requires a nonempty occasion, but its prompt already supports unspecified occasions.
    const occasionForAPI = occasion.value.trim() || 'General wishes';
    const controller=new AbortController();
    requestController=controller;
    const myRequest=++requestNumber;
    setBusy(true);
    note.textContent = 'Writing your poem with AI…';
    const timer=setTimeout(()=>controller.abort(),TIMEOUT_MS);
    try {
      const response=await fetch(ENDPOINT,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({occasion:occasionForAPI,message:userMessage}),
        signal:controller.signal
      });
      if(!response.ok){
        if(response.status===429) throw new Error('Too many requests. Please try again later.');
        if(response.status===400) throw new Error('Please check your wish and try again.');
        if(response.status===503) throw new Error('Poetry service is temporarily unavailable.');
        throw new Error('Poetry service is unavailable (HTTP '+response.status+').');
      }
      // Do not display or log provider_message, model keys, or raw provider errors.
      const result=await response.json();
      const generated=normalizePoem(result?.poem);
      if(myRequest!==requestNumber) return;
      data.text=generated;
      data.title=(title?.value || '').trim() || '寄语';
      data.occasion=occasion.value;
      data.wish=wish.value;
      data.include=true;
      if (title) title.value=data.title;
      poemText.value=data.text;
      include.checked=true;
      save();
      note.textContent='AI poem ready · Four five-character Chinese lines. You can edit it or regenerate.';
    }catch(err){
      if(myRequest!==requestNumber) return;
      note.textContent = err?.name==='AbortError' ? 'Request timed out. Please try again.'
        : err instanceof TypeError ? 'Could not connect to the poetry API. Check the connection and Worker CORS settings.'
        : (err?.message || 'Poem generation failed. Please retry.');
      // Preserve the previous poem, inclusion state and unsaved edits on errors.
    }finally{
      clearTimeout(timer);
      if(requestController===controller) requestController=null;
      if(myRequest===requestNumber) setBusy(false);
    }
  }
  generate.addEventListener('click',compose);
  remove.addEventListener('click',()=>{
    requestNumber++;
    if(requestController){requestController.abort();requestController=null;}
    setBusy(false);
    data.title='';data.text='';data.include=false;
    if (title) title.value='';
    poemText.value='';include.checked=false;
    save();note.textContent='Poem removed from this greeting card.';
  });
  for(const [field,element] of [['occasion',occasion],['wish',wish],['title',title],['text',poemText]]){
    if (!element) continue;
    for(const event of ['input','change'])element.addEventListener(event,()=>{data[field]=element.value;save();});
  }
  include.addEventListener('change',()=>{data.include=include.checked;save();});
  window.CookiePoetry={get:()=>({title:data.title,text:data.text,include:data.include,occasion:data.occasion,wish:data.wish})};
})();
