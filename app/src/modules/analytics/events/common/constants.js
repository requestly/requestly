export const AUTH = {
  SIGNUP: {
    ATTEMPTED: "signup_attempted",
    FAILED: "signup_failed",
    SUCCESS: "signup_success",

    // new
    BUTTON_CLICKED: "signup_button_clicked",
  },

  LOGIN: {
    ATTEMPTED: "login_attempted",
    REQUESTED: "login_requested",
    SUCCESS: "login_success",
    FAILED: "login_failed",

    // new
    BUTTON_CLICKED: "login_button_clicked",
    EMAIL_ENTERED: "login_email_entered",
    BSTACK_LOGIN_INITIATED: "bstack_login_initiated",
    USER_NOT_FOUND: "login_user_not_found",
    LOGIN_WITH_SSO_CLICKED: "login_with_sso_clicked",
    LOGIN_WITH_GOOGLE_CLICKED: "login_with_google_clicked",
    LOGIN_WITH_MAGIC_LINK_CLICKED: "login_with_magic_link_clicked",
    LOGIN_WITH_PASSWORD_CLICKED: "login_with_password_clicked",
    USER_SWITCHED_EMAIL: "login_user_switched_email",
  },

  LOGOUT: {
    ATTEMPTED: "logout_attempted",
    SUCCESS: "logout_success",
    FAILED: "logout_failed",
  },

  RESET_PASSWORD: {
    ATTEMPTED: "reset_password_attempted",
    SUCCESS: "reset_password_success",
    FAILED: "reset_password_failed",
  },

  FORGOT_PASSWORD: {
    ATTEMPTED: "forgot_password_attempted",
    SUCCESS: "forgot_password_success",
    FAILED: "forgot_password_failed",
  },

  EMAIL_VERIFICATION: {
    SEND_ATTEMPTED: "email_verification_send_attempted",
    SEND_SUCCESS: "email_verification_send_success",
    SEND_FAILED: "email_verification_send_failed",
    SUCCESS: "email_verification_success",
    FAILED: "email_verification_failed",
  },

  EMAIL_LINK_SIGNIN_FORM: {
    SEEN: "email_link_signin_form_seen",
    SUBMITTED: "email_link_signin_form_submitted",
    LINK_RESEND_REQUESTED: "magic_link_resend_requested",

    // New
    LOGIN_WITH_GOOGLE_INSTEAD: "magic_link_login_with_google_instead",
  },

  VERIFY_OOBCODE: {
    ATTEMPTED: "verify_oobcode_attempted",
    FAILED: "verify_oobcode_failed",
    SUCCESS: "verify_oobcode_success",
  },
  AUTH_MODAL: {
    SHOWN: "auth_modal_shown",
    EMAIL_LOGIN_LINK_GENERATED: "email_login_link_generated",
    GENERATE_MAGIC_LINK_FAILED: "magic_link_generation_failed",
  },
  AUTH_ONE_TAP_PROMPT: {
    VISIBLE: "auth_one_tap_prompt_visible",
    ATTEMPTED: "auth_one_tap_prompt_attempted",
  },
  POPOVER: {
    SHOWN: "popover_at_signup_shown",
    CANCELLED: "popover_at_signup_cancelled",
    CONTINUED: "Popover_at_signup_continued",
  },
};

export const SOURCE = {
  NAVBAR: "navbar",
  GETTING_STARTED: "getting_started",
  MOCKS_LIST: "mocks_list",
  MOCKS_GETTING_STARTED: "mocks_getting_started",
  CREATE_FILE_MOCK: "create_file_mock",
  CREATE_NEW_RULE: "create_new_rule",
  CREATE_API_MOCK: "create_api_mock",
  CREATE_NEW_APP: "create_new_app",
  SESSION_RECORDING: "session_recording",
  UPLOAD_FILES: "upload_file_to_server",
  UPLOAD_RULES: "upload_rules",
  SHARE_RULES: "share_rules",
  EXPORT_RULES: "export_rules",
  IMPORT_SHARED_LIST: "import_shared_list",
  ACCESS_SHARED_LIST: "access_shared_list",
  SAVE_DRAFT_SESSION: "save_draft_session",
  ENABLE_SYNC: "enable_syncing",
  ENABLE_BACKUP: "enable_backup",
  LOGIN_CTA: "login_cta",
  SIGNUP_CTA: "signup_cta",
  DELETE_RULE: "delete_rule",
  COMMAND_BAR: "command_bar",
  WORKSPACE_SIDEBAR: "workspace_sidebar",
  RULES_LIST: "rules_list",
  RULE_EDITOR: "rule_editor",
  PERSONA_SURVEY: "persona-survey",
  PERSONA_RECOMMENDATION_SCREEN: "persona_recommendation_screen",
  PRICING_PAGE: "pricing_page",
  HOME_SCREEN: "home_screen",
  DROPDOWN: "dropdown",
  TRIAL_BADGE: "trial_badge",
  SCREEN: "screen",
  RULE_TABLE_CREATE_NEW_RULE_BUTTON: "rule_table_create_new_rule_button",
  CHECKOUT_BILLING_TEAMS: "checkout_billing_teams",
  TRIAL_ONGOING_BADGE: "trial_ongoing_badge",
  TRIAL_EXPIRED_BADGE: "trial_expired_badge",
  REQUEST_FEATURE_MODAL: "request_feature_modal",
  USE_FOR_FREE_NOW: "use_for_free_now",
  MAGIC_LINK: "magic_link",
  ONE_TAP_PROMPT: "one_tap_prompt",
  SIDEBAR_INVITE_BUTTON: "sidebar_invite_button",
  APP_ONBOARDING: "app_onboarding",
  BILLING_TEAM: "billing_team",
  TEST_THIS_RULE: "test_this_rule",
  RULE_GROUP: "rule_group",
  TEMPLATES_SCREEN: "templates_screen",
  PLAN_EXPIRED_BANNER: "plan_expired_banner",
  MV3_MODAL: "mv3_modal",
  API_CLIENT_EMPTY_STATE: "api_client_empty_state",
  SHARED_LIST_SCREEN: "shared_list_screen",
  EXTENSION_ONBOARDING: "extension_onboarding",
  DESKTOP_ONBOARDING: "desktop_onboarding",
  PRICING_TABLE: "pricing_table",
  TEAM_WORKSPACE_BAD_INVITE_SCREEN: "team_workspace_bad_invite_screen",
  WORKSPACE_DROPDOWN: "workspace_dropdown",
};

