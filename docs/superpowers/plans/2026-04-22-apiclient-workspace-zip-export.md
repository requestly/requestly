# API Client Workspace ZIP Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Export workspace" button at the bottom of the API Client sidebar that downloads a zip containing `collections.json` and `environments.json` — every collection (with nested requests + examples) and every environment (including the global one) for the current workspace. Works for all workspace types incl. logged-out.

**Architecture:** Extract the existing single-collection/single-environment sanitize logic from `ApiClientExportModal.tsx` into a reusable module. Add a pure `buildWorkspaceExport` that takes already-hydrated records (examples inlined into `data.examples` by the existing tree hydration) + environments, plus `zipWorkspaceExport` that packages both JSON strings into a zip Blob via `fflate`. Drop a confirmation modal behind a new footer button in `SingleWorkspaceSidebar`.

**Tech Stack:** React + TypeScript, Ant Design (`Modal`, `Button`), Redux Toolkit selectors for record/env access, `fflate` (already installed) for zipping, `vitest` for unit tests.

**Spec:** `docs/superpowers/specs/2026-04-22-apiclient-workspace-zip-export-design.md`

---

## File Structure

**New files (paths relative to repo root):**
- `app/src/features/apiClient/helpers/exporters/requestly/sanitize.ts` — extracted pure helpers.
- `app/src/features/apiClient/helpers/exporters/requestly/sanitize.test.ts` — unit tests for extracted helpers.
- `app/src/features/apiClient/helpers/exporters/requestly/buildWorkspaceExport.ts` — combines records + envs into two JSON payloads.
- `app/src/features/apiClient/helpers/exporters/requestly/buildWorkspaceExport.test.ts`
- `app/src/features/apiClient/helpers/exporters/requestly/zipWorkspaceExport.ts` — wraps payloads into a zip Blob.
- `app/src/features/apiClient/helpers/exporters/requestly/zipWorkspaceExport.test.ts`
- `app/src/features/apiClient/screens/apiClient/components/modals/workspaceExportModal/WorkspaceExportModal.tsx` — confirmation modal.
- `app/src/features/apiClient/screens/apiClient/components/modals/workspaceExportModal/workspaceExportModal.scss` — minimal styles (reuse design system).
- `app/src/features/apiClient/screens/apiClient/components/sidebar/components/sidebarFooterActions/SidebarFooterActions.tsx` — footer component.
- `app/src/features/apiClient/screens/apiClient/components/sidebar/components/sidebarFooterActions/sidebarFooterActions.scss`.

**Modified:**
- `app/src/modules/analytics/events/features/constants.js` — add 3 event name constants.
- `app/src/modules/analytics/events/features/apiClient/index.js` — add 3 track functions.
- `app/src/features/apiClient/screens/apiClient/components/modals/exportModal/ApiClientExportModal.tsx` — delete the inline sanitize helpers; import from `sanitize.ts`.
- `app/src/features/apiClient/screens/apiClient/components/sidebar/SingleWorkspaceSidebar/SingleWorkspaceSidebar.tsx` — mount `<SidebarFooterActions />` below `<ErrorFilesList />`.

---

## Task 1: Extract sanitize helpers from ApiClientExportModal

Moves `sanitizeRecord`, `sanitizeRecords` and the environment mapping out of the modal so both the existing per-collection/per-env export and the new workspace export call the same code. Behavior stays identical.

**Files:**
- Create: `app/src/features/apiClient/helpers/exporters/requestly/sanitize.ts`
- Create: `app/src/features/apiClient/helpers/exporters/requestly/sanitize.test.ts`
- Modify: `app/src/features/apiClient/screens/apiClient/components/modals/exportModal/ApiClientExportModal.tsx` — remove lines 70–103 (the inline helpers), import from the new module.

- [ ] **Step 1: Write the failing tests**

