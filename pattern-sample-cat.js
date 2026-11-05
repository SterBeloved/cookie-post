/* Cookie Post: use the cat line-art sample through the existing Image to Pattern pipeline. */
(() => {
  'use strict';
  const button = document.getElementById('pattern-sample-cat');
  const input = document.getElementById('pattern-upload');
  if (!button || !input) return;
  button.addEventListener('click', async () => {
    if (button.disabled) return;
    button.disabled = true;
    try {
      const response = await fetch('assets/sample-cat-stamp.svg');
      if (!response.ok) throw new Error('Could not load cat sample (HTTP ' + response.status + ').');
      const xml = await response.text();
      const url = URL.createObjectURL(new Blob([xml], {type:'image/svg+xml'}));
      let image;
      try {
        image = new Image();
        image.src = url;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = 527; canvas.height = 580;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(image,0,0,canvas.width,canvas.height);
        const png = await new Promise((resolve,reject) => canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG conversion failed.')),'image/png'));
        const transfer = new DataTransfer();
        transfer.items.add(new File([png], 'sample-cat-stamp.png', {type:'image/png'}));
        input.files = transfer.files;
        input.dispatchEvent(new Event('change', {bubbles:true}));
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('[Cookie Post] Sample pattern:',error);
      const info=document.getElementById('pattern-info');
      if(info)info.textContent='Could not load the cat sample. Try uploading your own PNG image.';
    } finally {
      button.disabled = false;
    }
  });
})();