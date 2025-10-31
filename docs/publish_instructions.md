# Publishing instructions

This file explains how to publish the `docs/requestly-local-workspace.md` article to DEV.to using the included helper script, and alternative manual steps for Medium or personal blogs.

## Option A — Publish to DEV.to (script)

1. Export or copy your final article into `docs/requestly-local-workspace.md` (this repo already contains the draft).
2. Set your DEV.to API key as an environment variable:

```bash
export DEVTO_API_KEY=your_api_key_here
```

3. Run the publisher script from the repository root:

```bash
python3 scripts/publish_devto.py docs/requestly-local-workspace.md
```

4. The script will print the response JSON from DEV.to which contains the article URL. Save it and share on social media.

Notes:
- The script creates a new article. To update an existing article, you can use the DEV.to API `PUT /articles/:id` — I can help extend the script if you want updates instead of new publishes.
- Make sure your markdown file is ready and has screenshot links that point to public URLs or inline images supported by DEV.to.

## Option B — Publish to DEV.to manually (UI)

1. Log in to https://dev.to and click "Create Post".
2. Copy the Markdown from `docs/requestly-local-workspace.md` into the editor.
3. Add tags: `requestly`, `local-workspace`, `tutorial`, `api`.
4. Publish.

## Option C — Publish to Medium or personal blog

- For Medium: copy Markdown and paste into Medium's editor. Images must be uploaded to Medium.
- For personal blog: follow your blog's CMS instructions. If your blog supports Markdown, paste directly; otherwise convert or upload.

## After publishing

- Use the `docs/social_templates.md` file to copy ready-to-post messages for LinkedIn and X.
- Add final article link to the repo's README or a dedicated blog index if you want a canonical copy here.

If you'd like, I can publish for you — provide DEV.to API key (set in `DEVTO_API_KEY`) and I will run the script and publish. I can also adapt the script to support updates or copy images to a public CDN first.
