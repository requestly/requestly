# Environments & Variables

> Status tags used throughout this document:
> - **`[Existing]`** — Already implemented in the current codebase; carry forward as-is in the rewrite.
> - **`[New — Postman Parity]`** — Not currently implemented; adding to match Postman's offering.
> - **`[New]`** — Not currently implemented; new Requestly-specific addition.


## Objective

Implement the Environments & Variables system for the API Client rewrite. This system allows users to define named sets of key-value variables, organise them into scopes (Global, Environment, Collection, Runtime, Dynamic), and reference them anywhere in requests using `{{variable}}` syntax. The goal is to deliver a complete, production-ready variable management experience with a simplified single-value model, auto-save, and clear scoping hierarchy.


## Success Criteria

User can:
- Create, rename, duplicate, delete, and colour-code environments
- Switch the active environment and see all variable references resolve immediately
- Define variables with a single Value field that is local by default, with an explicit share toggle
- Add descriptions to variables for documentation
- Use secret-type variables that are masked in UI and stripped on export
- Reference variables in URL, query params, headers, body, auth fields, and script strings via `{{key}}` syntax
- See resolved/unresolved variable highlighting and autocomplete in all editors
- Use dynamic variables (`{{$randomEmail}}`, `{{$timestamp}}`, etc.) powered by Faker
- Set and read variables programmatically in pre-request and post-response scripts
- View the Global Environment as a persistent, always-available variable scope
- Define collection-level variables that apply to all requests within the collection
- Export environments in Requestly JSON and Postman-compatible formats
- Import environments from Requestly JSON and Postman JSON formats


## Feature Scope


### 1. Environment Management

CRUD operations and organisation of named environments within a workspace.

**In Scope**

*Sidebar Listing*
- Environments appear under a dedicated "Environments" section in the secondary sidebar `[Existing]`
- The list shows each environment's name and colour dot (if assigned) `[Existing]` (colour dot is `[New — Postman Parity]`)
- Environments are sorted alphabetically in the sidebar `[Existing]`
- Global Environment appears as a pinned entry at the top of the list, visually distinct from user-created environments `[Existing]`
- Right-click (or three-dot menu) on any environment reveals: Rename, Duplicate, Set Active, Assign Colour, Export, Delete `[Existing]` (Duplicate, Assign Colour are `[New]`)
- Clicking an environment in the sidebar opens its Editor View in the main content area as a tab `[Existing]`

*Create*
- Create via: "+" button in the Environments sidebar section header, or the quick-create option inside the Environment Switcher dropdown `[Existing]` (quick-create in switcher is `[New]`)
- New environment is created with a default name ("New Environment") and an empty variable list `[Existing]`
- The environment's Editor View opens automatically in a new tab after creation `[Existing]`
- The name field is focused and selected for immediate inline renaming `[Existing]`
- If this is the first environment in the workspace, it is automatically set as the active environment `[Existing]`

*Rename*
- Rename via: double-click on the environment name in the sidebar, or editing the name in the Editor View header `[Existing]`
- Name is saved on blur or Enter; reverts on Escape `[Existing]`
- Empty names are not allowed — revert to previous name if left blank `[Existing]`

*Duplicate*
- Duplicate via: sidebar context menu → "Duplicate" `[New]`
- Creates a deep copy of all variables (keys, values, types, descriptions, shared flags) `[New]`
- Duplicated environment is named "{Original Name} (Copy)" `[New]`
- The duplicate is not set as active — the user must explicitly switch to it `[New]`
- The duplicate's Editor View opens in a new tab `[New]`

*Delete*
- Delete via: sidebar context menu → "Delete", or from the Editor View header `[Existing]`
- Confirmation dialog required before deletion `[Existing]`
- If the deleted environment is currently the active environment, the active environment resets to "No Environment" `[Existing]`
- The Editor View tab for the deleted environment closes automatically `[Existing]`
- Deletion is permanent — environments cannot be recovered after deletion `[Existing]`

