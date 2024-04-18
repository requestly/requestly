import { useEffect } from "react";
import { StorageService } from "init";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { updateImplictRuleTestingWidgetConfig } from "features/settings";

export const InitImplicitWidgetConfigHandler = () => {
  const appMode = useSelector(getAppMode);
  const isImplicitRuleTestingEnabled = useFeatureIsOn("implicit_test_this_rule");

  useEffect(() => {
    if (isImplicitRuleTestingEnabled) {
      StorageService(appMode)
        .getRecord(GLOBAL_CONSTANTS.STORAGE_KEYS.IMPLICIT_RULE_TESTING_WIDGET_CONFIG)
        .then((record) => {
          if (record === undefined) {
            updateImplictRuleTestingWidgetConfig(appMode, {
              visibility: GLOBAL_CONSTANTS.IMPLICIT_RULE_TESTING_WIDGET_VISIBILITY.ALL,
              ruleTypes: [],
            });
          }
        });
    } else {
      StorageService(appMode).removeRecord(GLOBAL_CONSTANTS.STORAGE_KEYS.IMPLICIT_RULE_TESTING_WIDGET_CONFIG);
    }
  }, [appMode, isImplicitRuleTestingEnabled]);
};
