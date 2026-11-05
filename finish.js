'use strict';
/* Cookie Post V1.1: stamp bugfix + playable icing/package/export loop.
   Kept separate to avoid rewriting the established homepage or flavor/shape pages. */
(() => {
  const key='cookie-post-journey-v11';
  const stored=()=>{try{return JSON.parse(localStorage.getItem(key))||{}}catch{return {}}};
  const journey=Object.assign({strokes:[],paper:'mint',border:'2655',from:'',to:'',message:'',bakeLevel:0,baked:false},stored());
  const keep=()=>{try{localStorage.setItem(key,JSON.stringify(journey));}catch(e){toast('This browser cannot save more local data.')}};
  const svgTag=(name,props={})=>{const e=document.createElementNS('http://www.w3.org/2000/svg',name);Object.entries(props).forEach(([k,v])=>e.setAttribute(k,String(v)));return e;};

  // A real SVG clipPath element avoids the legacy HTML-string insertion problem.
  function rebuildStamp(){
    if(state.page!=='decorate' && state.page!=='package')return;
    const svg=$('stamp-canvas');const defs=svg.querySelector('defs');
    let cp=svg.querySelector('#stampClip');if(!cp){cp=svgTag('clipPath',{id:'stampClip',clipPathUnits:'userSpaceOnUse'});defs.append(cp);}
    cp.replaceChildren();
    const outerPath=state.shape?pathForShape():shapeData[0].path;
    cp.append(svgTag('path',{d:outerPath,transform:'translate(25 25) scale(.97)'}));
    const base=$('stamp-cookie-base');base.replaceChildren();
    const g=svgTag('g',{transform:'translate(25 25) scale(.97)'});
    g.append(svgTag('path',{d:outerPath,fill:flavor().color}));
    const doughTexture=window.CookieDoughTextures?.[state.flavor];
    if(doughTexture){
      let cut=svg.querySelector('#doughSurfaceClip');
      if(!cut){cut=svgTag('clipPath',{id:'doughSurfaceClip',clipPathUnits:'userSpaceOnUse'});defs.append(cut);}
      cut.replaceChildren(svgTag('path',{d:outerPath}));
      const textured=svgTag('g',{'clip-path':'url(#doughSurfaceClip)'});
      textured.append(svgTag('image',{href:doughTexture,x:30,y:22,width:260,height:276,preserveAspectRatio:'none'}));
      g.append(textured);
    }
    g.append(svgTag('path',{d:outerPath,fill:'none',stroke:'#b88d61','stroke-width':'5','stroke-linejoin':'round'}));
    base.append(g);
    if(!svg.querySelector('#stampCookieGrain')){
      const pat=svgTag('pattern',{id:'stampCookieGrain',width:13,height:15,patternUnits:'userSpaceOnUse'});
      pat.append(svgTag('circle',{cx:2,cy:7,r:'.8',fill:'#6e5a45',opacity:'.24'}),svgTag('circle',{cx:9,cy:3,r:'.65',fill:'#fff',opacity:'.4'}));defs.append(pat);
    }
    $('stamp-cookie-label').textContent=flavor().name+' · '+(state.shape?shape().name:'Circle');
    const info=stampCatalog.find(x=>x.id===stampState.selected)||stampCatalog[0];
    // Reuse the same shaded imprint for live preview, baking and the exported cookie PNG.
    const fg=svgTag('g',{'clip-path':'url(#stampClip)'});
    fg.innerHTML=imprintGraphic();
    $('stamp-imprint').replaceChildren(fg);
    $('stamp-info').textContent=info.name+' — '+info.meaning;
    $('stamp-depth').value=stampState.depth;$('stamp-rotation').value=stampState.rotation;
    $('stamp-depth-value').textContent=stampState.depth+'%';$('stamp-rotation-value').textContent=stampState.rotation+'°';
    $('stamp-notice').textContent=stampState.applied?'Stamp applied and saved to your local draft.':'Live stamp preview; press Apply Stamp to save.';
    $('stamp-grid').querySelectorAll('[data-stamp]').forEach(b=>b.classList.toggle('selected',b.dataset.stamp===stampState.selected));
    if(typeof renderPatternOverlay==='function')renderPatternOverlay();
  }
  const inheritedRenderStamp=renderStamp;
  renderStamp = function(){if(state.page==='decorate'){inheritedRenderStamp();rebuildStamp();}else if(state.page==='package')rebuildStamp();};

  const icing=$('icing-layer'),ctx=icing.getContext('2d');
  const temp={draw:false,pts:[]};
  const topping={kind:'sprinkles',size:7,density:3,pearlColor:'#e9a5b2'};
  const toppingTools=new Set(['sprinkles','sugarpins','chocolatechips','coconut']);
  const rainbow=['#eaa4af','#8fcbb4','#f5ca69','#bab0e6','#9dcde6','#f5b49b'];
  function activeTool(){return state.decorateTool==='toppings'?topping.kind:state.decorateTool==='cream'?'cream':$('icing-tool').value;}
  function activeWidth(){return state.decorateTool==='toppings'?topping.size:state.decorateTool==='cream'?+$('cream-width').value:+$('icing-width').value;}
  function activeColor(){return state.decorateTool==='toppings'?topping.pearlColor:state.decorateTool==='cream'?$('cream-color').value:$('icing-color').value;}
  function drawPiece(st,p,index){
    const size=Math.max(2,Math.min(14,st.width||7));
    // Deterministic visual variety means saved strokes and PNG export render identically.
    const seed=(index*37+Math.round(p.x)*7+Math.round(p.y)*11)>>>0;
    const color=rainbow[seed%rainbow.length];
    if(st.tool==='sprinkles'){
      const r=size*.57;ctx.fillStyle=st.color||color;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.65)';ctx.beginPath();ctx.arc(p.x-r*.26,p.y-r*.28,r*.30,0,Math.PI*2);ctx.fill();
    }else if(st.tool==='sugarpins'){
      ctx.translate(p.x,p.y);ctx.rotate((seed%180)*Math.PI/180);ctx.fillStyle=color;
      ctx.beginPath();ctx.roundRect(-size*.25,-size*.95,size*.5,size*1.9,size*.22);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.28)';ctx.fillRect(-size*.15,-size*.78,size*.12,size*1.5);
    }else if(st.tool==='chocolatechips'){
      ctx.translate(p.x,p.y);ctx.rotate((seed%65)*Math.PI/180);
      ctx.fillStyle=seed%3===0?'#6f3e2c':seed%3===1?'#a36c4f':'#50352e';
      ctx.beginPath();ctx.moveTo(0,-size*.78);ctx.lineTo(size*.71,size*.42);ctx.quadraticCurveTo(0,size*.90,-size*.71,size*.42);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#ffffff44';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(-size*.3,size*.32);ctx.lineTo(0,-size*.32);ctx.stroke();
    }else if(st.tool==='coconut'){
      ctx.translate(p.x,p.y);ctx.rotate((seed%180)*Math.PI/180);ctx.fillStyle=seed%3===0?'#f1e6ca':'#fffdf3';
      ctx.beginPath();ctx.ellipse(0,0,size*.24,size*.95,0,0,2*Math.PI);ctx.fill();
      ctx.strokeStyle='#c9bda5';ctx.lineWidth=.6;ctx.stroke();
    }
  }
  function paintIcing(){
    ctx.clearRect(0,0,360,360);
    ctx.save();
    if(state.shape){const clip=new Path2D(pathForShape());ctx.translate(25,25);ctx.scale(.97,.97);ctx.clip(clip);ctx.setTransform(1,0,0,1,0,0);}
    for(const st of [...journey.strokes,...(temp.pts.length?[{points:temp.pts,color:activeColor(),width:activeWidth(),tool:activeTool(),density:topping.density}]:[])]){
      if(!st.points?.length)continue;
      ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.shadowColor='rgba(90,53,36,.25)';ctx.shadowBlur=2;ctx.shadowOffsetY=1;
      if(toppingTools.has(st.tool)){
        const stride=Math.max(1,Math.ceil(8/(st.density||3)));
        for(let i=0;i<st.points.length;i+=stride){
          const p=st.points[i];ctx.save();drawPiece(st,p,i);ctx.restore();
        }
      }else{
        // Cream Pen is a separate raised piping layer. Existing icing strokes stay flat.
        const outline=()=>{
          ctx.beginPath();
          st.points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
          if(st.points.length===1)ctx.lineTo(st.points[0].x+.01,st.points[0].y+.01);
        };
        if(st.tool==='cream'){
          const w=Math.max(5,Math.min(27,st.width||12));
          ctx.shadowColor='rgba(92,59,45,.25)';ctx.shadowBlur=3;ctx.shadowOffsetY=2;
          outline();ctx.strokeStyle=st.color||'#fff9ef';ctx.lineWidth=w;ctx.stroke();
          ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;
          outline();ctx.strokeStyle='rgba(99,67,54,.10)';ctx.lineWidth=w*.78;ctx.stroke();
          outline();ctx.strokeStyle=st.color||'#fff9ef';ctx.lineWidth=w*.65;ctx.stroke();
        }else{
          outline();ctx.strokeStyle=st.color;ctx.lineWidth=st.width;ctx.stroke();
        }
      }
      ctx.restore();
    }
    ctx.restore();
  }
  let sendPreviewTicket = 0;
  async function renderSendPage(){
    const ticket=++sendPreviewTicket;
    const img=$('send-card-preview');
    const status=$('send-preview-status');
    const summary=$('send-card-summary');
    img.removeAttribute('src');
    status.textContent='Preparing your greeting card preview...';
    const p=window.CookiePoetry?.get?.();
    summary.textContent=[journey.to?'To: '+journey.to:'To: Someone special',journey.from?'From: '+journey.from:'',p?.include&&p?.text?'Poem included':''].filter(Boolean).join(' · ');
    try{
      const canvas=await createCardCanvas();
      if(ticket!==sendPreviewTicket || state.page!=='send')return;
      img.src=canvas.toDataURL('image/png');
      status.textContent='Your completed greeting card';
    }catch(error){
      if(ticket!==sendPreviewTicket)return;
      console.error('[Cookie Post] Card preview error:', error);
      status.textContent='Preview unavailable: '+(error?.message||String(error));
    }
  }
  // Poetry has moved to Send. Refresh the card preview when it is edited/generated.
  let poemRefreshTimer;
  function schedulePoemPreview(){
    if(state.page !== 'send')return;
    clearTimeout(poemRefreshTimer);
    poemRefreshTimer=setTimeout(renderSendPage,240);
  }
  ['poetry-occasion','poetry-wish','poetry-text','poetry-include'].forEach(id=>{
    const field=$(id);if(field){field.addEventListener('input',schedulePoemPreview);field.addEventListener('change',schedulePoemPreview);}
  });
  const note=$('poetry-note');
  if(note)new MutationObserver(schedulePoemPreview).observe(note,{childList:true,characterData:true,subtree:true});
  window.CookiePostRefreshSendPreview=renderSendPage;
  const prevShow=show;
  show=function(page){
    $('send-workspace').classList.add('hidden');
    if(page==='send'){
      state.page='send';$('home').classList.add('hidden');$('studio').classList.remove('hidden');
      $('bake-workspace').classList.add('hidden');$('package-workspace').classList.add('hidden');
      document.querySelector('.content-panel').classList.add('hidden');$('send-workspace').classList.remove('hidden');
      $('page-title').textContent='Send Your Cookie Post';
      $('page-desc').textContent='Your cookie is wrapped. Now deliver a little sweetness.';
      document.querySelectorAll('.step').forEach(el=>el.classList.toggle('active',el.dataset.go==='send'));
      $('prev-btn').textContent='‹ Package';$('next-btn').textContent='Send Cookie Post ›';
      renderSendPage();window.scrollTo(0,0);return;
    }
    if(page==='bake'){
      state.page='bake';$('home').classList.add('hidden');$('studio').classList.remove('hidden');
      $('page-title').textContent='Bake Your Cookie';$('page-desc').textContent='A warm, golden finish — or leave your dough as it is.';
      document.querySelector('.content-panel').classList.add('hidden');$('package-workspace').classList.add('hidden');$('bake-workspace').classList.remove('hidden');
      document.querySelectorAll('.step').forEach(el=>el.classList.toggle('active',el.dataset.go==='bake'));
      $('prev-btn').textContent='‹ Decorate';$('next-btn').textContent='Next: Package ›';renderBake();window.scrollTo(0,0);return;
    }
    if(page==='package'){
      state.page='package';$('home').classList.add('hidden');$('studio').classList.remove('hidden');$('bake-workspace').classList.add('hidden');
      $('page-title').textContent='Package & Share';$('page-desc').textContent='Wrap a digital gift, write a note, and export your cookie.';
      document.querySelector('.content-panel').classList.add('hidden');$('package-workspace').classList.remove('hidden');
      document.querySelectorAll('.step').forEach(el=>el.classList.toggle('active',el.dataset.go==='package'));
      $('prev-btn').textContent='‹ Bake';$('next-btn').textContent='Next: Send ›';renderPackage();window.scrollTo(0,0);return;
    }
    document.querySelector('.content-panel').classList.remove('hidden');$('package-workspace').classList.add('hidden');$('bake-workspace').classList.add('hidden');
    prevShow(page);
    if(page==='decorate'){rebuildStamp();paintIcing();setTab(state.decorateTool||'stamps');}
  };
  function setTab(tool){
    state.decorateTool=tool;
    document.querySelectorAll('.decorate-tab').forEach(b=>b.classList.toggle('active',b.dataset.tool===tool));
    $('stamps-panel').classList.toggle('hidden',tool!=='stamps');
    $('pattern-panel').classList.toggle('hidden',tool!=='pattern');
    $('icing-panel').classList.toggle('hidden',tool!=='icing');
    $('cream-panel').classList.toggle('hidden',tool!=='cream');
    $('toppings-panel').classList.toggle('hidden',tool!=='toppings');
    icing.classList.toggle('hidden',tool!=='icing'&&tool!=='cream'&&tool!=='toppings');
    $('stamp-canvas').style.pointerEvents=(tool==='icing'||tool==='cream'||tool==='toppings')?'none':'auto';
    if(tool==='icing'||tool==='cream'||tool==='toppings')paintIcing();
  }
  document.querySelectorAll('.decorate-tab').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tool)));
  // The previous toolbar already handles the other two tabs; this listener adds icing mode.
  const pos=e=>{const r=icing.getBoundingClientRect();return{x:(e.clientX-r.left)*360/r.width,y:(e.clientY-r.top)*360/r.height}};
  icing.addEventListener('pointerdown',e=>{if(state.decorateTool==='icing'&&$('icing-tool').value==='eraser'){const i=journey.strokes.findLastIndex(st=>st.tool==='pen');if(i>=0){journey.strokes.splice(i,1);paintIcing();keep();}else toast('No icing stroke to erase.');return;}e.preventDefault();icing.setPointerCapture(e.pointerId);temp.draw=true;temp.pts=[pos(e)];paintIcing()});
  icing.addEventListener('pointermove',e=>{if(!temp.draw)return;const p=pos(e),last=temp.pts.at(-1);if(Math.hypot(p.x-last.x,p.y-last.y)>(state.decorateTool==='toppings'?5:1.5)){temp.pts.push(p);paintIcing()}});
  function endStroke(){if(!temp.draw)return;temp.draw=false;journey.strokes.push({points:temp.pts,color:activeColor(),width:activeWidth(),tool:activeTool(),density:topping.density});temp.pts=[];paintIcing();keep()}
  icing.addEventListener('pointerup',endStroke);icing.addEventListener('pointercancel',endStroke);
  $('icing-undo').addEventListener('click',()=>{const i=journey.strokes.findLastIndex(st=>st.tool==='pen');if(i>=0){journey.strokes.splice(i,1);paintIcing();keep();}else toast('No icing stroke to undo.');});
  $('icing-clear').addEventListener('click',()=>{const count=journey.strokes.length;journey.strokes=journey.strokes.filter(st=>st.tool!=='pen');if(journey.strokes.length===count){toast('No icing strokes to clear.');return;}paintIcing();keep();});
  document.querySelectorAll('[data-icing-swatch]').forEach(btn=>btn.addEventListener('click',()=>{$('icing-color').value=btn.dataset.icingSwatch;}));

  document.querySelectorAll('[data-cream-swatch]').forEach(btn=>btn.addEventListener('click',()=>{$('cream-color').value=btn.dataset.creamSwatch;}));
  $('cream-width').addEventListener('input',e=>{$('cream-width-value').textContent=e.target.value+'px';});
  $('cream-undo').addEventListener('click',()=>{const i=journey.strokes.findLastIndex(st=>st.tool==='cream');if(i>=0){journey.strokes.splice(i,1);paintIcing();keep();}else toast('No cream stroke to undo.');});
  $('cream-clear').addEventListener('click',()=>{journey.strokes=journey.strokes.filter(st=>st.tool!=='cream');paintIcing();keep();});
  $('pearl-color').addEventListener('input',e=>{topping.pearlColor=e.target.value;});
  document.querySelectorAll('[data-pearl-swatch]').forEach(btn=>btn.addEventListener('click',()=>{$('pearl-color').value=btn.dataset.pearlSwatch;topping.pearlColor=btn.dataset.pearlSwatch;}));
  const updatePearlControls=()=>{$('pearl-color-controls').classList.toggle('hidden',topping.kind!=='sprinkles');};
  updatePearlControls();
  document.querySelectorAll('[data-topping]').forEach(b=>b.addEventListener('click',()=>{
    topping.kind=b.dataset.topping;
    updatePearlControls();
    document.querySelectorAll('[data-topping]').forEach(el=>el.classList.toggle('active',el===b));
  }));
  $('topping-size').addEventListener('input',e=>{
    topping.size=+e.target.value;
    $('topping-size-label').textContent=topping.size<6?'Small':topping.size<10?'Medium':'Large';
  });
  $('topping-density').addEventListener('input',e=>{topping.density=+e.target.value;$('topping-density-label').textContent=e.target.value;});
  $('topping-undo').addEventListener('click',()=>{
    const i=journey.strokes.findLastIndex(st=>toppingTools.has(st.tool));
    if(i>=0){journey.strokes.splice(i,1);paintIcing();keep();}else toast('No toppings to undo.');
  });
  $('topping-clear').addEventListener('click',()=>{
    journey.strokes=journey.strokes.filter(st=>!toppingTools.has(st.tool));paintIcing();keep();
  });

  // Use the same complete SVG cookie in the wrapping view and exported raster assets.
  function snapshotSVG(skipPattern=false){
    rebuildStamp();const svg=$('stamp-canvas').cloneNode(true);
    svg.removeAttribute('tabindex');svg.setAttribute('xmlns','http://www.w3.org/2000/svg');
    if(skipPattern)svg.querySelector('#pattern-imprint')?.remove(); // Render lines separately on Canvas to avoid Safari nested-SVG issues.
    const plate=svg.querySelector('circle');if(plate)plate.remove();
    if(journey.baked && journey.bakeLevel>0){
      const body=svg.querySelector('#stamp-cookie-base > g > path:last-child');
      if(body){body.setAttribute('stroke',journey.bakeLevel>65?'#946044':'#b67e51');body.setAttribute('stroke-width',String(5+journey.bakeLevel/18));}
    }
    return new XMLSerializer().serializeToString(svg);
  }
  function imageFromSVG(xml){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Could not render cookie.'));im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(xml);})}
  // Safari can reject SVG -> Image decoding when a serialized SVG embeds artwork.
  // Keep the main high-fidelity rendering path and provide a Canvas fallback,
  // so the whole postcard never disappears due to one SVG decode failure.
  async function drawFallbackCookie(x){
    x.save();x.scale(2,2);
    let path;
    try{path=new Path2D(state.shape?pathForShape():shapeData[0].path)}
    catch(err){console.warn('[Cookie Post] Invalid shape path:',err);path=new Path2D(shapeData[0].path)}
    x.translate(25,25);x.scale(.97,.97);
    x.shadowColor='rgba(101,64,43,.28)';x.shadowBlur=7;x.shadowOffsetY=8;
    x.fillStyle=flavor().color;x.fill(path);
    x.shadowColor='transparent';x.shadowBlur=0;x.shadowOffsetY=0;
    x.strokeStyle='#b88d61';x.lineWidth=4;x.stroke(path);
    x.save();x.clip(path);
    const stampUrl=window.CookieStampShadows?.[stampState.selected];
    if(stampUrl){
      try{
        const stamp=new Image();stamp.src=stampUrl;await stamp.decode();
        x.save();x.translate(stampState.x,stampState.y);x.rotate(stampState.rotation*Math.PI/180);
        x.globalAlpha=.30+.62*(stampState.depth/100);
        const scale=typeof stampState.size==='number'?stampState.size/100:1;
        x.drawImage(stamp,-83*scale,-83*scale,166*scale,166*scale);x.restore();
      }catch(err){console.warn('[Cookie Post] Stamp fallback skipped:',err)}
    }
    x.restore();x.restore();
  }
  async function rasterCookie(){
    paintIcing();
    const c=document.createElement('canvas');c.width=c.height=720;
    const x=c.getContext('2d');
    try{
      const img=await imageFromSVG(snapshotSVG(true));
      x.drawImage(img,0,0,720,720);
      // Drawing a nested SVG image can succeed but taint Safari's Canvas.
      // Probe before icing/export, and rebuild a clean canvas if necessary.
      try{x.getImageData(0,0,1,1)}catch(securityError){
        console.warn('[Cookie Post] SVG was not origin-clean; rebuilding cookie on Canvas.',securityError);
        c.width=c.height=720; // resets the origin-clean flag
        await drawFallbackCookie(c.getContext('2d'));
      }
    }catch(err){
      console.warn('[Cookie Post] SVG cookie rasterization failed; using fallback:',err);
      c.width=c.height=720;
      await drawFallbackCookie(c.getContext('2d'));
    }
    if(journey.baked&&journey.bakeLevel){x.save();x.globalCompositeOperation='source-atop';x.fillStyle=`rgba(166,93,31,${journey.bakeLevel/1600})`;x.fillRect(0,0,720,720);x.restore();}
    // Image-to-Pattern uses an image data URI. Composite it on an origin-clean
    // Canvas so Safari can export the final postcard, even if SVG fallback ran.
    // Clip all raster overlays (image-to-pattern and decorating pens) to the cookie silhouette.
    // Cookie coordinates are 320x320, inset 25 and scaled .97 in the 360x360 preview.
    x.save();
    x.scale(2,2);
    x.translate(25,25);
    x.scale(.97,.97);
    x.clip(new Path2D(state.shape?pathForShape():shapeData[0].path));
    x.setTransform(1,0,0,1,0,0);
    const pattern=window.CookiePostPattern?.get?.();
    if(pattern?.applied&&pattern.processedData){
      try{
        const lines=new Image();lines.src=pattern.processedData;await lines.decode();
        const scale=(Number(pattern.scale)||100)/100;
        const w=180*scale,h=180*scale;
        const px=Number(pattern.x)||180,py=Number(pattern.y)||180;
        x.save();x.scale(2,2);
        x.translate(px,py);x.rotate((Number(pattern.rotation)||0)*Math.PI/180);
        if(pattern.mode==='emboss'){
          x.globalAlpha=.23;x.drawImage(lines,-w/2-1.2,-h/2-1.2,w,h);
          x.globalAlpha=.45;x.drawImage(lines,-w/2+1.1,-h/2+1.5,w,h);
        }else{
          x.globalAlpha=.85;x.drawImage(lines,-w/2,-h/2,w,h);
        }
        x.restore();
      }catch(error){console.warn('[Cookie Post] Pattern could not be composited:',error);}
    }
    const imgIcing=new Image();imgIcing.src=icing.toDataURL('image/png');
    try{await imgIcing.decode();x.drawImage(imgIcing,0,0,720,720)}
    catch(err){console.warn('[Cookie Post] Icing image could not be decoded:',err)}
    x.restore(); // release the silhouette clipping region
    return c;
  }
  function downloadCanvas(canvas,name){return new Promise(resolve=>canvas.toBlob(blob=>{if(!blob){toast('Export failed.');resolve(false);return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);resolve(true)},'image/png'))}
  // Local, offline-safe uploaded background. Stored cropped so it stays in My Draft.
  function setPhotoPreview(){
    const paper=$('package-paper');if(!paper)return;
    const enabled=Boolean(journey.photoBackground);
    paper.classList.toggle('has-custom-background',enabled);
    if(enabled)paper.style.setProperty('--uploaded-postcard-photo',`url("${journey.photoBackground}")`);
    else paper.style.removeProperty('--uploaded-postcard-photo');
    const status=$('postcard-photo-status');if(status)status.textContent=enabled?'Your photo is in use · centre-cropped to the postcard.':'The photo is automatically centre-cropped to fit the postcard.';
  }
  async function handlePhoto(file){
    if(!file)return;
    if(!file.type.startsWith('image/')){toast('Please choose an image.');return;}
    const url=URL.createObjectURL(file);
    try{
      const img=new Image();img.src=url;await img.decode();
      if(!img.naturalWidth||!img.naturalHeight)throw Error('Invalid image.');
      const canvas=document.createElement('canvas');canvas.width=800;canvas.height=1120;
      const x=canvas.getContext('2d');
      const scale=Math.max(canvas.width/img.naturalWidth,canvas.height/img.naturalHeight);
      const w=img.naturalWidth*scale,h=img.naturalHeight*scale;
      x.drawImage(img,(canvas.width-w)/2,(canvas.height-h)/2,w,h);
      journey.photoBackground=canvas.toDataURL('image/jpeg',0.78);
      keep();setPhotoPreview();refreshPackageIfLandscape();
      if(state.page==='send')renderSendPage();
    }catch(error){console.error('[Cookie Post] Photo background:',error);toast('Could not use this photo. Try JPG or PNG.');}
    finally{URL.revokeObjectURL(url);}
  }
  if($('postcard-photo-upload'))$('postcard-photo-upload').addEventListener('change',e=>handlePhoto(e.target.files?.[0]));
  if($('postcard-photo-remove'))$('postcard-photo-remove').addEventListener('click',()=>{journey.photoBackground=null;keep();setPhotoPreview();refreshPackageIfLandscape();if($('postcard-photo-upload'))$('postcard-photo-upload').value='';if(state.page==='send')renderSendPage();});
  async function paintPhotoBackground(ctx){
    if(!journey.photoBackground)return false;
    const img=new Image();img.src=journey.photoBackground;await img.decode();
    ctx.drawImage(img,0,0,1200,1680);return true;
  }
  async function cleanCookieForCard(){
    const original=await rasterCookie();
    const clean=document.createElement('canvas');clean.width=clean.height=720;
    const g=clean.getContext('2d');g.drawImage(original,0,0);
    // Mask the entire artwork to the genuine cookie silhouette. No plate/mat can survive.
    g.globalCompositeOperation='destination-in';
    g.save();g.setTransform(2,0,0,2,0,0);g.translate(25,25);g.scale(.97,.97);
    try{g.fill(new Path2D(state.shape?pathForShape():shapeData[0].path));}
    catch(err){g.fill(new Path2D(shapeData[0].path));}
    g.restore();g.globalCompositeOperation='source-over';
    return clean;
  }
  const ChineseWrappingPapers=new Set(['cn-mist-lilac','cn-sky-blue','cn-cream-gold','cn-blush-pink','cn-soft-green','cn-celadon-mist','cn-warm-taupe']);
  const wrappingImageCache=new Map();
  async function drawChineseWrappingPaper(ctx){
    if(!ChineseWrappingPapers.has(journey.paper))return false;
    const name=journey.paper;
    if(!wrappingImageCache.has(name)){
      const promise=new Promise((resolve,reject)=>{
        const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Wrapping paper unavailable: '+name));
        image.src='assets/wrapping/'+name+'.jpg';
      });
      wrappingImageCache.set(name,promise);
    }
    const img=await wrappingImageCache.get(name);
    const scale=Math.max(1200/img.naturalWidth,1680/img.naturalHeight);
    const width=img.naturalWidth*scale,height=img.naturalHeight*scale;
    ctx.drawImage(img,(1200-width)/2,(1680-height)/2,width,height);
    return true;
  }
  let packagePreviewTicket=0;
  async function refreshLandscapePackagePreview(){
    const ticket=++packagePreviewTicket;
    const stage=$('package-orientation-stage');
    if(!stage||journey.orientation!=='landscape'||state.page!=='package')return;
    let img=$('package-landscape-preview');
    if(!img){img=document.createElement('img');img.id='package-landscape-preview';img.className='package-landscape-preview';img.alt='Landscape greeting card with cookie on the left and text on the right';stage.append(img);}
    try{
      const canvas=await createLandscapeCardCanvas();
      if(ticket!==packagePreviewTicket||journey.orientation!=='landscape'||state.page!=='package')return;
      img.src=canvas.toDataURL('image/png');
    }catch(err){console.warn('[Cookie Post] Package landscape preview:',err);}
  }
  function updateOrientationPreview(){
    const mode=journey.orientation==='landscape'?'landscape':'portrait';
    const select=$('postcard-orientation');if(select)select.value=mode;
    const stage=$('package-orientation-stage');if(stage)stage.classList.toggle('is-landscape',mode==='landscape');
    if(mode==='landscape')refreshLandscapePackagePreview();
    else ++packagePreviewTicket;
  }
  function refreshPackageIfLandscape(){
    if(journey.orientation==='landscape'&&state.page==='package')refreshLandscapePackagePreview();
  }
  const orientationSelect=$('postcard-orientation');
  if(orientationSelect)orientationSelect.addEventListener('change',event=>{
    journey.orientation=event.target.value==='landscape'?'landscape':'portrait';
    keep();updateOrientationPreview();
    if(state.page==='send')renderSendPage();
  });
  function wrapColors(){return {mint:['#bfe4d4','#fffaf1'],pink:['#edb8c3','#fff5f8'],blue:['#bdd3e9','#f4f8ff'],lavender:['#d1c3e9','#faf5ff']}[journey.paper]||['#bfe4d4','#fffaf1']}
  async function exportCookie(){try{const c=await rasterCookie();await downloadCanvas(c,'cookie-post-sticker.png');}catch(e){toast('PNG export failed: '+e.message)}}
  // Postcard border PNG scale. Saved alongside the user's existing card settings.
  const getBorderSize=()=>Math.max(70,Math.min(130,Number(journey.borderSize)||100));
  function updateBorderSize(){
    const amount=getBorderSize();
    const slider=$('postcard-border-size');
    const output=$('postcard-border-size-value');
    if(slider){slider.value=String(amount);slider.disabled=journey.border==='none';}
    if(output)output.textContent=amount+'%';
    const paper=$('package-paper');
    if(paper)paper.style.setProperty('--postcard-border-scale',amount+'%');
  }
  const sizeSlider=$('postcard-border-size');
  if(sizeSlider)sizeSlider.addEventListener('input',event=>{
    journey.borderSize=Number(event.target.value);
    updateBorderSize();keep();
    refreshPackageIfLandscape();
    if(state.page==='send')renderSendPage();
  });
  const resetBorder=$('postcard-border-size-reset');
  if(resetBorder)resetBorder.addEventListener('click',()=>{
    journey.borderSize=100;updateBorderSize();keep();
    refreshPackageIfLandscape();
    if(state.page==='send')renderSendPage();
  });
  const borderDesigns=[['2646','Vintage Flourish'],['2647','Blue Filigree'],['2648','Classic Double Line'],['2649','Blue Botanical'],['2650','Art Nouveau Lace'],['2651','Golden Baroque'],['2652','Emerald Floral'],['2653','Golden Corners'],['2654','Ornate Lace'],['2655','Victorian Gold']];
  const borderImageCache=new Map();
  function getFrameImage(id){
    if(id==='none')return Promise.resolve(null);
    if(borderImageCache.has(id))return borderImageCache.get(id);
    const p=new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=window.CookiePostFrameData?.[id]||`assets/postcard-frames/frame-${id}.png`;});
    borderImageCache.set(id,p);return p;
  }
  function paintPostcardBorder(ctx,image){
    if(!image)return;
    ctx.save();
    ctx.shadowColor='rgba(78,49,32,.26)';ctx.shadowBlur=2;ctx.shadowOffsetX=1;ctx.shadowOffsetY=2;
    ctx.drawImage(image,105,125,990,1140);
    ctx.restore();
  }
  async function renderPostcardBorderChoices(){
    const select=$('postcard-border-select');const grid=$('postcard-border-swatches');
    if(!select||!grid)return;
    select.value=journey.border||'2655';
    grid.innerHTML=borderDesigns.map(([id,name])=>`<button type="button" class="postcard-border-choice ${journey.border===id?'selected':''}" data-border="${id}" title="${name}" aria-label="${name}"><img src="assets/postcard-frames/frame-${id}.png" alt="" loading="lazy"><span>${name}</span></button>`).join('');
    grid.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>setBorder(b.dataset.border)));
  }
  function setBorder(id){
    journey.border=id;keep();
    const select=$('postcard-border-select');if(select)select.value=id;
    document.querySelectorAll('.postcard-border-choice').forEach(b=>b.classList.toggle('selected',b.dataset.border===id));
    // Keep a small live border preview next to the actual cookie in Package.
    const paper=$('package-paper');if(paper)paper.style.setProperty('--postcard-border-url',id==='none'?'none':`url("assets/postcard-frames/frame-${id}.png")`);
    updateBorderSize();refreshPackageIfLandscape();
    if(state.page==='send')renderSendPage();
  }
  if($('postcard-border-select'))$('postcard-border-select').addEventListener('change',e=>setBorder(e.target.value));
    async function createPortraitCardCanvas(){
    const c=document.createElement('canvas');c.width=1200;c.height=1680;
    const x=c.getContext('2d');const colors=wrapColors();
    const hasPhoto=journey.photoBackground?await paintPhotoBackground(x):false;
    const hasChinesePaper=!hasPhoto&&await drawChineseWrappingPaper(x);
    if(!hasPhoto&&!hasChinesePaper){
      x.fillStyle=colors[0];x.fillRect(0,0,1200,1680);
      x.fillStyle=colors[1];
      for(let yy=0;yy<1680;yy+=70)for(let xx=0;xx<1200;xx+=70)if((xx/70+yy/70)%2===0)x.fillRect(xx,yy,70,70);
    }
    const frame=await getFrameImage(journey.border||'2655');
    // Genuine cookie silhouette, with NO plate and NO circular backing.
    const cookie=await cleanCookieForCard();
    x.drawImage(cookie,290,220,620,620);
    if(frame){
      x.save();x.shadowColor='rgba(78,49,32,.26)';x.shadowBlur=2;x.shadowOffsetX=1;x.shadowOffsetY=2;
      const scale=getBorderSize()/100;
      // Match Package CSS border overlay, which is sized to the full 5:7 card.
      const w=1200*scale,h=1680*scale;
      // CSS background-size clips a zoomed frame to postcard bounds; Canvas must too.
      x.beginPath();x.rect(0,0,1200,1680);x.clip();
      x.drawImage(frame,600-w/2,840-h/2,w,h);x.restore();
    }
    if(document.fonts){
      try{await Promise.all([
        document.fonts.load('42px "Cookie Post WenKai GB"','春风送暖花开'),
        document.fonts.load('500 26px "Cookie Post WenKai GB"','寄语')
      ]);}catch(err){console.warn('[Cookie Post] Postcard font unavailable:',err);}
    }
    const poem=window.CookiePoetry?.get?.()||{};
    const poemLines=(poem.include&&poem.text)?poem.text.split(/\n+/).map(t=>t.trim()).filter(Boolean).slice(0,4):[];
    x.textAlign='center';x.fillStyle=hasPhoto?'#3d302c':'#553b35';
    // V2.13.2: narrow, translucent white mist behind lettering (not the cookie).
    {
      const textPanelTop=poemLines.length?850:920;
      const textPanelHeight=poemLines.length?650:580;
      x.save();
      x.shadowColor='rgba(255,255,255,.38)';
      x.shadowBlur=26;
      x.shadowOffsetX=0;
      x.shadowOffsetY=0;
      const mist=x.createLinearGradient(0,textPanelTop,0,textPanelTop+textPanelHeight);
      mist.addColorStop(0,'rgba(255,253,249,.48)');
      mist.addColorStop(.52,'rgba(255,252,246,.43)');
      mist.addColorStop(1,'rgba(255,255,255,.37)');
      x.fillStyle=mist;
      x.beginPath();
      x.roundRect(245,textPanelTop,710,textPanelHeight,34);
      x.fill();
      x.restore();
      x.fillStyle='#553b35';
    }
    if(poemLines.length){
      x.font='42px "Cookie Post WenKai GB", "Songti SC", serif';
      poemLines.forEach((v,i)=>x.fillText(v.slice(0,22),600,920+i*70,760));
    }
    x.font='32px "Cookie Post WenKai GB", "Songti SC", Georgia, serif';
    const text=journey.message||'';
    const lines=[];
    for(const para of text.split(/\n/)){
      let line='';for(const ch of [...para]){
        if(x.measureText(line+ch).width>750){lines.push(line);line=ch;}else line+=ch;
      }lines.push(line);
    }
    lines.slice(0,poemLines.length?2:4).forEach((v,i)=>x.fillText(v,600,(poemLines.length?1250:1040)+i*46,760));
    x.font='500 26px "Cookie Post WenKai GB", "Songti SC", Georgia, serif';
    if(journey.to)x.fillText('To '+journey.to.slice(0,50),600,1360,800);
    if(journey.from)x.fillText('From '+journey.from.slice(0,50),600,1410,800);
    return c;
  }
  // V2.20: a genuine landscape composition, not a rotated portrait image.
  // Same cookie, paper, frame, poem and names; only layout changes.
  async function createLandscapeCardCanvas(){
    const W=1680,H=1200;
    const c=document.createElement('canvas');c.width=W;c.height=H;
    const x=c.getContext('2d');
    const cover=(img)=>{
      const scale=Math.max(W/img.width,H/img.height);
      const w=img.width*scale,h=img.height*scale;
      x.drawImage(img,(W-w)/2,(H-h)/2,w,h);
    };
    let customBackground=false;
    if(journey.photoBackground){
      const image=new Image();image.src=journey.photoBackground;await image.decode();
      cover(image);customBackground=true;
    }else if(ChineseWrappingPapers.has(journey.paper)){
      const paper=new Image();paper.src='assets/wrapping/'+journey.paper+'.jpg';await paper.decode();
      cover(paper);
    }else{
      const colors=wrapColors();
      x.fillStyle=colors[0];x.fillRect(0,0,W,H);
      x.fillStyle=colors[1];
      for(let y=0;y<H;y+=70)for(let xx=0;xx<W;xx+=70)if(((xx+y)/70)%2===0)x.fillRect(xx,y,70,70);
    }
    const cookie=await cleanCookieForCard();
    x.save();x.shadowColor='rgba(87,57,42,.20)';x.shadowBlur=18;x.shadowOffsetY=10;
    x.drawImage(cookie,125,265,655,655);x.restore();
    // The original frame is portrait-shaped; turning only the decorative frame
    // lets it cover a landscape card without rotating its cookie or lettering.
    const frame=await getFrameImage(journey.border||'2655');
    if(frame){
      const scale=getBorderSize()/100;
      x.save();x.beginPath();x.rect(0,0,W,H);x.clip();
      x.shadowColor='rgba(78,49,32,.24)';x.shadowBlur=3;
      x.translate(W/2,H/2);x.rotate(Math.PI/2);
      x.drawImage(frame,-H*scale/2,-W*scale/2,H*scale,W*scale);
      x.restore();
    }
    if(document.fonts){
      try{await Promise.all([
        document.fonts.load('42px "Cookie Post WenKai GB"','春风送暖花开'),
        document.fonts.load('500 26px "Cookie Post WenKai GB"','寄语')
      ]);}catch(err){console.warn('[Cookie Post] Postcard font unavailable:',err);}
    }
    const poem=window.CookiePoetry?.get?.()||{};
    const poemLines=(poem.include&&poem.text)?poem.text.split(/\n+/).map(t=>t.trim()).filter(Boolean).slice(0,4):[];
    const left=835,right=1510,cx=(left+right)/2;
    // Light translucent paper provides readability without obscuring artwork.
    x.save();x.shadowColor='rgba(255,255,255,.25)';x.shadowBlur=23;
    const mist=x.createLinearGradient(left,170,right,1030);
    mist.addColorStop(0,'rgba(255,253,249,.47)');
    mist.addColorStop(.55,'rgba(255,252,247,.43)');
    mist.addColorStop(1,'rgba(255,255,255,.36)');
    x.fillStyle=mist;x.beginPath();x.roundRect(left,148,right-left,905,35);x.fill();x.restore();
    x.fillStyle=customBackground?'#47352e':'#553b35';
    x.textAlign='center';x.textBaseline='alphabetic';
    if(poemLines.length){
      x.font='42px "Cookie Post WenKai GB", "Songti SC", serif';
      poemLines.forEach((line,i)=>x.fillText(line.slice(0,22),cx,310+i*78,630));
    }
    x.font='32px "Cookie Post WenKai GB", "Songti SC", Georgia, serif';
    const message=journey.message||'';
    const lines=[];
    for(const paragraph of message.split(/\n/)){
      let line='';
      for(const ch of [...paragraph]){
        if(line&&x.measureText(line+ch).width>580){lines.push(line);line=ch;}
        else line+=ch;
      }
      lines.push(line);
    }
    const firstMessageY=poemLines.length?685:365;
    lines.slice(0,poemLines.length?4:9).forEach((line,i)=>x.fillText(line,cx,firstMessageY+i*49,610));
    x.font='500 26px "Cookie Post WenKai GB", "Songti SC", Georgia, serif';
    if(journey.to)x.fillText('To '+journey.to.slice(0,50),cx,945,620);
    if(journey.from)x.fillText('From '+journey.from.slice(0,50),cx,994,620);
    return c;
  }
  async function createCardCanvas(){
    return journey.orientation==='landscape'?createLandscapeCardCanvas():createPortraitCardCanvas();
  }
  window.CookiePostCreateCardCanvas=createCardCanvas;
  async function exportCard(){try{await downloadCanvas(await createCardCanvas(),'cookie-post-greeting-card.png')}catch(e){toast('Card export failed: '+e.message)}}
  function renderBake(){
    paintIcing();
    const svg=$('stamp-canvas').cloneNode(true);svg.removeAttribute('id');svg.removeAttribute('tabindex');
    const plate=svg.querySelector('circle');if(plate)plate.remove();
    $('bake-cookie').innerHTML=svg.innerHTML;
    // Keep the same cookie silhouette for Bake as Decorate and exported cards.
    const bakeDefs=$('bake-cookie').querySelector('defs')||$('bake-cookie').insertBefore(svgTag('defs'),$('bake-cookie').firstChild);
    let bakeClip=bakeDefs.querySelector('#bake-cookie-silhouette');
    if(!bakeClip){bakeClip=svgTag('clipPath',{id:'bake-cookie-silhouette',clipPathUnits:'userSpaceOnUse'});bakeDefs.append(bakeClip);}
    bakeClip.replaceChildren(svgTag('path',{d:state.shape?pathForShape():shapeData[0].path,transform:'translate(25 25) scale(.97)'}));
    const icingImage=svgTag('image',{x:0,y:0,width:360,height:360,href:icing.toDataURL('image/png')});
    const clippedIcing=svgTag('g',{'clip-path':'url(#bake-cookie-silhouette)'});
    clippedIcing.append(icingImage);
    $('bake-cookie').append(clippedIcing);
    $('bake-level').value=journey.bakeLevel;$('bake-value').textContent=journey.bakeLevel+'%';
    $('bake-status').textContent=journey.baked?`Baked · Golden level ${journey.bakeLevel}%`:'Raw dough · No baking yet';
    $('bake-window').style.setProperty('--bake',journey.baked?journey.bakeLevel/100:0);
  }
  $('bake-level').addEventListener('input',e=>{$('bake-value').textContent=e.target.value+'%';$('bake-window').style.setProperty('--bake',Number(e.target.value)/100);});
  $('bake-apply').addEventListener('click',()=>{journey.bakeLevel=Math.max(1,Number($('bake-level').value));journey.baked=true;keep();renderBake();toast('Cookie baked!');});
  $('bake-skip').addEventListener('click',()=>{journey.baked=false;journey.bakeLevel=0;keep();renderBake();toast('Kept as raw dough.');});
  function renderPackage(){
    paintIcing();
    $('package-paper').dataset.paper=journey.paper;$('paper-select').value=journey.paper;updateOrientationPreview();
    renderPostcardBorderChoices();setBorder(journey.border||'2655');
    if($('sender-name'))$('sender-name').value=journey.from||'';$('recipient-name').value=journey.to;$('gift-message').value=journey.message;
    $('package-flavor').textContent=flavor().name+' · '+(state.shape?shape().name:'Circle');
    const packageSvg=snapshotSVG().replace(/<svg /,'<svg id="package-cookie" ');
    $('package-cookie').outerHTML=packageSvg;
    const target=$('package-cookie');
    const defs=target.querySelector('defs')||target.insertBefore(svgTag('defs'),target.firstChild);
    const clip=svgTag('clipPath',{id:'package-cookie-silhouette',clipPathUnits:'userSpaceOnUse'});
    clip.append(svgTag('path',{d:state.shape?pathForShape():shapeData[0].path,transform:'translate(25 25) scale(.97)'}));defs.append(clip);
    const group=svgTag('g',{'clip-path':'url(#package-cookie-silhouette)'});
    for(const child of [...target.children])if(child!==defs)group.append(child);
    group.append(svgTag('image',{x:0,y:0,width:360,height:360,href:icing.toDataURL('image/png')}));target.append(group);
    setPhotoPreview();refreshPackageIfLandscape();
  }
  $('paper-select').addEventListener('change',e=>{journey.paper=e.target.value;keep();$('package-paper').dataset.paper=journey.paper;refreshPackageIfLandscape();});
  if($('sender-name'))$('sender-name').addEventListener('input',e=>{journey.from=e.target.value;keep();refreshPackageIfLandscape()});
  $('recipient-name').addEventListener('input',e=>{journey.to=e.target.value;keep();refreshPackageIfLandscape()});
  $('gift-message').addEventListener('input',e=>{journey.message=e.target.value;keep();refreshPackageIfLandscape()});
  $('download-cookie').addEventListener('click',exportCookie);
  $('download-card').addEventListener('click',exportCard);
  // The mail dialog is managed by mail.js; do not open mailto drafts.


  // Replace earlier navigation listeners, keeping all existing page data and markup.
  for(const id of ['next-btn','prev-btn','export-btn']){const old=$(id),fresh=old.cloneNode(true);old.replaceWith(fresh);}
  $('next-btn').addEventListener('click',()=>{
    if(state.page==='dough')show('shape');
    else if(state.page==='shape'){if(!state.shape){toast('Choose a shape first.');return}if(state.shape==='custom'&&!state.customPath){toast('Draw your custom shape first.');return}show('decorate')}
    else if(state.page==='decorate')show('bake');
    else if(state.page==='bake')show('package');
    else if(state.page==='package')show('send');
    else if(state.page==='send')$('email-message').click();
  });
  $('prev-btn').addEventListener('click',()=>show(({dough:'home',shape:'dough',decorate:'shape',bake:'decorate',package:'bake',send:'package'})[state.page]||'home'));
  $('export-btn').addEventListener('click',exportCookie);
  $('send-back-package').addEventListener('click',()=>show('package'));
  document.querySelectorAll('.step[data-go]').forEach(btn=>{if(btn.dataset.go==='bake')btn.addEventListener('click',()=>{if(!state.shape){toast('Choose a shape first.');return;}show('bake')});if(btn.dataset.go==='package')btn.addEventListener('click',()=>{if(!state.shape){toast('Choose a shape first.');return}show('package')})});
  document.querySelector('.step[data-go="send"]').addEventListener('click',()=>{if(!state.shape){toast('Choose a shape first.');return;}show('send');});
  // Restore stamp selection from Traditional Sets and repaint when a stamp changes.
  $('stamp-grid').addEventListener('click',()=>requestAnimationFrame(rebuildStamp));
  $('stamp-depth').addEventListener('input',()=>requestAnimationFrame(rebuildStamp));
  $('stamp-rotation').addEventListener('input',()=>requestAnimationFrame(rebuildStamp));
  $('stamp-center').addEventListener('click',()=>requestAnimationFrame(rebuildStamp));
  $('stamp-clear').addEventListener('click',()=>requestAnimationFrame(rebuildStamp));
  $('stamp-canvas').addEventListener('click',()=>requestAnimationFrame(rebuildStamp));
  show('home');
})();
