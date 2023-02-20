//EXTERNALS
import { StorageService } from "../init";
//CONSTANTS
import APP_CONSTANTS from "../config/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
//FUNCTIONS
import { setIdsOfRulePairs } from "./rules/set-ids-of-rules-pairs";
import { setSourceFilterFormatOfRulePairs } from "./rules/setSourceFilterFormat";
import { migrateHeaderRulesToV2 } from "./rules/migrateHeaderRulesToV2";

export const checkIfSourceFilterMigrationStepsAreAlreadyPerformed = (
  appMode
) => {
  return StorageService(appMode).getRecord(
    APP_CONSTANTS.MIGRATED_TO_NEW_SOURCE_FILTER_FORMAT
  );
};

export const checkIfHeadersV2MigrationStepsAreAlreadyPerformed = (appMode) => {
  return StorageService(appMode).getRecord(
    APP_CONSTANTS.MIGRATED_HEADER_RULES_TO_V2
  );
};

export const setHeadersV2MigrationStepsDone = (appMode) => {
  return StorageService(appMode).saveRecord({
    [APP_CONSTANTS.MIGRATED_HEADER_RULES_TO_V2]: true,
  });
};

export const setSourceFilterMigrationStepsDone = (appMode) => {
  return StorageService(appMode).saveRecord({
    [APP_CONSTANTS.MIGRATED_TO_NEW_SOURCE_FILTER_FORMAT]: true,
  });
};

export const executeMigrationSteps = async (appMode) => {
  const rules = await StorageService(appMode).getRecords(
    GLOBAL_CONSTANTS.OBJECT_TYPES.RULE
  );
  const rulesWithPairIdSet = setIdsOfRulePairs(rules);
  StorageService(appMode).saveMultipleRulesOrGroups(rulesWithPairIdSet);
};

export const executeMigrationForSourceFilterFormat = async (appMode) => {
  const rules = await StorageService(appMode).getRecords(
    GLOBAL_CONSTANTS.OBJECT_TYPES.RULE
  );
  const rulesWithNewSourceFilterFormat = setSourceFilterFormatOfRulePairs(
    rules
  );
  StorageService(appMode).saveMultipleRulesOrGroups(
    rulesWithNewSourceFilterFormat
  );
};

export const executeV2MigrationForHeaderRules = async (appMode) => {
  const rules = await StorageService(appMode).getRecords(
    GLOBAL_CONSTANTS.OBJECT_TYPES.RULE
  );

  const migratedRules = migrateHeaderRulesToV2(rules);

  StorageService(appMode).saveMultipleRulesOrGroups(migratedRules);
};
