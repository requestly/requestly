import { createEntityAdapter, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RQAPI } from "../../../../../shared/dist/types/entities/apiClient/api";

export enum EventFlow {
  API_EXECUTION = "API_EXECUTION",
  // other useCases later
}

export interface RequestEventData {
  type: "REQUEST";
  payload: RQAPI.Request;
}
export interface ResponseEventData {
  type: "RESPONSE";
  payload: RQAPI.Response;
}

type APIClientEventData = RequestEventData | ResponseEventData;

type RecordTag = { recordId: string };
type IterationTag = { iteration: number };
export type Tag = Partial<RecordTag & IterationTag>;

export interface APIClientEvent {
  id: string;
  timestamp: number;
  flow: EventFlow;
//   workspaceId: WorkspaceId;
  tag: Tag;
  data: APIClientEventData;
  _ctx?: any; // static context. Eg. execution env details, variable snapshot, etc.
}


export const eventsAdapter = createEntityAdapter<APIClientEvent>({
  selectId: (event) => event.id,
  sortComparer: (a, b) => (a?.timestamp > b?.timestamp ? 1 : -1),
});

export type EventsSliceState = {
  events: ReturnType<typeof eventsAdapter.getInitialState>;
};

export const eventsSlice = createSlice({
  name: "EventsStream",
  initialState: {
    events: eventsAdapter.getInitialState()
  },
  reducers: {
    eventAdd: (state, action: PayloadAction<APIClientEvent>) => {
      eventsAdapter.addOne(state.events, action.payload);
    },
    eventClearAll: (state) => {
      eventsAdapter.removeAll(state.events);
    },
  },
});

export const { actions: eventsActions, reducer: eventsReducer } = eventsSlice;

