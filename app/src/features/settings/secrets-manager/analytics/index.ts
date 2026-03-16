import { trackEvent } from "modules/analytics";
import { SecretProviderType } from "@requestly/shared/types/entities/secretsManager";
import { SECRETS_MANAGER } from "../consts/events";
import { isDesktopMode } from "utils/AppUtils";

type AnalyticsProviderType = "aws_secrets_manager" | "hashicorp_vault" | "azure_key_vault" | "gcp_secret_manager";
type AnalyticsPlatform = "web" | "desktop";

const getPlatform = (): AnalyticsPlatform => (isDesktopMode() ? "desktop" : "web");

export const mapProviderTypeToAnalytics = (type: SecretProviderType): AnalyticsProviderType => {
  switch (type) {
    case SecretProviderType.AWS_SECRETS_MANAGER:
      return "aws_secrets_manager";
    case SecretProviderType.HASHICORP_VAULT:
      return "hashicorp_vault";
    // When azure_key_vault / gcp_secret_manager are added to SecretProviderType,
    // add their cases here so the mapping stays explicit.
    default:
      return type as AnalyticsProviderType;
  }
};

export const trackSecretManagerProviderAddClicked = (source: "provider_list" | "onboarding" | "settings_page") => {
  trackEvent(SECRETS_MANAGER.ADD_PROVIDER_CLICKED, { source, platform: getPlatform() });
};

export const trackSecretManagerProviderConnectionTested = (
  providerType: AnalyticsProviderType,
  testResult: "success" | "failed" | "timeout",
  responseTimeMs: number,
  errorCode?: string
) => {
  trackEvent(SECRETS_MANAGER.PROVIDER_CONNECTION_TESTED, {
    provider_type: providerType,
    test_result: testResult,
    error_code: errorCode || null,
    response_time_ms: responseTimeMs,
  });
};

export const trackSecretManagerProviderAdded = (
  providerType: AnalyticsProviderType,
  providerName: string,
  secretsCount: number
) => {
  trackEvent(SECRETS_MANAGER.PROVIDER_ADDED, {
    provider_type: providerType,
    provider_name: providerName,
    secrets_count: secretsCount,
  });
};

export const trackSecretManagerProviderAddFailed = (
  providerType: AnalyticsProviderType,
  errorCode: string,
  errorMessage: string,
  step: "credential_input" | "connection_test" | "save"
) => {
  trackEvent(SECRETS_MANAGER.PROVIDER_ADD_FAILED, {
    provider_type: providerType,
    error_code: errorCode,
    error_message: errorMessage,
    step,
  });
};

export const trackSecretManagerProviderDeleted = (providerType: AnalyticsProviderType, secretsCount: number) => {
  trackEvent(SECRETS_MANAGER.PROVIDER_DELETED, {
    provider_type: providerType,
    secrets_count: secretsCount,
  });
};

export const trackSecretManagerSecretsFetched = (
  providerType: AnalyticsProviderType,
  secretsCount: number,
  fetchDurationMs: number,
  triggeredBy: "user_action" | "auto_refresh" | "page_load"
) => {
  trackEvent(SECRETS_MANAGER.SECRETS_FETCHED, {
    provider_type: providerType,
    secrets_count: secretsCount,
    fetch_duration_ms: fetchDurationMs,
    triggered_by: triggeredBy,
  });
};

export const trackSecretManagerSecretsFetchFailed = (
  providerType: AnalyticsProviderType,
  errorCode: string,
  errorMessage: string | undefined,
  triggeredBy: "user_action" | "auto_refresh"
) => {
  trackEvent(SECRETS_MANAGER.SECRETS_FETCH_FAILED, {
    provider_type: providerType,
    error_code: errorCode,
    error_message: errorMessage,
    triggered_by: triggeredBy,
  });
};
