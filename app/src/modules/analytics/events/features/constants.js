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
  session_recording_name_updated: "session_recording_name_updated",
  session_recording_panel_tab_clicked: "session_recording_panel_tab_clicked",
  session_recording_panel_sample_session_clicked: "session_recording_panel_sample_session_clicked",
  session_recording_upload: "session_recording_upload",
  session_recording_iframe_embed_copied: "session_recording_iframe_embed_copied",
  NEW_SESSION_CLICKED: "new_session clicked",
  network_log_context_menu_open: "network_log_context_menu_open",
  network_log_context_menu_option_clicked: "network_log_context_menu_option_clicked",
  bad_session_recording_viewed: "bad_session_recording_viewed",
  session_recording_file_opened: "session_recording_file_opened",

  ONBAORDING: {
    onboarding_page_viewed: "session_onboarding_page_viewed",
    sample_session_viewed: "sample_session_viewed",
    start_recording_clicked: "start_recording_btn_clicked",
    invalid_recording_url: "invalid_recording_url_entered",
    navigate_to_target_website: "navigated_to_recording_target",
    navigated_to_settings: "session_onboarding_to_settings_navigated",
  },
  network: {
    import: {
      har: {
        btn_clicked: "import_external_har_button_clicked",
        completed: "import_external_har_completed",
        canceled: "import_external_har_canceled",
      },

      web_sessions: {
        btn_clicked: "import_web_session_button_clicked",
        completed: "import_web_session_completed",
        canceled: "import_web_session_canceled",
      },
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
    back_from_preview: "back_from_preview_clicked",
    har_file_opened: "har_file_opened",
  },
  MOCK_RESPONSES: {
    MOCK_RESPONSES_BUTTON_CLICKED: "mock_responses_button_clicked",
    MOCK_RESPONSES_RESOURCE_TYPE_SELECTED: "mock_responses_resource_type_selected",
    MOCK_RESPONSES_TARGETING_CONDITIONS_SELECTED: "mock_responses_targeting_conditions_selected",
    MOCK_RESPONSES_GRAPHQL_KEY_ENTERED: "mock_responses_graphql_key_entered",
    MOCK_RESPONSES_REQUESTS_SELECTED: "mock_responses_requests_selected",
    MOCK_RESPONSES_CREATE_RULES_CLICKED: "mock_responses_create_rules_clicked",
    MOCK_RESPONSES_RULE_CREATION_STARTED: "mock_responses_rule_creation_started",
    MOCK_RESPONSES_RULE_CREATION_COMPLETED: "mock_responses_rule_creation_completed",
    MOCK_RESPONSES_RULE_CREATION_FAILED: "mock_responses_rule_creation_failed",
    MOCK_RESPONSES_VIEW_NOW_CLICKED: "mock_responses_view_now_clicked",
  },
};

export const SHARED_LIST = {
  CREATED: "sharedList_created",
  LIMIT_REACHED: "sharedList_limit_reached",
  IMPORT_STARTED: "sharedList_import_started",
  IMPORT_FAILED: "sharedList_import_failed",
  IMPORT_COMPLETED: "sharedList_import_completed",
  NOTIFY_CLICKED: "sharedList_notify_button_clicked",
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
    VIEWED: "charles_settings_import_viewed",
    IMPORT_STARTED: "charles_settings_import_started",
    PARSED: "charles_settings_parsed",
    IMPORT_FAILED: "charles_settings_import_failed",
    IMPORT_COMPLETE: "charles_settings_import_completed",
    DOCS_CLICKED: "charles_settings_import_docs_clicked",
  },
};

// TODO: cleanup
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
  COLLECTIONS: {
    DELETED: "mock_collection_deleted",
    UPDATED: "mock_collection_updated",
    CREATED: "mock_collection_created",
  },
};

