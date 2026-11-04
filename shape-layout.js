/* Cookie Post V2.7 — Shape page cookie rendering fix + stamp size control.
   - Regenerates cookie bodies from each selected shape instead of clipping a round dough photo.
   - Adapts the procedural cookie shading to every flavor color.
   - Keeps the V2.6 Shape layout (left basics / middle preview / right traditional / draw below).
   - Adds Traditional Stamp size adjustment in Decorate.
*/
(() => {
  'use strict';
  const panel=document.getElementById('shape-panel');
  const grid=document.getElementById('shapes');
  if(!panel||!grid) return;

  const originalRenderPreview = renderPreview;
  const current=document.querySelector('#shape-panel .current-dough');
  const traditionalSetSection=document.querySelector('#sets')?.closest('.shape-section');
  if(traditionalSetSection)traditionalSetSection.classList.add('shape-hide-sets');
  const classicSection=grid.closest('.shape-section');
  if(classicSection)classicSection.classList.add('shape-new-groups');

  const drawer=document.getElementById('drawing-area');
  let drawTrigger=document.getElementById('shape-draw-trigger');
  if(!drawTrigger){
    drawTrigger=document.createElement('button');
    drawTrigger.type='button';
    drawTrigger.id='shape-draw-trigger';
    drawTrigger.className='outline-button shape-draw-trigger';
    drawTrigger.textContent='Draw My Own Shape';
    panel.insertBefore(drawTrigger,drawer);
  }
  drawTrigger.addEventListener('click',()=>{
    state.shape='custom';
    drawer.classList.remove('hidden');
    save();render();
    drawer.scrollIntoView({behavior:'smooth',block:'nearest'});
  });

  const baseIds=new Set(['circle','heart','square','star','flower','bunny','ribbon']);
  const traditionIds=new Set(['scallop','peachshape','fishshape','lotusshape','gourdshape']);

  function rgb(hex){
    const safe=(hex||'#000000').replace('#','');
    const full=safe.length===3?safe.split('').map(ch=>ch+ch).join(''):safe.padEnd(6,'0').slice(0,6);
    const n=parseInt(full,16);
    return [(n>>16)&255,(n>>8)&255,n&255];
  }
  function hex(arr){return '#'+arr.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');}
  function mix(a,b,t){const x=rgb(a),y=rgb(b);return hex(x.map((n,i)=>n*(1-t)+y[i]*t));}
  function proceduralCookieMarkup(path,flavorInfo,key,{withShadow=true,strokeWidth=3.1}={}){
    const topBase=mix(flavorInfo.color,'#f5ecd9',0.14);
    const side1=mix(flavorInfo.color,'#c48d68',0.22);
    const side2=mix(flavorInfo.color,'#a46f54',0.33);
    const side3=mix(flavorInfo.color,'#855742',0.44);
    const rim=mix(flavorInfo.color,'#96674c',0.36);
    const grainDark=mix(flavorInfo.color,'#7a5a45',0.48);
    const grainLight=mix(flavorInfo.color,'#fff6ea',0.72);
    const grain=`${key}-grain`;
    const clip=`${key}-clip`;
    const blur=`${key}-blur`;
    return `
      <defs>
        <pattern id="${grain}" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="6" r="0.9" fill="${grainDark}" opacity="0.24"/>
          <circle cx="12" cy="10" r="0.75" fill="${grainLight}" opacity="0.34"/>
          <circle cx="8" cy="15" r="0.52" fill="${grainDark}" opacity="0.16"/>
        </pattern>
        <clipPath id="${clip}"><path d="${path}"/></clipPath>
        <filter id="${blur}"><feGaussianBlur stdDeviation="4.4"/></filter>
      </defs>
      ${withShadow?`<ellipse cx="162" cy="244" rx="74" ry="15" fill="#6f5240" opacity="0.17" filter="url(#${blur})"/>`:''}
      <path d="${path}" transform="translate(0 12)" fill="${side3}" opacity="0.88"/>
      <path d="${path}" transform="translate(0 8)" fill="${side2}" opacity="0.94"/>
      <path d="${path}" transform="translate(0 4)" fill="${side1}" opacity="0.98"/>
      <path d="${path}" fill="${topBase}"/>
      <g clip-path="url(#${clip})">
        <rect x="30" y="32" width="260" height="260" fill="url(#${grain})" opacity="0.55"/>
      </g>
      <path d="${path}" fill="none" stroke="${rim}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>`;
  }

  function shapePath(shapeObj){
    return shapeObj.id==='custom'&&state.customPath?state.customPath:shapeObj.path;
  }

  function card(shapeObj,flavorInfo,key){
    const selected=state.shape===shapeObj.id;
    return `<button class="option-card shape-card shape-choice ${selected?'selected':''}" data-shape="${shapeObj.id}" style="--card-bg:${shapeObj.bg};--card-stroke:${shapeObj.stroke}">
      <svg class="shape-icon" viewBox="0 0 320 320" aria-hidden="true">${proceduralCookieMarkup(shapePath(shapeObj),flavorInfo,key,{withShadow:false,strokeWidth:2.6})}</svg>
      <span class="option-name">${shapeObj.name}</span>
    </button>`;
  }

  renderShapes=function(){
    const f=flavor();
    const basic=shapeData.filter(s=>baseIds.has(s.id));
    const traditional=shapeData.filter(s=>traditionIds.has(s.id));
    grid.innerHTML=`<section class="shape-side shape-side-basic" aria-label="Basic Shapes"><h3 class="mini-heading">Basic Shapes</h3><div class="shape-choice-grid">${basic.map((s,i)=>card(s,f,`basic-${i}-${s.id}`)).join('')}</div></section>
      <section class="shape-side shape-side-traditional" aria-label="Traditional Shapes"><h3 class="mini-heading">Traditional Shapes</h3><div class="shape-choice-grid">${traditional.map((s,i)=>card(s,f,`trad-${i}-${s.id}`)).join('')}</div></section>`;
    grid.querySelectorAll('[data-shape]').forEach(b=>b.addEventListener('click',()=>{
      state.shape=b.dataset.shape;
      drawer.classList.add('hidden');
      save();render();
    }));
    drawer.classList.toggle('hidden',state.shape!=='custom');
    drawTrigger.classList.toggle('active',state.shape==='custom');
    if(current) current.querySelector('strong').textContent=f.name;
  };

  renderPreview=function(){
    if(state.page!=='shape'){
      originalRenderPreview();
      return;
    }
    const f=flavor();
    const selected=state.shape?shape():shapeData.find(s=>s.id==='circle');
    const path=shapePath(selected);
    const dough=document.getElementById('dough-figure');
    dough.removeAttribute('transform');
    dough.innerHTML=proceduralCookieMarkup(path,f,'shape-main-preview',{withShadow:true,strokeWidth:3.5});
    document.getElementById('preview-caption').textContent=state.shape?selected.name:'Choose your shape';
    document.getElementById('preview-meta').textContent=f.name+' dough';
    document.getElementById('current-flavor').textContent=f.name;
  };

  // --- Traditional stamp size control ---
  const stampControls=document.querySelector('.stamp-controls-bottom');
  if(stampControls && !document.getElementById('stamp-scale')){
    const label=document.createElement('label');
    label.className='stamp-field';
    label.innerHTML='Stamp Size <output id="stamp-scale-value">100%</output><input id="stamp-scale" type="range" min="55" max="150" value="100">';
    const rotateField=document.getElementById('stamp-rotation')?.closest('.stamp-field');
    if(rotateField && rotateField.nextSibling) stampControls.insertBefore(label,rotateField.nextSibling);
    else stampControls.appendChild(label);
  }
  if(typeof stampState==='object' && !Number.isFinite(Number(stampState.size))) stampState.size=100;
  if(state.stamped && Number.isFinite(Number(state.stamped.size)) && !Number.isFinite(Number(stampState.size))) stampState.size=Number(state.stamped.size);

  imprintGraphic=function(){
    const image=window.CookieStampShadows?.[stampState.selected];
    const depth=stampState.depth/100;
    const size=Number(stampState.size)||100;
    const side=(166*size/100);
    const half=(side/2);
    if(image){
      const opacity=(0.28 + 0.66*depth).toFixed(3);
      return `<g transform="translate(${stampState.x} ${stampState.y}) rotate(${stampState.rotation})" pointer-events="none"><image href="${image}" x="${(-half).toFixed(1)}" y="${(-half).toFixed(1)}" width="${side.toFixed(1)}" height="${side.toFixed(1)}" opacity="${opacity}"/></g>`;
    }
    const sym=stampCatalog.find(s=>s.id===stampState.selected)?.symbol||'福';
    const fontSize=(90*size/100).toFixed(1);
    return `<text x="${stampState.x}" y="${stampState.y}" font-size="${fontSize}" text-anchor="middle" fill="#735443">${sx(sym)}</text>`;
  };

  renderStamp=function(){
    if(state.page!=='decorate') return;
    renderStampGrid();
    const f=flavor();
    const activeShape=state.shape?shape():shapeData[0];
    const p=shapePath(activeShape);
    document.getElementById('stamp-cookie-label').textContent=f.name+' · '+activeShape.name;
    document.getElementById('stamp-cookie-base').innerHTML=`<g transform="translate(25 25) scale(.97)">${proceduralCookieMarkup(p,f,'stamp-cookie-base-fill',{withShadow:false,strokeWidth:4.6})}</g>`;
    const defs=document.querySelector('#stamp-canvas defs');
    if(!document.getElementById('stampClip')) defs.insertAdjacentHTML('beforeend',`<clipPath id="stampClip"><g transform="translate(25 25) scale(.97)"><path id="stamp-clip-path" d="${p}"/></g></clipPath>`);
    else {
      const oldClipNode=document.getElementById('stamp-clip-path');
      if(oldClipNode) oldClipNode.setAttribute('d',p);
    }
    document.getElementById('stamp-imprint').innerHTML=`<g clip-path="url(#stampClip)">${imprintGraphic()}</g>`;
    const selectedStamp=stampCatalog.find(s=>s.id===stampState.selected);
    if(selectedStamp) document.getElementById('stamp-info').textContent=selectedStamp.name+' — '+selectedStamp.meaning;
    document.getElementById('stamp-depth').value=stampState.depth;
    document.getElementById('stamp-rotation').value=stampState.rotation;
    document.getElementById('stamp-depth-value').textContent=stampState.depth+'%';
    document.getElementById('stamp-rotation-value').textContent=stampState.rotation+'°';
    const stampScale=document.getElementById('stamp-scale');
    const stampScaleValue=document.getElementById('stamp-scale-value');
    if(stampScale){
      stampScale.value=String(Number(stampState.size)||100);
      if(stampScaleValue) stampScaleValue.textContent=(Number(stampState.size)||100)+'%';
    }
    document.getElementById('stamp-notice').textContent=stampState.applied?'Stamp applied and saved to your local draft.':'Previewing motif. Press Apply Stamp to keep it.';
    // The shape renderer overrides renderStamp; reattach Image to Pattern too.
    window.CookiePostRefreshPatternOverlay?.();
  };

  const stampScaleInput=document.getElementById('stamp-scale');
  if(stampScaleInput && !stampScaleInput.dataset.bound){
    stampScaleInput.dataset.bound='1';
    stampScaleInput.addEventListener('input',e=>{
      stampState.size=Number(e.target.value);
      stampState.applied=false;
      renderStamp();
    });
  }

  render();
})();
