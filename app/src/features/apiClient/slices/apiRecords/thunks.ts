import { createAsyncThunk } from "@reduxjs/toolkit";
import { omit, partition } from "lodash";
import { RQAPI } from "features/apiClient/types";
import { ApiClientRecordsInterface } from "../../helpers/modules/sync/interfaces";
import { isApiRequest, isApiCollection, processRecordsForDuplication } from "../../screens/apiClient/utils";
import { getAllRecords } from "../../commands/utils";
import { apiRecordsActions } from "./slice";

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
>("apiRecords/delete", async ({ records, repository }, { dispatch, rejectWithValue }) => {
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
});

export const moveRecords = createAsyncThunk<
  { movedRecords: RQAPI.ApiClientRecord[] },
  {
    recordsToMove: RQAPI.ApiClientRecord[];
    collectionId: string;
    repository: Repository;
  },
  { rejectValue: string }
>("apiRecords/move", async ({ recordsToMove, collectionId, repository }, { dispatch, rejectWithValue }) => {
  const updatedRecords = recordsToMove.map((record) => {
    return isApiCollection(record)
      ? { ...record, collectionId, data: omit(record.data, "children") }
      : { ...record, collectionId };
  });

  try {
    const movedRecords = await repository.moveAPIEntities(updatedRecords, collectionId);

    dispatch(apiRecordsActions.upsertRecords(movedRecords));

    return { movedRecords };
  } catch (error) {
    return rejectWithValue("Failed to move records");
  }
});

export const duplicateRecords = createAsyncThunk<
  { duplicatedRecords: RQAPI.ApiClientRecord[] },
  {
    records: RQAPI.ApiClientRecord[];
    repository: Repository;
  },
  { rejectValue: string }
>("apiRecords/duplicate", async ({ records, repository }, { dispatch, rejectWithValue }) => {
  try {
    const recordsToDuplicate = processRecordsForDuplication(records, repository);
    const duplicatedRecords = await repository.duplicateApiEntities(recordsToDuplicate);

    dispatch(apiRecordsActions.upsertRecords(duplicatedRecords));

    return { duplicatedRecords };
  } catch (error) {
    return rejectWithValue("Failed to duplicate records");
  }
});
