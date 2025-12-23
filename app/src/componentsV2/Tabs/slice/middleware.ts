import type { Middleware } from "@reduxjs/toolkit";
import { tabsActions } from "./slice";
import { bufferActions } from "features/apiClient/slices/buffer/slice";
import { apiClientContextRegistry } from "features/apiClient/slices/workspaceView/helpers/ApiClientContextRegistry/ApiClientContextRegistry";
import { apiRecordsAdapter } from "features/apiClient/slices/apiRecords/slice";
import { environmentsAdapter } from "features/apiClient/slices/environments/slice";
import type { ApiClientStoreState } from "features/apiClient/slices/workspaceView/helpers/ApiClientContextRegistry/types";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import type { TabSource } from "componentsV2/Tabs/types";
import { RequestViewTabSource } from "features/apiClient/screens/apiClient/components/views/components/RequestView/requestViewTabSource";
import { CollectionViewTabSource } from "features/apiClient/screens/apiClient/components/views/components/Collection/collectionViewTabSource";
import { EnvironmentViewTabSource } from "features/apiClient/screens/environment/components/environmentView/EnvironmentViewTabSource";
import { RQAPI } from "features/apiClient/types";

/**
 * Fetches entity data from the appropriate slice based on tab source type and returns
 * the correct entity type and data for buffer creation.
 */
function getEntityDataFromTabSource(
  source: TabSource,
  state: ApiClientStoreState
): { entityType: ApiClientEntityType; entityId: string; data: unknown } | null {
  const sourceId = source.getSourceId();
  const sourceName = source.getSourceName();

  // Determine entity category from source name or instance type
  let category: "request" | "collection" | "environments" | null = null;

  if (source instanceof RequestViewTabSource || sourceName === "request") {
    category = "request";
  } else if (source instanceof CollectionViewTabSource || sourceName === "collection") {
    category = "collection";
  } else if (source instanceof EnvironmentViewTabSource || sourceName === "environments") {
    category = "environments";
  }

  if (!category) {
    return null;
  }

  // Handle request category - could be HTTP or GraphQL
  if (category === "request") {
    const record = apiRecordsAdapter.getSelectors().selectById(state.records.records, sourceId);

    if (!record || record.type !== RQAPI.RecordType.API) {
      return null;
    }

    const apiRecord = record as RQAPI.ApiRecord;
    const entityType =
      apiRecord.data.type === RQAPI.ApiEntryType.HTTP
        ? ApiClientEntityType.HTTP_RECORD
        : ApiClientEntityType.GRAPHQL_RECORD;

    return {
      entityType,
      entityId: sourceId,
      data: record,
    };
  }

  // Handle collection category
  if (category === "collection") {
    const record = apiRecordsAdapter.getSelectors().selectById(state.records.records, sourceId);

    if (!record) {
      return null;
    }

    return {
      entityType: ApiClientEntityType.COLLECTION_RECORD,
      entityId: sourceId,
      data: record,
    };
  }

  // Handle environments category
  if (category === "environments") {
    const environment = environmentsAdapter.getSelectors().selectById(state.environments.environments, sourceId);

    if (!environment) {
      return null;
    }

    return {
      entityType: ApiClientEntityType.ENVIRONMENT,
      entityId: sourceId,
      data: environment,
    };
  }

  return null;
}

export const tabBufferMiddleware: Middleware = () => (next) => (action) => {
  if (tabsActions.openTab.match(action)) {
    const { source, modeConfig } = action.payload;

    if (modeConfig.mode === "buffer") {
      try {
        const context = apiClientContextRegistry.getLastUsedContext();

        if (!context) {
          if (process.env.NODE_ENV === "development") {
            console.warn("[Tab Buffer Middleware] No API client context found");
          }
          return next(action);
        }

        const apiClientStore = context.store;
        const state = apiClientStore.getState() as ApiClientStoreState;

        const entityData = getEntityDataFromTabSource(source, state);

        if (!entityData) {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              `[Tab Buffer Middleware] Cannot determine entity or data not found: ${source.getSourceName()}`
            );
          }
          return next(action);
        }

        const { entityType, entityId, data } = entityData;

        apiClientStore.dispatch(
          bufferActions.open({
            entityType: entityType,
            isNew: false,
            referenceId: entityId,
            data: data,
          })
        );

        if (process.env.NODE_ENV === "development") {
          console.log(`[Tab Buffer Middleware] Buffer ensured for ${entityType}/${entityId}`);
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("[Tab Buffer Middleware] Error creating buffer:", error);
        }
      }
    }
  }

  return next(action);
};
