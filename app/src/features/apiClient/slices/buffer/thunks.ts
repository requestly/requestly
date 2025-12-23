import { createAsyncThunk } from "@reduxjs/toolkit";
import type { ThunkDispatch, AnyAction } from "@reduxjs/toolkit";
import type { RQAPI } from "features/apiClient/types";
import type { ApiClientRecordsInterface } from "../../helpers/modules/sync/interfaces";
import type { ApiClientRootState } from "../hooks/types";
import { bufferActions, bufferAdapterSelectors } from "./slice";
import { createRecord, updateRecord } from "../apiRecords/thunks";
import { ApiClientEntityType } from "../entities/types";
import { BUFFER_SLICE_NAME } from "../common/constants";
import type { BufferEntry } from "./types";

type Repository = ApiClientRecordsInterface<Record<string, unknown>>;

interface SaveResult {
  id: string;
  data: unknown;
}

type AppThunkDispatch = ThunkDispatch<ApiClientRootState, unknown, AnyAction>;

interface EntityHandler {
  save: (entry: BufferEntry, repository: Repository, dispatch: AppThunkDispatch) => Promise<SaveResult>;
}

const createRecordHandler = (entityType: ApiClientEntityType): EntityHandler => ({
  save: async (entry, repository, dispatch) => {
    if (!entry.referenceId) {
      // Create new record
      const record = await dispatch(
        createRecord({
          entityType,
          id: entry.id,
          data: entry.current as RQAPI.ApiRecord,
          repository,
        })
      ).unwrap();

      return { id: record.id, data: record };
    }

    // Update existing record - might not return data
    const record = await dispatch(
      updateRecord({
        entityType,
        id: entry.referenceId,
        data: entry.current as Partial<RQAPI.ApiRecord>,
        repository,
      })
    ).unwrap();

    return { id: record?.id ?? entry.referenceId, data: record ?? entry.current };
  },
});

const entityHandlers: Record<ApiClientEntityType, EntityHandler> = {
  [ApiClientEntityType.HTTP_RECORD]: createRecordHandler(ApiClientEntityType.HTTP_RECORD),
  [ApiClientEntityType.COLLECTION_RECORD]: createRecordHandler(ApiClientEntityType.COLLECTION_RECORD),
  [ApiClientEntityType.GRAPHQL_RECORD]: createRecordHandler(ApiClientEntityType.GRAPHQL_RECORD),
};

export const saveBuffer = createAsyncThunk<
  SaveResult,
  { bufferId: string; repository: Repository },
  { state: ApiClientRootState; rejectValue: string }
>("buffer/save", async ({ bufferId, repository }, { getState, dispatch, rejectWithValue }) => {
  const state = getState();
  const entry = bufferAdapterSelectors.selectById(state[BUFFER_SLICE_NAME], bufferId);

  if (!entry) {
    return rejectWithValue(`Buffer ${bufferId} not found`);
  }

  const handler = entityHandlers[entry.entityType];
  if (!handler) {
    return rejectWithValue(`No handler for entity type: ${entry.entityType}`);
  }

  const result = await handler.save(entry, repository, dispatch);

  dispatch(
    bufferActions.markSaved({
      id: bufferId,
      savedData: result.data,
      referenceId: result.id,
    })
  );

  return result;
});
