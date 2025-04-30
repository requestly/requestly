export const DARK_MODE = {
  TOGGLED: "dark_mode_toggled",
};

export const PROMO_HEADER = {
  CLICKED: "promo_header_clicked",
};

export const FEEDBACK = {
  SUBMITTED: "feedback_submitted",
};

export const INSTALLATION = {
  EXTENSION_INSTALLED: "extension_installed",
  DESKTOP_APP_INSTALLED: "desktop_app_installed",
};

export const UNINSTALLATION = {
  EXTENSION_UNINSTALLED: "extension_uninstalled",
};

export const EXTENSION_CONTEXT_INVALIDATION = {
  MESSAGE_SEEN: "extension_context_invalidated",
  APP_RELOADED_FROM_MESSAGE: "app_reloaded_from_extension_context_invalidated_message",
};

export const ORGANIZATION = {
  VIEW_MORE_USERS_CLICKED: "organization_view_more_users_clicked",
  PAGE_VIEWED: "organization_my_org_page_viewed",
  CREATE_TEAM_SUBSCRIPTION_CLICKED: "organization_create_team_subs_clicked",
};

export const BUSINESS = {
  CHECKOUT: {
    BUTTON_CLICKED: "checkout_button_clicked",
    FAILED: "checkout_failed",
    COMPLETED: "checkout_completed",
    ENTERPRISE_REQUESTED: "enterprise_requested",

    // Suffix "frontend" to differentiate events from backend
    CHECKOUT_INITIATIED: "checkout_initiated_frontend",
    CHECKOUT_COMPLETED: "checkout_completed_frontend",

    BSTACK_STRIPE_CHECKOUT_INITIATED: "bstack_stripe_checkout_initiated",
  },

  TRIAL_MODE_EXPIRED_MODAL_SHOWN: "trial_mode_expired_modal_shown",
  TRIAL_MODE_EXPIRED_UPGRADE_BUTTON_CLICKED: "trial_mode_expired_upgrade_button_clicked",
  UPGRADE_CLICKED: "upgrade_clicked",
  VIEW_GITHUB_CLICKED: "view_github_clicked",
  APPSUMO_CODE_REDEEMED: "appsumo_code_redeemed",
  PRICING_PLAN_CTA_CLICKED: "pricing_plan_cta_clicked",
  PRICING_PLAN_CANCELLATION_REQUESTED: "pricing_plan_cancellation_requested",
  PRICING_PLAN_CANCELLED: "pricing_plan_cancelled",
};

export const INTEREST_CAPTURED = "interest_captured";

export const DESKTOP_ACTION_INTEREST_CAPTURED = "desktop_action_interest_captured";

export const COUPON = {
  COUPON_APPLIED_SUCCESS: "coupon_applied_success",
  COUPON_APPLIED_FAILURE: "coupon_applied_failure",
};

export const PRODUCT_ANNOUNCEMENT = {
  VIEWED: "product_announcement_viewed",
  CLICKED: "product_announcement_clicked",
};

export const HEADER_RULES_MIGRATED_TO_V2 = "headers_rules_migrated_to_v2";

export const PAGE_VIEW = "page_view";

export const VERIFY_EMAIL_CLICKED = "verify_email_clicked";

export const TUTORIALS_CLICKED = "tutorials_clicked";

export const USERNAME = {
  USERNAME_UPDATED: "username_updated",
};

export const COMMAND_PALETTE = {
  COMMAND_PALETTE_OPENED: "command_palette_opened",
  COMMAND_PALETTE_CLOSED: "command_palette_closed",
  COMMAND_PALETTE_OPTION_SELECTED: "command_palette_option_selected",
  COMMAND_PALETTE_OPTION_SEARCHED: "command_palette_option_searched",
};

export const SETTINGS_TOGGLED = "settings_toggled";

export const ONBOARDING = {
  PERSONA_SURVEY: {
    PERSONA_SURVEY_VIEWED: "persona_survey_viewed",
    PERSONA_Q1_COMPLETED: "persona_q1_completed",
    PERSONA_Q2_COMPLETED: "persona_q2_completed",
    PERSONA_Q3_COMPLETED: "persona_q3_completed",
    PERSONA_QUESTIONNAIRE_STARTED: "persona_questionnaire_started",
    PERSONA_RECOMMENDATION_SELECTED: "persona_recommendation_selected",
    PERSONA_RECOMMENDATION_SKIPPED: "persona_recommendation_skipped",
    PERSONA_SURVEY_SIGN_IN_CLICKED: "persona_survey_sign_in_clicked",
    VIEW_ALL_PERSONA_RECOMMENDATION: "view_all_persona_recommendation",
  },
  WORKSPACE: {
    ONBOARDING_WORKSPACE_SKIP: "onboarding_workspace_skip",
    WORKSPACE_ONBOARDING_PAGE_VIEWED: "workspace_onboarding_page_viewed",
  },
};

export const PRODUCT_WALKTHROUGH = {
  WALKTHROUGH_VIEWED: "walkthrough_viewed",
  WALKTHROUGH_STEP_DONE: "walkthrough_step_done",
  WALKTHROUGH_COMPLETED: "walkthrough_completed",
};

export const MORE_INFO = {
  MORE_INFO_SHOWN: "more_info_shown",
  MORE_INFO_VIEWED: "more_info_viewed",
  MORE_INFO_CLICKED: "more_info_clicked",
};

export const SHARING = {
  SHARE_BUTTON_CLICKED: "share_button_clicked",
  SHARE_MODAL_VIEWED: "share_modal_viewed",
  SHARING_TAB_SWITCHED: "sharing_tab_switched",
  RULES_DOWNLOAD_CLICKED: "rules_download_clicked",
  SHARING_MODAL_WORKSPACE_DROPDOWN_CLICKED: "sharing_modal_workspace_dropdown_clicked",
  SHARING_URL_IN_WORKSPACE_COPIED: "sharing_url_in_workspace_copied",
  SHARING_MODAL_RULES_DUPLICATED: "sharing_modal_rules_duplicated",
  SHARING_MODAL_TOAST_VIEWED: "sharing_modal_toast_viewed",
};

export const MONETIZATION_EXPERIMENT = {
  CONTACT_US_CLICKED: "contact_us_clicked",
  UPGRADE_CLICKED: "upgrade_clicked",
  RENEW_NOW_CLICKED: "renew_now_clicked",
};

export const SUBSCRIPTION = {
  PERSONAL_SUBSCRIPTION_INVOICE_CLICKED: "personal_subscription_invoice_clicked",
};

export const SUPPORT_OPTION = {
  CLICKED: "support_option_clicked",
  JOIN_SLACK_CLICKED: "join_slack_connect_clicked",
  OPENED: "support_options_opened",
  SLACK_CONNECT_VISIBLE: "join_slack_connect_viewed",
};
