import { useEffect } from "react";
import { useSelector } from "react-redux";
import { StorageService } from "init";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import { getFeatureUsage } from "utils/rules/getFeatureUsage";
import { trackRuleFeatureUsageEvent } from "modules/analytics/events/common/rules";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import Logger from "lib/logger";

const useFeatureUsageEvent = () => {
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);

  useEffect(() => {
    const timerId = setTimeout(() => {
      Logger.log("Reading rules in useFeatureUsageEvent");
      StorageService(appMode)
        .getRecords(GLOBAL_CONSTANTS.OBJECT_TYPES.RULE)
        .then((rules) => {
          if (rules.length > 0) {
            const featureUsageResults = getFeatureUsage(rules);
            if (Object.keys(featureUsageResults).length > 0) {
              trackRuleFeatureUsageEvent(featureUsageResults);
            }
          }
        });
    }, 5000);

    return () => clearTimeout(timerId);
  }, [appMode, user.loggedIn]);
};

export default useFeatureUsageEvent;
