import { createSlice } from "@reduxjs/toolkit";
import { Har } from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/types";
import { ReducerKeys } from "store/constants";

export enum PreviewType {
  IMPORTED = "IMPORTED",
  SAVED = "SAVED",
}

export interface NetworkSessionPreviewState {
  importedHar?: Har | null;
  sessionId?: string;
  previewType?: PreviewType;
  sessionName?: string;
}

const initialState: NetworkSessionPreviewState = {
  importedHar: null,
  sessionId: null,
  sessionName: null,
};

const slice = createSlice({
  name: ReducerKeys.HAR_PREVIEW,
  initialState,
  reducers: {
    resetState: () => initialState,
    setImportedHar: (state, action) => {
      state.importedHar = action.payload;
    },
    setSessionId: (state, action) => {
      state.sessionId = action.payload;
    },
    setPreviewType: (state, action) => {
      state.previewType = action.payload;
    },
    setSessionName: (state, action) => {
      state.sessionName = action.payload;
    },
  },
});

export const { actions: networkSessionActions, reducer: harPreviewReducer } = slice;
