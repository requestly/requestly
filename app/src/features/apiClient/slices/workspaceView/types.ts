import { EntityState } from "@reduxjs/toolkit";
import { Workspace, WorkspaceType } from "features/workspaces/types";

export enum ApiClientViewMode {
  SINGLE = "SINGLE",
  MULTI = "MULTI",
}

export type WorkspaceStatus =
  | { loading: true }
  | { loading: false; state: { success: true; result: null } | { success: false; error: string } };

export type WorkspaceMeta =
  | {
      type: WorkspaceType;
    }
  | {
      type: WorkspaceType.LOCAL;
      rootPath: Workspace["rootPath"];
    };

export interface WorkspaceInfo {
  id: string | null;
  meta: WorkspaceMeta;
}

export interface WorkspaceState extends WorkspaceInfo {
  status: WorkspaceStatus;
}

export interface WorkspaceViewState {
  isSetupDone: boolean;
  viewMode: ApiClientViewMode;
  selectedWorkspaces: EntityState<WorkspaceState>;
  fallbackWorkspaceId?: WorkspaceState["id"];
}