export const RULES = {
  RULE_CREATED: "rule_created",
  RULE_EDITED: "rule_edited",
  RULE_DELETED: "rule_deleted",
  RULE_TOGGLED: "rule_toggled",
  RULE_TOGGLE_ATTEMPTED: "rule_toggle_attempted",
  RULE_DUPLICATED: "rule_duplicated",
  GROUP_DUPLICATED: "group_duplicated",
  RULE_PIN_TOGGLED: "rule_pin_toggled",
  RULE_EXPORTED: "rule_exported",
  RULE_PAIR_CREATION_ATTEMPTED: "rule_pair_creation_attempted",
  RULE_PAIR_CREATED: "rule_pair_created",
  RULE_FILTER_MODIFIED: "rule_filter_modified",
  RULE_FILTER_MODAL_TOGGLED: "rule_filter_modal_toggled",
  RULE_EXECUTED: "rule_executed",

  RULES_EXPORTED: "rules_exported",
  RULES_DELETED: "rules_deleted",
  RULES_TRASHED: "rules_trashed",
  RULES_UNGROUPED: "rules_ungrouped",
  RULE_CREATION_WORKFLOW_STARTED: "rule_creation_workflow_started",
  RULE_TUTORIAL_MODAL_SHOWN: "rule_tutorial_modal_shown",
  RULE_FEATURE_USAGE: "rule_feature_usage",
  ERROR_IN_RULE_CREATION: "error_in_rule_creation",
  ERROR_IN_SAVING_DNR: "error_in_saving_dnr",
  RULE_EDITOR_CLOSED: "rule_editor_closed",
  RULE_EDITOR_HEADER_CLICKED: "rule_editor_header_clicked",
  NEW_RULE_BUTTON_CLICKED: "new_rule_button_clicked",
  RULE_TYPE_SWITCHED: "rule_type_switched",
  RULE_DEMO_VIDEO_CLICKED: "rule_demo_video_clicked",
  RULES_EMPTY_STATE_CLICKED: "rules_empty_state_clicked",
  GETTING_STARTED_VIDEO_PLAYED: "getting_started_video_played",
  RULE_SIMULATOR_TRIED: "rule_simulator_tried",
  DESKTOP_RULE_VIEWED_ON_EXTENSION: "desktop_rule_viewed_on_extension",
  SAMPLE_REGEX_CLICKED: "sample_regex_clicked",

  // rule details panel
  RULE_DETAILS_PANEL_CLOSED: "rule_details_panel_closed",
  RULE_DETAILS_PANEL_DOCS_CLICKED: "rule_details_panel_docs_clicked",
  RULE_DETAILS_USE_CASE_CLICKED: "rule_details_use_case_clicked",

  // rule editor docs
  DOCS_SIDEBAR_VIEWED: "docs_sidebar_viewed",
  DOCS_SIDEBAR_CLOSED: "docs_sidebar_closed",
  DOCS_SIDEBAR_PRIMARY_CATEGORY_CLICKED: "docs_sidebar_primary_category_clicked",
  DOCS_SIDEBAR_SECONDARY_CATEGORY_CLICKED: "docs_sidebar_secondary_category_clicked",
  DOCS_SIDEBAR_CONTACT_US_CLICKED: "docs_sidebar_contact_us_clicked",
  DOCS_SIDEBAR_DEMOVIDEO_WATCHED: "docs_sidebar_demovideo_watched",
};

export const GROUPS = {
  GROUP_CHANGED: "group_changed",
  GROUP_CREATED: "group_created",
  GROUP_STATUS_TOGGLED: "group_status_toggled",
  GROUP_DELETED: "group_deleted",
};

