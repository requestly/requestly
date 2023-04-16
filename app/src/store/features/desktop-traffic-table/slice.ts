import { createSlice, createEntityAdapter, EntityState, PayloadAction } from "@reduxjs/toolkit";
import { ReducerKeys } from "store/constants";

// TODO: @wrongsahil, add types here when send_network_logs is moved to new events schema

interface ResponsesState {
  [id: string]: any;
}

interface DesktopTrafficTableState {
  logs: EntityState<any>;
  responses: ResponsesState; // Stores all the bodies in different state key
}

export const logsAdapter = createEntityAdapter<any>({
  selectId: (log) => log.id,
  sortComparer: (a, b) => (a?.data?.timestamp > b?.data?.timestamp ? 1 : -1),
});

const slice = createSlice({
  name: ReducerKeys.DESKTOP_TRAFFIC_TABLE,
  initialState: {
    logs: logsAdapter.getInitialState(),
    responses: {},
  },
  reducers: {
    logAdd: (state: DesktopTrafficTableState, action: PayloadAction<any>) => {
      logsAdapter.addOne(state.logs, action.payload);
    },
    logUpsert: (state: DesktopTrafficTableState, action: PayloadAction<any>) => {
      logsAdapter.upsertOne(state.logs, action.payload);
    },
    logUpdate: (state: DesktopTrafficTableState, action: PayloadAction<any>) => {
      logsAdapter.updateOne(state.logs, action.payload);
    },
    logsClearAll: (state: DesktopTrafficTableState, action: PayloadAction<any>) => {
      logsAdapter.removeAll(state.logs);
    },
    logResponseBodyAdd: (state: DesktopTrafficTableState, action: PayloadAction<any>) => {
      state.responses[action?.payload?.id] = action.payload?.response?.body;
    },
    logResponsesClearAll: (state: DesktopTrafficTableState, action: PayloadAction<any>) => {
      state.responses = {};
    },
  },
});

export const { actions: desktopTrafficTableActions, reducer: desktopTrafficTableReducer } = slice;
