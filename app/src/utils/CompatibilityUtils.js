import { FEATURE_COMPATIBLE_VERSION } from "config/constants/compatibility";
import * as semver from "semver";
import { getAppDetails } from "./AppUtils";

/**
 *
 * @param {*} featureName : This should be one of "config/constants/compatibility.FEATURES"
 * @returns {boolean} Whether the feature is compatible or not
 */
export function isFeatureCompatible(featureName) {
  const { app_mode, app_version } = getAppDetails();
  const compatibilityVersionMap = FEATURE_COMPATIBLE_VERSION[featureName] || {};
  return checkVersionCompatibility(
    app_version,
    compatibilityVersionMap[app_mode]
  );
}

const checkVersionCompatibility = (currentVersion, compatibleVersion) => {
  if (!compatibleVersion || !currentVersion) {
    return false;
  }

  try {
    return semver.gte(currentVersion, compatibleVersion);
  } catch (err) {
    // console.log("Nothing to see here");
  }

  return false;
};
