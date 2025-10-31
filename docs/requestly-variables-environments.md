# Variables & Environments in Requestly — A practical guide

Last updated: 2025-10-31

Learn how to use Requestly's Variables and Environments to manage multiple setups (Dev, Staging, Production), simplify your requests, and make scripts reusable. This guide is hands-on, contains examples, and includes templates for social sharing when you're ready to publish.

---

## Why Use Variables & Environments?

When you work across multiple stages (development, staging, production), you typically change values like base URLs, API tokens, and feature flags. Editing every request is error prone. Environments let you define those values once and switch them globally. Variables let you reference them in requests, rules, and scripts.

This saves time, reduces mistakes, and makes collaboration easier.

---

## Quick Contract (what you'll get)

- Inputs: environment objects (Dev/Staging/Prod) containing variables like `base_url`, `api_token`, and `default_headers`.
- Outputs: requests and scripts that use `{{variableName}}` to reference environment variables and change behavior when switching environments.
- Error modes: missing variable -> Requestly typically throws or leaves placeholder; test for presence in pre-request scripts.
- Success criteria: switching environment seamlessly updates request targets and script behavior.

---

## Table of contents

1. Create environments in Requestly
2. Define variables (examples)
3. Use variables in requests
4. Switch environments quickly
5. Use variables in pre-request and post-response scripts
6. Example walkthrough (Dev -> Staging swap)
7. Screenshots & capture checklist
8. Publishing & social templates
9. Acceptance checklist

---

## 1) Create environments in Requestly (step-by-step)

