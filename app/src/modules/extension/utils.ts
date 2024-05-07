import { Rule } from "types";
import { parseExtensionRules } from "./mv3RuleParser";
import { StorageService } from "init";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

export const migrateRuleToMV3 = (rule: Rule): Rule => {
  return {
    ...rule,
    extensionRules: parseExtensionRules(rule),
  };
};

export const getMV3MigrationStatus = async (appMode: string) => {
  const mv3MigrationStatus =
    (await StorageService(appMode).getRecord(GLOBAL_CONSTANTS.STORAGE_KEYS.MV3_MIGRATION_STATUS)) ?? {};
  return mv3MigrationStatus;
};

export const saveMV3MigrationStatus = async (appMode: string, migrationStatus: any) => {
  await StorageService(appMode).saveRecord({
    [GLOBAL_CONSTANTS.STORAGE_KEYS.MV3_MIGRATION_STATUS]: {
      ...migrationStatus,
    },
  });
};