Create `app/src/features/apiClient/helpers/exporters/requestly/sanitize.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { sanitizeRecord, sanitizeRecords, sanitizeEnvironments } from "./sanitize";
import { RQAPI } from "features/apiClient/types";

describe("sanitizeRecord", () => {
  it("strips createdBy, updatedBy, ownerId, createdTs, updatedTs", () => {
    const record = {
      id: "r1",
      name: "Hello",
      type: RQAPI.RecordType.API,
      collectionId: "c1",
      createdBy: "user-1",
      updatedBy: "user-1",
      ownerId: "user-1",
      createdTs: 123,
      updatedTs: 456,
      data: { request: {}, response: null, auth: { currentAuthType: "NO_AUTH" } },
    } as any;

    const result = sanitizeRecord(record);

    expect(result).not.toHaveProperty("createdBy");
    expect(result).not.toHaveProperty("updatedBy");
    expect(result).not.toHaveProperty("ownerId");
    expect(result).not.toHaveProperty("createdTs");
    expect(result).not.toHaveProperty("updatedTs");
    expect(result.id).toBe("r1");
  });

  it("does not strip data.examples from API records", () => {
    const record = {
      id: "r1",
      type: RQAPI.RecordType.API,
      collectionId: "c1",
      createdBy: "user-1",
      data: {
        request: {},
        response: null,
        auth: { currentAuthType: "NO_AUTH" },
        examples: [{ id: "ex1", type: RQAPI.RecordType.EXAMPLE_API, parentRequestId: "r1", data: {} }],
      },
    } as any;

    const result = sanitizeRecord(record) as any;

    expect(result.data.examples).toHaveLength(1);
    expect(result.data.examples[0].id).toBe("ex1");
  });
});

describe("sanitizeRecords", () => {
  it("flattens a nested collection tree into a single array, preserving order", () => {
    const tree = {
      id: "col1",
      type: RQAPI.RecordType.COLLECTION,
      collectionId: null,
      name: "Root",
      data: {
        auth: { currentAuthType: "NO_AUTH" },
        variables: {},
        children: [
          { id: "api1", type: RQAPI.RecordType.API, collectionId: "col1", data: { request: {}, response: null, auth: { currentAuthType: "NO_AUTH" } } },
          {
            id: "col2",
            type: RQAPI.RecordType.COLLECTION,
            collectionId: "col1",
            data: { auth: { currentAuthType: "NO_AUTH" }, variables: {}, children: [
              { id: "api2", type: RQAPI.RecordType.API, collectionId: "col2", data: { request: {}, response: null, auth: { currentAuthType: "NO_AUTH" } } },
            ] },
          },
        ],
      },
    } as any;

    const result = sanitizeRecords(tree);
    const ids = result.map((r: any) => r.id);

    expect(ids).toEqual(["col1", "api1", "col2", "api2"]);
  });

  it("strips children from the emitted collection node", () => {
    const tree = {
      id: "col1",
      type: RQAPI.RecordType.COLLECTION,
      collectionId: null,
      data: { auth: { currentAuthType: "NO_AUTH" }, variables: {}, children: [] },
    } as any;

    const result = sanitizeRecords(tree);

    expect((result[0] as any).data).not.toHaveProperty("children");
  });
});

describe("sanitizeEnvironments", () => {
  it("strips localValue from every variable and tags isGlobal correctly", () => {
    const envs = [
      {
        id: "env1",
        name: "Local",
        variables: {
          API_KEY: { syncValue: "s", localValue: "l", type: "string" },
        },
      },
      {
        id: "GLOBAL_ENVIRONMENT",
        name: "Global",
        variables: {
          HOST: { syncValue: "api.example.com", localValue: "api.local", type: "string" },
        },
      },
    ] as any;

    const result = sanitizeEnvironments(envs);

    expect(result[0].variables.API_KEY).not.toHaveProperty("localValue");
    expect(result[0].variables.API_KEY).toHaveProperty("syncValue", "s");
    expect(result[0].isGlobal).toBe(false);
    expect(result[1].isGlobal).toBe(true);
    expect(result[1].variables.HOST).not.toHaveProperty("localValue");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd app && npx vitest run src/features/apiClient/helpers/exporters/requestly/sanitize.test.ts`

Expected: FAIL with "Cannot find module './sanitize'" or similar.

- [ ] **Step 3: Create the sanitize module**

Create `app/src/features/apiClient/helpers/exporters/requestly/sanitize.ts`:

```ts
import { omit } from "lodash";
import { RQAPI } from "features/apiClient/types";
import { EnvironmentData } from "backend/environment/types";
import { isGlobalEnvironment } from "features/apiClient/screens/environment/utils";

export type ExportRecord = Omit<
  RQAPI.ApiClientRecord,
  "createdBy" | "updatedBy" | "ownerId" | "createdTs" | "updatedTs"
>;

const METADATA_FIELDS_TO_STRIP = ["createdBy", "updatedBy", "ownerId", "createdTs", "updatedTs"] as const;

/**
 * Strips user/timestamp metadata from a record's top level. Does not touch
 * the `data` field — examples nested under `data.examples` are preserved.
 */
export function sanitizeRecord(record: RQAPI.ApiClientRecord): ExportRecord {
  return omit(record, METADATA_FIELDS_TO_STRIP) as ExportRecord;
}

/**
 * Walks a hydrated collection tree and returns a flat array of sanitized
 * records in depth-first order. The emitted collection node has its
 * `data.children` stripped; API records keep their `data.examples` intact.
 */
export function sanitizeRecords(collection: RQAPI.CollectionRecord): ExportRecord[] {
  const records: ExportRecord[] = [];

  records.push(sanitizeRecord({ ...collection, data: omit(collection.data, "children") }) as ExportRecord);

  if (collection.data.children) {
    collection.data.children.forEach((record: RQAPI.ApiClientRecord) => {
      if (record.type === RQAPI.RecordType.API) {
        records.push(sanitizeRecord(record));
      } else if (record.type === RQAPI.RecordType.COLLECTION) {
        records.push(...sanitizeRecords(record as RQAPI.CollectionRecord));
      }
    });
  }

  return records;
}

/**
 * Processes environments the same way `ApiClientExportModal` does today:
 * strips `localValue` from every variable and tags each environment with
 * `isGlobal` based on its id.
 */
export function sanitizeEnvironments(environments: EnvironmentData[]): (EnvironmentData & { isGlobal: boolean })[] {
  return environments.map((env) => {
    const updatedVariables = Object.keys(env.variables).reduce((acc, key) => {
      const { localValue, ...rest } = env.variables[key] as any;
      acc[key] = rest;
      return acc;
    }, {} as typeof env.variables);

    return { ...env, variables: updatedVariables, isGlobal: isGlobalEnvironment(env.id) };
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd app && npx vitest run src/features/apiClient/helpers/exporters/requestly/sanitize.test.ts`

