import { useState } from "react";
import SettingsItem from "../SettingsItem";
import { trackSettingsToggled } from "modules/analytics/events/misc/settings";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";

import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import APP_CONSTANTS from "config/constants";
import { isFeatureCompatible } from "utils/CompatibilityUtils";

export const SSL_VERIFICATION_STORAGE_KEY = "sslVerificationEnabled";

const isSSLVerificationCompatible = isFeatureCompatible(APP_CONSTANTS.FEATURES.ENABLE_SSL_VALIDATION);

export const isSSLVerificationEnabled = (): boolean => {
  if (!isSSLVerificationCompatible) {
    return true; // Default to enabled if the feature is not compatible
  }
  const storedValue = localStorage.getItem(SSL_VERIFICATION_STORAGE_KEY);
  // Default is true (SSL verification enabled)
  return storedValue === null ? true : storedValue === "true";
};

const persistSSLPreferenceToMainProcess = (enabled: boolean) => {
  window?.RQ?.DESKTOP?.SERVICES?.IPC?.invokeEventInMain("rq-storage:storage-action", {
    type: "USER_PREFERENCE:UPDATE_SSL_VERIFICATION",
    payload: { data: { isSslVerificationEnabled: enabled } },
  }).catch((error: any) => {
    console.warn("Failed to persist SSL verification preference to main process", error);
  });
};

const SSLVerification = () => {
  const [isSslVerificationEnabled, setIsSslVerificationEnabled] = useState<boolean>(isSSLVerificationEnabled);

  const handleChange = (status: boolean) => {
    localStorage.setItem(SSL_VERIFICATION_STORAGE_KEY, String(status));
    setIsSslVerificationEnabled(status);
    persistSSLPreferenceToMainProcess(status);
    trackSettingsToggled("ssl_verification", status ? "enabled" : "disabled");
  };

  const appMode = useSelector(getAppMode);

  return (
    <SettingsItem
      isActive={isSslVerificationEnabled}
      onChange={handleChange}
      disabled={appMode != GLOBAL_CONSTANTS.APP_MODES.DESKTOP}
      title="Enable SSL certificate verification"
      caption="When disabled, Requestly will not verify SSL certificates for API requests."
    />
  );
};

export default SSLVerification;