export const ONBOARDING = {
  INSTALL_EXTENSION_LINK_CLICKED: "install_extension_link_clicked",
  VIEW_ALL_PLATFORMS_CLICKED: "view_all_platforms_clicked",
  HEADER_CLICKED: "header_clicked",
  TOPBAR_CLICKED: "topbar_clicked",
  HELPDESK_CLICKED: "helpdesk_clicked",
  FOOTER_CLICKED: "footer_clicked",
  DESKTOP_APP_PROMO_CLICKED: "desktop_app_download_promo_clicked",
  PRODUCT_HUNT_BANNER_CLICKED: "product_hunt_banner_clicked",
  PRODUCTS_DROPDOWN_CLICKED: "products_dropdown_clicked",
  PRODUCT_CLICKED: "product_clicked",
  PIN_EXTENSION_POPUP_VIEWED: "pin_extension_popup_viewed",
  PIN_EXTENSION_POPUP_EXPANDED: "pin_extension_popup_expanded",
  PIN_EXTENSION_POPUP_CLOSED: "pin_extension_popup_closed",
  APP_NOTIFICATION_BANNER_VIEWED: "app_notification_banner_viewed",
  EXTENSION_INSTALL_CTA_SHOWN: "extension_install_cta_shown",
};

export const TEAMS = {
  WORKSPACE_SWITCHED: "workspace_switched",
  INVITE_TEAMMATES_CLICKED: "invite_teammates_clicked",
  INVITE_TEAMMATES_BANNER_CLICKED: "invite_teammates_banner_clicked",
  INVITE_MORE_TEAMMATES_BUTTON_CLICKED: "invite_more_teammates_button_clicked",
  CREATE_NEW_TEAM_CLICKED: "create_new_team_clicked",
  NEW_WORKSPACE_CREATED: "new_workspace_created",
  WORKSPACE_DELETE_CLICKED: "workspace_delete_clicked",
  WORKSPACE_DELETED: "workspace_deleted",
  REQUEST_TEAM_PLAN_CARD_SHOWN: "request_team_plan_card_shown",
  REQUEST_TEAM_PLAN_CARD_CLICKED: "request_team_plan_card_clicked",
  WORKSPACE_SETTING_TOGGLED: "workspace_setting_toggled",
  WORKSPACE_DROPDOWN_CLICKED: "workspace_dropdown_clicked",
  ADD_WORKSPACE_NAME_MODAL_VIEWED: "add_workspace_name_modal_viewed",
  ADD_MEMBERS_IN_WORKSPACE_MODAL_VIEWED: "add_members_in_worskpace_modal_viewed",
  WORKSPACE_INVITE_LINK_COPIED: "workspace_invite_link_copied",
  TEAM_WORKSPACE_ORGANIZATION_CARD_VIEWED: "team_workspace_organization_card_viewed",
  TEAM_WORKSPACE_ORGANIZATION_CARD_CANCELLED: "team_workspace_organization_card_cancelled",
  TEAM_WORKSPACE_ORGANIZATION_CARD_CLICKED: "team_workspace_organization_card_clicked",
  WORKSPACE_INVITE_ANIMATION_VIEWED: "workspace_invite_animation_viewed",
  GET_TEAM_PLAN_BANNER_VIEWED: "get_team_plan_banner_viewed",
  GET_TEAM_PLAN_BANNER_CLICKED: "get_team_plan_banner_clicked",

  MULTI_WORKSPACE_SELECTED: "multi_workspace_selected",
  MULTI_WORKSPACE_DESELECTED: "multi_workspace_deselected",
  MANAGE_WORKSPACE_CLICKED: "manage_workspace_clicked",

  NEW_TEAM_CREATION_WORKFLOW_STARTED: "new_team_creation_workflow_started",
  LOCAL_WORKSPACE_CREATION_CONFLICT_SHOWN: "local_workspace_creation_conflict_shown",
  LOCAL_WORKSPACE_CREATION_MODE_SELECTED: "local_workspace_creation_mode_selected",
};

export const TRAFFIC_TABLE = {
  SIDEBAR_FILTER_SELECTED: "sidebar_filter_selected",
  SIDEBAR_FILTER_EXPANDED: "sidebar_filter_expanded",
  SIDEBAR_FILTER_COLLAPSED: "sidebar_filter_collapsed",
  SIDEBAR_FILTER_CLEAR_ALL_CLICKED: "sidebar_filter_clear_all_clicked",
};

export const FEATURE_LIMITER = {
  UPGRADE_BANNER_VIEWED: "feature_limiter_upgrade_banner_viewed",
};

export const PRICING = {
  PAID_FEATURE_NUDGE_VIEWED: "paid_feature_nudge_viewed",
  VIEW_PRICING_PLANS_CLICKED: "view_pricing_plans_clicked",
};

export const AI = {
  AI_FEATURES_CONSENT_MODAL_SHOWN: "ai_features_consent_modal_shown",
};
