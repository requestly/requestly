//EXTERNALS
import { StorageService } from "../init";
//CONSTANTS
import APP_CONSTANTS from "../config/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
//FUNCTIONS
import { setIdsOfRulePairs } from "./rules/set-ids-of-rules-pairs";
import { setSourceFilterFormatOfRulePairs } from "./rules/setSourceFilterFormat";
import { migrateHeaderRulesToV2 } from "./rules/migrateHeaderRulesToV2";
import Logger from "lib/logger";

export const checkIfSourceFilterMigrationStepsAreAlreadyPerformed = (appMode) => {
  Logger.log("Reading storage in checkIfSourceFilterMigrationStepsAreAlreadyPerformed");
  return StorageService(appMode).getRecord(APP_CONSTANTS.MIGRATED_TO_NEW_SOURCE_FILTER_FORMAT);
};

export const checkIfHeadersV2MigrationStepsAreAlreadyPerformed = (appMode) => {
  Logger.log("Reading storage in checkIfHeadersV2MigrationStepsAreAlreadyPerformed");
  return StorageService(appMode).getRecord(APP_CONSTANTS.MIGRATED_HEADER_RULES_TO_V2);
};

export const setHeadersV2MigrationStepsDone = (appMode) => {
  Logger.log("Writing storage in setHeadersV2MigrationStepsDone");
  return StorageService(appMode).saveRecord({
    [APP_CONSTANTS.MIGRATED_HEADER_RULES_TO_V2]: true,
  });
};

export const setSourceFilterMigrationStepsDone = (appMode) => {
  Logger.log("Writing storage in setSourceFilterMigrationStepsDone");
  return StorageService(appMode).saveRecord({
    [APP_CONSTANTS.MIGRATED_TO_NEW_SOURCE_FILTER_FORMAT]: true,
  });
};

export const executeMigrationSteps = async (appMode) => {
  Logger.log("Reading storage in executeMigrationSteps");
  const rules = await StorageService(appMode).getRecords(GLOBAL_CONSTANTS.OBJECT_TYPES.RULE);
  const rulesWithPairIdSet = setIdsOfRulePairs(rules);
  Logger.log("Reading storage in executeMigrationSteps");
  StorageService(appMode).saveMultipleRulesOrGroups(rulesWithPairIdSet);
};

export const executeMigrationForSourceFilterFormat = async (appMode) => {
  Logger.log("Reading storage in executeMigrationForSourceFilterFormat");
  const rules = await StorageService(appMode).getRecords(GLOBAL_CONSTANTS.OBJECT_TYPES.RULE);
  const rulesWithNewSourceFilterFormat = setSourceFilterFormatOfRulePairs(rules);
  Logger.log("Reading storage in executeMigrationForSourceFilterFormat");
  StorageService(appMode).saveMultipleRulesOrGroups(rulesWithNewSourceFilterFormat);
};

export const executeV2MigrationForHeaderRules = async (appMode) => {
  Logger.log("Reading storage in executeV2MigrationForHeaderRules");
  const rules = await StorageService(appMode).getRecords(GLOBAL_CONSTANTS.OBJECT_TYPES.RULE);

  const migratedRules = migrateHeaderRulesToV2(rules);

  Logger.log("Writing storage in executeV2MigrationForHeaderRules");
  StorageService(appMode).saveMultipleRulesOrGroups(migratedRules);
};
