# Requestly Agent Plugin

This plugin packages a focused agent workflow for Requestly maintainers and users. It is designed to be useful in Codex, Claude Code, Claude Cowork, Copilot-style coworkers, and other `SKILL.md`-compatible harnesses.

The plugin does not add a runtime dependency to Requestly. It gives agents a precise operating procedure, expected outputs, and plugin evals so maintainers can decide whether agent-produced work is good enough to accept.

## What It Includes

- Codex and Claude plugin manifests.
- A Requestly-specific skill at `skills/requestly-api-workflow/SKILL.md`.
- Plugin eval cases in `evals/requestly-api-workflow/cases.jsonl`.
- Privacy-safe measurement guidance for teams that want production plugin metrics.

## Primary Workflows

- Collection design.
- Rule impact review.
- Mock regression plan.
- Auth header audit.

## Eval Cases

- `collection-plan`: Create a Requestly collection plan for a payments API.
- `rule-review`: Review a Requestly rule that rewrites staging traffic to localhost.
- `mock-regression`: Create plugin evals for a mocked 500 response and timeout behavior.

## Install In An Agent Harness

Use this plugin directory directly from the repository when your harness supports local or Git-backed plugin sources. The plugin root is:

```text
plugins/requestly-api-workflow
```

For Telvine-backed distribution and metrics:

```bash
npm i -g telvine
telvine login
telvine publish ./plugins/requestly-api-workflow
telvine plugins metrics
```

## Telemetry Boundary

The plugin should only record metadata about plugin execution and eval outcomes. Do not record prompts, source files, request bodies, connector payloads, credentials, model outputs, or production user data.
