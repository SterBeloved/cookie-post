'use strict';
const flavors=[
{id:'butter',name:'Original Butter',color:'#f2d394',bg:'#ffe4a7',stroke:'#e0b344',emoji:'🧈',image:'assets/dough/original-butter.png'},
{id:'matcha',name:'Matcha Green Tea',color:'#9bb974',bg:'#daeac3',stroke:'#8fae75',emoji:'🍃',image:'assets/dough/matcha-green-tea.png'},
{id:'strawberry',name:'Strawberry',color:'#eaa6ad',bg:'#ffdae0',stroke:'#db92a1',emoji:'🍓',image:'assets/dough/strawberry.png'},
{id:'osmanthus',name:'Osmanthus',color:'#efcf83',bg:'#fff0c5',stroke:'#d9b45e',emoji:'🌼',image:'assets/dough/osmanthus.png'},
{id:'chocolate',name:'Chocolate',color:'#99704d',bg:'#e9cfbd',stroke:'#bf896d',emoji:'🍫',image:'assets/dough/chocolate.png'},
{id:'mint',name:'Mint',color:'#a7ded0',bg:'#ccebe9',stroke:'#83c4b8',emoji:'🌿',image:'assets/dough/mint.png'},
{id:'earl',name:'Earl Grey Tea',color:'#ae8870',bg:'#ead3b8',stroke:'#b58e6a',emoji:'☕',image:'assets/dough/earl-grey-tea.png'},
{id:'purple',name:'Purple Sweet Potato',color:'#ae88bf',bg:'#e7d6ea',stroke:'#bba1ca',emoji:'🍠',image:'assets/dough/purple-sweet-potato.png'},
{id:'yuzu',name:'Yuzu Citrus',color:'#eee19d',bg:'#f7ecc3',stroke:'#d1c179',emoji:'🍋',image:'assets/dough/yuzu-citrus.png'},
{id:'sakura',name:'Sakura',color:'#eac4d3',bg:'#ffe0e8',stroke:'#e6afbd',emoji:'🌸',image:'assets/dough/sakura.png'}
];
const shapeData=[
{id:'circle',name:'Circle',path:'M160 57 A103 103 0 1 1 159.9 57 Z',bg:'#ffecac',stroke:'#e5b83c'},
{id:'heart',name:'Heart',path:'M160 267 C128 238 62 194 57 133 C51 67 128 51 160 104 C196 45 267 73 263 136 C260 193 194 240 160 267 Z',bg:'#e2f0ce',stroke:'#9bb878'},
{id:'square',name:'Square',path:'M74 67 Q65 67 65 77 L65 247 Q65 257 75 257 L246 257 Q257 257 257 246 L257 78 Q257 67 247 67 Z',bg:'#ffdde3',stroke:'#e4a6af'},
{id:'star',name:'Star',path:'M160 40 L196 115 L278 127 L218 183 L233 263 L160 226 L87 263 L102 183 L42 127 L124 115 Z',bg:'#ffedb5',stroke:'#e7c35f'},
{id:'flower',name:'Flower',path:'M160 72 C189 30 236 59 231 100 C278 101 287 155 242 179 C270 226 237 266 193 246 C171 286 122 275 116 242 C64 260 47 212 83 177 C40 150 54 104 102 106 C96 56 134 40 160 72 Z',bg:'#d2f2ef',stroke:'#77b7bd'},
{id:'bunny',name:'Bunny',path:'M111 130 C82 88 79 33 104 30 C130 27 142 80 145 112 C158 108 168 108 177 112 C181 77 195 29 219 34 C248 44 219 108 205 132 C247 152 253 197 223 231 C194 263 113 264 84 231 C52 196 67 151 111 130 Z',bg:'#ece0f6',stroke:'#b69cd7'},
{id:'ribbon',name:'Ribbon',path:'M153 124 C111 72 64 76 48 95 C27 118 48 166 91 170 C113 173 137 155 153 146 L153 166 L117 225 L146 222 L159 203 L173 221 L204 233 L173 164 L173 145 C221 179 270 176 279 134 C288 92 251 75 226 84 C203 91 182 107 173 121 Q160 113 153 124 Z',bg:'#e9d9f4',stroke:'#a894c4'},
{id:'custom',name:'Draw My Own',path:'M76 212 C59 169 92 144 128 148 C109 101 149 66 182 98 C213 62 258 104 239 143 C276 167 258 212 220 222 L106 222 Z',bg:'#ffdee5',stroke:'#da879c'}
];
const $=id=>document.getElementById(id);
const load=()=>{try{const v=JSON.parse(localStorage.getItem('cookie-post-draft-v1'));return v&&typeof v==='object'?v:null}catch{return null}};
const previous=load();
if(previous?.flavor==='pineapple')previous.flavor='osmanthus';
const state={page:'home',flavor:flavors.some(f=>f.id===previous?.flavor)?previous.flavor:'butter',shape:shapeData.some(s=>s.id===previous?.shape)?previous.shape:null,customPath:typeof previous?.customPath==='string'?previous.customPath:null,stamped:previous?.stamped||null};
const flavor=()=>flavors.find(f=>f.id===state.flavor)||flavors[0];
const shape=()=>shapeData.find(s=>s.id===state.shape)||shapeData[0];
const save=()=>localStorage.setItem('cookie-post-draft-v1',JSON.stringify({flavor:state.flavor,shape:state.shape,customPath:state.customPath,stamped:state.stamped}));
const toast=msg=>{const t=$('toast');t.textContent=msg;t.classList.remove('hidden');clearTimeout(toast.timeout);toast.timeout=setTimeout(()=>t.classList.add('hidden'),2400)};
function modal(title,desc){$('dialog-title').textContent=title;$('dialog-text').textContent=desc;$('dialog').classList.remove('hidden');}
function show(page){
 state.page=page;
 $('home').classList.toggle('hidden',page!=='home');$('studio').classList.toggle('hidden',page==='home');
 if(page==='home')return;
 const decorate=page==='decorate';
 $('page-title').textContent=page==='dough'?'Choose Your Dough':page==='shape'?'Choose Your Shape':'Decorate Your Cookie';
 $('page-desc').textContent=page==='dough'?'Pick a flavor for your cookie dough!':page==='shape'?'Pick a mold, or draw your own cookie shape!':'Add a traditional pastry imprint to your cookie.';
 $('dough-panel').classList.toggle('hidden',page!=='dough');$('shape-panel').classList.toggle('hidden',page!=='shape');
 document.querySelector('.preview-area').classList.toggle('hidden',decorate);
 document.querySelector('.options-area').classList.toggle('hidden',decorate);
 $('stamp-workspace').classList.toggle('hidden',!decorate);
 document.querySelector('.content-panel').classList.toggle('stamp-layout',decorate);
 document.querySelectorAll('.step').forEach(el=>el.classList.toggle('active',el.dataset.go===page));
 $('prev-btn').textContent=page==='dough'?'‹ Home':'‹ Back';
 $('next-btn').textContent=page==='dough'?'Next: Shape ›':page==='shape'?'Next: Decorate ›':'Next: Package ›';
 render();if(decorate)renderStamp();window.scrollTo({top:0,behavior:'instant'});
}
function pathForShape(s=shape()){return s.id==='custom'&&state.customPath?state.customPath:s.path}
function makePreviewSVG(path,color){
  // Preserve the selected mold outline while showing the actual 3D dough material.
  // Use an embedded data URL so Safari and exported images work offline.
  const source=window.CookieDoughTextures?.[state.flavor];
  if(!source)return `<path d="${path}" fill="${color}" stroke="#b78e69" stroke-width="3"/>`;
  return `<defs><clipPath id="doughPreviewClip"><path d="${path}"/></clipPath></defs>
    <path d="${path}" fill="${color}" stroke="#b78e69" stroke-width="2"/>
    <g clip-path="url(#doughPreviewClip)"><image href="${source}" x="30" y="22" width="260" height="276" preserveAspectRatio="none"/></g>
    <path d="${path}" fill="none" stroke="#b78e69" stroke-width="3" stroke-linejoin="round"/>`;
}
function makeDoughPhotoMarkup(src){return `<ellipse cx="160" cy="216" rx="68" ry="17" fill="#866955" opacity=".12"/><image href="${src}" x="62" y="72" width="196" height="152" preserveAspectRatio="xMidYMid meet"/>`; }
function renderPreview(){const f=flavor();let path;if(state.page==='shape'&&state.shape){path=pathForShape()}else{path='M78 210 C68 194 71 163 80 138 C90 109 111 93 138 90 C159 79 191 84 213 99 C239 110 252 137 247 166 C257 184 246 216 224 231 C203 247 168 251 145 244 C114 248 91 235 78 210 Z'}
 if(state.page==='dough'){
   $('dough-figure').removeAttribute('transform');
   $('dough-figure').innerHTML=makeDoughPhotoMarkup(f.image);
 }else{
   $('dough-figure').innerHTML=makePreviewSVG(path,f.color);
   $('dough-figure').removeAttribute('transform');
 }
 $('preview-caption').textContent=f.name+(state.page==='dough'?' · Unshaped dough':` · ${state.shape?shape().name:'Choose a mold'}`);$('preview-meta').textContent=state.page==='shape'?'Your flavor is preserved from Step 1.':'Your dough, your rules.';$('current-flavor').textContent=f.name;}
