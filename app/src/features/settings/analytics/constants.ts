export const SETTINGS = {
  APP_SETTINGS_VIEWED: "app_settings_viewed",
  APP_SETTINGS_SIDEBAR_CLICKED: "app_settings_sidebar_clicked",

  // TODO: Move these constants inside billin folder
  BILLING: {
    BILLING_TEAM_NAVIGATED: "billing_team_navigated",
    BILLING_TEAM_ACTION_CLICKED: "billing_team_action_clicked",
    BILLING_TEAM_NO_MEMBER_FOUND: "billing_team_no_member_found_to_be_added",
    BILLIG_TEAM_MEMBER_ADDED: "billing_team_member_added",
    BILLING_TEAM_MEMBER_REMOVED: "billing_team_member_removed",
    BILLING_TEAM_ROLE_CHANGED: "billing_team_role_changed",
    BILLING_PERSONAL_SUBSCRIPTION_DOWNLOAD_INVOICES_CLICKED: "billing_personal_subscription_download_invoices_clicked",
    REQUEST_BILLING_TEAM_ACCESS_MODAL_VIEWED: "request_billing_team_access_modal_viewed",
    JOIN_BILLING_TEAM_REMINDER_VIEWED: "join_billing_team_reminder_viewed",
    BILLING_TEAM_ACCESS_REQUEST_RESPONDED: "billing_team_access_request_responded",
    BILLING_TEAM_INVITE_MEMBER_CLICKED: "billing_team_invite_member_clicked",
    BILLING_TEAM_INVITE_MEMBER_EMAIL_ENTERRED: "billing_team_invite_member_email_enterred",
    BILLING_TEAM_INVITE_SENT_SUCCESSFULLY: "billing_team_invite_sent_successfully",
    BILLING_TEAM_INVITE_SENDING_FAILED: "billing_team_invite_sending_failed",
    BILLING_TEAM_INVOICE_REQUEST_SENT: "billing_team_invoice_request_sent",
    BILLING_TEAM_INVOICE_REQUEST_FAILED: "billing_team_invoice_request_failed",
    BILLING_TEAM_INVOICE_REQUEST_CLICKED: "billing_team_invoice_request_clicked",
    BILLING_TEAM_MANAGE_PLAN_CLICKED: "billing_team_manage_plan_clicked",
    BILLING_TEAM_MANAGE_LICENSES_CLICKED: "billing_team_manage_licenses_clicked",
    BILLING_TEAM_INVOICE_DASHBOARD_CLICKED: "billing_team_invoice_dashboard_clicked",
  },

  WORKSPACE: {
    WORKSPACE_SETTINGS_GO_TO_BILLING_TEAM_CLICKED: "workspace_settings_go_to_billing_team_clicked",
    WORKSPACE_SETTINGS_LEARN_MORE_CLICKED: "workspace_settings_learn_about_billing_team_clicked",
    WORKSPACE_SETTINGS_AUTOMATIC_MAPPING_TOGGLE_CLICKED: "workspace_settings_automatic_mapping_to_billing_team_toggled",
  },

  DESKTOP: {
    LOCAL_LOG_FILE: {
      TOGGLED: "local_log_file_config_toggled",
      FILTER: {
        ADD: "local_log_file_filter_added",
        REMOVE: "local_log_file_filter_removed",
      },
      STORE_PATH: {
        FILE_SELECTION: {
          STARTED: "local_log_file_store_path_file_selection_started",
          COMPLETED: "local_log_file_store_path_file_selection_completed",
          FAILED: "local_log_file_store_path_file_selection_failed",
        },
        CLEARED: "local_log_file_store_path_cleared",
      },
    },
  },
};