1. Sign in to Requestly and open the Environments section (Docs: https://docs.requestly.com/general/api-client/environments-and-variables).
2. Click "Create Environment" or similar.
3. Create three environments: `Dev`, `Staging`, and `Production`.
4. For each environment, add variables. Common names:
   - `base_url` — the root URL for the API or site.
   - `api_token` — bearer token or API key.
   - `default_headers` — optional JSON string for shared headers.
   - `feature_flag_X` — any environment-specific toggles.

Example variable values:
- Dev:
  - `base_url` = `https://dev.api.example.com`
  - `api_token` = `dev-token-123`
- Staging:
  - `base_url` = `https://staging.api.example.com`
  - `api_token` = `staging-token-abc`
- Production:
  - `base_url` = `https://api.example.com`
  - `api_token` = `prod-token-***`

Tip: use descriptive names and avoid including secrets in public/shared environments. Use team secret storage if available.

---

## 2) Define variables (practical examples)

Use simple, consistent names. Examples:

- `base_url`
- `auth_token` or `api_token`
- `user_email`
- `timeout_ms`
- `headers_json` (a JSON string with headers)

If Requestly supports typed values (string/boolean/number), prefer the correct type for clarity.

---

## 3) Use variables in requests

In Requestly requests or rules you can reference variables like this:

- Inline in URL: `{{base_url}}/v1/users`
- Headers: `Authorization: Bearer {{api_token}}`
- Body: e.g. `{"email": "{{user_email}}"}`

Example URL before/after:
- Template: `{{base_url}}/api/todos`
- Dev resolves to: `https://dev.api.example.com/api/todos`

This allows you to keep a single request and switch environments to target different backends.

---

## 4) Switch environments easily

Requestly's UI allows selecting the active environment from a dropdown (usually near the top). Switch to `Staging` and all `{{...}}` variable references resolve to the Staging values.

Pro tip: When collaborating, add environment descriptions or a README on the environment explaining usage and restrictions.

---

## 5) Use variables in pre-request and post-response scripts

Requestly supports running JavaScript snippets before a request and after a response. Variables are accessible via the environment API that Requestly exposes in scripts.

Common uses:
- Add dynamic headers (timestamp, nonce)
- Compute HMAC signatures from secret + payload
- Fail fast if an expected variable is missing

Example pre-request script (pseudocode / Requestly-style JS):

```javascript
// Ensure api_token exists and set Authorization header
const token = getEnvironmentVariable('api_token') || '';
if (!token) {
  // Optionally log or throw
  console.error('api_token missing for environment');
}
setRequestHeader('Authorization', `Bearer ${token}`);

// Example: if you store headers as JSON string in 'default_headers'
try {
  const headersJson = getEnvironmentVariable('default_headers');
  if (headersJson) {
    const obj = JSON.parse(headersJson);
    Object.keys(obj).forEach(k => setRequestHeader(k, obj[k]));
  }
} catch (e) {
  console.warn('default_headers parse error', e);
}
```

Example post-response script (pseudocode):

```javascript
// Store a token returned by login call into environment (for reuse)
if (response.status === 200) {
  const body = JSON.parse(response.body);
  if (body && body.token) {
    setEnvironmentVariable('api_token', body.token);
    console.log('Saved api_token to environment');
  }
}
```

Note: function names like `getEnvironmentVariable`, `setRequestHeader`, `setEnvironmentVariable` are placeholders — check Requestly's exact script API in the UI/docs and adapt. The Requestly docs page (linked at top) contains exact names.

---

## 6) Example walkthrough: swap Dev -> Staging

Goal: run the same saved request against Staging instead of Dev.

1. Ensure `Dev` and `Staging` environments exist and each has `base_url` and `api_token`.
2. Save a request with URL: `{{base_url}}/v1/projects/123` and header `Authorization: Bearer {{api_token}}`.
3. Select environment `Dev` and run the request: you should hit `https://dev.api.example.com/v1/projects/123`.
4. Switch environment to `Staging` in the top dropdown.
5. Run the same saved request again — it should now target `https://staging.api.example.com/v1/projects/123`.

If a pre-request script writes or updates variables (e.g., stores a freshly minted token), check that the `Staging` environment gets updated (workspace-scoped vs global behavior depends on Requestly settings).

---

## 7) Screenshots & capture checklist

Screenshots to include in your blog (place images in `docs/images/`):

- `01-environments-list.png` — the Environments listing with Dev/Staging/Prod
- `02-create-environment.png` — showing the new environment form
- `03-variables.png` — variables panel with `base_url` and `api_token`
- `04-request-using-variable.png` — request URL with `{{base_url}}`
- `05-switch-environment.png` — environment dropdown being switched
- `06-pre-request-script.png` — editor showing pre-request script using variables
- `07-post-response-set-variable.png` — example of saving token into env

How to capture:
- Use your OS screenshot tool or the browser devtools.
- If you prefer terminal: use `gnome-screenshot` (Linux) or a clipboard tool.
- Save images into `docs/images/` and update the draft to remove the placeholder links or replace them with the actual file names.

Accessibility tip: add descriptive alt text for each image.

---

## 8) Publishing & social templates

Where to publish:
- DEV.to — friendly for dev tutorials and supports Markdown. You can publish via UI or API.
- Medium — good audience; may require a membership to publish widely.
- Personal blog — best if you own the canonical copy.

DEV.to post example publish command (requires API key):

```bash
curl -X POST "https://dev.to/api/articles" \
  -H "Content-Type: application/json" \
  -H "api-key: YOUR_DEVTO_API_KEY" \
  -d '{"article": {"title":"Variables & Environments in Requestly: A Practical Guide","body_markdown":"<PASTE_MARKDOWN_HERE>","published":true,"tags":["requestly","api","tutorial"]}}'
```

LinkedIn post template:

> Published: "Variables & Environments in Requestly — A practical guide" — a short walkthrough for using envs and variables to keep your API requests and scripts DRY. Read: <link>
>
> Key takeaways: use `{{base_url}}` and `{{api_token}}`, store tokens via post-response scripts, and flip environments to test different backends quickly.
>
> #Requestly #API #DevTools #Tutorial

X (Twitter) template (shortened):

> New: Variables & Environments in Requestly — make your API requests environment-aware in seconds. Read: <link> #Requestly #APITesting

You can reuse the images in `docs/images/` for social posts.

---

## 9) Acceptance checklist (for this task)

- [ ] I explored variables & environments hands-on in Requestly (note: if you want, I can walk you through these steps in your browser or record a short screencast).
- [ ] This article includes step-by-step instructions on creating and using variables/environments.
- [ ] Content is original and human-written (please edit tone if you want a more personal voice).
- [ ] Article includes examples and screenshot placeholders.
- [ ] Blog is structured, with headings and examples.
- [ ] Publishing: instructions and social templates are included; publish requires your account/API keys.

---

## Next steps (how I can help)

- I can: open Requestly docs in your browser, walk you through creating environments step-by-step, and help you capture screenshots.
- I can also publish the article to DEV.to/Medium for you if you provide the API key or credentials (or publish it to this repo and you can copy it to your blog).

If you'd like to publish now, tell me which platform and provide the API key (or paste the live site URL where you want the post). If you prefer, I can make a PR in this repo so the article lives in its `docs/` folder and you can publish from there.

---

## Appendix: example pre-request & post-response script templates

Pre-request (set Authorization header and ensure token exists):

```javascript
// Template for Requestly pre-request script
(function() {
  const token = getEnv('api_token');
  if (!token) {
    console.warn('api_token is not set in the current environment');
  }
  // set header if API supports it
  setHeader('Authorization', `Bearer ${token}`);
})();
```

Post-response (save token from login):

```javascript
// Template for Requestly post-response script
(function() {
  if (response.status === 200) {
    try {
      const body = JSON.parse(response.body);
      if (body && body.token) {
        setEnv('api_token', body.token);
        console.log('Saved api_token to environment');
      }
    } catch (e) {
      console.warn('Could not parse response body', e);
    }
  }
})();
```

Adjust function names to Requestly's exact script API.

---

## Final notes

This draft lives at `docs/requestly-variables-environments.md` in the workspace. Replace the placeholder images with real screenshots in `docs/images/` and update any API names in the script templates to match Requestly's script API if needed.

If you'd like, I can: 
- open the Requestly docs for exact function names,
- help capture screenshots by walking you through the UI,
- or publish the article to DEV.to on your behalf (you'd need to provide an API key).

Which of those should I do next?
