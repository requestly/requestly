import { describe, it, expect, vi } from "vitest";

import { computeMigrationSegment } from "./useMigrationSegment";
import { WorkspaceType } from "features/workspaces/types";
import { ApiClientViewMode } from "features/apiClient/slices/workspaceView/types";

vi.mock("react-redux", () => ({ useSelector: vi.fn() }));
vi.mock("features/apiClient/slices/workspaceView/hooks", () => ({ useViewMode: vi.fn() }));
vi.mock("store/slices/workspaces/selectors", () => ({ getActiveWorkspace: vi.fn() }));

describe("computeMigrationSegment", () => {
  it("returns 'unknown' when workspaceType is undefined (hydrating)", () => {
    expect(computeMigrationSegment({ workspaceType: undefined, viewMode: ApiClientViewMode.SINGLE })).toBe("unknown");
  });

  it("returns 'auto-local-fs' when viewMode is MULTI (any workspaceType)", () => {
    expect(computeMigrationSegment({ workspaceType: WorkspaceType.PERSONAL, viewMode: ApiClientViewMode.MULTI })).toBe(
      "auto-local-fs"
    );
    expect(computeMigrationSegment({ workspaceType: WorkspaceType.LOCAL, viewMode: ApiClientViewMode.MULTI })).toBe(
      "auto-local-fs"
    );
    expect(computeMigrationSegment({ workspaceType: undefined, viewMode: ApiClientViewMode.MULTI })).toBe(
      "auto-local-fs"
    );
  });

  it("returns 'auto-local-fs' for SINGLE view on LOCAL workspace", () => {
    expect(computeMigrationSegment({ workspaceType: WorkspaceType.LOCAL, viewMode: ApiClientViewMode.SINGLE })).toBe(
      "auto-local-fs"
    );
  });

  it("returns 'local-storage' for SINGLE view on LOCAL_STORAGE workspace", () => {
    expect(
      computeMigrationSegment({ workspaceType: WorkspaceType.LOCAL_STORAGE, viewMode: ApiClientViewMode.SINGLE })
    ).toBe("local-storage");
  });

  it("returns 'auto-cloud' for SINGLE view on PERSONAL workspace", () => {
    expect(computeMigrationSegment({ workspaceType: WorkspaceType.PERSONAL, viewMode: ApiClientViewMode.SINGLE })).toBe(
      "auto-cloud"
    );
  });

  it("returns 'auto-cloud' for SINGLE view on SHARED workspace", () => {
    expect(computeMigrationSegment({ workspaceType: WorkspaceType.SHARED, viewMode: ApiClientViewMode.SINGLE })).toBe(
      "auto-cloud"
    );
  });

  it("returns 'local-storage' as the safety fallback for unrecognized workspaceType", () => {
    expect(
      computeMigrationSegment({
        workspaceType: "HYPOTHETICAL_FUTURE_TYPE" as any,
        viewMode: ApiClientViewMode.SINGLE,
      })
    ).toBe("local-storage");
  });
});
