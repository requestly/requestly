import { trackEvent } from "modules/analytics";
import { RecordingOptions, SessionRecordingMode, SessionSaveMode, Visibility } from "../types";
import { SESSIONS } from "./constants";
import { trackRQLastActivity } from "utils/AnalyticsUtils";

export const trackDraftSessionViewed = (recording_mode: SessionRecordingMode) => {
  trackEvent(SESSIONS.DRAFT_SESSION_RECORDING_VIEWED, { recording_mode });
};

export const trackDraftSessionDiscarded = () => trackEvent(SESSIONS.DRAFT_SESSION_DISCARDED);

export const trackDraftSessionNamed = () => trackEvent(SESSIONS.DRAFT_SESSION_RECORDING_NAMED);

export const trackSessionRecordingFailed = (reason: string) =>
  trackEvent(SESSIONS.SESSION_RECORDING_FAILED, { reason });

export const trackDraftSessionSaved = ({
  session_length,
  options,
  type,
  source,
  recording_mode,
}: {
  session_length: number;
  options: RecordingOptions;
  type: SessionSaveMode;
  source: string;
  recording_mode: SessionRecordingMode;
}) => {
  trackEvent(SESSIONS.DRAFT_SESSION_RECORDING_SAVED, {
    type,
    session_length,
    options,
    source,
    recording_mode,
  });

  trackRQLastActivity(SESSIONS.DRAFT_SESSION_RECORDING_SAVED);
};

export const trackDraftSessionSaveFailed = (reason: string) =>
  trackEvent(SESSIONS.DRAFT_SESSION_RECORDING_SAVE_FAILED, { reason });

export const trackSavedSessionViewed = (source: string, session_id: string) =>
  trackEvent(SESSIONS.SAVED_SESSION_RECORDING_VIEWED, { source, session_id });

export const trackSessionRecordingShareClicked = () => {
  trackEvent(SESSIONS.SESSION_RECORDING_SHARE_CLICKED);
  trackRQLastActivity(SESSIONS.SESSION_RECORDING_SHARE_CLICKED);
};

export const trackSessionRecordingShareLinkCopied = (source = "app") =>
  trackEvent(SESSIONS.SESSION_RECORDING_SHARE_LINK_COPIED, { source });

export const trackSessionRecordingVisibilityUpdated = (visibility: Visibility) => {
  trackEvent(SESSIONS.SESSION_RECORDING_VISIBILITY_UPDATED, {
    visibility,
  });
  trackRQLastActivity(SESSIONS.SESSION_RECORDING_VISIBILITY_UPDATED);
};

export const trackSessionRecordingDeleted = () => {
  trackEvent(SESSIONS.SESSION_RECORDING_DELETED);
  trackRQLastActivity(SESSIONS.SESSION_RECORDING_DELETED);
};

export const trackSessionRecordingDescriptionUpdated = () => trackEvent(SESSIONS.SESSION_RECORDING_DESCRIPTION_ADDED);

export const trackSessionRecordingNameUpdated = () => {
  trackEvent(SESSIONS.SESSION_RECORDING_NAME_UPDATED);
};

export const trackBadSessionRecordingViewed = () => trackEvent(SESSIONS.BAD_SESSION_RECORDING_VIEWED);

export const trackSessionRecordingBottomSheetTabClicked = (tab: string) =>
  trackEvent(SESSIONS.SESSION_RECORDING_BOTTOM_SHEET_TAB_CLICKED, { tab });
