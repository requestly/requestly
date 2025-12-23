import * as Sentry from "@sentry/react";
import { createTransform } from "redux-persist";
import { TAB_SOURCES_MAP } from "../constants";
import type { TabServiceState, TabState } from "./types";

interface TabStateSerialized {
  id: string;
  sourceType: string;
  sourceMetadata: unknown;
  activeWorkflows: never[];
  modeConfig: TabState["modeConfig"];
}

interface TabServiceStateSerialized {
  tabs: {
    ids: string[];
    entities: Record<string, TabStateSerialized>;
  };
  activeTabId?: string;
  previewTabId?: string;
}

function serializeTab(tab: TabState): TabStateSerialized {
  return {
    id: tab.id,
    sourceType: tab.source.constructor.name,
    sourceMetadata: tab.source.metadata,
    activeWorkflows: [],
    modeConfig: tab.modeConfig,
  };
}

function deserializeTab(serialized: TabStateSerialized): TabState | null {
  try {
    const SourceClass = TAB_SOURCES_MAP[serialized.sourceType];
    if (!SourceClass) {
      Sentry.captureMessage(`Unknown tab source type: ${serialized.sourceType}`, {
        level: "warning",
        tags: { error_type: "tab_persistence_issue" },
        extra: { serializedTab: serialized },
      });
      return null;
    }

    // Type assertion necessary: each TabSource constructor has different metadata signature
    // @ts-expect-error - Runtime validation via TAB_SOURCES_MAP ensures correct pairing
    const source = new SourceClass(serialized.sourceMetadata);

    return {
      id: serialized.id,
      source,
      activeWorkflows: new Set(),
      modeConfig: serialized.modeConfig,
    };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { error_type: "tab_persistence_issue" },
      extra: { serializedTab: serialized },
    });
    return null;
  }
}

export const tabsPersistTransform = createTransform<TabServiceState, TabServiceStateSerialized>(
  (state: TabServiceState): TabServiceStateSerialized => {
    const serializedEntities: Record<string, TabStateSerialized> = {};

    for (const tab of Object.values(state.tabs.entities)) {
      if (tab) {
        serializedEntities[tab.id] = serializeTab(tab);
      }
    }

    return {
      tabs: {
        ids: state.tabs.ids as string[],
        entities: serializedEntities,
      },
      activeTabId: state.activeTabId,
      previewTabId: state.previewTabId,
    };
  },

  (serialized: TabServiceStateSerialized): TabServiceState => {
    const deserializedEntities: Record<string, TabState> = {};
    const validIds: string[] = [];

    for (const id of serialized.tabs.ids) {
      const serializedTab = serialized.tabs.entities[id];
      if (serializedTab) {
        const tab = deserializeTab(serializedTab);
        if (tab) {
          deserializedEntities[tab.id] = tab;
          validIds.push(tab.id);
        }
      }
    }

    const validatedActiveTabId =
      serialized.activeTabId && validIds.includes(serialized.activeTabId) ? serialized.activeTabId : validIds[0]; // Fallback to first valid tab

    const validatedPreviewTabId =
      serialized.previewTabId && validIds.includes(serialized.previewTabId) ? serialized.previewTabId : undefined;

    if (validIds.length === 0) {
      return {
        tabs: {
          ids: [],
          entities: {},
        },
        activeTabId: undefined,
        previewTabId: undefined,
      };
    }

    return {
      tabs: {
        ids: validIds,
        entities: deserializedEntities,
      },
      activeTabId: validatedActiveTabId,
      previewTabId: validatedPreviewTabId,
    };
  },

  { whitelist: ["tabs"] }
);
