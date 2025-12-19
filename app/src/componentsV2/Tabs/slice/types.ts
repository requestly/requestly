import { EntityState } from "@reduxjs/toolkit";
import { TabSource } from "../types";
import { EntityType } from "features/apiClient/slices/types";

export type TabId = string;

export type Abortable<T = unknown> = {
  abort: () => void;
  promise: Promise<T>;
};

export type ActiveWorkflow = {
  cancelWarning: string;
  workflow: Abortable;
};

export type TabModeConfig = { entityId: string; entityType: EntityType } & (
  | {
      mode: "buffer";
    }
  | {
      mode: "entity";
    }
);

export interface TabState<T extends TabSource = TabSource> {
  id: TabId;
  source: T;
  activeWorkflows: Set<ActiveWorkflow>;
  modeConfig: TabModeConfig;
}

export interface TabServiceState {
  tabs: EntityState<TabState>;
  activeTabId?: TabId;
  previewTabId?: TabId;
}
