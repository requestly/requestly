import { describe, expect, it, vi } from "vitest";
import {
  WORKSPACE_COPY_ERROR_MESSAGE,
  WORKSPACE_INVITE_ERROR_MESSAGE,
  executeWorkspaceShareAction,
  isWorkspaceShareDropdownEnabled,
} from "./workspaceShareUtils";

describe("workspaceShareUtils", () => {
  it("enables the dropdown when private workspace adds a second destination", () => {
    expect(isWorkspaceShareDropdownEnabled([{ id: "workspace-1" }])).toBe(false);
    expect(
      isWorkspaceShareDropdownEnabled([
        { id: "workspace-1" },
        { id: "private-workspace" },
      ])
    ).toBe(true);
  });

  it("surfaces copy failures and always clears loading", async () => {
    const setIsLoading = vi.fn();
    const onSuccess = vi.fn();
    const onError = vi.fn();

    await executeWorkspaceShareAction({
      action: () => Promise.reject(new Error("copy failed")),
      errorMessage: WORKSPACE_COPY_ERROR_MESSAGE,
      onError,
      onSuccess,
      setIsLoading,
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(WORKSPACE_COPY_ERROR_MESSAGE);
    expect(setIsLoading.mock.calls).toEqual([[true], [false]]);
  });

  it("surfaces invite failures and always clears loading", async () => {
    const setIsLoading = vi.fn();
    const onSuccess = vi.fn();
    const onError = vi.fn();

    await executeWorkspaceShareAction({
      action: () => Promise.reject(new Error("invite failed")),
      errorMessage: WORKSPACE_INVITE_ERROR_MESSAGE,
      onError,
      onSuccess,
      setIsLoading,
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(WORKSPACE_INVITE_ERROR_MESSAGE);
    expect(setIsLoading.mock.calls).toEqual([[true], [false]]);
  });
});
