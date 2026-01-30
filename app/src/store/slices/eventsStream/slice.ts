import { createEntityAdapter, createSlice, PayloadAction } from "@reduxjs/toolkit";
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
    eventAdd: (state, action: PayloadAction<APIClientEvent>) => {
      eventsAdapter.addOne(state.events, action.payload);
    },
    eventClearAll: (state) => {
      eventsAdapter.removeAll(state.events);
    },
  },
});

export const { actions: eventsActions, reducer: eventsReducer } = eventsSlice;
