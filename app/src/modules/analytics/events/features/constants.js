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

  RESOURCE_OVERRIDE_SETTINGS: {
    VIEWED: "resource_override_settings_import_viewed",
    IMPORT_STARTED: "resource_override_settings_import_started",
    PARSED: "resource_override_settings_parsed",
    IMPORT_FAILED: "resource_override_settings_import_failed",
    IMPORT_COMPLETE: "resource_override_settings_import_completed",
    DOCS_CLICKED: "resource_override_settings_import_docs_clicked",
  },

  HEADER_EDITOR_SETTINGS: {
    VIEWED: "header_editor_settings_import_viewed",
    IMPORT_STARTED: "header_editor_settings_import_started",
    PARSED: "header_editor_settings_parsed",
    IMPORT_FAILED: "header_editor_settings_import_failed",
    IMPORT_COMPLETE: "header_editor_settings_import_completed",
    DOCS_CLICKED: "header_editor_settings_import_docs_clicked",
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
  CURL_IMPORT_MODAL_OPENED: "api_client_curl_import_modal_opened",
  EXPORT_COLLECTIONS_FAILED: "api_client_export_collections_failed",
  EXPORT_COLLECTIONS_SUCCESSFUL: "api_client_export_collections_successful",
  EXPORT_COLLECTIONS_STARTED: "api_client_export_collections_started",
  IMPORT_COLLECTIONS_CLICKED: "api_client_import_collections_clicked",
  IMPORT_COLLECTIONS_FAILED: "api_client_import_collections_failed",
  IMPORT_COLLECTIONS_SUCCESSFUL: "api_client_import_collections_successful",
  IMPORT_COLLECTIONS_STARTED: "api_client_import_collections_started",
  IMPORT_FROM_POSTMAN_CLICKED: "api_client_import_from_postman_clicked",
  IMPORT_FROM_POSTMAN_COMPLETED: "api_client_import_from_postman_completed",
  IMPORT_FROM_POSTMAN_FAILED: "api_client_import_from_postman_failed",
  IMPORT_FROM_POSTMAN_STARTED: "api_client_import_from_postman_started",
  IMPORT_FROM_BRUNO_CLICKED: "api_client_import_from_bruno_clicked",
  IMPORT_FROM_BRUNO_COMPLETED: "api_client_import_from_bruno_completed",
  IMPORT_FROM_BRUNO_FAILED: "api_client_import_from_bruno_failed",
  IMPORT_FROM_BRUNO_DATA_PROCESSED: "api_client_import_from_bruno_data_processed",
  IMPORT_FROM_BRUNO_STARTED: "api_client_import_from_bruno_started",
  DUPLICATE_REQUEST_CLICKED: "api_client_duplicate_request_clicked",
  DUPLICATE_REQUEST_SUCCESSFUL: "api_client_duplicate_request_successful",
  DUPLICATE_REQUEST_FAILED: "api_client_duplicate_request_failed",
  MOVE_REQUEST_TO_COLLECTION_CLICKED: "api_client_move_request_to_collection_clicked",
  MOVE_REQUEST_TO_COLLECTION_SUCCESSFUL: "api_client_move_request_to_collection_successful",
  MOVE_REQUEST_TO_COLLECTION_FAILED: "api_client_move_request_to_collection_failed",
  INSTALL_EXTENSION_DIALOG_SHOWN: "api_client_install_extension_dialog_shown",
  RESPONSE_LOADED: "api_client_response_loaded",
  REQUEST_DONE: "api_client_request_done",
  RAW_RESPONSE_VIEWED: "api_client_raw_response_viewed",
  REQUEST_SELECTED_FROM_HISTORY: "api_client_request_selected_from_history",
  HISTORY_CLEARED: "api_client_history_cleared",
  IMPORT_CURL_CLICKED: "api_client_import_curl_clicked",
  CURL_IMPORTED: "api_client_curl_imported",
  CURL_IMPORT_FAILED: "api_client_curl_import_failed",

  // Example collection
  EXAMPLE_COLLECTIONS_IMPORTED: "api_client_example_collections_imported",
  EXAMPLE_COLLECTIONS_IMPORT_FAILED: "api_client_example_collections_import_failed",
  EXAMPLE_COLLECTIONS_NUDGE_SHOWN: "api_client_example_collections_nudge_shown",
  EXAMPLE_COLLECTIONS_NUDGE_CLOSE_CLICKED: "api_client_example_collections_nudge_close_clicked",
  EXAMPLE_COLLECTIONS_NUDGE_IMPORT_CLICKED: "api_client_example_collections_nudge_import_clicked",

  // Local store sync
  LOCAL_STORAGE_SYNC_STARTED: "local_storage_sync_started",
  LOCAL_STORAGE_SYNC_FAILED: "local_storage_sync_failed",
  LOCAL_STORAGE_SYNC_COMPLETED: "local_storage_sync_completed",

  // Request
  REQUEST_SENT: "api_client_request_sent",
  NEW_REQUEST_CLICKED: "api_client_new_request_clicked",
  REQUEST_SAVED: "api_client_request_saved",
  REQUEST_FAILED: "api_client_request_failed",
  REQUEST_DELETED: "api_client_request_deleted",
  REQUEST_DUPLICATED: "api_client_request_duplicated",
  REQUEST_EXPORTED: "api_client_request_exported",
  REQUEST_MOVED: "api_client_request_moved",
  REQUEST_CODE_COPIED: "api_client_request_code_copied",
  REQUEST_RENAMED: "api_client_request_renamed",
  REQUEST_CANCELLED: "api_client_request_cancelled",

  // Tab
  NEW_TAB_OPENED: "api_client_new_tab_opened",

  // Collection
  NEW_COLLECTION_CLICKED: "api_client_new_collection_clicked",
  COLLECTION_SAVED: "api_client_collection_saved",
  COLLECTION_RENAMED: "api_client_collection_renamed",
  COLLECTION_EXPORTED: "api_client_collection_exported",
  COLLECTION_DELETED: "api_client_collection_deleted",

  // Environment & Variables
  ENVIRONMENT_CLICKED: "api_client_new_environment_clicked",
  VARIABLES_UPDATED: "api_client_variables_updated",
  VARIABLE_CREATED: "api_client_variable_created",
  ENVIRONMENT_SWITCHED: "api_client_environment_switched",
  ENVIRONMENT_RENAMED: "api_client_environment_renamed",
  ENVIRONMENT_DUPLICATED: "api_client_environment_duplicated",
  ENVIRONMENT_EXPORTED: "api_client_environment_exported",
  ENVIRONMENT_DELETED: "api_client_environment_deleted",

  // Import Data
  IMPORT_STARTED: "api_client_import_started",
  IMPORT_DATA_PARSED: "api_client_import_requests_parsed",
  IMPORT_DATA_FAILED: "api_client_import_requests_parsing_failed",
  IMPORT_SUCCESS: "api_client_import_success",
  IMPORT_FAILED: "api_client_import_failed",

  // Collection Runner
  COLLECTION_RUN_STARTED: "api_client_collection_run_started",
  COLLECTION_RUN_STOPPED: "api_client_collection_run_stopped",
  COLLECTION_RUN_HISTORY_VIEWED: "api_client_collection_run_history_viewed",
  COLLECTION_RUN_SAVE_HISTORY_FAILED: "api_client_collection_run_save_history_failed",
  COLLECTION_RUNNER_VIEWED: "api_client_collection_runner_viewed",
  COLLECTION_RUNNER_CONFIG_SAVED: "api_client_collection_runner_config_saved",
  COLLECTION_RUNNER_CONFIG_SAVE_FAILED: "api_client_collection_runner_config_save_failed",

  // Tests Autogeneration
  TEST_GENERATION_STARTED: "api_client_test_generation_started",
  TEST_GENERATION_COMPLETED: "api_client_test_generation_completed",
  TEST_GENERATION_FAILED: "api_client_test_generation_failed",

  //Data-File Support for Collection Runner
  COLLECTION_RUNNER_SELECT_FILE_CLICKED: "api_client_collection_runner_select_file_clicked",
  COLLECTION_RUNNER_FILE_PARSED: "api_client_collection_runner_file_parsed",
  COLLECTION_RUNNER_FILE_PARSE_FAILED: "api_client_collection_runner_file_parse_failed",
  COLLECTION_RUNNER_FILE_RECORD_LIMIT_EXCEEDED: "api_client_collection_runner_file_record_limit_exceeded",
  COLLECTION_RUNNER_TRUNCATED_FILE_USED: "api_client_collection_runner_truncated_file_used",
  COLLECTION_RUNNER_FILE_CLEARED: "api_client_collection_runner_file_cleared",
  AI_GENERATE_TESTS_BTN_CLICKED: "ai_generate_tests_btn_clicked",
  AI_GENERATE_TESTS_POPOVER_GENERATE_CLICKED: "ai_generate_tests_popover_generate_clicked",
  AI_GENERATE_TESTS_FAILED: "ai_generate_tests_failed",
  AI_GENERATE_TESTS_SUCCESSFUL: "ai_generate_tests_successful",
  AI_GENERATE_TESTS_EDIT_PROMPT_CLICKED: "ai_generate_tests_edit_prompt_clicked",
  AI_GENERATE_TESTS_REJECT_ALL_CLICKED: "ai_generate_tests_reject_all_clicked",
  AI_GENERATE_TESTS_ACCEPT_ALL_CLICKED: "ai_generate_tests_accept_all_clicked",
  AI_GENERATE_TESTS_ACCEPT_CLICKED: "ai_generate_tests_accept_clicked",
  AI_GENERATE_TESTS_REJECT_CLICKED: "ai_generate_tests_reject_clicked",
  AI_GENERATION_REVIEW_COMPLETED: "ai_generation_review_completed",
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
