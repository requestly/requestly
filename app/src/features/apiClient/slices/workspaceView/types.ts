import { EntityState } from "@reduxjs/toolkit";
import { Workspace, WorkspaceType } from "features/workspaces/types";
import { RawResult } from "utils/try";

export enum ApiClientViewMode {
  SINGLE = "SINGLE",
  MULTI = "MULTI",
}

export type WorkspaceStatus = { loading: true } | { loading: false; state: RawResult<null> };

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
}
