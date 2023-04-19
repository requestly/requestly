//EXTERNALS
import { StorageService } from "../init";
//CONSTANTS
import APP_CONSTANTS from "../config/constants";
// import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
//Actions
import * as ExtensionActions from "../actions/ExtensionActions";
import Logger from "lib/logger";

export const checkIfStorageMigrationStepsAreAlreadyPerformed = (appMode) => {
  Logger.log("Reading storage in checkIfStorageMigrationStepsAreAlreadyPerformed");
  return StorageService(appMode).getRecord(APP_CONSTANTS.STORAGE_MIGRATED_TO_LOCAL);
};

export const setStorageMigrationStepsDone = (appMode) => {
  Logger.log("Writing storage in setStorageMigrationStepsDone");
  return StorageService(appMode).saveRecord({
    [APP_CONSTANTS.STORAGE_MIGRATED_TO_LOCAL]: true,
  });
};

export const executeStorageMigrationSteps = async (appMode) => {
  let storageType = null;

  const res = await ExtensionActions.getStorageInfo();
  storageType = res.storageType;

  if (storageType === "local") return;

  ExtensionActions.setStorageType("local");
};