Expected: PASS. All tests green.

- [ ] **Step 5: Refactor ApiClientExportModal to use the shared helpers**

Edit `app/src/features/apiClient/screens/apiClient/components/modals/exportModal/ApiClientExportModal.tsx`:

Replace the top-level imports at lines 1–17 (keep everything except the `omit` import from lodash and the `isGlobalEnvironment` import — both now encapsulated by `sanitize.ts`):

```tsx
import React, { useCallback, useEffect, useState } from "react";
import { Modal } from "antd";
import { RQAPI } from "features/apiClient/types";
import { getFormattedDate } from "utils/DateTimeUtils";
import "./apiClientExportModal.scss";
import fileDownload from "js-file-download";
import { EnvironmentData } from "backend/environment/types";
import { isApiCollection } from "../../../utils";
import {
  trackEnvironmentExported,
  trackExportApiCollectionsFailed,
  trackExportCollectionsClicked,
} from "modules/analytics/events/features/apiClient";
import { MdOutlineIosShare } from "@react-icons/all-files/md/MdOutlineIosShare";
import { ExportRecord, sanitizeRecord, sanitizeRecords, sanitizeEnvironments } from "features/apiClient/helpers/exporters/requestly/sanitize";
```

Delete the inline definitions:
- Lines 36 `type ExportRecord = …` (now imported).
- Lines 70–71 `const sanitizeRecord = …`.
- Lines 73–91 `const sanitizeRecords = useCallback…`.
- Lines 93–103 `const processEnvironments = useCallback…`.

Update the `useEffect` at lines 105–123 to call the imported helpers directly:

```tsx
useEffect(() => {
  if (!isOpen || isApiRecordsProcessed) return;

  if (exportType === "collection") {
    const recordsToExport: ExportRecord[] = [];

    recordsToBeExported.forEach((record) => {
      if (isApiCollection(record)) {
        recordsToExport.push(...sanitizeRecords(record));
      } else {
        recordsToExport.push({ ...sanitizeRecord(record), collectionId: "" } as ExportRecord);
      }
    });

    setExportData({ records: recordsToExport });
  } else {
    setExportData({ environments: sanitizeEnvironments(environments) });
  }
  setIsApiRecordsProcessed(true);
}, [
  isOpen,
  recordsToBeExported,
  environments,
  isApiRecordsProcessed,
  exportType,
]);
```

Remove the two no-longer-used dependencies (`sanitizeRecords`, `processEnvironments`) from the useCallback deps.

- [ ] **Step 6: Type-check**

Run: `cd app && npx tsc --noEmit`

Expected: no new errors introduced by the refactor. If the original file had pre-existing type errors elsewhere in the codebase, they are unrelated and fine to ignore.

- [ ] **Step 7: Commit**

```bash
git add app/src/features/apiClient/helpers/exporters/requestly/sanitize.ts \
        app/src/features/apiClient/helpers/exporters/requestly/sanitize.test.ts \
        app/src/features/apiClient/screens/apiClient/components/modals/exportModal/ApiClientExportModal.tsx
git commit -m "refactor(apiClient): extract export sanitize helpers into shared module"
```

---

## Task 2: buildWorkspaceExport — combine records + environments into two JSON payloads

Pure function. Given the already-hydrated top-level records (collections with `data.children`, APIs with `data.examples` inlined) and the environment list, produces the two JSON objects that end up in the zip.

**Files:**
- Create: `app/src/features/apiClient/helpers/exporters/requestly/buildWorkspaceExport.ts`
- Create: `app/src/features/apiClient/helpers/exporters/requestly/buildWorkspaceExport.test.ts`

- [ ] **Step 1: Write the failing test**

