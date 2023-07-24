import { RQSessionAttributes, RQSessionEvents } from "@requestly/web-sdk";
import { ReducerKeys } from "store/constants";
import { RootState } from "store/types";
import { SessionRecordingMetadata, Visibility } from "views/features/sessions/SessionViewer/types";
import { SessionRecordingState } from "./slice";

export const getSessionRecordingState = (state: RootState): SessionRecordingState => {
  return state[ReducerKeys.SESSION_RECORDING];
};

export const getSessionRecordingEvents = (state: RootState): RQSessionEvents => {
  return getSessionRecordingState(state).events;
};

export const getSessionRecording = (state: RootState): SessionRecordingMetadata => {
  return getSessionRecordingState(state).sessionRecording;
};

export const getSessionRecordingAttributes = (state: RootState): RQSessionAttributes => {
  return getSessionRecording(state)?.sessionAttributes;
};

export const getSessionRecordingId = (state: RootState): string => {
  return getSessionRecording(state)?.id;
};

export const getSessionRecordingName = (state: RootState): string => {
  return getSessionRecording(state)?.name;
};

export const getSessionRecordingEventsFilePath = (state: RootState): string => {
  return getSessionRecording(state)?.eventsFilePath;
};

export const getSessionRecordingVisibility = (state: RootState): Visibility => {
  return getSessionRecording(state)?.visibility;
};

export const getIsRequestedByOwner = (state: RootState): boolean => {
  return getSessionRecording(state)?.isRequestedByOwner;
};

export const getSessionRecordingStartTimeOffset = (state: RootState): number => {
  return getSessionRecording(state)?.startTimeOffset || 0;
};

export const getSessionRecordingDescription = (state: RootState): string => {
  return getSessionRecording(state)?.description || "";
};

export const getIsReadOnly = (state: RootState): boolean => {
  return getIsRequestedByOwner(state) === false; // for draft, isRequestedByOwner is undefined
};

export const getIncludeConsoleLogs = (state: RootState): boolean => {
  return getSessionRecording(state)?.options?.includeConsoleLogs ?? true;
};

export const getIncludeNetworkLogs = (state: RootState): boolean => {
  return getSessionRecording(state)?.options?.includeNetworkLogs ?? true;
};