*Colour Coding*
- Assign a colour via: sidebar context menu → "Assign Colour", or a colour picker in the Editor View header `[New — Postman Parity]`
- Predefined palette of standard colours (e.g., red, orange, yellow, green, blue, purple) plus up to 6 user-defined custom colours `[New — Postman Parity]`
- Colour appears as a dot/badge in: sidebar listing, environment switcher dropdown, environment switcher collapsed state, Editor View header `[New — Postman Parity]`
- Colours help visually distinguish environments (e.g., red for Production, green for Development) `[New — Postman Parity]`
- Colour can be removed (reset to no colour) `[New — Postman Parity]`

*General*
- Environments are scoped to a workspace — not shared across workspaces `[Existing]`

**Out of Scope**
- Environment forking and pull requests
- Pinning environments to collections with auto-activate default
- Environment templates or presets


### 2. Global Environment

A single, always-present environment that provides workspace-wide fallback variables.

**In Scope**
- One Global Environment per workspace, auto-created on workspace initialisation `[Existing]`
- Cannot be deleted, renamed, or colour-coded — it is a permanent fixture `[Existing]`
- Appears as a pinned "Globals" entry at the top of the Environments sidebar list, visually separated from user-created environments (e.g., with a globe icon) `[Existing]`
- Clicking "Globals" opens the same Editor View as regular environments, with the name field non-editable and no delete action `[Existing]`
- Global variables are accessible regardless of which environment is active (or if no environment is active) `[Existing]`
- Global variables have the lowest priority among user-defined scopes (Runtime > Environment > Collection > Global) `[Existing]`
- Use cases: base URLs shared across all environments, default timeout values, team-wide API keys `[Existing]`
- Supports the same variable fields as regular environments (value, type, description, share toggle) `[Existing]` (description and share toggle are new additions — see Variable Data Model)
- Exportable separately in both Requestly JSON and Postman-compatible formats `[Existing]`

**Out of Scope**
- Global variables spanning multiple workspaces


### 3. Variable Data Model

The structure and fields of each variable entry, adopting a simplified single-value model.

**In Scope**
- Each variable has: Key (string), Value (string | number | boolean), Type, Description, Shared flag `[Existing]` (Description and Shared flag are new — see below)
- Type field with options: String, Number, Boolean, Secret `[Existing]`
- Single Value field — this is the value used during request execution `[New — Postman Parity]` (replaces the current dual SYNCED / LOCAL column model)
- Value is local by default — stored on the user's machine, never synced to cloud unless explicitly shared `[New — Postman Parity]`
- Share toggle per variable: when enabled, the value is synced to the workspace and visible to all team members `[New — Postman Parity]`
- When a shared value is edited locally, the variable shows an "Edited" indicator — user can choose to update shared value or reset to shared value `[New — Postman Parity]`
- Description field (optional) for documenting a variable's purpose, accepted values, or usage notes `[New — Postman Parity]`
- Variables can be enabled/disabled — disabled variables are skipped during resolution `[Existing]`
- Variable key uniqueness enforced within a single scope (duplicate keys flagged with warning) `[Existing]`
- Auto-save — edits to variable key, value, type, description, or shared status persist immediately without a manual save action `[New — Postman Parity]` (current implementation uses a manual save button with buffered state)

**Out of Scope**
- Vault variable type with `{{vault:key}}` syntax
- Variable versioning or change history
- Variable validation rules (e.g., regex patterns, allowed values)


### 4. Variable Scoping & Precedence

The hierarchy of variable scopes and how conflicts between same-named variables are resolved.

**In Scope**
- Five resolution scopes, from highest to lowest priority: `[Existing]`
  1. **Runtime** — set via scripts (`rq.variables.set`) or manually; request-scoped by default, optionally persistent across sessions
  2. **Environment** — variables from the currently active environment
  3. **Collection** — variables defined on the request's parent collection, then ancestor collections walking up the tree
  4. **Global** — variables from the Global Environment
  5. **Dynamic** — auto-generated Faker-based variables (read-only, lowest priority)
- When the same key exists at multiple scopes, the narrowest (highest priority) scope wins `[Existing]`
- If no environment is active, environment scope is skipped — resolution falls through to Collection > Global > Dynamic `[Existing]`
- Collection variable inheritance: a request inside a nested collection inherits variables from all ancestor collections, with the nearest ancestor taking priority `[Existing]`

**Out of Scope**
- Data File scope (CSV/JSON variables for collection runner — tracked under Collection Runner PRD)
- Per-tab environment selection (different tabs using different active environments)


### 5. Environment Switcher

