import { createAsyncThunk } from "@reduxjs/toolkit";
import { RQAPI } from "features/apiClient/types";
import { ApiClientRecordsInterface } from "../../helpers/modules/sync/interfaces";
import { entitySynced } from "../common/actions";
import { ApiClientEntityType } from "../entities/types";

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
>(
  "apiRecords/create",
  async ({ entityType, id, data, repository }, { dispatch, rejectWithValue }) => {
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
  }
);

export const updateRecord = createAsyncThunk<
  RQAPI.ApiRecord,
  {
    entityType: ApiClientEntityType;
    id: string;
    data: Partial<RQAPI.ApiRecord>;
    repository: Repository;
  },
  { rejectValue: string }
>(
  "apiRecords/update",
  async ({ entityType, id, data, repository }, { dispatch, rejectWithValue }) => {
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
  }
);
