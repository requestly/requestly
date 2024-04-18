import { StorageService } from "init";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { ImplicitRuleTestingWidgetConfig } from "../types";

export const updateImplictRuleTestingWidgetConfig = (appMode: string, config: ImplicitRuleTestingWidgetConfig) => {
  StorageService(appMode).saveRecord({
    [GLOBAL_CONSTANTS.STORAGE_KEYS.IMPLICIT_RULE_TESTING_WIDGET_CONFIG]: config,
  });
};
