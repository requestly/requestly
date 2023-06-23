export const SESSION_RECORDING = {
  session_recording_demo_video_opened: "session_recording_demo_video_opened",
  session_recordings_config_opened: "session_recordings_config_opened",
  session_recordings_config_saved: "session_recordings_config_saved",
  session_recordings_install_extension_dialog_shown: "session_recordings_extension_dialog_opened",
  session_recordings_installation_button_clicked: "session_recordings_installation_button_clicked",
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
  session_recording_start_time_offset_updated: "session_recording_start_time_offset_updated",
  session_recording_deleted: "session_recording_deleted",
  session_recording_description_added: "session_recording_description_added",
  session_recording_panel_tab_clicked: "session_recording_panel_tab_clicked",
  session_recording_panel_sample_session_clicked: "session_recording_panel_sample_session_clicked",

  network: {
    import: {
      btn_clicked: "import_external_har_button_clicked",
      completed: "import_external_har_completed",
      canceled: "import_external_har_canceled",
    },
    delete: {
      btn_clicked: "delete_network_session_clicked_from_list",
      confirmed: "delete_network_session_confimed",
      canceled: "delete_network_session_canceled",
    },
    save: {
      btn_clicked: "save_network_session_button_clicked",
      saved: "new_network_session_saved",
      canceled: "new_network_session_canceled",
    },
    download: "download_network_session_clicked",
  },
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
  VISIBILITY_TOGGLED: "shared_list_visibility_toggled",
  RECIPIENT_ADDED: "shared_list_recipient_added",
};

export const RULES = {
  IMPORT: {
    UPLOAD_RULES_BUTTON_CLICKED: "upload_rules_button_clicked",
    STARTED: "rules_import_started",
    COMPLETED: "rules_import_completed",
    FAILED: "rules_import_failed",
    JSON_PARSED: "rules_json_parsed",
  },

  CHARLES_SETTINGS: {
    IMPORT_STARTED: "charles_settings_import_started",
    PARSED: "charles_settings_parsed",
    IMPORT_FAILED: "charles_settings_import_failed",
    IMPORT_COMPLETE: "charles_settings_import_completed",
    DOCS_CLICKED: "charles_settings_import_docs_clicked",
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
  NEW_MOCK_BUTTON_CLICKED: "new_mock_button_clicked",
  MOCK_EDITOR_OPENED: "mock_editor_opened",
  MOCK_EDITOR_CLOSED: "mock_editor_closed",
  MOCK_UPLOAD_WORKFLOW_STARTED: "mock_upload_workflow_started",
  MOCK_UPLOADED: "mock_uploaded",
  MOCK_UPLOAD_FAILED: "mock_upload_failed",
  TEST_MOCK_CLICKED: "test_mock_clicked",

  AI_MOCK_RESPONSE_BUTTON_CLICKED: "ai_mock_response_button_clicked",
  AI_MOCK_RESPONSE_GENERATE_CLICKED: "ai_mock_response_generate_clicked",
  AI_MOCK_RESPONSE_USE_CLICKED: "ai_mock_response_use_clicked",
  AI_MOCK_RESPONSE_GENERATED: "ai_mock_response_generated",
  AI_MOCK_RESPONSE_GENERATE_FAILED: "ai_mock_response_generate_failed",
};

export const API_CLIENT = {
  REQUEST_SENT: "api_client_request_sent",
  REQUEST_CANCELLED: "api_client_request_cancelled",
  BEAUTIFY_REQUEST_JSON_CLICKED: "api_client_beautify_request_json_clicked",
  IMPORT_CURL_CLICKED: "api_client_import_curl_clicked",
  CURL_IMPORTED: "api_client_curl_imported",
  CURL_IMPORT_FAILED: "api_client_curl_import_failed",
  NEW_REQUEST_CLICKED: "api_client_new_request_clicked",
  REQUEST_SELECTED_FROM_HISTORY: "api_client_request_selected_from_history",
  HISTORY_CLEARED: "api_client_history_cleared",
  REQUEST_FAILED: "api_client_request_failed",
  RESPONSE_LOADED: "api_client_response_loaded",
  RAW_RESPONSE_VIEWED: "api_client_raw_response_viewed",
  RESPONSE_HEADERS_VIEWED: "api_client_response_headers_viewed",
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
  WORKSPACE_INVITE_LINK_GENERATED: "workspace_invite_link_generated",
  WORKSPACE_INVITE_LINK_REVOKED: "workspace_invite_link_revoked",
  WORKSPACE_INVITE_ACCEPTED: "workspace_invite_accepted",
  WORKSPACE_INVITE_SCREEN_ERROR: "workspace_invite_screen_error",
  WORKSPACE_JOINING_MODAL_OPENED: "workspace_joining_modal_opened",
  WORKSPACE_JOIN_CLICKED: "workspace_join_clicked",
  WORKSPACE_ONBOARDING_VIEWED: "workspace_onboarding_viewed",
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

export const RULE_EDITOR = {
  MODIFY_API_RESPONSE: {
    SERVE_WITHOUT_REQUEST_ENABLED: "serveWithoutRequestEnabled",
  },
};

export const TEMPLATES = {
  IMPORT_STARTED: "template_import_started",
  IMPORT_COMPLETED: "template_import_completed",
};