Create `buildWorkspaceExport.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildWorkspaceExport, WORKSPACE_EXPORT_SCHEMA_VERSION } from "./buildWorkspaceExport";
import { RQAPI } from "features/apiClient/types";

function makeCollection(id: string, children: any[] = []): RQAPI.CollectionRecord {
  return {
    id,
    name: id,
    type: RQAPI.RecordType.COLLECTION,
    collectionId: null,
    data: { auth: { currentAuthType: "NO_AUTH" }, variables: {}, children },
  } as any;
}

function makeApi(id: string, collectionId: string | null, examples: any[] = []): RQAPI.ApiRecord {
  return {
    id,
    name: id,
    type: RQAPI.RecordType.API,
    collectionId,
    data: {
      request: { url: "https://example.com", method: "GET" },
      response: null,
      auth: { currentAuthType: "NO_AUTH" },
      examples,
    },
  } as any;
}

describe("buildWorkspaceExport", () => {
  it("emits schema_version 1.0.0 on both payloads", () => {
    const result = buildWorkspaceExport({ rootRecords: [], environments: [] });

    expect(result.collectionsJson.schema_version).toBe(WORKSPACE_EXPORT_SCHEMA_VERSION);
    expect(result.environmentsJson.schema_version).toBe(WORKSPACE_EXPORT_SCHEMA_VERSION);
    expect(WORKSPACE_EXPORT_SCHEMA_VERSION).toBe("1.0.0");
  });

  it("flattens every collection tree and preserves data.examples on API records", () => {
    const example = { id: "ex1", type: RQAPI.RecordType.EXAMPLE_API, parentRequestId: "api1", data: {} };
    const api = makeApi("api1", "col1", [example]);
    const collection = makeCollection("col1", [api]);

    const result = buildWorkspaceExport({ rootRecords: [collection], environments: [] });

    const ids = result.collectionsJson.records.map((r: any) => r.id);
    expect(ids).toEqual(["col1", "api1"]);
    const apiRecord = result.collectionsJson.records.find((r: any) => r.id === "api1") as any;
    expect(apiRecord.data.examples).toHaveLength(1);
    expect(apiRecord.data.examples[0].id).toBe("ex1");
  });

  it("handles root-level API records (not inside any collection)", () => {
    const rootApi = makeApi("api1", null);

    const result = buildWorkspaceExport({ rootRecords: [rootApi], environments: [] });

    expect(result.collectionsJson.records.map((r: any) => r.id)).toEqual(["api1"]);
  });

  it("includes every environment and tags the global one with isGlobal: true", () => {
    const envs = [
      { id: "env1", name: "Dev", variables: { K: { syncValue: "v", type: "string" } } },
      { id: "GLOBAL_ENVIRONMENT", name: "Global", variables: {} },
    ] as any;

    const result = buildWorkspaceExport({ rootRecords: [], environments: envs });

    expect(result.environmentsJson.environments).toHaveLength(2);
    expect(result.environmentsJson.environments.find((e: any) => e.id === "GLOBAL_ENVIRONMENT").isGlobal).toBe(true);
    expect(result.environmentsJson.environments.find((e: any) => e.id === "env1").isGlobal).toBe(false);
  });

  it("returns counts (collections, apis, environments) for UI preview", () => {
    const rootApi = makeApi("api0", null);
    const nested = makeApi("api1", "col1");
    const collection = makeCollection("col1", [nested]);

    const result = buildWorkspaceExport({
      rootRecords: [collection, rootApi],
      environments: [{ id: "env1", name: "Dev", variables: {} }] as any,
    });

    expect(result.counts).toEqual({ collections: 1, apis: 2, environments: 1 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd app && npx vitest run src/features/apiClient/helpers/exporters/requestly/buildWorkspaceExport.test.ts`

Expected: FAIL with "Cannot find module './buildWorkspaceExport'".

- [ ] **Step 3: Implement buildWorkspaceExport**

Create `app/src/features/apiClient/helpers/exporters/requestly/buildWorkspaceExport.ts`:

