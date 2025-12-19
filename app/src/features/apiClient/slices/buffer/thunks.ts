import { createAsyncThunk } from "@reduxjs/toolkit";
import { RQAPI } from "features/apiClient/types";
import { ApiClientRecordsInterface } from "../../helpers/modules/sync/interfaces";
import { ApiClientRootState } from "../hooks/types";
import { bufferActions, bufferAdapterSelectors } from "./slice";
import { createRecord, updateRecord } from "../apiRecords/thunks";

type Repository = ApiClientRecordsInterface<Record<string, unknown>>;

export const saveBuffer = createAsyncThunk<
  RQAPI.ApiRecord,
  { bufferId: string; repository: Repository },
  { state: ApiClientRootState; rejectValue: string }
>("buffer/save", async ({ bufferId, repository }, { getState, dispatch, rejectWithValue }) => {
  const state = getState();
  const entry = bufferAdapterSelectors.selectById(state.buffer, bufferId);

  if (!entry) {
    return rejectWithValue(`Buffer ${bufferId} not found`);
  }

  const isNew = !entry.referenceId;

  let record: RQAPI.ApiRecord;

  if (isNew) {
    record = await dispatch(
      createRecord({
        entityType: entry.entityType,
        id: entry.id,
        data: entry.current as RQAPI.ApiRecord,
        repository,
      })
    ).unwrap();
  } else {
    record = await dispatch(
      updateRecord({
        entityType: entry.entityType,
        id: entry.referenceId!,
        data: entry.current as Partial<RQAPI.ApiRecord>,
        repository,
      })
    ).unwrap();
  }

  dispatch(
    bufferActions.markSaved({
      id: bufferId,
      savedData: record,
      referenceId: record.id,
    })
  );

  return record;
});
