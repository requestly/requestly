import { RootState } from "store/types";
import { NetworkSessionPreviewState, PreviewType } from "./slice";
import { ReducerKeys } from "store/constants";
import { Har } from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/types";

export const getNetworkSessionPreviewState = (state: RootState): NetworkSessionPreviewState =>
  state[ReducerKeys.HAR_PREVIEW];

export const getImportedHar = (state: RootState): Har | null => getNetworkSessionPreviewState(state).importedHar;

export const getSessionId = (state: RootState): string => getNetworkSessionPreviewState(state).sessionId;

export const getPreviewType = (state: RootState): PreviewType => getNetworkSessionPreviewState(state).previewType;

export const getSessionName = (state: RootState): string => getNetworkSessionPreviewState(state).sessionName;
