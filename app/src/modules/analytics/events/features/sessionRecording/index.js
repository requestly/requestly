import { trackEvent } from "modules/analytics";
import { trackRQLastActivity } from "utils/AnalyticsUtils";
import { SESSION_RECORDING } from "../constants";

export const trackDemoVideoOpened = () => trackEvent(SESSION_RECORDING.session_recording_demo_video_opened);

export const trackConfigurationOpened = (source = "in_app") => {
  trackEvent(SESSION_RECORDING.session_recordings_config_opened, { source });
};

export const trackConfigurationSaved = (params) => {
  trackEvent(SESSION_RECORDING.session_recordings_config_saved, params);
  trackRQLastActivity(SESSION_RECORDING.session_recordings_config_saved);
};

export const trackInstallExtensionDialogShown = (params) =>
  trackEvent(SESSION_RECORDING.session_recordings_install_extension_dialog_shown, params);

export const trackSessionRecordingFailed = (reason) =>
  trackEvent(SESSION_RECORDING.session_recording_failed, { reason });

export const trackDraftSessionViewed = (recording_mode) => {
  trackEvent(SESSION_RECORDING.draft_session_recording_viewed, { recording_mode });
  trackRQLastActivity(SESSION_RECORDING.draft_session_recording_viewed);
};

export const trackDraftSessionDiscarded = () => trackEvent(SESSION_RECORDING.draft_session_discarded);

export const trackDraftSessionNamed = () => trackEvent(SESSION_RECORDING.draft_session_recording_named);

export const trackDraftSessionSaved = ({ session_length, options, type, source, recording_mode }) => {
  trackEvent(SESSION_RECORDING.draft_session_recording_saved, {
    type,
    session_length,
    options,
    source,
    recording_mode,
  });

  trackRQLastActivity(SESSION_RECORDING.draft_session_recording_saved);
};

export const trackDraftSessionSaveFailed = (reason) =>
  trackEvent(SESSION_RECORDING.draft_session_recording_save_failed, { reason });

export const trackSavedSessionViewed = (source) =>
  trackEvent(SESSION_RECORDING.saved_session_recording_viewed, { source });

export const trackBadSessionRecordingViewed = () => trackEvent(SESSION_RECORDING.bad_session_recording_viewed);

export const trackSessionRecordingShareClicked = () => {
  trackEvent(SESSION_RECORDING.session_recording_share_clicked);
  trackRQLastActivity(SESSION_RECORDING.session_recording_share_clicked);
};

export const trackSessionRecordingShareLinkCopied = (source = "app") =>
  trackEvent(SESSION_RECORDING.session_recording_share_link_copied, { source });

export const trackIframeEmbedCopied = () => {
  trackEvent(SESSION_RECORDING.session_recording_iframe_embed_copied);
};

export const trackSessionRecordingVisibilityUpdated = (visibility) => {
  trackEvent(SESSION_RECORDING.session_recording_visibility_updated, {
    visibility,
  });
  trackRQLastActivity(SESSION_RECORDING.session_recording_visibility_updated);
};

export const trackSessionRecordingStartTimeOffsetUpdated = () =>
  trackEvent(SESSION_RECORDING.session_recording_start_time_offset_updated);

export const trackSessionRecordingDeleted = () => {
  trackEvent(SESSION_RECORDING.session_recording_deleted);
  trackRQLastActivity(SESSION_RECORDING.session_recording_deleted);
};

export const trackSessionRecordingDescriptionUpdated = () =>
  trackEvent(SESSION_RECORDING.session_recording_description_added);

export const trackSessionRecordingNameUpdated = () => {
  trackEvent(SESSION_RECORDING.session_recording_name_updated);
};

export const trackSessionRecordingPanelTabClicked = (tab, session_type, source = "app") => {
  trackEvent(SESSION_RECORDING.session_recording_panel_tab_clicked, {
    tab,
    source,
    session_type,
  });
};

export const trackSampleSessionClicked = (log_type) => {
  trackEvent(SESSION_RECORDING.session_recording_panel_sample_session_clicked, {
    log_type,
  });
};

/* ONBOARDING */
export const trackOnboardingPageViewed = () => trackEvent(SESSION_RECORDING.ONBAORDING.onboarding_page_viewed);
export const trackOnboardingSampleSessionViewed = () => trackEvent(SESSION_RECORDING.ONBAORDING.sample_session_viewed);
export const trackStartRecordingWithURLClicked = (source) => {
  trackEvent(SESSION_RECORDING.ONBAORDING.start_recording_clicked, { source });
};
export const trackOnboardingToSettingsNavigate = () => trackEvent(SESSION_RECORDING.ONBAORDING.navigated_to_settings);
export const trackStartRecordingOnExternalTarget = (url) => {
  trackEvent(SESSION_RECORDING.ONBAORDING.navigate_to_target_website, { url });
};
export const trackTriedRecordingForInvalidURL = (url) => {
  trackEvent(SESSION_RECORDING.ONBAORDING.invalid_recording_url, { url });
};

// UPLOAD SESSION
export const trackSessionRecordingUpload = (status) => {
  trackEvent(SESSION_RECORDING.session_recording_upload, { status });
};

export const trackNewSessionClicked = () => {
  trackEvent(SESSION_RECORDING.NEW_SESSION_CLICKED);
};

// CONTEXT MENU
export const trackSessionRecordingNetworkLogContextMenuOpen = () => {
  trackEvent(SESSION_RECORDING.network_log_context_menu_open);
};

export const trackSessionRecordingNetworkLogContextMenuOptionClicked = (option) => {
  trackEvent(SESSION_RECORDING.network_log_context_menu_option_clicked, { option });
};

export function trackLocalSessionRecordingOpened() {
  trackEvent(SESSION_RECORDING.session_recording_file_opened);
}
