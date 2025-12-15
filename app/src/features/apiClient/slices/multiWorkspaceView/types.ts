import { EntityState } from "@reduxjs/toolkit";
import { RawResult } from "utils/try";

export enum ApiClientViewMode {
  SINGLE = "SINGLE",
  MULTI = "MULTI",
}

export type WorkspaceState = { loading: true } | { loading: false; state: RawResult<null> };

export interface WorkspaceViewState {
  id: string;
  state: WorkspaceState;
}

export interface MultiWorkspaceViewState {
  viewMode: ApiClientViewMode;
  selectedWorkspaces: EntityState<WorkspaceViewState>;
}
