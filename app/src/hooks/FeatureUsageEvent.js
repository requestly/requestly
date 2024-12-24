import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getFeatureUsage } from "utils/rules/getFeatureUsage";
import { trackRuleFeatureUsageEvent } from "modules/analytics/events/common/rules";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import Logger from "lib/logger";
import { useFeatureLimiter } from "./featureLimiter/useFeatureLimiter";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import clientRuleStorageService from "services/clientStorageService/features/rule";

const FeatureUsageEvent = () => {
  const user = useSelector(getUserAuthDetails);

  const { checkFeatureLimits } = useFeatureLimiter();

  const isFeatureLimiterOn = useFeatureIsOn("show_feature_limit_banner");

  useEffect(() => {
    if (isFeatureLimiterOn) {
      checkFeatureLimits();
    }
  }, [checkFeatureLimits, isFeatureLimiterOn]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      Logger.log("Reading rules in useFeatureUsageEvent");
      clientRuleStorageService.getRecordsByObjectType(GLOBAL_CONSTANTS.OBJECT_TYPES.RULE).then((rules) => {
        if (rules.length > 0) {
          const featureUsageResults = getFeatureUsage(rules);
          if (Object.keys(featureUsageResults).length > 0) {
            trackRuleFeatureUsageEvent(featureUsageResults);
          }
        }
      });
    }, 5000);

    return () => clearTimeout(timerId);
  }, [user.loggedIn]);

  return null;
};

export default FeatureUsageEvent;
