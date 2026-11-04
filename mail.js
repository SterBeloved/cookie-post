/* Cookie Post email integration — no secrets in the browser. */
(() => {
  'use strict';
  const CONFIG = {
    worker: 'https://cookiepost-mail-api.shianqi1116.workers.dev',
    serviceId: 'service_cookiepost',
    templateId: 'template_uyd7pem',
    publicKey: '7ZNDTwTffBh5zTtj4',
    // Replace after deployment and Turnstile setup. Never put the secret key here.
    turnstileSiteKey: '0x4AAAAAAFzsXhIQvBnrzAAs'
  };
  const button = document.getElementById('email-message');
  if (!button) return;
  const modal = document.createElement('div');
  modal.className = 'cookie-mail-overlay';
  modal.hidden = true;
  modal.innerHTML = `<section class="cookie-mail-panel" role="dialog" aria-modal="true" aria-labelledby="cookie-mail-heading">
    <button type="button" class="cookie-mail-close" aria-label="Close">×</button>
    <div class="cookie-mail-eyebrow">Psst... Special delivery!</div>
    <h2 id="cookie-mail-heading">Send a Little Sweetness</h2>
    <p>A handmade cookie, wrapped up in a little letter.</p>
    <form id="cookie-mail-form">
      <label>To (email address)<input name="to_email" type="email" autocomplete="email" required maxlength="254" placeholder="friend@example.com"></label>
      <label>From<input name="from_name" maxlength="80" placeholder="Your name (optional)"></label>
      <label>A little note<textarea name="message" rows="3" maxlength="600" placeholder="A sweet wish for you..."></textarea></label>
      <div id="cookie-mail-turnstile"></div>
      <p class="cookie-mail-status" role="status" aria-live="polite"></p>
      <button class="primary-button cookie-mail-submit" type="submit">Send Cookie Post</button>
    </form>
    <small>Card images are stored temporarily and deleted from R2 after approximately 30 days. Your recipient can view the card via its link.</small>
  </section>`;
  document.body.append(modal);
  const form = modal.querySelector('form');
  const status = modal.querySelector('.cookie-mail-status');
  const submit = modal.querySelector('.cookie-mail-submit');
  const close = () => { if (!submit.disabled) modal.hidden = true; };
  modal.querySelector('.cookie-mail-close').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) close(); });
  let widgetId = null;
  function loadTurnstile() {
    if (!CONFIG.turnstileSiteKey) return;
    if (window.turnstile) {
      if (widgetId === null) widgetId = window.turnstile.render('#cookie-mail-turnstile', { sitekey: CONFIG.turnstileSiteKey });
      return;
    }
    if (document.querySelector('script[data-cookie-turnstile]')) return;
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true; script.defer = true;
    script.dataset.cookieTurnstile = '1';
    script.onload = loadTurnstile;
    document.head.append(script);
  }
  button.addEventListener('click', () => {
    form.elements.from_name.value = document.getElementById('sender-name')?.value || '';
    form.elements.message.value = document.getElementById('gift-message')?.value || '';
    status.textContent = '';
    modal.hidden = false;
    loadTurnstile();
    form.elements.to_email.focus();
  });
  const toBlob = canvas => new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not export card image.')), 'image/png'));
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (submit.disabled) return;
    if (!CONFIG.turnstileSiteKey) {
      status.textContent = 'Almost ready! Please configure the Turnstile Site Key after deploying your website. No email has been sent.';
      return;
    }
    const token = window.turnstile && widgetId !== null ? window.turnstile.getResponse(widgetId) : '';
    if (!token) { status.textContent = 'Please complete the security check first.'; return; }
    if (!window.emailjs || typeof window.CookiePostCreateCardCanvas !== 'function') {
      status.textContent = 'Mail service or card generator is unavailable. Please reload.'; return;
    }
    submit.disabled = true;
    try {
      status.textContent = 'Wrapping your cookie card...';
      const blob = await toBlob(await window.CookiePostCreateCardCanvas());
      if (blob.size > 5 * 1024 * 1024) throw new Error('Card exceeds 5MB. Please reduce its size.');
      status.textContent = 'Uploading your card...';
      const uploaded = await fetch(CONFIG.worker + '/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'image/png', 'X-Turnstile-Token': token },
        body: blob
      });
      const result = await uploaded.json().catch(() => ({}));
      if (!uploaded.ok || !result.imageUrl) throw new Error(result.error || `Upload failed (HTTP ${uploaded.status})`);
      status.textContent = 'Sending your little letter...';
      await window.emailjs.send(CONFIG.serviceId, CONFIG.templateId, {
        to_email: form.elements.to_email.value.trim(),
        from_name: form.elements.from_name.value.trim() || 'A Cookie Post friend',
        message: form.elements.message.value.trim(),
        card_url: result.imageUrl,
        poem: (() => {
          const poem = window.CookiePoetry?.get?.();
          return poem?.include && poem?.text ? poem.text.trim() : '';
        })(),
        to_name: (() => {
          const name = document.getElementById('recipient-name')?.value.trim();
          return name ? ` for ${name}` : '';
        })()
      }, { publicKey: CONFIG.publicKey });
      status.textContent = 'Your Cookie Post is on its way!';
      form.reset();
    } catch (err) {
      status.textContent = 'Not sent: ' + (err?.message || 'Please try again.');
    } finally {
      submit.disabled = false;
      if (window.turnstile && widgetId !== null) window.turnstile.reset(widgetId);
    }
  });
})();
