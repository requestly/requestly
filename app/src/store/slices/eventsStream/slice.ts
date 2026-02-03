import { createEntityAdapter, createSlice, PayloadAction, prepareAutoBatched } from "@reduxjs/toolkit";
import { APIClientEvent } from "features/apiClient/eventStream/types";

export const eventsAdapter = createEntityAdapter<APIClientEvent>({
  selectId: (event) => event.id,
  sortComparer: (a, b) => (a?.timestamp > b?.timestamp ? 1 : -1),
});

export const eventsSlice = createSlice({
  name: "EventsStream",
  initialState: {
    events: eventsAdapter.getInitialState(),
  },
  reducers: {
    eventAdd: {
      reducer(state, action: PayloadAction<APIClientEvent>) {
        eventsAdapter.addOne(state.events, action.payload);
      },
      prepare: prepareAutoBatched<APIClientEvent>(),
    },
    eventClearAll: (state) => {
      eventsAdapter.removeAll(state.events);
    },
  },
});

export const { actions: eventsActions, reducer: eventsReducer } = eventsSlice;