```ts
import { RQAPI } from "features/apiClient/types";
import { EnvironmentData } from "backend/environment/types";
import { ExportRecord, sanitizeRecord, sanitizeRecords, sanitizeEnvironments } from "./sanitize";

export const WORKSPACE_EXPORT_SCHEMA_VERSION = "1.0.0";

export interface CollectionsExportJson {
  schema_version: string;
  records: ExportRecord[];
}

export interface EnvironmentsExportJson {
  schema_version: string;
  environments: (EnvironmentData & { isGlobal: boolean })[];
}

export interface WorkspaceExportCounts {
  collections: number;
  apis: number;
  environments: number;
}

export interface WorkspaceExportPayload {
  collectionsJson: CollectionsExportJson;
  environmentsJson: EnvironmentsExportJson;
  counts: WorkspaceExportCounts;
}

export interface BuildWorkspaceExportInput {
  /**
   * Top-level records pulled from the hydrated API Client store (typically via
   * `useRootRecords()`). Collections must already have `data.children`
   * populated and API records must have their examples inlined under
   * `data.examples` — both conditions are met after the standard tree
   * hydration step.
   */
  rootRecords: RQAPI.ApiClientRecord[];
  /** All environments (including global). */
  environments: EnvironmentData[];
}

export function buildWorkspaceExport(input: BuildWorkspaceExportInput): WorkspaceExportPayload {
  const { rootRecords, environments } = input;

  const records: ExportRecord[] = [];
  let collectionCount = 0;
  let apiCount = 0;

  rootRecords.forEach((record) => {
    if (record.type === RQAPI.RecordType.COLLECTION) {
      records.push(...sanitizeRecords(record as RQAPI.CollectionRecord));
    } else if (record.type === RQAPI.RecordType.API) {
      records.push({ ...sanitizeRecord(record), collectionId: "" } as ExportRecord);
    }
  });

  records.forEach((r) => {
    if ((r as any).type === RQAPI.RecordType.COLLECTION) collectionCount += 1;
    if ((r as any).type === RQAPI.RecordType.API) apiCount += 1;
  });

  const sanitizedEnvs = sanitizeEnvironments(environments);

  return {
    collectionsJson: { schema_version: WORKSPACE_EXPORT_SCHEMA_VERSION, records },
    environmentsJson: { schema_version: WORKSPACE_EXPORT_SCHEMA_VERSION, environments: sanitizedEnvs },
    counts: { collections: collectionCount, apis: apiCount, environments: sanitizedEnvs.length },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd app && npx vitest run src/features/apiClient/helpers/exporters/requestly/buildWorkspaceExport.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/src/features/apiClient/helpers/exporters/requestly/buildWorkspaceExport.ts \
        app/src/features/apiClient/helpers/exporters/requestly/buildWorkspaceExport.test.ts
git commit -m "feat(apiClient): add buildWorkspaceExport to assemble workspace JSON payloads"
```

---

## Task 3: zipWorkspaceExport — package payloads into a zip Blob

Thin wrapper around `fflate.zipSync`. Round-trip test verifies both files land in the zip and survive unzip.

**Files:**
- Create: `app/src/features/apiClient/helpers/exporters/requestly/zipWorkspaceExport.ts`
- Create: `app/src/features/apiClient/helpers/exporters/requestly/zipWorkspaceExport.test.ts`

- [ ] **Step 1: Write the failing test**

Create `zipWorkspaceExport.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { unzipSync, strFromU8 } from "fflate";
import { zipWorkspaceExport, WORKSPACE_ZIP_FILENAMES } from "./zipWorkspaceExport";

describe("zipWorkspaceExport", () => {
  const payload = {
    collectionsJson: { schema_version: "1.0.0", records: [{ id: "c1" }] },
    environmentsJson: { schema_version: "1.0.0", environments: [{ id: "e1", isGlobal: false, name: "Dev", variables: {} }] },
    counts: { collections: 1, apis: 0, environments: 1 },
  } as any;

  it("returns a Uint8Array containing both files", () => {
    const bytes = zipWorkspaceExport(payload);

    expect(bytes).toBeInstanceOf(Uint8Array);

    const unzipped = unzipSync(bytes);
    expect(Object.keys(unzipped).sort()).toEqual(["collections.json", "environments.json"]);
  });

  it("produces valid JSON with the correct shape and schema_version", () => {
    const unzipped = unzipSync(zipWorkspaceExport(payload));

    const collections = JSON.parse(strFromU8(unzipped[WORKSPACE_ZIP_FILENAMES.collections]));
    const environments = JSON.parse(strFromU8(unzipped[WORKSPACE_ZIP_FILENAMES.environments]));

    expect(collections.schema_version).toBe("1.0.0");
    expect(collections.records).toEqual([{ id: "c1" }]);
    expect(environments.schema_version).toBe("1.0.0");
    expect(environments.environments).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd app && npx vitest run src/features/apiClient/helpers/exporters/requestly/zipWorkspaceExport.test.ts`

Expected: FAIL with "Cannot find module './zipWorkspaceExport'".

- [ ] **Step 3: Implement zipWorkspaceExport**

Create `app/src/features/apiClient/helpers/exporters/requestly/zipWorkspaceExport.ts`:

```ts
import { strToU8, zipSync } from "fflate";
import { WorkspaceExportPayload } from "./buildWorkspaceExport";

export const WORKSPACE_ZIP_FILENAMES = {
  collections: "collections.json",
  environments: "environments.json",
} as const;

/**
 * Packages a `WorkspaceExportPayload` into a zip and returns the raw bytes.
 * Callers are responsible for wrapping the result in a `Blob` and triggering
 * the browser download.
 */
export function zipWorkspaceExport(payload: WorkspaceExportPayload): Uint8Array {
  const files: Record<string, Uint8Array> = {
    [WORKSPACE_ZIP_FILENAMES.collections]: strToU8(JSON.stringify(payload.collectionsJson, null, 2)),
    [WORKSPACE_ZIP_FILENAMES.environments]: strToU8(JSON.stringify(payload.environmentsJson, null, 2)),
  };

  return zipSync(files);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd app && npx vitest run src/features/apiClient/helpers/exporters/requestly/zipWorkspaceExport.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/src/features/apiClient/helpers/exporters/requestly/zipWorkspaceExport.ts \
        app/src/features/apiClient/helpers/exporters/requestly/zipWorkspaceExport.test.ts
git commit -m "feat(apiClient): add zipWorkspaceExport using fflate"
```

