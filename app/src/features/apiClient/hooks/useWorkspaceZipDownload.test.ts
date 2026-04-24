import { describe, it, expect, vi } from "vitest";

import { assembleWorkspaceZip, buildExportFileName } from "./useWorkspaceZipDownload";

// Mock-short-circuit the module-load chain — same pattern as useMigrationSegment.test.ts.
// Even though these tests only exercise pure functions, importing `./useWorkspaceZipDownload`
// transitively pulls in react-redux / feature hooks / logger (which touches `document` at
// module-load and crashes Vitest's Node env). Leave these mocks in place even if they
// look unused.
vi.mock("react-redux", () => ({ useSelector: vi.fn() }));
vi.mock("features/apiClient/slices/apiRecords/apiRecords.hooks", () => ({ useAllRecords: vi.fn() }));
vi.mock("features/apiClient/slices/environments/environments.hooks", () => ({
  useAllEnvironments: vi.fn(),
  useGlobalEnvironment: vi.fn(),
}));
vi.mock("features/apiClient/slices/workspaceView/helpers/ApiClientContextRegistry/hooks", () => ({
  useApiClientFeatureContext: vi.fn(),
}));
vi.mock("store/slices/workspaces/selectors", () => ({
  getWorkspaceById: vi.fn(),
  dummyPersonalWorkspace: { id: "dummy", name: "Private", workspaceType: "PERSONAL" },
}));
vi.mock("utils/DateTimeUtils", () => ({ getFormattedDate: vi.fn(() => "01_02_2026") }));
vi.mock("lib/logger", () => ({ default: { log: vi.fn(), error: vi.fn(), warn: vi.fn() } }));
vi.mock("actions/ExtensionActions", () => ({ getAPIResponse: vi.fn() }));
vi.mock("actions/DesktopActions", () => ({ getAPIResponse: vi.fn() }));
vi.mock("features/apiClient/screens/apiClient/utils", () => ({
  convertFlatRecordsToNestedRecords: vi.fn(() => ({ updatedRecords: [] })),
}));

describe("buildExportFileName", () => {
  it("slugifies the workspace name and appends a date", () => {
    const fileName = buildExportFileName("My Workspace!", () => "01_02_2026");
    expect(fileName).toBe("RQ-workspace-My-Workspace-export-01_02_2026.zip");
  });

  it("falls back to 'workspace' for empty / whitespace names", () => {
    expect(buildExportFileName("   ", () => "01_02_2026")).toBe("RQ-workspace-workspace-export-01_02_2026.zip");
    expect(buildExportFileName("", () => "01_02_2026")).toBe("RQ-workspace-workspace-export-01_02_2026.zip");
  });

  it("strips disallowed characters while keeping alphanumerics, hyphens, underscores", () => {
    expect(buildExportFileName("Team_42-Alpha", () => "01_02_2026")).toBe(
      "RQ-workspace-Team_42-Alpha-export-01_02_2026.zip"
    );
  });
});

describe("assembleWorkspaceZip", () => {
  it("returns a non-empty Uint8Array and zero counts for an empty workspace", () => {
    const result = assembleWorkspaceZip({
      rootRecords: [],
      environments: [],
    });
    expect(result.bytes).toBeInstanceOf(Uint8Array);
    expect(result.bytes.byteLength).toBeGreaterThan(0);
    expect(result.counts).toEqual({ collections: 0, apis: 0, examples: 0, environments: 0 });
  });
});
