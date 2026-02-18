import { createAsyncThunk } from "@reduxjs/toolkit";
import { omit, partition } from "lodash";
import { RQAPI } from "features/apiClient/types";
import { ApiClientRecordsInterface } from "../../helpers/modules/sync/interfaces";
import {
  isApiRequest,
  isApiCollection,
  processRecordsForDuplication,
  filterOutChildrenRecords,
} from "../../screens/apiClient/utils";
import { getAllRecords, getRecordsToRender } from "../../commands/utils";
import { apiRecordsActions } from "./slice";
import { selectAllRecords, selectChildToParent } from "./selectors";
import { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry";
import { reduxStore } from "store";
import { ApiClientViewMode } from "../workspaceView";
import { getApiClientFeatureContext } from "../workspaceView/helpers/ApiClientContextRegistry/hooks";
import { Workspace } from "features/workspaces/types";
import { erroredRecordsActions } from "../erroredRecords";
import { closeTabByEntityId } from "componentsV2/Tabs/slice";
import { apiRecordsRankingManager } from "features/apiClient/helpers/RankingManager";

type Repository = ApiClientRecordsInterface<Record<string, unknown>>;

export const createRecord = createAsyncThunk<
  RQAPI.ApiRecord,
  {
    id: string;
    data: RQAPI.ApiRecord;
    repository: Repository;
  },
  { rejectValue: string }
>("apiRecords/create", async ({ id, data, repository }, { dispatch, rejectWithValue }) => {
  const result = await repository.createRecordWithId(data, id);

  if (!result.success || !result.data) {
    return rejectWithValue(result.message ?? "Failed to create record");
  }

  const record = result.data as RQAPI.ApiRecord;

  dispatch(apiRecordsActions.upsertRecord(record));

  return record;
});

export const updateRecord = createAsyncThunk<
  RQAPI.ApiRecord,
  {
    id: string;
    data: Partial<RQAPI.ApiRecord>;
    repository: Repository;
  },
  { rejectValue: string }
>("apiRecords/update", async ({ id, data, repository }, { dispatch, rejectWithValue }) => {
  const result = await repository.updateRecord(data, id);

  if (!result.success || !result.data) {
    return rejectWithValue(result.message ?? "Failed to update record");
  }

  const record = result.data as RQAPI.ApiRecord;

  dispatch(apiRecordsActions.upsertRecord(record));

  return record;
});

type DeleteRecordsResult = {
  recordsDeletionResult: { success: boolean; message?: string };
  collectionsDeletionResult: { success: boolean; data: unknown; message?: string };
  deletedApiRecords: RQAPI.ApiRecord[];
  deletedCollectionRecords: RQAPI.CollectionRecord[];
};

export const deleteRecords = createAsyncThunk<
  DeleteRecordsResult,
  {
    records: RQAPI.ApiClientRecord[];
    repository: Repository;
  },
  { rejectValue: string }
>(
  "apiRecords/delete",
  async ({ records, repository }, { dispatch, rejectWithValue, getState, signal }) => {
    const recordsToBeDeleted = getAllRecords(records);

    const [apiRecords, collectionRecords] = partition(recordsToBeDeleted, isApiRequest);
    const apiRecordIds = apiRecords.map((record) => record.id);
    const collectionRecordIds = collectionRecords.map((record) => record.id);

    const recordsDeletionResult = await repository.deleteRecords(apiRecordIds);
    const collectionsDeletionResult = await repository.deleteCollections(collectionRecordIds);

    if (!recordsDeletionResult.success || !collectionsDeletionResult.success) {
      return rejectWithValue(
        recordsDeletionResult.message ?? collectionsDeletionResult.message ?? "Failed to delete records"
      );
    }

    dispatch(apiRecordsActions.recordsDeleted([...apiRecordIds, ...collectionRecordIds]));

    return {
      recordsDeletionResult,
      collectionsDeletionResult,
      deletedApiRecords: apiRecords as RQAPI.ApiRecord[],
      deletedCollectionRecords: collectionRecords as RQAPI.CollectionRecord[],
    };
  },
  {
    condition: async ({ records }) => {
      const allRecords = getAllRecords(records);

      const results = await Promise.allSettled(
        allRecords.map((r) => reduxStore.dispatch(closeTabByEntityId({ entityId: r.id, skipUnsavedPrompt: true })))
      );

      const hasAllSucceeded = results.every((result) => {
        if (result.status === "fulfilled") {
          return closeTabByEntityId.fulfilled.match(result.value);
        }
        return false;
      });

      return hasAllSucceeded;
    },
  }
);

export const forceRefreshRecords = createAsyncThunk<boolean, { repository: Repository }, { rejectValue: string }>(
  "apiRecords/forceRefresh",
  async ({ repository }, { dispatch, rejectWithValue }) => {
    try {
      const recordsToRefresh = await repository.getRecordsForForceRefresh();
      if (!recordsToRefresh || !recordsToRefresh.success) {
        return false;
      }

      dispatch(
        apiRecordsActions.hydrate({
          records: recordsToRefresh.data.records,
          erroredRecords: recordsToRefresh.data.erroredRecords, // TODO: cleanup
        })
      );

      dispatch(erroredRecordsActions.setApiErroredRecords(recordsToRefresh.data.erroredRecords));
      // closeCorruptedTabs();

      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to refresh records");
    }
  }
);

export const moveRecords = createAsyncThunk<
  { movedRecords: RQAPI.ApiClientRecord[] },
  {
    recordsToMove: RQAPI.ApiClientRecord[];
    collectionId: string;
    repository: Repository;
    sourceWorkspaceId: Workspace["id"];
    destinationWorkspaceId?: Workspace["id"];
  },
  { rejectValue: string }
>(
  "apiRecords/move",
  async (
    { recordsToMove, collectionId, repository, sourceWorkspaceId, destinationWorkspaceId },
    { dispatch, rejectWithValue }
  ) => {
    const context = getApiClientFeatureContext(destinationWorkspaceId);
    const ranks = apiRecordsRankingManager.getRanksForNewApis(context, collectionId, recordsToMove);
    const updatedRecords = recordsToMove.map((record, index) => {
      return isApiCollection(record)
        ? { ...record, collectionId, data: omit(record.data, "children") }
        : { ...record, collectionId, rank: ranks[index] };
    });

    try {
      const movedRecords = await repository.moveAPIEntities(updatedRecords, collectionId);

      dispatch(apiRecordsActions.upsertRecords(movedRecords));

      // TODO: check why we need to refresh for local workspace, when move is in same workspace
      const sourceContext = getApiClientFeatureContext(sourceWorkspaceId);
      await sourceContext.store
        .dispatch(forceRefreshRecords({ repository: sourceContext.repositories.apiClientRecordsRepository }) as any)
        .unwrap();

      if (destinationWorkspaceId && destinationWorkspaceId !== sourceWorkspaceId) {
        const destinationContext = getApiClientFeatureContext(destinationWorkspaceId);

        await destinationContext.store
          .dispatch(
            forceRefreshRecords({ repository: destinationContext.repositories.apiClientRecordsRepository }) as any
          )
          .unwrap();
      }

      return { movedRecords };
    } catch (error) {
      return rejectWithValue("Failed to move records");
    }
  }
);

export const duplicateRecords = createAsyncThunk<
  { duplicatedRecords: RQAPI.ApiClientRecord[] },
  { recordIds: Set<string>; repository: Repository },
  { rejectValue: string; state: ApiClientStoreState }
>("apiRecords/duplicate", async ({ recordIds, repository }, { dispatch, rejectWithValue, getState }) => {
  try {
    const context = getApiClientFeatureContext();
    const apiClientRecords = selectAllRecords(getState());
    const recordsToRender = getRecordsToRender({ apiClientRecords });
    const childParentMap = selectChildToParent(getState());
    const processedRecords = filterOutChildrenRecords(recordIds, childParentMap, recordsToRender.recordsMap);
    const recordsToDuplicate = processRecordsForDuplication(processedRecords, repository, context);

    const duplicatedRecords = await repository.duplicateApiEntities(recordsToDuplicate);

    dispatch(apiRecordsActions.upsertRecords(duplicatedRecords));

    const isMultiView = reduxStore.getState().workspaceView.viewMode === ApiClientViewMode.MULTI;
    if (isMultiView) {
      await dispatch(forceRefreshRecords({ repository })).unwrap();
    }

    return { duplicatedRecords };
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to duplicate records");
  }
});

export const getExamplesForApiRecords = createAsyncThunk<
  { examples: RQAPI.ExampleApiRecord[] },
  { apiRecordIds: string[]; repository: Repository },
  { rejectValue: string }
>("apiRecords/getExamplesForApiRecords", async ({ apiRecordIds, repository }, { dispatch, rejectWithValue }) => {
  try {
    const result = await repository.getAllExamples(apiRecordIds);
    if (!result.success) {
      throw new Error("Failed to get examples");
    }

    dispatch(apiRecordsActions.upsertRecords(result.data.examples));

    return { examples: result.data.examples };
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to get examples");
  }
});

export const createExampleRequest = createAsyncThunk<
  { exampleRecord: RQAPI.ExampleApiRecord },
  { parentRequestId: string; example: RQAPI.ExampleApiRecord; repository: Repository },
  { rejectValue: string }
>("apiRecords/createExample", async ({ parentRequestId, example, repository }, { dispatch, rejectWithValue }) => {
  try {
    const result = await repository.createExampleRequest(parentRequestId, example);
    if (!result.success || !result.data) {
      throw new Error(result.message ?? "Failed to create example request");
    }

    const record = result.data as RQAPI.ExampleApiRecord;

    dispatch(apiRecordsActions.upsertRecord(record));

    return { exampleRecord: record };
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to create example request");
  }
});