---

## Task 4: Add analytics events for workspace export

Three events to mirror the existing export-collection analytics trio.

**Files:**
- Modify: `app/src/modules/analytics/events/features/constants.js`
- Modify: `app/src/modules/analytics/events/features/apiClient/index.js`

- [ ] **Step 1: Add event name constants**

In `app/src/modules/analytics/events/features/constants.js`, find the `API_CLIENT = { ... }` block (around line 189) and insert after the existing `EXPORT_COLLECTIONS_*` entries (line 193):

```js
  EXPORT_WORKSPACE_STARTED: "api_client_export_workspace_started",
  EXPORT_WORKSPACE_SUCCESSFUL: "api_client_export_workspace_successful",
  EXPORT_WORKSPACE_FAILED: "api_client_export_workspace_failed",
```

- [ ] **Step 2: Add track functions**

In `app/src/modules/analytics/events/features/apiClient/index.js`, add near the other export tracking functions:

```js
export const trackWorkspaceExportStarted = (params) => {
  trackEvent(API_CLIENT.EXPORT_WORKSPACE_STARTED, params);
};

export const trackWorkspaceExportSuccessful = (params) => {
  trackEvent(API_CLIENT.EXPORT_WORKSPACE_SUCCESSFUL, params);
};

export const trackWorkspaceExportFailed = (params) => {
  trackEvent(API_CLIENT.EXPORT_WORKSPACE_FAILED, params);
};
```

- [ ] **Step 3: Verify import path compiles**

Run: `cd app && npx tsc --noEmit 2>&1 | grep -E "workspaceExport|trackWorkspaceExport" || echo "no errors"`

Expected: `no errors`.

- [ ] **Step 4: Commit**

```bash
git add app/src/modules/analytics/events/features/constants.js \
        app/src/modules/analytics/events/features/apiClient/index.js
git commit -m "feat(apiClient): add analytics events for workspace export"
```

---

## Task 5: WorkspaceExportModal — confirmation + download

Modal that shows counts, builds the zip on confirm, triggers the browser download.

**Files:**
- Create: `app/src/features/apiClient/screens/apiClient/components/modals/workspaceExportModal/WorkspaceExportModal.tsx`
- Create: `app/src/features/apiClient/screens/apiClient/components/modals/workspaceExportModal/workspaceExportModal.scss`

- [ ] **Step 1: Create the SCSS file**

Create `app/src/features/apiClient/screens/apiClient/components/modals/workspaceExportModal/workspaceExportModal.scss`:

```scss
.workspace-export-modal {
  .workspace-export-modal__counts {
    display: flex;
    gap: 16px;
    margin: 16px 0;
    font-size: 13px;
    color: var(--requestly-color-text-subtle);

    .count-item {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .count-value {
        font-size: 20px;
        font-weight: 600;
        color: var(--requestly-color-text-default);
      }

      .count-label {
        text-transform: uppercase;
        letter-spacing: 0.4px;
        font-size: 11px;
      }
    }
  }

  .workspace-export-modal__error {
    margin-top: 12px;
    color: var(--requestly-color-error);
    font-size: 12px;
  }
}
```

- [ ] **Step 2: Implement the modal**

Create `app/src/features/apiClient/screens/apiClient/components/modals/workspaceExportModal/WorkspaceExportModal.tsx`:

