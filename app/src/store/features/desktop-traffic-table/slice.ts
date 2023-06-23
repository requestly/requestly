import { createSlice, createEntityAdapter, EntityState, PayloadAction, prepareAutoBatched } from "@reduxjs/toolkit";
import { ReducerKeys } from "store/constants";

// TODO: @wrongsahil, add types here when send_network_logs is moved to new events schema

interface ResponsesState {
  [id: string]: any;
}

interface GroupFilters {
  app: string[];
  domain: string[];
}

interface SearchFilters {
  term: string;
  regex: boolean;
}

interface TrafficTableFilters {
  statusCode: string[];
  method: string[];
  resourceType: string[];
  app: string[];
  domain: string[];
  search: SearchFilters;
}

interface DesktopTrafficTableState {
  logs: EntityState<any>;
  responses: ResponsesState; // Stores all the bodies in different state key
  filters: TrafficTableFilters;
}

export const logsAdapter = createEntityAdapter<any>({
  selectId: (log) => log.id,
  sortComparer: (a, b) => (a?.timestamp > b?.timestamp ? 1 : -1),
});

const initialState: DesktopTrafficTableState = {
  logs: logsAdapter.getInitialState(),
  responses: {},
  filters: {
    statusCode: [],
    method: [],
    resourceType: [],
    app: [],
    domain: [],
    search: {
      term: "",
      regex: false,
    },
  },
};

const slice = createSlice({
  name: ReducerKeys.DESKTOP_TRAFFIC_TABLE,
  initialState,
  reducers: {
    logAdd: (state: DesktopTrafficTableState, action: PayloadAction<any>) => {
      logsAdapter.addOne(state.logs, action.payload);
    },
    logUpsert: {
      reducer(state: DesktopTrafficTableState, action: PayloadAction<any>) {
        logsAdapter.upsertOne(state.logs, action.payload);
      },
      prepare: prepareAutoBatched<any>(),
    },
    logUpdate: (state: DesktopTrafficTableState, action: PayloadAction<any>) => {
      logsAdapter.updateOne(state.logs, action.payload);
    },
    logsClearAll: (state: DesktopTrafficTableState, action: PayloadAction<any>) => {
      logsAdapter.removeAll(state.logs);
    },
    logResponseBodyAdd: {
      reducer(state: DesktopTrafficTableState, action: PayloadAction<any>) {
        state.responses[action?.payload?.id] = action.payload?.response?.body;
      },
      prepare: prepareAutoBatched<any>(),
    },
    logResponsesClearAll: (state: DesktopTrafficTableState, action: PayloadAction<any>) => {
      state.responses = {};
    },
    updateFilters: (state: DesktopTrafficTableState, action: PayloadAction<any>) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    updateSearchTerm: (state: DesktopTrafficTableState, action: PayloadAction<string>) => {
      state.filters.search.term = action.payload;
    },
    addGroupFilters: (
      state: DesktopTrafficTableState,
      action: PayloadAction<{ key: keyof GroupFilters; value: string }>
    ) => {
      state.filters[action.payload.key].push(action.payload.value);
    },
    removeGroupFilter: (
      state: DesktopTrafficTableState,
      action: PayloadAction<{ key: keyof GroupFilters; domain: string }>
    ) => {
      const index = state.filters[action.payload.key].indexOf(action.payload.domain);
      if (index !== -1) {
        state.filters[action.payload.key].splice(index, 1);
      }
    },
    clearGroupFilters: (state: DesktopTrafficTableState) => {
      state.filters.app = [];
      state.filters.domain = [];
    },
    toggleRegexSearch: (state: DesktopTrafficTableState) => {
      state.filters.search.regex = !state.filters.search.regex;
    },
    clearColumnFilters: (state: DesktopTrafficTableState) => {
      state.filters = {
        ...state.filters,
        method: initialState.filters.method,
        resourceType: initialState.filters.resourceType,
        statusCode: initialState.filters.statusCode,
      };
    },
  },
});

export const { actions: desktopTrafficTableActions, reducer: desktopTrafficTableReducer } = slice;
