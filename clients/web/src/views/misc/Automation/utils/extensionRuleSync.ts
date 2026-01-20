import { clientStorageService, initClientStorageService } from "services/clientStorageService";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { Rule } from "@requestly/shared/types/entities/rules";

initClientStorageService(GLOBAL_CONSTANTS.APP_MODES.EXTENSION);

export const clearExtensionStorage = async () => {
  return clientStorageService.clearStorage().catch(() => {
    throw new Error("Failed to clear extension storage");
  });
};

export const saveRulesToExtension = async (rules: Rule[]) => {
  const formattedObject = rules.reduce<Record<string, Rule>>((acc, rule) => {
    if (rule?.id) acc[rule.id] = rule;
    return acc;
  }, {});

  try {
    await clientStorageService.saveStorageObject(formattedObject);
  } catch (error) {
    throw new Error("Failed to save rules to extension storage");
  }
};
