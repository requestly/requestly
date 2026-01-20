import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { getImplicitRuleTestingWidgetConfig, updateImplictRuleTestingWidgetConfig } from "features/settings";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import APP_CONSTANTS from "config/constants";
import { LOGGER as Logger } from "@requestly/utils";

export const InitImplicitWidgetConfigHandler = () => {
  const appMode = useSelector(getAppMode);

  useEffect(() => {
    if (isFeatureCompatible(APP_CONSTANTS.FEATURES.IMPLICIT_TEST_THIS_RULE)) {
      getImplicitRuleTestingWidgetConfig(appMode)
        .then((record) => {
          if (record === undefined) {
            updateImplictRuleTestingWidgetConfig(appMode, {
              enabled: true,
              visibility: GLOBAL_CONSTANTS.IMPLICIT_RULE_TESTING_WIDGET_VISIBILITY.ALL,
              ruleTypes: [],
            });
          }
        })
        .catch((err) => {
          Logger.log("Error fetching implicit rule testing widget config", err);
        });
    }
  }, [appMode]);
};
