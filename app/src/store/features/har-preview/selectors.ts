import { RootState } from "store/types";
import { HarPreviewState, PreviewType } from "./slice";
import { ReducerKeys } from "store/constants";
import { Har } from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/types";

export const getHarPreviewState = (state: RootState): HarPreviewState => state[ReducerKeys.HAR_PREVIEW]

export const getImportedHar = (state: RootState): Har | null => getHarPreviewState(state).importedHar

export const getSessionId = (state: RootState): string => getHarPreviewState(state).sessionId

export const getPreviewType = (state: RootState): PreviewType => getHarPreviewState(state).previewType

export const getSessionName = (state: RootState): string => getHarPreviewState(state).sessionName