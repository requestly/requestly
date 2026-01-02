import { createAsyncThunk } from "@reduxjs/toolkit";
import { partition } from "lodash";
import { RQAPI } from "features/apiClient/types";
import { ApiClientRecordsInterface } from "../../helpers/modules/sync/interfaces";
import { entitySynced } from "../common/actions";
import { ApiClientEntityType } from "../entities/types";
import { isApiRequest } from "../../screens/apiClient/utils";
import { getAllRecords } from "../../commands/utils";
import { apiRecordsActions } from "./slice";

type Repository = ApiClientRecordsInterface<Record<string, unknown>>;

export const createRecord = createAsyncThunk<
  RQAPI.ApiRecord,
  {
    entityType: ApiClientEntityType;
    id: string;
    data: RQAPI.ApiRecord;
    repository: Repository;
  },
  { rejectValue: string }
>("apiRecords/create", async ({ entityType, id, data, repository }, { dispatch, rejectWithValue }) => {
  const result = await repository.createRecordWithId(data, id);

  if (!result.success || !result.data) {
    return rejectWithValue(result.message ?? "Failed to create record");
  }

  const record = result.data as RQAPI.ApiRecord;

  dispatch(
    entitySynced({
      entityType,
      entityId: record.id,
      data: record,
    })
  );

  return record;
});

export const updateRecord = createAsyncThunk<
  RQAPI.ApiRecord,
  {
    entityType: ApiClientEntityType;
    id: string;
    data: Partial<RQAPI.ApiRecord>;
    repository: Repository;
  },
  { rejectValue: string }
>("apiRecords/update", async ({ entityType, id, data, repository }, { dispatch, rejectWithValue }) => {
  const result = await repository.updateRecord(data, id);

  if (!result.success || !result.data) {
    return rejectWithValue(result.message ?? "Failed to update record");
  }

  const record = result.data as RQAPI.ApiRecord;

  dispatch(
    entitySynced({
      entityType,
      entityId: record.id,
      data: record,
    })
  );

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
