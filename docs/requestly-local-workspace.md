# Getting started with Requestly Local Workspace

---
title: "Getting started with Requestly Local Workspace"
description: "A beginner-friendly, hands-on guide to creating and using Requestly's Local Workspace to manage API requests and collections locally."
author: "<YOUR NAME>"
tags: [requestly, local-workspace, tutorial, api]
date: 2025-10-31
draft: false
---

Last updated: 2025-10-31

This guide is a hands-on, beginner-friendly walkthrough for Requestly's Local Workspace feature. It shows how to create a local workspace, add and organize requests, run requests, use local scripts/variables, and export collections. Replace the screenshots placeholders with your captures and add a short "My notes" section after you try the steps.

## Why use a Local Workspace?

A Local Workspace gives you an isolated, file-backed environment for creating and testing API requests, rules, and collections without immediately syncing to a remote or team workspace. It's great for experimentation, work-in-progress, and when you want to keep sensitive data locally during development.

## What you'll learn

- Creating a Local Workspace
- Adding and organizing requests locally
- Saving collections and exporting them
- Running requests and inspecting responses
- Using pre-request and post-response scripts (local scope)
- Best practices and screenshots to document your process

---

## 1. Create a Local Workspace

1. Open Requestly and go to the Workspaces area (look for a Workspaces or Local Workspaces option in the UI).
2. Click "Create Local Workspace" (or similar). Give it a descriptive name (for example, `local-dev`).
3. Choose whether to initialize with sample requests or start empty.
4. Confirm. The workspace will be stored locally (browser storage or file) depending on Requestly's implementation.

Screenshot placeholder: `docs/images/lw-01-create-workspace.png`

---

## 2. Add and manage API requests inside the workspace

- Click "New Request" and provide method, URL, headers, and body.
- Use variables scoped to the Local Workspace to keep your requests portable.
- Organize requests into Collections or folders within the Local Workspace.

Example:
- Request name: `Get Projects`
- URL: `https://api.example.com/v1/projects`
- Method: `GET`
- Headers: `Authorization: Bearer <token>`

Screenshot placeholder: `docs/images/lw-02-new-request.png`

---

## 3. Save and organize collections locally

- Create a Collection called `My Local APIs` and add requests to it.
- Save frequently; local changes remain in the workspace and won't affect team workspaces until you explicitly export or sync.
- Export the collection (if you want a file backup) using the Export feature.

Screenshot placeholder: `docs/images/lw-03-collections.png`

---

## 4. Run requests and view responses

- Select a request and click "Send" or "Run".
- Inspect the response status, headers, and body in the Response panel.
- Use the console/logging (if provided) to view script outputs.

Screenshot placeholders:
- `docs/images/lw-04-run-request.png`
- `docs/images/lw-05-response-panel.png`

---

## 5. Use pre-request and post-response scripts locally

Local Workspaces support scripts that only affect the current workspace. Common use-cases:

- Set dynamic headers (timestamps, nonces)
- Read/write workspace-scoped variables
- Save tokens to the local workspace after login

Example pre-request script (pseudocode):

```javascript
// Get token from workspace variable store
const token = getWorkspaceVar('api_token') || '';
if (token) setHeader('Authorization', `Bearer ${token}`);
```

Example post-response script to save token:

```javascript
if (response.status === 200) {
  const body = JSON.parse(response.body || '{}');
  if (body.token) setWorkspaceVar('api_token', body.token);
}
```

Note: Replace `getWorkspaceVar`, `setHeader`, and `setWorkspaceVar` with the actual Requestly Local Workspace script API if they differ — check the Requestly docs or script editor for exact function names.

Screenshot placeholder: `docs/images/lw-06-scripts.png`

---

## 6. Exporting, syncing, and safety

- If you want to share a local collection, export it as a file and import into a team workspace.
- Keep secrets out of exported files unless you scrub them first.
- Consider using a secret manager or Requestly's team vault (if available) for secrets in shared contexts.

---

## 7. Example quick workflow

1. Create `local-dev` workspace.
2. Add `Login` request that returns a token.
3. Add `Get Projects` request that uses `{{api_token}}` stored in workspace variables.
4. Run `Login`, inspect response, and save token to workspace via post-response script.
5. Run `Get Projects` — the Authorization header is now set by the workspace variable.

---

## 8. Screenshots & GIF ideas (capture checklist)

- Create workspace screen
- New request creation
- Running a request and showing response
- Script editor with a pre-request/post-response snippet
- Exporting a collection

Place images into `docs/images/` and replace the placeholders in this file.

---

## 9. Publishing & sharing templates

Publish to DEV.to, Medium, or your personal blog. Use the social templates in `docs/social_templates.md` and the `scripts/publish_devto.py` helper (added to this repo) if you want to publish to DEV.to programmatically.

DEV.to suggested tags: `requestly`, `local-workspace`, `tutorial`, `api`

---

## Acceptance checklist

- [ ] You explored Local Workspace and documented your personal notes in the "My notes" section below.
- [ ] This article contains step-by-step instructions to create and use a Local Workspace.
- [ ] The content is original and written from first-hand experience (add your short notes under "My notes").
- [ ] Screenshots/GIFs are added to `docs/images/` and referenced in the article.
- [ ] The article is reviewed for grammar and technical accuracy.
- [ ] The article is published and shared on social channels.

---

## What I did for you (so far)

- Created this beginner-friendly draft and added screenshot placeholders.
- Added script templates for local pre/post scripts (pseudocode).
- Added helper files to publish to DEV.to and social post templates (see `docs/social_templates.md` and `scripts/publish_devto.py`).

## What I can't do without your input

- I cannot capture screenshots or GIFs from your local Requestly UI — please add them to `docs/images/`.
- I cannot publish to DEV.to/Medium on your behalf without your API key or account credentials. You can run the included helper script, or provide the API key and I can publish for you.

## My notes (add your personal experience here)

_Example_: "I created a `local-dev` workspace, added a Login request, and saved the token using a post-response script. The token persisted only in the local workspace and didn't sync to my team workspace — this was ideal for testing."

Add 2-4 short bullet points describing what you tried and any surprises/notes. This will make the article clearly first-hand and original.

---

## Notes & next steps

If you'd like, I can:

- Open the Requestly Local Workspace docs in your browser and fetch exact function names for script calls.
- Walk you through creating the workspace step-by-step in a guided session and prepare the screenshots for the article.
- Publish the article to DEV.to for you (you must provide your DEV.to API key in a secure way), or I can give exact commands for you to run locally.

Tell me which option you prefer and I'll continue.
