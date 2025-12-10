import { EntityState } from "@reduxjs/toolkit";

export enum ApiClientViewMode {
  SINGLE = "SINGLE",
  MULTI = "MULTI",
}

export type WorkspaceState =
  | { loading: false; errored: true; error: string }
  | { loading: true; errored: false }
  | { loading: false; errored: false };

export interface WorkspaceViewState {
  id: string;
  state: WorkspaceState;
}

export interface MultiWorkspaceViewState {
  viewMode: ApiClientViewMode;
  selectedWorkspaces: EntityState<WorkspaceViewState>;
}