The UI control for selecting the active environment. This is the primary way users switch context between different variable sets (e.g., dev → staging → production).

**In Scope**

*Placement & Collapsed State*
- Located in the sidebar header, always visible regardless of which sidebar section is expanded `[Existing]`
- When collapsed (not clicked), displays: the active environment's name and colour dot, or "No Environment" if none is active `[Existing]` (colour dot is `[New — Postman Parity]`)
- Clicking the switcher opens the dropdown `[Existing]`

*Dropdown Behaviour*
- Lists all environments alphabetically, each showing their name and colour dot `[Existing]` (colour dot is `[New — Postman Parity]`)
- "No Environment" option at the top to deselect any active environment — selecting this means only Global, Collection, and Dynamic variables are available `[Existing]`
- Active environment indicated with a check mark icon `[Existing]`
- Search/filter field at the top of the dropdown for workspaces with many environments `[New]`
- Quick-create action at the bottom of the dropdown (e.g., "+ New Environment") — creates the environment and sets it as active without navigating away from the current tab `[New]`
- If no environments exist, the dropdown shows an empty state with a prominent "Create Environment" call-to-action `[Existing]`

*Switching Behaviour*
- Clicking a different environment in the dropdown immediately sets it as the active environment `[Existing]`
- On switch, all `{{variable}}` references across all open request tabs are re-resolved against the new environment's variables `[Existing]`
- Variable highlighting (resolved/unresolved colours) and autocomplete results update immediately to reflect the new environment `[Existing]`
- The switcher label updates to show the newly active environment's name and colour `[Existing]`
- The switch is workspace-global — all open tabs share the same active environment `[Existing]`
- If a request is currently in-flight when the user switches, the in-flight request uses the variables it was sent with; the new environment applies to the next send `[Existing]`

**Out of Scope**
- Per-tab environment selector (different tabs using different active environments)
- Environment quick-switch keyboard shortcut


### 6. Environment Editor View

The full-screen tab view that opens when a user clicks on an environment (or Globals) in the sidebar. This is where users manage all variables within a single environment.

**In Scope**

*Opening the Editor*
- Clicking any environment in the sidebar opens its Editor View in the main content area as a tab `[Existing]`
- Multiple environment Editor tabs can be open simultaneously (e.g., "Globals" tab + "Production" tab) `[Existing]`
- Tabs show the environment name and colour dot; closing a tab does not delete the environment `[Existing]` (colour dot is `[New — Postman Parity]`)

*Header*
- Displays: environment name (editable inline), colour dot with picker, active/inactive badge, and action buttons `[Existing]` (colour picker is `[New — Postman Parity]`)
- For Global Environment: name is "Globals" and non-editable, no delete action, no colour picker `[Existing]`
- Action buttons: Set as Active / Deactivate, Export (dropdown: Requestly JSON, Postman JSON), Delete `[Existing]`
- "Set as Active" button is replaced with "Active" badge when this environment is currently the active one `[Existing]`

*Body*
- The variable editing table (see Section 7 — Variable Editing UI) `[Existing]`
- Search/filter bar above the table to find variables by key or value `[Existing]`
- Empty state when no variables exist: message + "Add Variable" call-to-action `[Existing]`

*Runtime Variables Tab (separate view)*
- When opening the Runtime Variables entry (if surfaced in sidebar), shows a similar table but with runtime-specific columns (Persistent toggle instead of Shared toggle) `[Existing]`
- Runtime variables are not tied to any named environment — they show script-set and manually-set variables from the current session `[Existing]`

**Out of Scope**
- Split view comparing two environments side-by-side
- Environment-level description or notes field
- Variable change history within the editor


### 7. Variable Editing UI

The table-based interface for viewing and editing variables within an environment, collection, or global scope.

