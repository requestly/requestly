import * as Sentry from "@sentry/react";
import { createTransform } from "redux-persist";
import { TAB_SOURCES_MAP } from "../constants";
import type { TabState } from "./types";
import type { TabSourceMetadata } from "../types";
import type { EntityState } from "@reduxjs/toolkit";
import { NativeError } from "errors/NativeError";

interface TabStateSerialized {
  id: string;
  sourceType: string;
  sourceMetadata: TabSourceMetadata;
  modeConfig: TabState["modeConfig"];
}

interface TabsEntityStateSerialized {
  ids: string[];
  entities: Record<string, TabStateSerialized>;
}

function serializeTab(tab: TabState): TabStateSerialized {
  return {
    id: tab.id,
    sourceType: tab.source.type,
    sourceMetadata: tab.source.metadata,
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

      throw new NativeError(`Unknown tab source type: ${serialized.sourceType}`);
    }

    // Each TabSource constructor has different metadata signature
    // @ts-expect-error - Runtime validation via TAB_SOURCES_MAP ensures correct pairing
    const source = new SourceClass(serialized.sourceMetadata);

    return {
      id: serialized.id,
      source,
      activeWorkflows: new Set(),
      secondaryBufferIds: new Set(),
      modeConfig: serialized.modeConfig,
    };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { error_type: "tab_persistence_issue" },
      extra: { serializedTab: serialized },
    });

    throw new NativeError(error);
  }
}

export const tabsPersistTransform = createTransform<EntityState<TabState>, TabsEntityStateSerialized>(
  (inboundState: EntityState<TabState>, key): TabsEntityStateSerialized => {
    const serializedEntities: Record<string, TabStateSerialized> = {};

    if (!inboundState?.entities) {
      return {
        ids: [],
        entities: {},
      };
    }

    for (const tab of Object.values(inboundState.entities)) {
      if (tab) {
        serializedEntities[tab.id] = serializeTab(tab);
      }
    }

    return {
      ids: inboundState.ids as string[],
      entities: serializedEntities,
    };
  },

  (outboundState: TabsEntityStateSerialized, key): EntityState<TabState> => {
    if (!outboundState?.entities || !outboundState?.ids) {
      return {
        ids: [],
        entities: {},
      };
    }

    const deserializedEntities: Record<string, TabState> = {};
    const validIds: string[] = [];

    for (const id of outboundState.ids) {
      const serializedTab = outboundState.entities[id];
      if (serializedTab) {
        const tab = deserializeTab(serializedTab);
        if (tab) {
          deserializedEntities[tab.id] = tab;
          validIds.push(tab.id);
        }
      }
    }

    if (validIds.length === 0) {
      return {
        ids: [],
        entities: {},
      };
    }

    return {
      ids: validIds,
      entities: deserializedEntities,
    };
  },
  { whitelist: ["tabs"] }
);
