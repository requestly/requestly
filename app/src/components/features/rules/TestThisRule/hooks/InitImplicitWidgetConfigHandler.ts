import { useEffect } from "react";
import { StorageService } from "init";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { getImplicitRuleTestingWidgetConfig, updateImplictRuleTestingWidgetConfig } from "features/settings";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import APP_CONSTANTS from "config/constants";
import { isNull } from "lodash";

export const InitImplicitWidgetConfigHandler = () => {
  const appMode = useSelector(getAppMode);
  const implicitRuleTestingFlag = useFeatureValue("implicit_test_this_rule", null);

  useEffect(() => {
    if (isFeatureCompatible(APP_CONSTANTS.FEATURES.IMPLICIT_TEST_THIS_RULE)) {
      if (!isNull(implicitRuleTestingFlag)) {
        if (implicitRuleTestingFlag.enabled) {
          getImplicitRuleTestingWidgetConfig(appMode).then((record) => {
            if (record === undefined) {
              updateImplictRuleTestingWidgetConfig(appMode, {
                enabled: true,
                visibility: GLOBAL_CONSTANTS.IMPLICIT_RULE_TESTING_WIDGET_VISIBILITY.ALL,
                ruleTypes: [],
              });
            }
          });
        } else {
          StorageService(appMode).removeRecord(GLOBAL_CONSTANTS.STORAGE_KEYS.IMPLICIT_RULE_TESTING_WIDGET_CONFIG);
        }
      }
    }
  }, [appMode, implicitRuleTestingFlag]);
};