**In Scope**
- Editable table with columns: Key, Value, Type (dropdown), Description, Shared (toggle), Actions `[Existing]` (Description and Shared columns are new — see Variable Data Model)
- For Secret-type variables: Value is masked (dots/asterisks) with a reveal/hide toggle (eye icon) `[Existing]`
- Inline editing — click to edit any cell directly in the table `[Existing]`
- Add new variable row via an empty row at the bottom of the table or an "Add Variable" action `[Existing]`
- Delete variable via row action (with confirmation for shared variables) `[Existing]`
- Bulk actions: select multiple variables and delete, share, or unshare `[New]`
- Duplicate key detection — highlight rows with duplicate keys and show a warning `[Existing]`
- Search/filter variables by key or value within the table `[Existing]`
- Sort by key name (ascending/descending) `[New]`
- Drag-and-drop reordering of variable rows (persisted via variablesOrder) `[Existing]`
- Auto-save all changes — no save button needed `[New — Postman Parity]`
- RBAC: edit/delete gated behind environment edit permissions; viewers see read-only table `[Existing]`
- For Runtime Variables: show a "Persistent" toggle column instead of the Shared column `[Existing]`

**Out of Scope**
- Import variables from clipboard or CSV paste
- Variable grouping or tagging within an environment


### 8. Variable Highlighting & Autocomplete

Inline variable assistance in all text editors (URL bar, header values, body editor, script editor).

**In Scope**
- Detect `{{variableName}}` patterns in all text input fields and code editors `[Existing]`
- Colour-code resolved variables (theme primary colour) and unresolved variables (error colour) `[Existing]`
- Dynamic variables (`{{$name}}`) highlighted with a distinct style `[Existing]`
- Typing `{{` triggers an autocomplete dropdown listing all available variables `[Existing]`
- Autocomplete shows: variable name, resolved value (masked for secrets), scope badge (Environment, Collection, Global, Runtime, Dynamic) `[Existing]`
- Autocomplete respects precedence — if a variable exists at multiple scopes, show the winning scope's value `[Existing]`
- Autocomplete auto-inserts closing `}}` if not already present `[Existing]`
- Hover tooltip on any `{{variable}}` showing: resolved value, source scope, variable type, and description (if set) `[Existing]` (description display is new)
- For undefined variables: hover shows "Variable not found" with quick actions to create it or switch environment `[Existing]`
- All of the above works in: URL bar, query parameter values, header values, request body (raw/JSON), auth field values, pre-request script strings, post-response script strings `[Existing]`

**Out of Scope**
- Variable usage analytics (showing where a variable is used across requests)
- Inline variable renaming (rename a variable and update all references)


### 9. Dynamic Variables

Auto-generated variables powered by Faker that produce a fresh value on every request execution.

**In Scope**
- Syntax: `{{$variableName}}` — the `$` prefix distinguishes dynamic from user-defined variables `[Existing]`
- Powered by `@faker-js/faker` library `[Existing]`
- Categories: Common (`$guid`, `$timestamp`, `$isoTimestamp`, `$randomUUID`), Text, Numbers, Internet, Person, Location, Finance, Business, Commerce, DateTime, Files, Words `[Existing]`
- New value generated on each send — never cached or persisted `[Existing]`
- Lowest resolution priority — any user-defined variable with the same name (minus `$`) takes precedence `[Existing]`
- Supported in all `{{}}` contexts: URL, params, headers, body, auth fields `[Existing]`
- In scripts: accessible as callable methods on the `rq` object (e.g., `rq.$randomEmail()`, `rq.$randomInt(1, 100)`) `[Existing]`
- Listed in autocomplete with a "Dynamic" scope badge and example value `[Existing]`
- Hover tooltip shows variable description and a sample generated value `[Existing]`

**Out of Scope**
- User-defined custom dynamic variable functions
- Seeded/deterministic faker output for reproducible tests


### 10. Collection Variables

Variables defined at the collection level, available to all requests within that collection.

**In Scope**
- Each collection can define its own set of variables using the same variable data model (key, value, type, description, shared toggle) `[Existing]`
- Collection variables are editable from the Collection View, in a dedicated "Variables" tab `[Existing]`
- Inheritance: a request inherits variables from its parent collection and all ancestor collections `[Existing]`
- Nearest-ancestor-wins: if the same key exists on a parent and grandparent collection, the parent's value is used `[Existing]`
- Collection variables have lower priority than Runtime and Environment, but higher than Global `[Existing]`
- Collection variable changes auto-save `[New — Postman Parity]`
- When viewing a variable popover, scope indicator shows "Collection: {collectionName}" to disambiguate `[Existing]`

**Out of Scope**
- Collection variable import/export as standalone files (they export as part of the collection)


### 11. Scripting API for Variables

