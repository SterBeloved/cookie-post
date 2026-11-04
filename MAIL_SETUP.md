# Cookie Post email integration (staged, safe)

The mail dialog and card PNG upload code are installed. Sending is deliberately disabled until public upload security is configured. **Do not put `UPLOAD_TEST_SECRET` or Turnstile Secret Key in frontend files.**

1. Deploy the static site to GitHub Pages or Cloudflare Pages. Identify its actual hostname.
2. Create a Cloudflare Turnstile Managed widget for that hostname; put the **public Site Key** in `mail.js` -> `turnstileSiteKey`.
3. Update `cookiepost-mail-api` Worker to accept `X-Turnstile-Token`, verify it server-side via Cloudflare Siteverify using a Secret stored in Worker Secrets, and preserve the existing R2, PNG validation, rate limiting, and UUID public-read endpoint. **Do not simply remove the private-test secret check** without adding server-side verification.
4. Add CORS for the deployed website origin and `OPTIONS` preflight on `/api/upload` (allow Content-Type, X-Turnstile-Token).
5. Test a real card end-to-end. Check R2 lifecycle and image URL; ensure emailjs template parameters match `card_url`, `message`, `from_name`, `to_email`.

No API secrets are included. EmailJS Public Key, Service ID and Template ID are intentionally public client-side identifiers. Note: browser EmailJS public-key usage can be abused if not limited by EmailJS dashboard settings. Consider provider-side domain allowlisting and rate controls.

This is a frontend integration build, **not** a claim of successful end-to-end delivery. The Worker is still in private-test mode until step 3.
