//CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { SYNC_CONSTANTS } from "./syncing/syncConstants";
import { setStorageType } from "actions/ExtensionActions";
import Logger from "lib/logger";
//UTILS
import { getStorageHelper } from "../engines";
import { processRecordsArrayIntoObject } from "./syncing/syncDataUtils";
import { doSyncRecords } from "./syncing/SyncUtils";

class StorageServiceWrapper {
  constructor(options) {
    this.appMode = options.appMode || GLOBAL_CONSTANTS.APP_MODES.EXTENSION;
    this.StorageHelper = getStorageHelper(this.appMode);
    this.primaryKeys = options.primaryKeys || ["objectType", "ruleType"];
    this.records = [];
    this.isRecordsFetched = false;
    this.cachingEnabled = options["cacheRecords"];

    this.saveRecordWithID = this.saveRecordWithID.bind(this);
    this.saveRecord = this.saveRecord.bind(this);
    this.getRecord = this.getRecord.bind(this);
    this.getRecords = this.getRecords.bind(this);
  }

  isSavingThisObjectAllowed(object) {
    // If appMode is Remote, reject everything except Rules & Groups
    if (this.appMode === GLOBAL_CONSTANTS.APP_MODES.REMOTE) {
      // First, it must be an object
      if (
        !(
          typeof object === "object" &&
          !Array.isArray(object) &&
          object !== null
        )
      )
        return false;
      // Now check if its Rule/Group
      for (const objectDefinition of Object.values(object)) {
        if (
          !(
            objectDefinition.objectType ===
              GLOBAL_CONSTANTS.OBJECT_TYPES.RULE ||
            objectDefinition.objectType === GLOBAL_CONSTANTS.OBJECT_TYPES.GROUP
          )
        ) {
          return false;
        }
      }
    }
    return true;
  }

  getAllRecords() {
    return this.StorageHelper.getStorageSuperObject();
  }

  getRecords(objectType, forceFetch) {
    const self = this;
    return new Promise((resolve, reject) => {
      /* If records have been read from storage, return the cached values */
      if (
        self.cachingEnabled &&
        self.isRecordsFetched &&
        !forceFetch &&
        this.appMode !== GLOBAL_CONSTANTS.APP_MODES.REMOTE
      ) {
        resolve(self.filterRecordsByType(self.records, objectType));
        return;
      }

      function filterCallback(superObject) {
        // Clear the existing records
        self.records.length = 0;
        for (let key in superObject) {
          if (self.hasPrimaryKey(superObject[key])) {
            self.records.push(superObject[key]);
          }
        }

        self.isRecordsFetched = true;

        resolve(self.filterRecordsByType(self.records, objectType));
      }
      this.StorageHelper.getStorageSuperObject().then(filterCallback);
    });
  }

  hasPrimaryKey(record) {
    if (
      typeof record === "object" &&
      !Array.isArray(record) &&
      record !== null
    ) {
      for (let index = 0; index < this.primaryKeys.length; index++) {
        if (typeof record[this.primaryKeys[index]] !== "undefined") {
          return true;
        }
      }
    }
    return false;
  }

  filterRecordsByType(records, requestedObjectType) {
    if (!requestedObjectType) {
      return records;
    }

    return records.filter((record) => {
      let objectType = record.objectType || GLOBAL_CONSTANTS.OBJECT_TYPES.RULE;
      return objectType === requestedObjectType;
    });
  }

  async saveRecord(object) {
    if (!this.isSavingThisObjectAllowed(object)) {
      Logger.log("Storage service rejected this record to be saved", object);
      return;
    }
    await this.StorageHelper.saveStorageObject(object);
    this.updateRecord(object);
    return Object.values(object)[0];
  }

  saveRuleOrGroup(object, updateLastModified = true) {
    const formattedObject = {
      [object.id]: {
        ...object,
        modificationDate: updateLastModified
          ? new Date().getTime()
          : object?.modificationDate,
      },
    };
    doSyncRecords(
      formattedObject,
      SYNC_CONSTANTS.SYNC_TYPES.UPDATE_RECORDS,
      this.appMode
    );
    return this.saveRecord(formattedObject);
  }

