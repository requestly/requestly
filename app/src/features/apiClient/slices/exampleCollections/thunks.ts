import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Sentry from "@sentry/react";
import { NativeError } from "errors/NativeError";
import { SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY } from "features/apiClient/constants";
import exampleCollections from "features/apiClient/exampleCollections/examples/collections.json";
import exampleEnvironments from "features/apiClient/exampleCollections/examples/environments.json";
import localStoreRepository from "features/apiClient/helpers/modules/sync/localStore/ApiClientLocalStorageRepository";
import {
  processRqImportData,
  RQImportData,
} from "features/apiClient/screens/apiClient/components/modals/importModal/utils";
import { apiRecordsActions } from "features/apiClient/slices/apiRecords/slice";
import {
  trackExampleCollectionsImported,
  trackExampleCollectionsImportFailed,
} from "modules/analytics/events/features/apiClient";
import { variablesActions } from "store/features/variables/slice";
import { RootState } from "store/types";
import { sessionStorage } from "utils/sessionStorage";
import { exampleCollectionsActions } from "./slice";
import { ImportDependencies, ImportFailureReason } from "./types";

export const EXPANDED_RECORD_IDS_UPDATED = "expandedRecordIdsUpdated" as const;

function markAsExample<T>(record: T): T & { isExample: true } {
  return { ...record, isExample: true } as T & { isExample: true };
}

function markRootCollection<T extends { isExample?: boolean }>(record: T, index: number): T & { isExampleRoot?: true } {
  if (index === 0) {
    return { ...record, isExampleRoot: true };
  }
  return record;
}

function canImport(state: RootState): { success: false; error: string; reason: ImportFailureReason } | null {
  const { importStatus, isNudgePermanentlyClosed } = state.exampleCollections;

  if (importStatus.type === "IMPORTING") {
    return { success: false, error: "Import already in progress", reason: "ALREADY_IMPORTING" };
  }

  if (importStatus.type === "IMPORTED") {
    return { success: false, error: "Example collections already imported", reason: "ALREADY_IMPORTED" };
  }

  if (isNudgePermanentlyClosed) {
    return { success: false, error: "User has permanently closed the nudge", reason: "NUDGE_CLOSED" };
  }

  return null;
}

export const importExampleCollections = createAsyncThunk<
  { success: true; recordCount: number },
  ImportDependencies,
  { rejectValue: { success: false; error: string; reason: ImportFailureReason }; state: RootState }
>("exampleCollections/import", async (dependencies, { dispatch, getState, rejectWithValue }) => {
  const canImportResult = canImport(getState());
  if (canImportResult !== null) {
    return rejectWithValue(canImportResult);
  }

  const { repository, ownerId, environmentsToCreate, apiClientDispatch } = dependencies;

  dispatch(exampleCollectionsActions.importStarted());

  try {
    dispatch(
      variablesActions.setCurrentEnvironment({
        environmentId: localStoreRepository.environmentVariablesRepository.getGlobalEnvironmentId(),
      })
    );

    const dataToImport: RQImportData = ({
      records: exampleCollections.records,
      environments: exampleEnvironments.environments,
    } as unknown) as RQImportData;

    const processedData = processRqImportData(dataToImport, ownerId, repository.apiClientRecordsRepository);

    const transformedApis = processedData.apis.map((api: any) => {
      const newCollectionId = processedData.collections.find((collection: any) => collection.id === api.collectionId)
        ?.id;

      return markAsExample({
        ...api,
        collectionId: newCollectionId || null,
        id: repository.apiClientRecordsRepository.generateApiRecordId(newCollectionId),
      });
    });

    const transformedCollections = processedData.collections.map((collection: any, index: number) => {
      return markRootCollection(markAsExample(collection), index);
    });

    const recordsToImport = [...transformedApis, ...transformedCollections];
    const recordsResult = await repository.apiClientRecordsRepository.batchCreateRecordsWithExistingId(recordsToImport);

    if (!recordsResult.success) {
      const error = new NativeError(`Failed to create records: ${recordsResult.message || "Unknown error"}`);
      error.addContext({
        reason: "REPOSITORY_ERROR",
        recordsCount: recordsToImport.length,
      });
      throw error;
    }

    if (!recordsResult.data?.records || recordsResult.data.records.length === 0) {
      const error = new NativeError("No records were created");
      error.addContext({ reason: "REPOSITORY_ERROR" });
      throw error;
    }

    apiClientDispatch(apiRecordsActions.upsertRecords(recordsResult.data.records));

    try {
      await repository.environmentVariablesRepository.createEnvironments(environmentsToCreate);
    } catch (envError) {
      const error =
        envError instanceof Error
          ? NativeError.fromError(envError)
          : new NativeError(`Failed to create environments: Unknown error`);
      error.addContext({
        reason: "ENVIRONMENT_ERROR",
        environmentsCount: environmentsToCreate.length,
      });
      throw error;
    }

    const collectionsToExpand = transformedCollections.map((collection: any) => collection.id);
    const existingExpanded = sessionStorage.getItem(SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY, []);
    sessionStorage.setItem(SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY, [...existingExpanded, ...collectionsToExpand]);

    window.dispatchEvent(new CustomEvent(EXPANDED_RECORD_IDS_UPDATED));

    trackExampleCollectionsImported();
    dispatch(exampleCollectionsActions.importSucceeded({ timestamp: Date.now() }));

    return { success: true, recordCount: recordsResult.data.records.length } as const;
  } catch (error) {
    const timestamp = Date.now();
    let errorMessage: string;
    let failureReason: ImportFailureReason;

    if (error instanceof NativeError) {
      errorMessage = error.message;
      failureReason = (error.context.reason as ImportFailureReason) || "UNKNOWN_ERROR";
      Sentry.captureException(error, {
        tags: { feature: "example-collections", reason: failureReason },
        extra: error.context,
      });
    } else {
      errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      failureReason = "UNKNOWN_ERROR";
      const wrappedError = NativeError.fromError(error instanceof Error ? error : new Error(String(error)));
      wrappedError.addContext({ reason: failureReason });
      Sentry.captureException(wrappedError, { tags: { feature: "example-collections", reason: failureReason } });
    }

    trackExampleCollectionsImportFailed();
    dispatch(exampleCollectionsActions.importFailed({ error: errorMessage, timestamp }));

    return rejectWithValue({ success: false, error: errorMessage, reason: failureReason });
  }
});
