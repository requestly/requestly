import { createAsyncThunk, Dispatch } from "@reduxjs/toolkit";
import { RQAPI } from "features/apiClient/types";
import { ApiClientRecordsInterface } from "../../helpers/modules/sync/interfaces";
import { ApiClientRootState } from "../hooks/types";
import { bufferActions, bufferAdapterSelectors } from "./slice";
import { createRecord, updateRecord } from "../apiRecords/thunks";
import { ApiClientEntityType } from "../entities/types";
import { BUFFER_SLICE_NAME } from "../common/constants";
import { BufferEntry } from "./types";

type Repository = ApiClientRecordsInterface<Record<string, unknown>>;

interface SaveResult {
  id: string;
  data: unknown;
}

interface EntityHandler {
  save: (entry: BufferEntry, repository: Repository, dispatch: Dispatch) => Promise<SaveResult>;
}

const createRecordHandler = (entityType: ApiClientEntityType): EntityHandler => ({
  save: async (entry, repository, dispatch) => {
    const isNew = !entry.referenceId;

    const record = isNew
      ? await (dispatch as any)(
          createRecord({
            entityType,
            id: entry.id,
            data: entry.current as RQAPI.ApiRecord,
            repository,
          })
        ).unwrap()
      : await (dispatch as any)(
          updateRecord({
            entityType,
            id: entry.referenceId!,
            data: entry.current as Partial<RQAPI.ApiRecord>,
            repository,
          })
        ).unwrap();

    return { id: record.id, data: record };
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