// TODO: cleanup
export const MOCKSV2 = {
  DELETED: "mock_deleted",
  UPDATED: "mock_updated",
  CREATED: "mock_created",
  SELECTED: "mock_selected",
  STAR_TOGGLED: "mock_star_toggled",
  NEW_MOCK_BUTTON_CLICKED: "new_mock_button_clicked",
  MOCK_EDITOR_OPENED: "mock_editor_opened",
  MOCK_EDITOR_CLOSED: "mock_editor_closed",
  MOCK_UPLOAD_WORKFLOW_STARTED: "mock_upload_workflow_started",
  MOCK_UPLOADED: "mock_uploaded",
  MOCK_UPLOAD_FAILED: "mock_upload_failed",
  MOCKS_EXPORTED: "mocks_exported",
  MOCK_IMPORT_BUTTON_CLICKED: "mock_import_button_clicked",
  MOCKS_JSON_PARSED: "mocks_json_parsed",
  MOCKS_IMPORT_FAILED: "mocks_import_failed",
  MOCKS_IMPORT_COMPLETED: "mocks_import_completed",
  TEST_MOCK_CLICKED: "test_mock_clicked",
  MOCKS_LIST_FILTER_CHANGED: "mocks_list_filter_changed",

  AI_MOCK_RESPONSE_BUTTON_CLICKED: "ai_mock_response_button_clicked",
  AI_MOCK_RESPONSE_GENERATE_CLICKED: "ai_mock_response_generate_clicked",
  AI_MOCK_RESPONSE_USE_CLICKED: "ai_mock_response_use_clicked",
  AI_MOCK_RESPONSE_GENERATED: "ai_mock_response_generated",
  AI_MOCK_RESPONSE_GENERATE_FAILED: "ai_mock_response_generate_failed",

  MOCK_PASSWORD_GENERATE_CLICKED: "mock_password_generate_clicked",
  MOCK_PASSWORD_SAVED: "mock_password_saved",
  MOCK_PASSWORD_SAVE_ERROR: "mock_password_save_error",
  MOCK_PASSWORD_DELETED: "mock_password_deleted",

  // collections
  MOCK_COLLECTION_CREATED: "mock_collection_created",
  MOCK_COLLECTION_UPDATED: "mock_collection_updated",
  MOCK_COLLECTION_DELETED: "mock_collection_deleted",

  // bulk action
  MOCKS_LIST_BULK_ACTION_PERFORMED: "mocks_list_bulk_action_performed",
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
  INSTALL_EXTENSION_DIALOG_SHOWN: "api_client_install_extension_dialog_shown",
  REQUEST_SAVED: "api_client_request_saved",
  REQUEST_RENAMED: "api_client_request_renamed",
  NEW_COLLECTION_CLICKED: "api_client_new_collection_clicked",
  COLLECTION_SAVED: "api_client_collection_saved",
  COLLECTION_RENAMED: "api_client_collection_renamed",
  COLLECTION_DELETED: "api_client_collection_deleted",
  REQUEST_CREATED_IN_COLLECTION: "api_client_request_created_collection",
  EXPORT_COLLECTIONS_CLICKED: "api_client_export_collections_clicked",
  EXPORT_COLLECTIONS_FAILED: "api_client_export_collections_failed",
  EXPORT_COLLECTIONS_SUCCESSFUL: "api_client_export_collections_successful",
  EXPORT_COLLECTIONS_STARTED: "api_client_export_collections_started",
  IMPORT_COLLECTIONS_CLICKED: "api_client_import_collections_clicked",
  IMPORT_COLLECTIONS_FAILED: "api_client_import_collections_failed",
  IMPORT_COLLECTIONS_SUCCESSFUL: "api_client_import_collections_successful",
  IMPORT_COLLECTIONS_STARTED: "api_client_import_collections_started",
  ENABLE_KEY_VALUE_TOGGLED: "api_client_enable_key_value_toggled",
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

export const EXECUTION_LOGS = {
  FETCHED: "execution_logs_fetched",
};

export const RULE_SIMULATOR = {
  SIMULATED: "rule_simulated",
};

export const TEST_URL_CONDITION = {
  TEST_URL_CONDITION_MODAL_VIEWED: "test_URL_condition_modal_viewed",
  TEST_URL_CONDITION_MATCHING_TRIED: "test_URL_condition_matching_tried",
  TEST_URL_CONDITION_SOURCE_MODIFIED: "test_URL_condition_source_modified",
  TEST_URL_CONDITION_SOURCE_MODIFICATION_SAVED: "test_URL_condition_source_modification_saved",
  TEST_URL_CONDITION_MODAL_CLOSED: "test_URL_condition_modal_closed",
  TEST_URL_CONDITION_ANIMATION_VIEWED: "test_URL_condition_animation_viewed",
};

export const RULE_EDITOR = {
  MODIFY_API_RESPONSE: {
    SERVE_WITHOUT_REQUEST_ENABLED: "serveWithoutRequestEnabled",
  },
  TEST_THIS_RULE: {
    TEST_RULE_CLICKED: "test_rule_clicked",
    TEST_RULE_REPORT_GENERATED: "test_rule_report_generated",
    TEST_RULE_RESULT_CLICKED: "test_rule_result_clicked",
    TEST_RULE_SESSION_DRAFT_VIEWED: "test_rule_session_draft_viewed",
    TEST_RULE_SESSION_DRAFT_SAVED: "test_rule_session_draft_saved",
  },
  TROUBLESHOOT_CLICKED: "troubleshoot_clicked",
};

export const TEMPLATES = {
  IMPORT_STARTED: "template_import_started",
  IMPORT_COMPLETED: "template_import_completed",
  VIEW_ALL_TEMPLATES_CLICK: "view_all_templates_click",
  USE_TEMPLATE_CLICK: "use_template_click",
};

export const ECOSYSTEM = {
  ECOSYSTEM_FEATURE_CLICKED: "ecosystem_feature_clicked",
};

export const API_SECURITY_TESTING = {
  API_SECURITY_TESTING_LANDING_PAGE_VIEWED: "api_security_landing_page_viewed",
  API_SECURITY_TESTING_START_PRESSED: "api_security_start_pressed",
};