```tsx
import React, { useCallback, useMemo, useState } from "react";
import { Modal } from "antd";
import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import { getFormattedDate } from "utils/DateTimeUtils";
import { useRootRecords } from "features/apiClient/slices/apiRecords/apiRecords.hooks";
import { useAllEnvironments } from "features/apiClient/slices/environments/environments.hooks";
import { parseEnvironmentEntityToData } from "features/apiClient/slices/environments/utils";
import { buildWorkspaceExport } from "features/apiClient/helpers/exporters/requestly/buildWorkspaceExport";
import { zipWorkspaceExport } from "features/apiClient/helpers/exporters/requestly/zipWorkspaceExport";
import {
  trackWorkspaceExportStarted,
  trackWorkspaceExportSuccessful,
  trackWorkspaceExportFailed,
} from "modules/analytics/events/features/apiClient";
import "./workspaceExportModal.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workspaceName: string;
}

function slugifyWorkspaceName(name: string): string {
  const slug = name.trim().replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : "workspace";
}

function triggerBrowserDownload(bytes: Uint8Array, fileName: string) {
  const blob = new Blob([bytes], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const WorkspaceExportModal: React.FC<Props> = ({ isOpen, onClose, workspaceName }) => {
  const rootRecords = useRootRecords();
  const allEnvironments = useAllEnvironments();

  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payload = useMemo(() => {
    const environments = allEnvironments.map(parseEnvironmentEntityToData);
    return buildWorkspaceExport({ rootRecords, environments });
  }, [rootRecords, allEnvironments]);

  const isEmpty =
    payload.counts.collections === 0 &&
    payload.counts.apis === 0 &&
    payload.counts.environments === 0;

  const handleExport = useCallback(async () => {
    setError(null);
    setIsExporting(true);
    trackWorkspaceExportStarted({
      collections: payload.counts.collections,
      apis: payload.counts.apis,
      environments: payload.counts.environments,
    });

    try {
      const bytes = zipWorkspaceExport(payload);
      const fileName = `RQ-workspace-${slugifyWorkspaceName(workspaceName)}-export-${getFormattedDate("DD_MM_YYYY")}.zip`;
      triggerBrowserDownload(bytes, fileName);
      trackWorkspaceExportSuccessful({ zipSizeBytes: bytes.byteLength });
      onClose();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
      trackWorkspaceExportFailed({ errorType: message });
    } finally {
      setIsExporting(false);
    }
  }, [payload, workspaceName, onClose]);

  const handleCancel = useCallback(() => {
    if (isExporting) return;
    onClose();
  }, [isExporting, onClose]);

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <MdOutlineFileDownload />
          <span>Export workspace · {workspaceName}</span>
        </div>
      }
      open={isOpen}
      onCancel={handleCancel}
      closable={!isExporting}
      maskClosable={!isExporting}
      onOk={handleExport}
      okText="Export as ZIP"
      okButtonProps={{ loading: isExporting, disabled: isEmpty }}
      cancelButtonProps={{ disabled: isExporting }}
      className="custom-rq-modal workspace-export-modal"
    >
      {isEmpty ? (
        <div>Nothing to export — this workspace has no collections or environments.</div>
      ) : (
        <>
          <div>The exported ZIP will contain:</div>
          <div className="workspace-export-modal__counts">
            <div className="count-item">
              <span className="count-value">{payload.counts.collections}</span>
              <span className="count-label">Collections</span>
            </div>
            <div className="count-item">
              <span className="count-value">{payload.counts.apis}</span>
              <span className="count-label">Requests</span>
            </div>
            <div className="count-item">
              <span className="count-value">{payload.counts.environments}</span>
              <span className="count-label">Environments (incl. global)</span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "var(--requestly-color-text-subtle)" }}>
            Examples saved under requests are included.
          </div>
        </>
      )}
      {error && <div className="workspace-export-modal__error">Export failed: {error}</div>}
    </Modal>
  );
};
```

- [ ] **Step 3: Type-check**

Run: `cd app && npx tsc --noEmit 2>&1 | grep WorkspaceExportModal || echo "no errors"`

Expected: `no errors`.

- [ ] **Step 4: Commit**

```bash
git add app/src/features/apiClient/screens/apiClient/components/modals/workspaceExportModal/
git commit -m "feat(apiClient): add WorkspaceExportModal with counts preview and zip download"
```

---

## Task 6: SidebarFooterActions component

A thin component holding the Export workspace button. Kept separate so future footer actions have an obvious home.

**Files:**
- Create: `app/src/features/apiClient/screens/apiClient/components/sidebar/components/sidebarFooterActions/SidebarFooterActions.tsx`
- Create: `app/src/features/apiClient/screens/apiClient/components/sidebar/components/sidebarFooterActions/sidebarFooterActions.scss`

- [ ] **Step 1: Create the SCSS file**

Create `app/src/features/apiClient/screens/apiClient/components/sidebar/components/sidebarFooterActions/sidebarFooterActions.scss`:

```scss
.sidebar-footer-actions {
  border-top: 1px solid var(--requestly-color-surface-2);
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .sidebar-footer-actions__button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    padding: 6px 8px;
    background: transparent;
    border: none;
    color: var(--requestly-color-text-default);
    font-size: 12px;
    cursor: pointer;
    border-radius: 4px;

    &:hover:not(:disabled) {
      background: var(--requestly-color-surface-2);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
```

- [ ] **Step 2: Implement the component**

Create `app/src/features/apiClient/screens/apiClient/components/sidebar/components/sidebarFooterActions/SidebarFooterActions.tsx`:

