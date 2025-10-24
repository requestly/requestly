import { useFeatureValue } from "@growthbook/growthbook-react";

export const useIsBrowserStackIntegrationOn = () => {
  const isBrowserStackIntegrationEnabled = useFeatureValue("browserstack_integration", true);
  // TODO: Add localStorage.get("forceBsIntegration") check when bookmarklet is implemented
  return isBrowserStackIntegrationEnabled;
};
