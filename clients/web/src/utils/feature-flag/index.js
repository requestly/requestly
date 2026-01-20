import Logger from "lib/logger";
import posthog from "posthog-js";

class FeatureFlag {
  constructor() {
    this.isFeatureFlagLoaded = false;
    this.isPosthogInit = false;
  }

  // This is initialized after posthog has been initialized
  init = () => {
    this.isPosthogInit = true;
    this.isFeatureFlagLoaded = false;
    posthog.reloadFeatureFlags();
    posthog.onFeatureFlags(() => {
      Logger.log("Feature Flags Loaded");
      featureFlag.setIsFeatureFlagLoaded(true);
    });
  };

  setIsFeatureFlagLoaded = (value) => {
    this.isFeatureFlagLoaded = true;
  };

  getValue = (flagName, defaultValue = null) => {
    if (!flagName) {
      Logger.log("Flag Name is must");
    }

    let flagValue = defaultValue;
    Logger.log("isloaded", this.isFeatureFlagLoaded);
    Logger.log("isInit", this.isPosthogInit);

    if (this.isPosthogInit && posthog) {
      Logger.log(posthog.feature_flags.getFlagVariants());
      flagValue = posthog.getFeatureFlag(flagName);
    }

    return flagValue;
  };
}

const featureFlag = new FeatureFlag();

export default featureFlag;
