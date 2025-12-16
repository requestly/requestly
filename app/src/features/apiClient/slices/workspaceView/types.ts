import { EntityState } from "@reduxjs/toolkit";
import { Workspace, WorkspaceType } from "features/workspaces/types";
import { RawResult } from "utils/try";

export enum ApiClientViewMode {
  SINGLE = "SINGLE",
  MULTI = "MULTI",
}

export type WorkspaceStatus = { loading: true } | { loading: false; state: RawResult<null> };

export interface WorkspaceState {
  id: string;
  meta:
    | {
        type: WorkspaceType;
      }
    | {
        type: WorkspaceType.LOCAL;
        rootPath: Workspace["rootPath"];
      };
  status: WorkspaceStatus;
}

export interface WorkspaceViewState {
  isSetupDone: boolean;
  viewMode: ApiClientViewMode;
  selectedWorkspaces: EntityState<WorkspaceState>;
}
