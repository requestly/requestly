import { GettingStarted as GettingStartedV1 } from "./v1";
import { GettingStarted as GettingStartedV2 } from "./v2";
import { useFeatureValue } from "@growthbook/growthbook-react";

export const GettingStarted = () => {
  const variation = useFeatureValue("rules_screen_empty_state", "control");
  return variation === "control" ? <GettingStartedV1 /> : <GettingStartedV2 />;
};
