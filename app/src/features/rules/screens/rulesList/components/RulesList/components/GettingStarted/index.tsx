import { GettingStarted as GettingStartedV1 } from "./v1";
import { GettingStarted as GettingStartedV2 } from "./v2";

export const GettingStarted = () => {
  const isff = 0;
  return isff ? <GettingStartedV1 /> : <GettingStartedV2 />;
};
