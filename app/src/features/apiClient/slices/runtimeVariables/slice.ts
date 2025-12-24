import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { API_CLIENT_RUNTIME_VARIABLES_SLICE_NAME } from "../common/constants";
import { RuntimeVariablesEntity, RuntimeVariablesState } from "./types";
import persistReducer from "redux-persist/es/persistReducer";
import createTransform from "redux-persist/es/createTransform";
import storage from "redux-persist/lib/storage";
import { ApiClientVariables } from "../entities/api-client-variables";

const RUNTIME_VARIABLES_ENTITY_ID = "runtime_variables";

const initialState: RuntimeVariablesState = {
  entity: {
    id: RUNTIME_VARIABLES_ENTITY_ID,
    variables: {},
  },
};

export const runtimeVariablesSlice = createSlice({
  name: API_CLIENT_RUNTIME_VARIABLES_SLICE_NAME,
  initialState,
  reducers: {
    unsafePatch(
      state,
      action: PayloadAction<{
        patcher: (entity: RuntimeVariablesEntity) => void;
      }>
    ) {
      if (state.entity) {
        action.payload.patcher(state.entity);
      }
    },

    clear(state) {
      state.entity = {
        id: RUNTIME_VARIABLES_ENTITY_ID,
        variables: {},
      };
    },
  },
});

// Persistence transform for runtime variables
// Persists full variable data, conditionally including localValue based on isPersisted flag
const persistTransform = createTransform<
  RuntimeVariablesState["entity"],
  RuntimeVariablesEntity,
  RuntimeVariablesState
>(
  // Inbound: state -> storage (persist)
  (inboundState) => {
    if (!inboundState) {
      return {
        id: RUNTIME_VARIABLES_ENTITY_ID,
        variables: {},
      };
    }
    return {
      id: inboundState.id,
      variables: ApiClientVariables.persistFull(inboundState.variables),
    };
  },
  // Outbound: storage -> state (rehydrate) - just read as-is
  (outboundState) => outboundState,
  {
    whitelist: ["entity"],
  }
);

const runtimeVariablesPersistConfig = {
  key: "api_client_runtime_variables",
  storage: storage,
  transforms: [persistTransform],
  whitelist: ["entity"],
};

export const runtimeVariablesReducerWithPersist = persistReducer(
  runtimeVariablesPersistConfig,
  runtimeVariablesSlice.reducer
);

export const runtimeVariablesActions = runtimeVariablesSlice.actions;
export const runtimeVariablesReducer = runtimeVariablesSlice.reducer;

