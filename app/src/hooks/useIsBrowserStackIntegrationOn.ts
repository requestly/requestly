import { useFeatureValue } from "@growthbook/growthbook-react";
import { isEnvDev } from "utils/EnvUtils";

export const useIsBrowserStackIntegrationOn = () => {
  const featureValue = useFeatureValue("browserstack_integration", true);
  const isBrowserStackIntegrationEnabled = isEnvDev() ? false : featureValue;
  // TODO: Add localStorage.get("forceBsIntegration") check when bookmarklet is implemented
  return isBrowserStackIntegrationEnabled;
};
