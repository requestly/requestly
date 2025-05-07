import { useFeatureIsOn } from "@growthbook/growthbook-react";

export const useIsBrowserStackIntegrationOn = () => {
  const isBrowserStackIntegrationEnabled = useFeatureIsOn("browserstack_integration");
  // TODO: Add localStorage.get("forceBsIntegration") check when bookmarklet is implemented
  return isBrowserStackIntegrationEnabled;
};
