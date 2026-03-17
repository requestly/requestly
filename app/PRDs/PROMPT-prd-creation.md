# Reusable Prompt: PRD Creation for Feature Rebuild

Copy everything below the line and paste it as your first message. Replace the placeholders in `[brackets]`.

---

## The Prompt

```
We are rebuilding the Requestly app from scratch. I need a detailed PRD for the **[FEATURE NAME]** feature.

Follow this exact process in order:

### Phase 1 — Understand the Existing Feature
- Deep-dive into our current codebase to understand how [FEATURE NAME] works today.
- Document it from a **product perspective** — what features exist, what data is captured, what the UX flow is, what the limitations are, how it's stored, cross-platform behavior, and relationship with other features.
- Save this as a separate overview document (md file).

### Phase 2 — Competitive Research
- Research how **[COMPETITOR 1]** and **[COMPETITOR 2]** implement this feature.
- Use only official documentation and landing pages as sources. Every claim must have a source URL.
- Build a feature comparison matrix (us vs competitors).
- Propose prioritized improvements based on gaps.
- Add all findings (competitor deep-dives, comparison matrix, recommendations) to the overview document.

### Phase 3 — PRD Drafting (Interactive)
- Before writing the PRD, walk me through **every feature item one by one** using the AskUserQuestion tool:
  - First, list all existing features and ask if I want to carry them forward as-is, modify, or drop any.
  - For any I want to modify, ask specifically what should change.
  - Then go through each proposed new improvement and ask for my decision (include, skip, or customize).
  - For any feature decisions that need research (e.g., "how does the current app do X?"), do the research first and present findings before asking.
  - Flag edge cases you discover and ask for my input on each.
- Only after getting sign-off on every item, draft the PRD.

### Phase 4 — PRD Format Requirements
The PRD must:
- Be a **separate new md file** (not the overview doc).
- Mark every feature explicitly as **[Existing]**, **[New]**, or **[Existing, with changes]**.
- Include sections: Overview, Goals, Non-Goals, Feature Specification (one subsection per feature with detailed behavior + edge cases), Storage, Analytics events, Summary table (feature × status × section reference), Competitive References with source URLs.
- For any new component being introduced, call it out explicitly as **[New Component]** with full spec.
- Note cross-feature dependencies explicitly (e.g., if a change benefits another feature beyond this one).

### Phase 5 — Review & Fact-Check
- After drafting, do a self-review:
  - Verify every claim about the old app against the actual codebase (cite files and line numbers).
  - Verify every competitor claim against official docs (re-fetch if needed).
  - Check internal consistency across all sections (cross-references, edge case coverage).
  - Report findings to me — what's confirmed, what's inaccurate, what's missing.
- Fix any issues found.

### Phase 6 — Competitor Screenshots
- Find relevant screenshots from competitor documentation pages.
- Download them locally into a `screenshots/` folder.
- View each screenshot to verify it's valid and label it accurately.
- Add a dedicated Screenshots section to the PRD with each image, a description of what it shows, which PRD section it's relevant to, and the source URL.

Save all output files to the workspace folder.
```

## Tips for Use

- **Swap competitors**: Replace `[COMPETITOR 1]` and `[COMPETITOR 2]` with whatever is relevant. For API Client features, Postman and Apidog are the primary competitors. For other features, choose accordingly.
- **Add more competitors** if needed — just extend the list.
- **Skip phases** if you want: e.g., if you've already done competitive research, tell Claude to skip Phase 2.
- **Batch features**: You can run this for one feature at a time. Don't try to do multiple features in one session — the context gets too large.
- **Follow-up edits**: After the PRD is drafted, give feedback in plain language (e.g., "change X to Y in section 4.2"). Claude will apply targeted edits without regenerating the whole document.
