import { EntityState } from "@reduxjs/toolkit";
import { TabSource } from "../types";

export type TabId = string;

export type Abortable = {
  abort: () => void;
  then: (cb: () => void) => void;
  catch: (cb: () => void) => void;
};

export type ActiveWorkflow = {
  cancelWarning: string;
  workflow: Abortable;
};

export type TabModeConfig = { entityId: string } & (
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