function renderFlavors(){$('flavors').innerHTML=flavors.map(f=>`<button class="option-card flavor-card ${state.flavor===f.id?'selected':''}" data-flavor="${f.id}" style="--card-bg:${f.bg};--card-stroke:${f.stroke}"><span class="swatch-photo-wrap"><img class="swatch-photo" src="${f.image}" alt="" loading="eager" decoding="async"></span><span class="option-name">${f.name}</span></button>`).join('');document.querySelectorAll('[data-flavor]').forEach(b=>b.addEventListener('click',()=>{state.flavor=b.dataset.flavor;save();render()}))}
function renderShapes(){const f=flavor();$('shapes').innerHTML=shapeData.map(s=>`<button class="option-card shape-card ${state.shape===s.id?'selected':''}" data-shape="${s.id}" style="--card-bg:${s.bg};--card-stroke:${s.stroke};--dough:${f.color}"><svg class="shape-icon" viewBox="0 0 320 320" aria-hidden="true"><path d="${s.id==='custom'&&state.customPath?state.customPath:s.path}" /></svg><span class="option-name">${s.name}</span></button>`).join('');document.querySelectorAll('[data-shape]').forEach(b=>b.addEventListener('click',()=>{state.shape=b.dataset.shape;$('drawing-area').classList.toggle('hidden',state.shape!=='custom');save();render()}))}
function render(){renderPreview();renderFlavors();renderShapes();}
// Paths are traced directly from the user's transparent, four-color PNG mask (1670 x 942).
// No per-pixel canvas reads are needed, so home buttons also work when opened via file:// in Safari.
const homeActions={start:'Start Creating',image:'Image to Cookie',wish:'Make a Wish',collection:'My Collection'};
const homeMaskPaths={start:'M956,535 L957,549 L960,558 L967,567 L968,571 L978,579 L988,584 L1003,586 L1017,585 L1030,579 L1039,579 L1050,585 L1071,590 L1082,590 L1116,585 L1141,578 L1158,578 L1174,586 L1182,588 L1208,587 L1221,581 L1233,578 L1243,578 L1265,584 L1272,588 L1280,589 L1296,587 L1303,583 L1307,583 L1320,578 L1340,579 L1358,587 L1386,586 L1396,580 L1406,580 L1414,585 L1418,585 L1423,588 L1435,588 L1442,586 L1456,578 L1468,565 L1475,550 L1477,537 L1476,530 L1469,514 L1461,503 L1445,494 L1441,494 L1436,491 L1411,490 L1394,483 L1363,485 L1353,490 L1338,491 L1322,485 L1308,482 L1297,482 L1255,493 L1246,493 L1217,483 L1205,483 L1186,487 L1177,492 L1167,495 L1154,495 L1118,485 L1094,487 L1090,490 L1079,491 L1066,488 L1052,482 L1041,482 L1029,484 L1011,490 L1004,495 L1002,494 L990,498 L975,506 L964,516Z',image:'M949,638 L949,648 L952,657 L957,664 L975,680 L989,686 L1013,687 L1032,680 L1036,680 L1038,682 L1055,686 L1062,690 L1095,691 L1112,688 L1127,683 L1156,678 L1171,680 L1189,687 L1212,688 L1237,679 L1254,678 L1278,683 L1291,689 L1297,690 L1316,685 L1330,679 L1338,678 L1360,681 L1375,688 L1388,688 L1408,682 L1414,682 L1421,685 L1433,685 L1447,682 L1453,679 L1467,662 L1473,649 L1474,635 L1466,613 L1449,599 L1441,595 L1428,592 L1412,593 L1402,589 L1391,590 L1370,596 L1358,596 L1340,589 L1315,589 L1302,592 L1287,598 L1277,598 L1261,592 L1249,590 L1224,591 L1206,596 L1194,596 L1185,592 L1174,590 L1150,590 L1133,597 L1113,598 L1104,594 L1085,590 L1073,594 L1058,595 L1041,589 L1018,589 L1010,592 L992,592 L977,597 L958,615 L952,626Z',wish:'M950,736 L951,751 L958,763 L966,772 L976,779 L990,784 L1012,783 L1023,789 L1037,792 L1049,792 L1057,790 L1075,781 L1079,781 L1085,786 L1103,791 L1125,791 L1158,780 L1170,780 L1178,784 L1199,790 L1212,790 L1232,787 L1249,780 L1257,779 L1293,791 L1304,791 L1324,786 L1339,780 L1350,780 L1362,786 L1377,790 L1393,790 L1414,784 L1436,785 L1450,780 L1460,774 L1468,766 L1474,755 L1476,745 L1476,731 L1473,721 L1469,720 L1461,708 L1444,693 L1430,690 L1411,690 L1395,695 L1383,695 L1362,688 L1340,688 L1299,697 L1275,688 L1248,687 L1203,698 L1196,697 L1176,689 L1164,688 L1146,690 L1122,698 L1096,692 L1081,692 L1062,698 L1050,692 L1032,687 L1012,691 L999,689 L977,697 L964,707 L953,723Z',collection:'M945,841 L946,855 L950,865 L955,873 L973,889 L989,894 L998,895 L1014,893 L1027,900 L1039,899 L1041,901 L1050,900 L1074,891 L1078,891 L1081,894 L1095,900 L1117,901 L1132,898 L1149,891 L1168,889 L1189,899 L1198,901 L1213,901 L1231,897 L1250,888 L1260,888 L1277,897 L1299,901 L1314,899 L1325,893 L1337,890 L1341,887 L1358,887 L1368,890 L1378,896 L1386,898 L1387,897 L1394,900 L1413,900 L1421,897 L1424,894 L1435,894 L1444,889 L1447,890 L1450,888 L1464,872 L1470,860 L1473,847 L1472,834 L1467,816 L1459,806 L1454,804 L1450,800 L1442,796 L1426,792 L1402,793 L1393,795 L1388,798 L1379,798 L1357,789 L1337,789 L1316,796 L1314,798 L1306,798 L1301,800 L1287,798 L1281,794 L1260,789 L1238,791 L1224,796 L1218,796 L1212,799 L1202,799 L1168,789 L1157,789 L1122,800 L1102,797 L1081,789 L1076,789 L1061,794 L1055,794 L1043,799 L1033,798 L1018,792 L988,793 L966,804 L958,811 L947,830Z'};
const svgNS='http://www.w3.org/2000/svg';
function svgElem(type,attrs){const n=document.createElementNS(svgNS,type);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);return n;}
function renderHomeMask(){const layer=$('home-hit-layer');layer.innerHTML='';
  for(const [key,label] of Object.entries(homeActions)){
    const path=svgElem('path',{d:homeMaskPaths[key],class:'click-region',tabindex:'0',role:'button','aria-label':label});
    const activate=()=>{
      path.classList.add('baked');setTimeout(()=>path.classList.remove('baked'),250);
      switch(key){
        case 'start':setTimeout(()=>show('dough'),160);break;
        case 'image':modal('Image to Cookie','Image conversion will be added in a later version.');break;
        case 'wish':modal('Make a Wish','AI-powered suggestions are not connected yet.');break;
        case 'collection':modal('My Collection',load()?'A local draft is available. Choose Start Creating to continue.':'Your collection is empty for now.');break;
      }
    };
    path.addEventListener('click',activate);
    path.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}});
    layer.append(path);
  }
}
renderHomeMask();
$('home-btn').addEventListener('click',()=>show('home'));
document.querySelectorAll('.step[data-go]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.go==='decorate'&&!state.shape){toast('Choose a shape first.');return;}show(b.dataset.go)}));
$('change-flavor').addEventListener('click',()=>show('dough'));
$('prev-btn').addEventListener('click',()=>show(state.page==='decorate'?'shape':state.page==='shape'?'dough':'home'));
$('next-btn').addEventListener('click',()=>{if(state.page==='dough'){show('shape');return;}if(state.page==='decorate'){modal('Package is next','Your traditional stamp is saved. Packaging, icing pen and mail features are planned for the next version.');save();return;}if(!state.shape){toast('Choose a shape first.');return}if(state.shape==='custom'&&!state.customPath){toast('Draw a shape and press Use My Shape first.');return}show('decorate');save()});
$('save-btn').addEventListener('click',()=>{save();toast('Draft saved in this browser.');});
$('close-dialog').addEventListener('click',()=>$('dialog').classList.add('hidden'));
$('dialog-ok').addEventListener('click',()=>$('dialog').classList.add('hidden'));
$('dialog').addEventListener('click',e=>{if(e.target===$('dialog'))$('dialog').classList.add('hidden')});
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('dialog').classList.add('hidden')});
// Freehand editor: pointer sample -> normalize points to the same 320x320 SVG coordinate system.
const canvas=$('draw-canvas'),ctx=canvas.getContext('2d');let points=[],drawing=false;
function xy(event){const r=canvas.getBoundingClientRect();return{x:(event.clientX-r.left)*canvas.width/r.width,y:(event.clientY-r.top)*canvas.height/r.height}}
function redraw(){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.lineWidth=4;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#c77d86';ctx.setLineDash([9,6]);if(points.length<2)return;ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);if(!drawing)ctx.closePath();ctx.stroke();ctx.setLineDash([])}
canvas.addEventListener('pointerdown',e=>{e.preventDefault();drawing=true;points=[xy(e)];canvas.setPointerCapture(e.pointerId);redraw()});
canvas.addEventListener('pointermove',e=>{if(!drawing)return;const p=xy(e),last=points[points.length-1];if(Math.hypot(p.x-last.x,p.y-last.y)>3){points.push(p);redraw()}});
function finish(){if(drawing){drawing=false;redraw();$('drawing-status').textContent=`${points.length} outline points · Press Use My Shape to apply.`}}
canvas.addEventListener('pointerup',finish);canvas.addEventListener('pointercancel',finish);
$('clear-drawing').addEventListener('click',()=>{points=[];state.customPath=null;redraw();$('drawing-status').textContent='Start drawing anywhere on the canvas.'});
function simplified(raw,max=90){if(raw.length<=max)return raw;const step=(raw.length-1)/(max-1);return Array.from({length:max},(_,i)=>raw[Math.round(i*step)])}
$('use-drawing').addEventListener('click',()=>{if(points.length<7){toast('Draw a longer closed outline first.');return;}const pts=simplified(points);const xx=pts.map(p=>p.x),yy=pts.map(p=>p.y);const minX=Math.min(...xx),maxX=Math.max(...xx),minY=Math.min(...yy),maxY=Math.max(...yy);const scale=232/Math.max(maxX-minX,maxY-minY,1);const dx=160-(minX+maxX)*scale/2,dy=160-(minY+maxY)*scale/2;state.customPath=`M ${pts.map(p=>`${(p.x*scale+dx).toFixed(1)} ${(p.y*scale+dy).toFixed(1)}`).join(' L ')} Z`;state.shape='custom';save();render();toast('Custom outline applied.');});
// Export currently selected dough shape as a clean transparent PNG, without background graphics.
$('export-btn').addEventListener('click',()=>{const f=flavor();const p=state.page==='shape'&&state.shape?pathForShape():$('dough-figure').querySelector('path').getAttribute('d');const stampMarkup=state.page==='decorate'?`<defs><clipPath id="exportStampClip"><path d="${p}"/></clipPath></defs><g clip-path="url(#exportStampClip)" transform="translate(-25 -25) scale(1.0309)">${imprintGraphic()}</g>`:'';const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 320 320"><path d="${p}" fill="${f.color}" stroke="#ba8f68" stroke-width="4" stroke-linejoin="round" />${stampMarkup}</svg>`;const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'})),im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=c.height=640;c.getContext('2d').drawImage(im,0,0);URL.revokeObjectURL(url);const a=document.createElement('a');a.download=`cookie-post-${f.id}-${state.shape||'dough'}.png`;a.href=c.toDataURL('image/png');a.click();};im.onerror=()=>{URL.revokeObjectURL(url);toast('Export failed. Please retry.')};im.src=url;});

// v0.9 — editable traditional pastry stamping. The imprint uses the existing cookie shape and selected dough color.
const stampCatalog=[
 {id:'fu',name:'Fortune · 福',meaning:'福 represents good fortune and blessings; often used for New Year wishes.',symbol:'福'},
 {id:'rabbit',name:'Jade Rabbit',meaning:'The jade rabbit is associated with the moon and Mid-Autumn Festival.',symbol:'兔'},
 {id:'peach',name:'Longevity Peach',meaning:'Peaches are associated with wishes for long life.',symbol:'桃'},
 {id:'fish',name:'Lucky Fish',meaning:'Fish evokes abundance through the phrase 年年有余.',symbol:'鱼'},
 {id:'lotus',name:'Lotus Bloom',meaning:'The lotus is a recurring floral motif in Chinese arts.',symbol:'莲'},
 {id:'floral',name:'Floral Round',meaning:'Floral patterns are widely used in decorative pastry molds.',symbol:'花'},
 {id:'gourd',name:'Gourd Blessing',meaning:'The gourd can evoke 福禄 through sound associations.',symbol:'葫'},
 {id:'double',name:'Double Happiness',meaning:'囍 is commonly associated with celebrations and weddings.',symbol:'囍'}
];
const stampState={selected:'fu',depth:50,rotation:0,x:180,y:180,applied:false};
if(state.stamped && stampCatalog.some(s=>s.id===state.stamped.id))Object.assign(stampState,state.stamped);
const sx=escapeHtml=>String(escapeHtml).replace(/[&<>"']/g,a=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[a]));
function renderStampGrid(){
 $('stamp-grid').innerHTML=stampCatalog.map((s,i)=>`<button class="stamp-choice ${stampState.selected===s.id?'selected':''}" data-stamp="${s.id}" style="--stamp-card:${['#e9f4df','#eef1f6','#ffe7df','#e4f3f1','#f9e9f1','#fff1db','#e8ecda','#f0e7f5'][i]}"><img class="stamp-preview-art" src="assets/stamps/${s.id}.png" alt="" loading="lazy"><span>${s.name}</span></button>`).join('');
 document.querySelectorAll('[data-stamp]').forEach(b=>b.addEventListener('click',()=>{stampState.selected=b.dataset.stamp;stampState.applied=false;renderStamp();}));
}
function imprintGraphic(){
 const image=window.CookieStampShadows?.[stampState.selected];
 const depth=stampState.depth/100;
 // Stamp artworks are shaded, transparent impression layers rather than flat-color stickers.
 // Their alpha preserves the underlying dough flavor; position/rotation/depth remain editable.
 if(image){
   const opacity=(.30 + .62*depth).toFixed(3);
   return `<g transform="translate(${stampState.x} ${stampState.y}) rotate(${stampState.rotation})" pointer-events="none"><image href="${image}" x="-83" y="-83" width="166" height="166" opacity="${opacity}"/></g>`;
 }
 const sym=stampCatalog.find(s=>s.id===stampState.selected)?.symbol||'福';
 return `<text x="${stampState.x}" y="${stampState.y}" font-size="90" text-anchor="middle" fill="#735443">${sx(sym)}</text>`;
}
function renderStamp(){
 if(state.page!=='decorate')return;
 renderStampGrid();
 const f=flavor(),p=state.shape?pathForShape():shapeData[0].path;
 $('stamp-cookie-label').textContent=f.name+' · '+(state.shape?shape().name:'Circle');
 const d=`<path d="${p}" fill="${f.color}" stroke="#bf966e" stroke-width="5" stroke-linejoin="round"/>`;
 $('stamp-cookie-base').innerHTML=`<g transform="translate(25 25) scale(.97)">${d}<path d="${p}" fill="url(#stampCookieGrain)" opacity=".3"/></g>`;
 const defs=document.querySelector('#stamp-canvas defs');
 if(!document.getElementById('stampClip'))defs.insertAdjacentHTML('beforeend',`<clipPath id="stampClip"><g transform="translate(25 25) scale(.97)"><path id="stamp-clip-path" d="${p}"/></g></clipPath><pattern id="stampCookieGrain" width="13" height="15" patternUnits="userSpaceOnUse"><circle cx="2" cy="7" r=".8" fill="#6e5a45" opacity=".22"/><circle cx="9" cy="3" r=".65" fill="#fff" opacity=".34"/></pattern>`);
 else {const oldClipNode=document.getElementById('stamp-clip-path');if(oldClipNode)oldClipNode.setAttribute('d',p);}
 $('stamp-imprint').innerHTML=`<g clip-path="url(#stampClip)">${imprintGraphic()}</g>`;
 const s=stampCatalog.find(s=>s.id===stampState.selected);
 $('stamp-info').textContent=s.name+' — '+s.meaning;
 $('stamp-depth').value=stampState.depth;$('stamp-rotation').value=stampState.rotation;
 $('stamp-depth-value').textContent=stampState.depth+'%';$('stamp-rotation-value').textContent=stampState.rotation+'°';
 $('stamp-notice').textContent=stampState.applied?'Stamp applied and saved to your local draft.':'Previewing motif. Press Apply Stamp to keep it.';
}
$('stamp-depth').addEventListener('input',e=>{stampState.depth=Number(e.target.value);stampState.applied=false;renderStamp();});
$('stamp-rotation').addEventListener('input',e=>{stampState.rotation=Number(e.target.value);stampState.applied=false;renderStamp();});
$('stamp-center').addEventListener('click',()=>{stampState.x=180;stampState.y=180;stampState.rotation=0;stampState.applied=false;renderStamp()});
$('stamp-apply').addEventListener('click',()=>{stampState.applied=true;state.stamped={...stampState,id:stampState.selected};save();renderStamp();toast('Traditional stamp applied!');});
$('stamp-clear').addEventListener('click',()=>{state.stamped=null;stampState.applied=false;stampState.selected='fu';stampState.depth=50;stampState.rotation=0;stampState.x=180;stampState.y=180;save();renderStamp();toast('Stamp cleared.');});
$('stamp-undo').addEventListener('click',()=>{if(state.stamped){Object.assign(stampState,state.stamped);stampState.applied=true;renderStamp();toast('Restored last saved stamp.');}else toast('No applied stamp to restore.');});
$('stamp-canvas').addEventListener('click',e=>{const svg=$('stamp-canvas'),r=svg.getBoundingClientRect();const vb=svg.viewBox.baseVal;stampState.x=Math.max(70,Math.min(290,(e.clientX-r.left)*vb.width/r.width));stampState.y=Math.max(72,Math.min(288,(e.clientY-r.top)*vb.height/r.height));stampState.applied=false;renderStamp();});

show('home');

/* v1.0 — Traditional Sets + Image to Pattern */
(function(){
  const extraKey='cookie-post-extras-v1';
  let extras={};
  try{extras=JSON.parse(localStorage.getItem(extraKey))||{}}catch{extras={}};
  state.decorateTool=extras.decorateTool||'stamps';
  state.pendingSet=extras.pendingSet||null;
  state.pattern=extras.pattern||null;

  const newShapes=[
    {id:'scallop',name:'Mooncake Round',path:'M160 55 C174 55 185 68 198 71 C211 75 226 70 238 78 C250 86 253 102 262 113 C271 124 286 132 288 146 C290 160 278 173 277 187 C276 201 286 216 281 229 C276 242 260 250 251 261 C242 272 239 289 226 296 C213 303 198 297 184 301 C170 305 158 318 145 315 C132 312 123 296 110 291 C97 286 79 289 69 280 C59 271 59 254 52 242 C45 230 31 220 30 206 C29 192 40 178 42 164 C44 150 37 134 44 122 C51 110 68 104 78 94 C88 84 93 67 106 61 C119 55 134 63 148 60 C152 59 156 55 160 55 Z',bg:'#f2f6d6',stroke:'#b3bf7d'},
    {id:'peachshape',name:'Longevity Peach',path:'M161 55 C141 73 122 73 105 85 C84 100 72 123 71 148 C70 190 96 231 136 252 C148 258 151 266 160 278 C169 266 172 258 184 252 C226 230 252 191 249 145 C247 121 233 101 212 86 C196 75 179 72 161 55 Z',bg:'#ffe3e6',stroke:'#dd9cab'},
    {id:'fishshape',name:'Lucky Fish',path:'M69 160 C102 129 133 112 174 111 C194 111 216 117 230 126 C250 116 269 121 281 136 C266 142 260 151 259 160 C260 169 266 179 281 185 C268 199 249 203 230 194 C215 204 195 210 174 209 C132 208 101 191 69 160 Z M89 160 C103 150 113 145 128 143 M128 178 C113 176 104 171 89 160',bg:'#dceef6',stroke:'#8cb7c7'},
    {id:'lotusshape',name:'Lotus Blossom',path:'M160 46 C178 76 188 87 198 97 C213 73 239 74 245 96 C250 116 239 137 220 147 C247 151 260 174 250 193 C240 212 216 216 195 205 C200 231 182 254 160 248 C138 254 120 231 125 205 C104 216 80 212 70 193 C60 174 73 151 100 147 C81 137 70 116 75 96 C81 74 107 73 122 97 C132 87 142 76 160 46 Z',bg:'#f8dfef',stroke:'#c59fc3'},
    {id:'gourdshape',name:'Fortune Gourd',path:'M160 53 C183 53 198 68 198 89 C198 101 193 111 185 118 C219 126 242 152 242 189 C242 229 208 259 160 259 C112 259 78 229 78 189 C78 152 101 126 135 118 C127 111 122 101 122 89 C122 68 137 53 160 53 Z',bg:'#eef4d5',stroke:'#a8b86c'}
  ];
  newShapes.forEach(s=>{ if(!shapeData.some(x=>x.id===s.id)) shapeData.splice(shapeData.length-1,0,s); });

  const traditionalSets=[
    {id:'reunion',name:'Reunion Moon',shape:'scallop',stamp:'rabbit',desc:'Scalloped mooncake shape + jade rabbit motif',bg:'#eef3dc',stroke:'#a4ba7c'},
    {id:'longevity',name:'Longevity Blessing',shape:'peachshape',stamp:'peach',desc:'Peach outer mold + longevity peach motif',bg:'#ffe5e7',stroke:'#d9a2ad'},
    {id:'surplus',name:'Yearly Surplus',shape:'fishshape',stamp:'fish',desc:'Fish outer mold + abundance motif',bg:'#dceff4',stroke:'#89b2c1'},
    {id:'lotus',name:'Lotus Bloom',shape:'lotusshape',stamp:'lotus',desc:'Lotus blossom cookie + lotus imprint',bg:'#f7e3ef',stroke:'#c59cc5'},
    {id:'fortune',name:'Gourd Fortune',shape:'gourdshape',stamp:'gourd',desc:'Gourd shape + blessing motif',bg:'#eef2d9',stroke:'#a8b772'}
  ];

  const patternState=Object.assign({
    sourceData:null, processedData:null, mode:'emboss', threshold:140, invert:false, focus:70, simplify:78,
    scale:100, rotation:0, x:180, y:180, applied:false
  }, state.pattern||{});

  function persistExtras(){
    localStorage.setItem(extraKey, JSON.stringify({
      decorateTool: state.decorateTool,
      pendingSet: state.pendingSet,
      pattern: patternState.processedData?{...patternState}:null
    }));
  }

  function renderSets(){
    const box=$('sets'); if(!box) return;
    box.innerHTML=traditionalSets.map(set=>`<button class="set-card ${state.pendingSet===set.id?'selected':''}" data-set="${set.id}" style="--card-bg:${set.bg};--card-stroke:${set.stroke}"><strong>${set.name}</strong><span>${set.desc}</span></button>`).join('');
    box.querySelectorAll('[data-set]').forEach(btn=>btn.addEventListener('click',()=>{
      const set=traditionalSets.find(s=>s.id===btn.dataset.set); if(!set) return;
      state.pendingSet=set.id; state.shape=set.shape; stampState.selected=set.stamp; stampState.applied=false; save(); persistExtras(); render(); toast(set.name+' applied. You can still change shape or motif.');
    }));
  }

  renderShapes=function(){
    const f=flavor();
    renderSets();
    $('shapes').innerHTML=shapeData.map(s=>`<button class="option-card shape-card ${state.shape===s.id?'selected':''}" data-shape="${s.id}" style="--card-bg:${s.bg};--card-stroke:${s.stroke};--dough:${f.color}"><svg class="shape-icon" viewBox="0 0 320 320" aria-hidden="true"><path d="${s.id==='custom'&&state.customPath?state.customPath:s.path}" /></svg><span class="option-name">${s.name}</span></button>`).join('');
    document.querySelectorAll('[data-shape]').forEach(b=>b.addEventListener('click',()=>{state.shape=b.dataset.shape;$('drawing-area').classList.toggle('hidden',state.shape!=='custom');save();render()}));
    $('drawing-area').classList.toggle('hidden',state.shape!=='custom');
  }

  function setDecorateTool(tool){
    state.decorateTool=tool;
    document.querySelectorAll('.decorate-tab').forEach(btn=>btn.classList.toggle('active', btn.dataset.tool===tool));
    $('stamps-panel').classList.toggle('hidden', tool!=='stamps');
    $('pattern-panel').classList.toggle('hidden', tool!=='pattern');
    persistExtras();
    if(state.page==='decorate'){ if(tool==='stamps') renderStamp(); else renderPattern(); }
  }
  document.querySelectorAll('.decorate-tab').forEach(btn=>btn.addEventListener('click',()=>setDecorateTool(btn.dataset.tool)));

  show=function(page){
    state.page=page;
    $('home').classList.toggle('hidden',page!=='home');$('studio').classList.toggle('hidden',page==='home');
    if(page==='home')return;
    const decorate=page==='decorate';
    $('page-title').textContent=page==='dough'?'Choose Your Dough':page==='shape'?'Choose Your Shape':'Decorate Your Cookie';
    $('page-desc').textContent=page==='dough'?'Pick a flavor for your cookie dough!':page==='shape'?'Pick a mold, or use a traditional set!':'Add a traditional stamp or turn an uploaded image into a cookie pattern.';
    $('dough-panel').classList.toggle('hidden',page!=='dough');$('shape-panel').classList.toggle('hidden',page!=='shape');
    document.querySelector('.preview-area').classList.toggle('hidden',decorate);
    document.querySelector('.options-area').classList.toggle('hidden',decorate);
    $('stamp-workspace').classList.toggle('hidden',!decorate);
    document.querySelector('.content-panel').classList.toggle('stamp-layout',decorate);
    document.querySelectorAll('.step').forEach(el=>el.classList.toggle('active',el.dataset.go===page));
    $('prev-btn').textContent=page==='dough'?'‹ Home':'‹ Back';
    $('next-btn').textContent=page==='dough'?'Next: Shape ›':page==='shape'?'Next: Decorate ›':'Next: Package ›';
    render();
    if(decorate) setDecorateTool(state.decorateTool||'stamps');
    window.scrollTo({top:0,behavior:'instant'});
  }

  render=function(){renderPreview();renderFlavors();renderShapes(); if(state.page==='decorate'){ if(state.decorateTool==='pattern') renderPattern(); else renderStamp(); }}

  function buildPatternPreview(){
    const cvs=$('pattern-canvas'); if(!cvs) return;
    const ctx=cvs.getContext('2d'); ctx.clearRect(0,0,cvs.width,cvs.height); ctx.fillStyle='#fffaf0'; ctx.fillRect(0,0,cvs.width,cvs.height);
    if(!patternState.processedData){ ctx.fillStyle='#c9b8a2'; ctx.font='14px sans-serif'; ctx.textAlign='center'; ctx.fillText('No pattern yet',cvs.width/2,cvs.height/2); return; }
    const img=new Image(); img.onload=()=>{ ctx.clearRect(0,0,cvs.width,cvs.height); ctx.fillStyle='#fffaf0'; ctx.fillRect(0,0,cvs.width,cvs.height); const s=Math.min(cvs.width/img.width,cvs.height/img.height)*0.85; const w=img.width*s,h=img.height*s; ctx.drawImage(img,(cvs.width-w)/2,(cvs.height-h)/2,w,h);}; img.src=patternState.processedData;
  }

  // Extract an editable stamp impression rather than printing all the image edges.
  // Only shapes with sufficient size survive; high-frequency detail and straight
  // photo/card borders are deliberately discarded. The focus window is user adjustable.
  function processUploadedImage(img){
    const size=180, outputSize=220;
    const focus=Math.max(30,Math.min(100,Number(patternState.focus)||70))/100;
    const simplify=Math.max(0,Math.min(100,Number(patternState.simplify)||78));
    const off=document.createElement('canvas'); off.width=off.height=size;
    const cx=off.getContext('2d',{willReadFrequently:true});
    cx.fillStyle='#fff';cx.fillRect(0,0,size,size);
    // The central crop removes peripheral lettering, frames and other unrelated objects.
    const cropSize=Math.min(img.width,img.height)*focus;
    const sourceX=(img.width-cropSize)/2,sourceY=(img.height-cropSize)/2;
    const blurAmount=0.9+simplify/50;
    cx.filter=`blur(${blurAmount.toFixed(1)}px)`;
    cx.drawImage(img,sourceX,sourceY,cropSize,cropSize,9,9,size-18,size-18);
    cx.filter='none';
    const data=cx.getImageData(0,0,size,size).data;
    const grey=new Float32Array(size*size);
    for(let i=0;i<grey.length;i++){
      const j=i*4,alpha=data[j+3]/255;
      grey[i]=255*(1-alpha)+alpha*(data[j]*0.299+data[j+1]*0.587+data[j+2]*0.114);
    }
    const mask=new Uint8Array(size*size);
    const minMag=55+simplify*2.15+(Number(patternState.threshold)-140)*0.35;
    const at=(x,y)=>grey[y*size+x];
    for(let y=2;y<size-2;y++) for(let x=2;x<size-2;x++){
      const gx=-at(x-1,y-1)-2*at(x-1,y)-at(x-1,y+1)+at(x+1,y-1)+2*at(x+1,y)+at(x+1,y+1);
      const gy=-at(x-1,y-1)-2*at(x,y-1)-at(x+1,y-1)+at(x-1,y+1)+2*at(x,y+1)+at(x+1,y+1);
      const mag=Math.hypot(gx,gy);
      mask[y*size+x]=patternState.invert ? (mag<minMag && grey[y*size+x]<120 ? 1:0) : (mag>minMag ? 1:0);
    }
    // Remove long straight edges, typical of phone, photo, document or frame borders.
    // Leave short strokes (e.g. lettering and flower stems) alone.
    const straightLength=Math.round(22+simplify*.19);
    const erase=new Uint8Array(mask.length);
    for(let y=2;y<size-2;y++){
      let x=2;
      while(x<size-2){
        if(!mask[y*size+x]){x++;continue;}
        let b=x;while(x<size-2&&mask[y*size+x])x++;
        if(x-b>=straightLength)for(let k=b;k<x;k++) for(let d=-2;d<=2;d++)erase[(y+d)*size+k]=1;
      }
    }
    for(let x=2;x<size-2;x++){
      let y=2;
      while(y<size-2){
        if(!mask[y*size+x]){y++;continue;}
        let b=y;while(y<size-2&&mask[y*size+x])y++;
        if(y-b>=straightLength)for(let k=b;k<y;k++)for(let d=-2;d<=2;d++)erase[k*size+x+d]=1;
      }
    }
    for(let i=0;i<mask.length;i++) if(erase[i])mask[i]=0;
    // Connected-component filtering suppresses isolated text, QR noise and tiny detail.
    const seen=new Uint8Array(mask.length), components=[];
    const minArea=Math.max(10,Math.round(8+simplify*.48));
    for(let i=0;i<mask.length;i++){
      if(!mask[i]||seen[i])continue;
      const queue=[i], pixels=[];seen[i]=1;
      let minX=size,maxX=0,minY=size,maxY=0;
      for(let qi=0;qi<queue.length;qi++){
        const p=queue[qi],x=p%size,y=(p/size)|0;pixels.push(p);
        minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
          if(!dx&&!dy)continue;
          const xx=x+dx,yy=y+dy;
          if(xx<2||xx>=size-2||yy<2||yy>=size-2)continue;
          const q=yy*size+xx;if(mask[q]&&!seen[q]){seen[q]=1;queue.push(q);}
        }
      }
      const width=maxX-minX+1,height=maxY-minY+1;
      if(pixels.length>=minArea && (width>=13||height>=13))components.push({pixels,minX,maxX,minY,maxY});
    }
    components.sort((a,b)=>b.pixels.length-a.pixels.length);
    // Keep meaningful large shapes; do not let numerous tiny details overpower them.
    const retained=components.slice(0,Math.max(2,Math.round(9-simplify/20)));
    const clean=new Uint8Array(size*size);
    for(const c of retained)for(const p of c.pixels)clean[p]=1;
    const total=retained.reduce((n,c)=>n+c.pixels.length,0);
    if(total<20){
      patternState.processedData=null;
      $('pattern-info').textContent='No clear motif found. Try a closer crop, less simplification, or a high-contrast drawing rather than a photograph.';
      buildPatternPreview();persistExtras();return;
    }
    const result=document.createElement('canvas');result.width=result.height=outputSize;
    const rc=result.getContext('2d');
    const tiny=document.createElement('canvas');tiny.width=tiny.height=size;
    const tc=tiny.getContext('2d');const image=tc.createImageData(size,size);
    for(let i=0;i<clean.length;i++){
      image.data[i*4]=82;image.data[i*4+1]=58;image.data[i*4+2]=45;
      image.data[i*4+3]=clean[i]?255:0;
    }
    tc.putImageData(image,0,0);
    rc.imageSmoothingEnabled=true;rc.imageSmoothingQuality='high';
    rc.drawImage(tiny,0,0,outputSize,outputSize);
    patternState.processedData=result.toDataURL('image/png');
    patternState.applied=false;
    buildPatternPreview();renderPattern();persistExtras();
  }

  function patternGraphic(){
    if(!patternState.processedData)return '';
    const scale=patternState.scale/100,w=180*scale,h=180*scale;
    const x=patternState.x-w/2,y=patternState.y-h/2;
    const rotate=`rotate(${patternState.rotation} ${patternState.x} ${patternState.y})`;
    const src=patternState.processedData;
    if(patternState.mode==='icing'){
      return `<g transform="${rotate}"><image href="${src}" x="${x}" y="${y}" width="${w}" height="${h}" opacity=".85"/></g>`;
    }
    // A recessed, low-contrast imprint (not a solid black sticker).
    return `<g transform="${rotate}" pointer-events="none">
      <image href="${src}" x="${x-1.2}" y="${y-1.2}" width="${w}" height="${h}" opacity=".16" style="filter:brightness(2.3) sepia(.6)"/>
      <image href="${src}" x="${x+1.1}" y="${y+1.5}" width="${w}" height="${h}" opacity=".36"/>
    </g>`;
  }

  function renderPatternOverlay(){ $('pattern-imprint').innerHTML = patternState.processedData ? `<g clip-path="url(#stampClip)">${patternGraphic()}</g>` : ''; }

  const originalRenderStamp=renderStamp;
  renderStamp=function(){ originalRenderStamp(); renderPatternOverlay(); }

  function renderPattern(){
    if(state.page!=='decorate') return;
    renderStamp();
    $('pattern-threshold').value=patternState.threshold; $('pattern-threshold-value').textContent=patternState.threshold;
    $('pattern-focus').value=patternState.focus; $('pattern-focus-value').textContent=patternState.focus+'%';
    $('pattern-simplify').value=patternState.simplify; $('pattern-simplify-value').textContent=patternState.simplify+'%';
    $('pattern-scale').value=patternState.scale; $('pattern-scale-value').textContent=patternState.scale+'%';
    $('pattern-rotation').value=patternState.rotation; $('pattern-rotation-value').textContent=patternState.rotation+'°';
    $('pattern-mode').value=patternState.mode; $('pattern-invert').checked=patternState.invert;
    $('pattern-info').textContent = patternState.processedData ? (patternState.mode==='emboss' ? 'Simplified stamp impression. Click on the cookie to reposition, or adjust Focus and Simplify to remove unwanted details.' : 'Previewing an icing-outline pattern extracted from your uploaded lines. Click on the cookie preview to reposition it.') : 'Upload a high-contrast symbol. Focus crops the center, Simplify removes fine detail and long borders. Complex photos may need manual cropping.';
    buildPatternPreview();
  }

  $('pattern-upload').addEventListener('change', e=>{ const file=e.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=()=>{ const img=new Image(); img.onload=()=>{ patternState.sourceData=reader.result; processUploadedImage(img);}; img.src=reader.result;}; reader.readAsDataURL(file); });
  $('pattern-threshold').addEventListener('input', e=>{ patternState.threshold=Number(e.target.value); $('pattern-threshold-value').textContent=patternState.threshold; if(patternState.sourceData){ const img=new Image(); img.onload=()=>processUploadedImage(img); img.src=patternState.sourceData; }});
  for(const key of ['focus','simplify']){
    const el=$('pattern-'+key);
    el.addEventListener('input',e=>{patternState[key]=Number(e.target.value);$('pattern-'+key+'-value').textContent=e.target.value+'%';
      if(patternState.sourceData){const img=new Image();img.onload=()=>processUploadedImage(img);img.src=patternState.sourceData;}
    });
  }
  $('pattern-invert').addEventListener('change', e=>{ patternState.invert=e.target.checked; if(patternState.sourceData){ const img=new Image(); img.onload=()=>processUploadedImage(img); img.src=patternState.sourceData; }});
  $('pattern-scale').addEventListener('input', e=>{ patternState.scale=Number(e.target.value); $('pattern-scale-value').textContent=patternState.scale+'%'; renderPattern(); persistExtras(); });
  $('pattern-rotation').addEventListener('input', e=>{ patternState.rotation=Number(e.target.value); $('pattern-rotation-value').textContent=patternState.rotation+'°'; renderPattern(); persistExtras(); });
  $('pattern-mode').addEventListener('change', e=>{ patternState.mode=e.target.value; renderPattern(); persistExtras(); });
  $('pattern-center').addEventListener('click',()=>{ patternState.x=180; patternState.y=180; patternState.rotation=0; patternState.applied=false; renderPattern(); persistExtras(); });
  $('pattern-clear').addEventListener('click',()=>{ patternState.sourceData=null; patternState.processedData=null; patternState.applied=false; renderPattern(); persistExtras(); toast('Pattern cleared.'); });
  $('pattern-apply').addEventListener('click',()=>{ if(!patternState.processedData){ toast('Upload an image first.'); return; } patternState.applied=true; state.pattern={...patternState}; persistExtras(); renderPattern(); toast('Pattern applied!'); });

  const stampCanvas=$('stamp-canvas');
  stampCanvas.addEventListener('click', e=>{
    if(state.page!=='decorate') return;
    const svg=stampCanvas, r=svg.getBoundingClientRect(), vb=svg.viewBox.baseVal;
    const x=Math.max(70,Math.min(290,(e.clientX-r.left)*vb.width/r.width)); const y=Math.max(72,Math.min(288,(e.clientY-r.top)*vb.height/r.height));
    if(state.decorateTool==='pattern') { patternState.x=x; patternState.y=y; patternState.applied=false; renderPattern(); persistExtras(); }
  }, true);

  // Improve export to include pattern overlay.
  const exportClone=$('export-btn').cloneNode(true); $('export-btn').replaceWith(exportClone);
  exportClone.id='export-btn';
  exportClone.addEventListener('click',()=>{
    const f=flavor();
    const p=state.shape?pathForShape():$('dough-figure').querySelector('path').getAttribute('d');
    const stampMarkup=(state.stamped||stampState.applied||state.page==='decorate')?`<defs><clipPath id="exportStampClip"><path d="${p}"/></clipPath></defs><g clip-path="url(#exportStampClip)" transform="translate(-25 -25) scale(1.0309)">${imprintGraphic()}${patternGraphic()}</g>`:'';
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 320 320"><path d="${p}" fill="${f.color}" stroke="#ba8f68" stroke-width="4" stroke-linejoin="round" />${stampMarkup}</svg>`;
    const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'})),im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=c.height=640;c.getContext('2d').drawImage(im,0,0);URL.revokeObjectURL(url);const a=document.createElement('a');a.download=`cookie-post-${f.id}-${state.shape||'dough'}.png`;a.href=c.toDataURL('image/png');a.click();};im.onerror=()=>{URL.revokeObjectURL(url);toast('Export failed. Please retry.')};im.src=url;
  });

  // Initial render with new tools
  if(state.page==='decorate') setDecorateTool(state.decorateTool||'stamps');
  render();
})();
