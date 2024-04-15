import { StorageService } from "init";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

export const initImplicitTestRuleWidgetConfig = (appMode: string) => {
  StorageService(appMode)
    .getRecord(GLOBAL_CONSTANTS.IMPLICIT_RULE_TESTING_WIDGET_CONFIG)
    .then((record) => {
      if (record === undefined) {
        StorageService(appMode).saveRecord({
          [GLOBAL_CONSTANTS.IMPLICIT_RULE_TESTING_WIDGET_CONFIG]: {
            visibility: GLOBAL_CONSTANTS.IMPLICIT_RULE_TESTING_WIDGET_VISIBILITY.SPECIFIC,
            ruleTypes: [
              GLOBAL_CONSTANTS.RULE_TYPES.SCRIPT,
              GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE,
              GLOBAL_CONSTANTS.RULE_TYPES.REQUEST,
            ],
          },
        });
      }
    });
};
