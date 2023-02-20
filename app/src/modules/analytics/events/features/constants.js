export const SESSION_RECORDING = {
  session_recording_demo_video_opened: "session_recording_demo_video_opened",
  session_recordings_config_opened: "session_recordings_config_opened",
  session_recordings_config_saved: "session_recordings_config_saved",
  session_recordings_install_extension_dialog_shown:
    "session_recordings_extension_dialog_opened",
  session_recordings_installation_button_clicked:
    "session_recordings_installation_button_clicked",
  session_recording_failed: "session_recording_failed",
  draft_session_recording_viewed: "draft_session_recording_viewed",
  draft_session_discarded: "draft_session_discarded",
  draft_session_recording_named: "draft_session_recording_named",
  draft_session_recording_saved: "draft_session_recording_saved",
  draft_session_recording_save_failed: "draft_session_recording_save_failed",
  saved_session_recording_viewed: "saved_session_recording_viewed",
  session_recording_share_clicked: "session_recording_share_clicked",
  session_recording_share_link_copied: "session_recording_share_link_copied",
  session_recording_visibility_updated: "session_recording_visibility_updated",
  session_recording_start_time_offset_updated:
    "session_recording_start_time_offset_updated",
  session_recording_deleted: "session_recording_deleted",
  session_recording_description_added: "session_recording_description_added",
};

export const SHARED_LIST = {
  CREATED: "sharedList_created",
  LIMIT_REACHED: "sharedList_limit_reached",
  IMPORT_STARTED: "sharedList_import_started",
  IMPORT_FAILED: "sharedList_import_failed",
  IMPORT_COMPLETED: "sharedList_import_completed",
  URL_COPIED: "sharedList_url_copied",
  NOTIFY_CLICKED: "sharedList_notify_button_clicked",
  DELETE_CLICKED: "shared_list_delete_clicked",
};

export const RULES = {
  IMPORT: {
    UPLOAD_RULES_BUTTON_CLICKED: "upload_rules_button_clicked",
    STARTED: "rules_import_started",
    COMPLETED: "rules_import_completed",
    FAILED: "rules_import_failed",
    JSON_PARSED: "rules_json_parsed",
  },
};

export const MOCK_SERVER = {
  MOCKS: {
    DELETED: "mock_deleted",
    UPDATED: "mock_updated",
    CREATED: "mock_created",
  },
  FILES: {
    DELETED: "file_deleted",
    UPDATED: "file_updated",
    CREATED: "file_created",
  },
};

export const MOCKSV2 = {
  DELETED: "mock_deleted",
  UPDATED: "mock_updated",
  CREATED: "mock_created",
  SELECTED: "mock_selected",
};

export const REDIRECT_DESTINATION_OPTION = {
  CLICKED: "redirect_destination_option_clicked",
  SELECTED: "redirect_destination_option_selected",
  TYPE: {
    MOCK: "mock",
    FILE: "file",
  },
};

export const SYNCING = {
  SYNC: {
    TRIGGERED: "sync_triggered",
    TOGGLED: "sync_toggled",
    COMPLETED: "sync_completed",
    FAILED: "sync_failed",
  },
  BACKUP: {
    CREATED: "backup_created",
    ROLLBACKED: "backup_rollbacked",
    TOGGLED: "backup_toggled",
  },
};

export const CONSOLE_LOGGER = {
  TOGGLED: "console_logger_toggled",
};

export const TEAMS = {
  NEW_TEAM_CREATE_SUCCESS: "new_team_create_success",
  NEW_TEAM_CREATE_FAILURE: "new_team_create_failure",
  ADD_TEAM_MEMBER_SUCCESS: "add_team_member_success",
  ADD_TEAM_MEMBER_FAILURE: "add_team_member_failure",
};

export const TRASH = {
  RULES_RECOVERED: "trash_rules_recovered",
};

export const MOBILE_DEBUGGER = {
  SDK_KEY_CREATED: "sdk_key_created",
  SDK_KEY_CREATED_FAILURE: "sdk_key_created_failure",
  DEVICE_ID_SELECTED: "device_id_selected",
  DEVICE_ID_SELECTED_FAILURE: "device_id_selected_failure",
  SHARE_CLICKED: "mobile_app_share_clicked",
  SHARED: "mobile_app_shared",
};

export const EXECUTION_LOGS = {
  FETCHED: "execution_logs_fetched",
};

export const RULE_SIMULATOR = {
  SIMULATED: "rule_simulated",
};

export const TEMPLATES = {
  IMPORT_STARTED: "template_import_started",
  IMPORT_COMPLETED: "template_import_completed",
};