```tsx
import React, { useState, useMemo } from "react";
import { Tooltip } from "antd";
import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import { useRootRecords } from "features/apiClient/slices/apiRecords/apiRecords.hooks";
import { useAllEnvironments } from "features/apiClient/slices/environments/environments.hooks";
import { useGetSingleModeWorkspace } from "features/apiClient/slices/workspaceView/hooks";
import { WorkspaceExportModal } from "../../../modals/workspaceExportModal/WorkspaceExportModal";
import "./sidebarFooterActions.scss";

export const SidebarFooterActions: React.FC = () => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const rootRecords = useRootRecords();
  const allEnvironments = useAllEnvironments();
  const workspace = useGetSingleModeWorkspace();

  const workspaceName = workspace?.name ?? "Workspace";

  const isEmpty = useMemo(
    () => rootRecords.length === 0 && allEnvironments.length === 0,
    [rootRecords.length, allEnvironments.length]
  );

  return (
    <>
      <div className="sidebar-footer-actions">
        <Tooltip
          title={isEmpty ? "Nothing to export" : "Download all collections and environments as a zip"}
          placement="top"
        >
          <button
            type="button"
            className="sidebar-footer-actions__button"
            disabled={isEmpty}
            onClick={() => setIsExportModalOpen(true)}
          >
            <MdOutlineFileDownload size={16} />
            <span>Export workspace</span>
          </button>
        </Tooltip>
      </div>

      {isExportModalOpen && (
        <WorkspaceExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          workspaceName={workspaceName}
        />
      )}
    </>
  );
};
```

Note on `useGetSingleModeWorkspace`: the selector throws in multi-view mode, so this component must only ever be mounted inside `SingleWorkspaceSidebar` (which is gated by `viewMode === SINGLE` in `APIClientSidebar.tsx`). Task 7 only mounts it there.

- [ ] **Step 3: Type-check**

Run: `cd app && npx tsc --noEmit 2>&1 | grep SidebarFooterActions || echo "no errors"`

Expected: `no errors`. If the `workspace.name` path on `ApiClientFeatureContext` is wrong, the tsc error will point you at the correct property. Adjust to read the workspace name from whatever the context exposes (`ctx.workspace.name`, `ctx.workspaceName`, etc.).

- [ ] **Step 4: Commit**

```bash
git add app/src/features/apiClient/screens/apiClient/components/sidebar/components/sidebarFooterActions/
git commit -m "feat(apiClient): add SidebarFooterActions with Export workspace button"
```

---

## Task 7: Mount SidebarFooterActions in SingleWorkspaceSidebar

Wires up the new footer component below the existing `<ErrorFilesList />`.

**Files:**
- Modify: `app/src/features/apiClient/screens/apiClient/components/sidebar/SingleWorkspaceSidebar/SingleWorkspaceSidebar.tsx`

- [ ] **Step 1: Add import**

In `SingleWorkspaceSidebar.tsx`, add below the existing sidebar component imports (near line 20 where `ErrorFilesList` is imported):

```tsx
import { SidebarFooterActions } from "../components/sidebarFooterActions/SidebarFooterActions";
```

- [ ] **Step 2: Mount the component**

In the JSX around line 257, change:

```tsx
        <ErrorFilesList />
      </div>
```

To:

```tsx
        <ErrorFilesList />
        <SidebarFooterActions />
      </div>
```

(The `<SidebarFooterActions />` sits inside `.api-client-sidebar`, not inside `.api-client-sidebar-content`, so it anchors to the bottom of the sidebar — same layout level as `<ErrorFilesList />`.)

- [ ] **Step 3: Type-check**

Run: `cd app && npx tsc --noEmit 2>&1 | grep SingleWorkspaceSidebar || echo "no errors"`

Expected: `no errors`.

- [ ] **Step 4: Start the dev server and smoke test**

Run: `cd app && npm start` (or whatever dev script the project uses — check `package.json` scripts if unsure).

In the browser:
- [ ] Button appears at the bottom of the API Client secondary sidebar.
- [ ] Button stays visible across tabs (Collections, Environments, History, Runtime Variables).
- [ ] Click opens the modal with non-zero counts.
- [ ] "Export as ZIP" downloads `RQ-workspace-<name>-export-<date>.zip`.
- [ ] Unzip the file and confirm `collections.json` and `environments.json` exist and are valid JSON with `schema_version: "1.0.0"`.
- [ ] Open a collection-containing request that has a saved example; confirm the example is present in `collections.json` under the API record's `data.examples` array.
- [ ] Confirm the global environment appears in `environments.json` with `isGlobal: true`.
- [ ] Repeat smoke test against at least two workspace types. Easiest split:
  - Personal / shared cloud (log in on web).
  - Local storage (log out in web).
  - Local filesystem (run in desktop app with a local workspace). If the desktop app isn't set up on the dev machine, skip this one and note in the PR.

- [ ] **Step 5: Commit**

```bash
git add app/src/features/apiClient/screens/apiClient/components/sidebar/SingleWorkspaceSidebar/SingleWorkspaceSidebar.tsx
git commit -m "feat(apiClient): mount workspace export button in sidebar footer"
```

---

## Final validation

- [ ] Run the full test suite to confirm nothing broke: `cd app && npx vitest run src/features/apiClient/helpers/exporters/requestly`
- [ ] Type-check the whole app: `cd app && npx tsc --noEmit`
- [ ] Manual regression: export a single collection via the existing right-click → Export Requestly flow and confirm the output is byte-identical to before the refactor (same records, same shape). Any drift is a regression from Task 1.

When all checks are green, the branch is ready for PR review.
