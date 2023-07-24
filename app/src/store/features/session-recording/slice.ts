import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RQSessionEvents } from "@requestly/web-sdk";
import { ReducerKeys } from "store/constants";
import { SessionRecordingMetadata, Visibility } from "views/features/sessions/SessionViewer/types";

export interface SessionRecordingState {
  sessionRecording?: SessionRecordingMetadata;
  events?: RQSessionEvents;
}

const initialState: SessionRecordingState = {
  sessionRecording: null,
  events: null,
};

const slice = createSlice({
  name: ReducerKeys.SESSION_RECORDING,
  initialState,
  reducers: {
    resetState: () => initialState,
    setSessionRecording: (state, action: PayloadAction<SessionRecordingMetadata>) => {
      state.sessionRecording = action.payload;
    },
    setEvents: (state, action: PayloadAction<RQSessionEvents>) => {
      state.events = action.payload;
    },
    setVisibility: (state, action: PayloadAction<Visibility>) => {
      state.sessionRecording.visibility = action.payload;
    },
    setName: (state, action: PayloadAction<string>) => {
      state.sessionRecording.name = action.payload;
    },
    setStartTimeOffset: (state, action: PayloadAction<number>) => {
      state.sessionRecording.startTimeOffset = action.payload;
    },
    setDescription: (state, action: PayloadAction<string>) => {
      state.sessionRecording.description = action.payload;
    },
  },
});

export const { actions: sessionRecordingActions, reducer: sessionRecordingReducer } = slice;
