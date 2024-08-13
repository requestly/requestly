import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RQSessionEvents } from "@requestly/web-sdk";
import { ReducerKeys } from "store/constants";
import { SessionRecordingMetadata, Visibility } from "views/features/sessions/SessionViewer/types";

export interface SessionRecordingState {
  metadata?: SessionRecordingMetadata;
  events?: RQSessionEvents;
  trimmedSessionData?: {
    duration: number;
    events: RQSessionEvents;
  };
}

const initialState: SessionRecordingState = {
  metadata: null,
  events: null,
  trimmedSessionData: null,
};

const slice = createSlice({
  name: ReducerKeys.SESSION_RECORDING,
  initialState,
  reducers: {
    resetState: () => initialState,
    setSessionRecordingMetadata: (state, action: PayloadAction<SessionRecordingMetadata>) => {
      state.metadata = action.payload;
    },
    setEvents: (state, action: PayloadAction<RQSessionEvents>) => {
      state.events = action.payload;
    },
    setVisibility: (state, action: PayloadAction<Visibility>) => {
      state.metadata.visibility = action.payload;
    },
    setName: (state, action: PayloadAction<string>) => {
      state.metadata.name = action.payload;
    },
    setStartTimeOffset: (state, action: PayloadAction<number>) => {
      state.metadata.startTimeOffset = action.payload;
    },
    setDescription: (state, action: PayloadAction<string>) => {
      state.metadata.description = action.payload;
    },
    setTrimmedSessiondata: (state, action: PayloadAction<{ duration: number; events: RQSessionEvents }>) => {
      state.trimmedSessionData = action.payload;
    },
  },
});

export const { actions: sessionRecordingActions, reducer: sessionRecordingReducer } = slice;