  saveMultipleRulesOrGroups(array) {
    const formattedObject = {};
    array.forEach((object) => {
      if (object && object.id) formattedObject[object.id] = object;
    });
    doSyncRecords(
      formattedObject,
      SYNC_CONSTANTS.SYNC_TYPES.UPDATE_RECORDS,
      this.appMode
    );
    return this.saveRecord(formattedObject);
  }

  saveRulesOrGroupsWithoutSyncing(array) {
    const formattedObject = processRecordsArrayIntoObject(array);
    return this.saveRecord(formattedObject);
  }

  saveSessionRecordingPageConfig(config) {
    doSyncRecords(
      config,
      SYNC_CONSTANTS.SYNC_TYPES.SESSION_RECORDING_PAGE_CONFIG,
      this.appMode
    );
    return this.saveRecord({ sessionRecordingConfig: config });
  }

  /**
   * Saves the object which contains ID so that we do not need to specify id as the key and whole object as value
   * @param object
   * @returns {Promise<any>}
   */
  async saveRecordWithID(object) {
    if (!this.isSavingThisObjectAllowed(object)) {
      Logger.log("Storage service rejected this record to be saved", object);
      return;
    }
    await this.StorageHelper.saveStorageObject({ [object.id]: object });
    this.updateRecord(object);
  }

  getRecord(key) {
    return this.StorageHelper.getStorageObject(key);
  }

  async removeRecord(key) {
    await this.StorageHelper.removeStorageObject(key);
    doSyncRecords(
      [key],
      SYNC_CONSTANTS.SYNC_TYPES.REMOVE_RECORDS,
      this.appMode
    );
    this.deleteRecord(key);
  }

  removeRecords(array) {
    doSyncRecords(
      array,
      SYNC_CONSTANTS.SYNC_TYPES.REMOVE_RECORDS,
      this.appMode
    );
    return this.StorageHelper.removeStorageObjects(array);
  }

  removeRecordsWithoutSyncing(array) {
    // Seems useless
    return this.StorageHelper.removeStorageObjects(array);
  }

  getCachedRecordIndex(keyToFind) {
    for (
      let recordIndex = 0;
      recordIndex < this.records.length;
      recordIndex++
    ) {
      const recordKey = this.records[recordIndex].id;

      if (recordKey === keyToFind) {
        return recordIndex;
      }
    }

    return -1;
  }

  updateRecord(changedObject) {
    const changedObjectKey = changedObject.id,
      changedObjectIndex = this.getCachedRecordIndex(changedObjectKey),
      objectExists = changedObjectIndex !== -1;

    // Add/Update Object operation
    if (typeof changedObject !== "undefined") {
      // Don't cache records when objects do not contain primaryKeys
      if (!this.hasPrimaryKey(changedObject)) {
        return;
      }

      objectExists
        ? (this.records[
            changedObjectIndex
          ] = changedObject) /* Update existing object (Edit) */
        : this.records.push(changedObject); /* Create New Object */
    }
  }

  deleteRecord(deletedObjectKey) {
    const deletedObjectIndex = this.getCachedRecordIndex(deletedObjectKey);
    this.records.splice(deletedObjectIndex, 1);
  }

  printRecords() {
    this.StorageHelper.getStorageSuperObject().then(function (superObject) {
      console.log(superObject);
    });
  }

  async clearDB() {
    await this.StorageHelper.clearStorage();
    if (this.appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION)
      await setStorageType("local");
    this.records = [];
  }

  saveConsoleLoggerState(state) {
    if (!this.isSavingThisObjectAllowed(state)) {
      Logger.log("Storage service rejected this record to be saved", state);
      return;
    }
    const consoleLoggerState = {
      [GLOBAL_CONSTANTS.CONSOLE_LOGGER_ENABLED]: state,
    };
    this.StorageHelper.saveStorageObject(consoleLoggerState);
  }
}

export default StorageServiceWrapper;
