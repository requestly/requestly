import { FEATURE_COMPATIBLE_VERSION } from "config/constants/compatibility";
import * as semver from "semver";
import { getAppDetails } from "./AppUtils";

/**
 *
 * @param {*} featureName : This should be one of "config/constants/compatibility.FEATURES"
 * @returns {boolean} Whether the feature is compatible or not
 */
export function isFeatureCompatible(featureName) {
  const { app_mode, app_version, os } = getAppDetails();
  const compatibilityVersionMap = FEATURE_COMPATIBLE_VERSION[featureName] || {};
  return checkVersionCompatibility(app_version, os, compatibilityVersionMap[app_mode]);
}

const checkVersionCompatibility = (currentVersion, os, compatibilityCriteria) => {
  if (!compatibilityCriteria || !currentVersion) {
    return false;
  }
  let compatibleVersion;

  if (typeof compatibilityCriteria === "string") {
    // version applicable to all platforms
    compatibleVersion = compatibilityCriteria;
  } else {
    const versionCompatibleToPlatform = compatibilityCriteria?.[os];
    if (!versionCompatibleToPlatform) {
      return false;
    }
    compatibleVersion = versionCompatibleToPlatform;
  }
  try {
    return semver.gte(currentVersion, compatibleVersion);
  } catch (err) {
    // console.log("Nothing to see here");
  }

  return false;
};