The programmatic interface for reading, writing, and unsetting variables from pre-request and post-response scripts.

**In Scope**
- `rq.environment.get(key)` — read from active environment `[Existing]`
- `rq.environment.set(key, value)` — write to active environment (local value) `[Existing]`
- `rq.environment.unset(key)` — remove from active environment `[Existing]`
- `rq.globals.get(key)` / `.set(key, value)` / `.unset(key)` — read/write/remove global variables `[Existing]`
- `rq.collectionVariables.get(key)` / `.set(key, value)` / `.unset(key)` — read/write/remove collection variables `[Existing]`
- `rq.variables.get(key)` — read from the narrowest scope that defines the key (respects full precedence chain) `[Existing]`
- `rq.variables.set(key, value)` — write to Runtime scope (request-scoped by default) `[Existing]`
- `rq.variables.set(key, value, { persist: true })` — write to Runtime scope with persistence across sessions `[Existing]`
- All `.set()` operations update the local value only — shared values are never modified by scripts `[Existing]`
- `rq.$dynamicVarName()` — invoke any dynamic variable as a function in scripts `[Existing]`
- Type coercion: values are sanitised to primitives (string, number, boolean) — objects/arrays are JSON-stringified `[Existing]`

**Out of Scope**
- `rq.vault` — vault variable access from scripts
- `rq.sendRequest` — making HTTP calls from within scripts (tracked under Scripting Runtime PRD)
- `rq.cookies` — cookie management from scripts
- `.toObject()` / `.has()` / `.clear()` / `.replaceIn()` convenience methods (future enhancement)


### 12. Variable Quick Look

A glanceable panel showing all active variables and their resolved values without navigating away from the request.

**In Scope**
- Accessible via an eye icon or keyboard shortcut near the environment switcher `[New — Postman Parity]`
- Shows all variables from: active environment, global environment, and collection (in context) `[New — Postman Parity]`
- Variables grouped by scope with clear section headers `[New — Postman Parity]`
- Shows: key, resolved value (masked for secrets), type badge, shared indicator `[New — Postman Parity]`
- Search/filter within the Quick Look panel `[New — Postman Parity]`
- Click on any variable to navigate to its definition in the environment/collection editor `[New — Postman Parity]`
- Panel dismisses on outside click or Escape `[New — Postman Parity]`

**Out of Scope**
- Editing variables inline within Quick Look
- Showing runtime variables in Quick Look (they are ephemeral and request-scoped)


### 13. Import & Export

Moving environments in and out of the application.

**In Scope**
- Export individual environment as Requestly JSON format `[Existing]`
- Export individual environment as Postman v2.1 compatible JSON format `[Existing]`
- Export Global Environment separately in both formats `[Existing]`
- On export: local/current values are stripped — only shared values are included in the export file `[Existing]`
- On export: secret variable values are stripped regardless of shared status `[Existing]`
- Import environment from Requestly JSON file `[New]`
- Import environment from Postman JSON file (v2.0 and v2.1) `[New]`
- Import creates a new environment — does not overwrite existing environments `[New]`
- Import via file picker dialog `[New]`
- Validation on import: show errors for malformed files, missing required fields `[New]`

**Out of Scope**
- Import from URL or clipboard paste
- Bulk export of all environments as a single ZIP
- Import from other tools (Bruno, Insomnia, etc.) — tracked under separate Import/Export PRD
- Drag-and-drop import


### 14. Sync & Collaboration

How environment data is persisted and shared across team members.

**In Scope**
- Shared variable values sync to the cloud backend and are visible to all workspace members with access `[Existing]`
- Local (unshared) values are persisted on the user's device only (via local storage or equivalent) `[Existing]`
- On workspace join / app load: shared values are fetched from backend; local values are restored from local persistence `[Existing]`
- Conflict resolution: if a shared value is updated by another team member while you have a local edit, show an "Edited" indicator and let the user choose to keep local or accept remote `[New — Postman Parity]`
- RBAC integration: Viewer role can view and use variables but cannot edit shared values; Editor role can create, edit, delete, and share variables `[Existing]`
- Real-time or near-real-time sync of shared variable changes across team members `[Existing]`

**Out of Scope**
- Environment forking and pull requests
- Fine-grained per-variable access control
- Audit log of variable changes
