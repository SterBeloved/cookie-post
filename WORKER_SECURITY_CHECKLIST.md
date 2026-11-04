# Cookie Post Poetry API — Public launch security checklist

These tasks belong **inside the deployed Cloudflare Worker**, not the frontend, and were not changed by this integration.

## 1. Sanitize outward responses
Return only the minimum required public result:

```js
// Example: after your existing DeepSeek request and poem extraction:
return new Response(JSON.stringify({ poem: validatedPoem }), {
  status: 200,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*', // adjust to allowed production origins
    'Cache-Control': 'no-store'
  }
});
```

Do **not** return the full DeepSeek payload, `provider_message`, API keys, internal stack traces, hidden prompts, or third-party error bodies. Return sanitized error messages and an appropriate HTTP status. Avoid logging sensitive user wishes and keys.

## 2. Rate-limit before calling DeepSeek
On Cloudflare you can use a Workers Rate Limiting binding for an approximate per-IP limit, e.g. 5 requests per minute. Use `CF-Connecting-IP` server-side only if you correctly understand the Cloudflare trust boundary. Rate limiting bindings are approximate; for strict cross-location daily limits, use Durable Objects / durable centralized counters.

Example configuration (`wrangler.jsonc`, adapt to your own project):

```jsonc
{
  "ratelimits": [
    {"name":"POETRY_LIMITER","namespace_id":"1001","simple":{"limit":5,"period":60}}
  ]
}
```

Example handling inside your existing Worker handler **before** the provider request:

```js
const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
const { success } = await env.POETRY_LIMITER.limit({ key: ip });
if (!success) {
  return new Response(JSON.stringify({ error: 'Too many requests' }), {
    status: 429,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
```

You must also handle OPTIONS CORS preflight appropriately and put origin/method/header restrictions in place for your deployment. A front-end cooldown and CORS do not enforce cost limits.

## 3. Budget protection
- Set a provider-side **hard spend limit / API quota** if your DeepSeek account offers one; check its actual controls rather than assuming they exist.
- Track requests and token usage on the server. Reject requests if your own daily token/spend ceiling is reached. If the limit must be **strict**, track reservations and completions in an atomic store such as a Durable Object.
- Configure model maximum output tokens and timeouts.
- Limit input length server-side (for example, max 600 characters) and block requests that are not JSON or malformed.
- Add alerts for sudden request volume, 429 responses, errors and spending spikes.

## 4. API key safety
Keep the DeepSeek key in Cloudflare Workers **Secrets** and never in `poetry.js`, `index.html`, source-control commits, logs or browser localStorage. Use Cloudflare Worker Settings → Variables and Secrets, or `npx wrangler secret put YOUR_SECRET_NAME`.

## 5. Smoke test before publishing
- OPTIONS preflight from the deployed website origin works.
- POST returns `{ "poem": "..." }` only.
- 429 has a safe error body and CORS headers.
- Invalid inputs and upstream outages do not expose private details.
- Maximum spend and request budget enforced server-side.
