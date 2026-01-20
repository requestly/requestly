import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { ImplicitRuleTestingWidgetConfig } from "../types";
import { clientStorageService } from "services/clientStorageService";

export const updateImplictRuleTestingWidgetConfig = (appMode: string, config: ImplicitRuleTestingWidgetConfig) => {
  clientStorageService.saveStorageObject({
    [GLOBAL_CONSTANTS.STORAGE_KEYS.IMPLICIT_RULE_TESTING_WIDGET_CONFIG]: config,
  });
};

export const getImplicitRuleTestingWidgetConfig = async (appMode: string) => {
  return clientStorageService.getStorageObject(GLOBAL_CONSTANTS.STORAGE_KEYS.IMPLICIT_RULE_TESTING_WIDGET_CONFIG);
};
