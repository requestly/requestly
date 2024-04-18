import { StorageService } from "init";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { useCallback } from "react";

export const useInitImplicitWidgetConfig = () => {
  const appMode = useSelector(getAppMode);

  const initImplicitWidgetConfig = useCallback(() => {
    StorageService(appMode)
      .getRecord(GLOBAL_CONSTANTS.STORAGE_KEYS.IMPLICIT_RULE_TESTING_WIDGET_CONFIG)
      .then((record) => {
        if (record === undefined) {
          StorageService(appMode).saveRecord({
            [GLOBAL_CONSTANTS.STORAGE_KEYS.IMPLICIT_RULE_TESTING_WIDGET_CONFIG]: {
              visibility: GLOBAL_CONSTANTS.IMPLICIT_RULE_TESTING_WIDGET_VISIBILITY.ALL,
              ruleTypes: [],
            },
          });
        }
      });
  }, [appMode]);

  return {
    initImplicitWidgetConfig,
  };
};
