//CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { SYNC_CONSTANTS } from "./syncing/syncConstants";
//UTILS
import { processRecordsArrayIntoObject } from "./syncing/syncDataUtils";
import { doSyncRecords } from "./syncing/SyncUtils";
import { generateObjectId } from "./FormattingHelper";
import { clientStorageService } from "services/clientStorageService";

class StorageServiceWrapper {
  constructor(options) {
    this.appMode = options.appMode || GLOBAL_CONSTANTS.APP_MODES.EXTENSION;
    this.StorageHelper = clientStorageService;
    this.primaryKeys = options.primaryKeys || ["objectType", "ruleType"];

    this.saveRecordWithID = this.saveRecordWithID.bind(this);
    this.saveRecord = this.saveRecord.bind(this);
    this.getRecord = this.getRecord.bind(this);
    this.getRecords = this.getRecords.bind(this);

    this.transactionQueue = new Set(); // promises of transactions that are still pending
    this.transactionLedger = new Map(); // optional: helpful only in putting console logs
  }

  trackPromise(promise) {
    const id = generateObjectId();
    console.log("promise id", id);

    this.transactionQueue.add(promise);
    this.transactionLedger.set(promise, { id, startTime: Date.now() });

    promise.finally(() => {
      const endTime = Date.now();
      const ledgerEntry = this.transactionLedger.get(promise);
      console.log(`Promise resolved: ${ledgerEntry.id}, Duration: ${endTime - ledgerEntry.startTime}ms`);

      this.transactionQueue.delete(promise);
      this.transactionLedger.delete(promise);
    });
  }

  async waitForAllTransactions() {
    await Promise.allSettled([...this.transactionQueue]);
    this.transactionQueue.clear();
    this.transactionLedger.clear();
  }

  getAllRecords() {
    return this.StorageHelper.getStorageSuperObject();
  }

  hasPrimaryKey(record) {
    if (typeof record === "object" && !Array.isArray(record) && record !== null) {
      for (let index = 0; index < this.primaryKeys.length; index++) {
        if (typeof record[this.primaryKeys[index]] !== "undefined") {
          return true;
        }
      }
    }
    return false;
  }

  getRecords(objectType) {
    const self = this;
    return new Promise((resolve) => {
      this.StorageHelper.getStorageSuperObject().then((superObject) => {
        const myArr = [];
        for (let key in superObject) {
          // clear out everything that is not an object with a primary key - eventually allows only rules & groups
          if (self.hasPrimaryKey(superObject[key])) {
            myArr.push(superObject[key]);
          }
        }
        resolve(self.filterRecordsByType(myArr, objectType));
      });
    });
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
    await this.StorageHelper.saveStorageObject(object); // writes to Extension or Desktop storage
    return Object.values(object)[0]; // why???
  }

  /**
   * @param ruleOrGroup rule or group
   * @param options options for save operation
   * @param {boolean} options.silentUpdate do not update last modified timestamp
   * @param {string} options.workspaceId workspace identifier
   * @returns a promise on save of the rule or group
   */
  async saveRuleOrGroup(ruleOrGroup, options = {}) {
    const formattedObject = {
      [ruleOrGroup.id]: {
        ...ruleOrGroup,
        modificationDate: options.silentUpdate ? ruleOrGroup?.modificationDate : new Date().getTime(),
      },
    };
    const promise = doSyncRecords(formattedObject, SYNC_CONSTANTS.SYNC_TYPES.UPDATE_RECORDS, this.appMode, {
      workspaceId: options.workspaceId,
    }).then(() => this.saveRecord(formattedObject));
    this.trackPromise(promise);
    return promise;
  }

  async saveMultipleRulesOrGroups(array, options = {}) {
    const formattedObject = {};
    array.forEach((object) => {
      if (object && object.id) formattedObject[object.id] = object;
    });
    const promise = doSyncRecords(formattedObject, SYNC_CONSTANTS.SYNC_TYPES.UPDATE_RECORDS, this.appMode, {
      workspaceId: options.workspaceId,
    }).then(() => this.saveRecord(formattedObject));
    this.trackPromise(promise);
    return promise;
  }

  saveRulesOrGroupsWithoutSyncing(array) {
    const formattedObject = processRecordsArrayIntoObject(array);
    return this.saveRecord(formattedObject);
  }

  async saveSessionRecordingPageConfig(config) {
    await doSyncRecords(config, SYNC_CONSTANTS.SYNC_TYPES.SESSION_RECORDING_PAGE_CONFIG, this.appMode);
    return this.saveRecord({ sessionRecordingConfig: config });
  }

  /**
   * Saves the object which contains ID so that we do not need to specify id as the key and whole object as value
   * @param object
   * @returns {Promise<any>}
   */
  async saveRecordWithID(object) {
    await this.StorageHelper.saveStorageObject({ [object.id]: object });
  }

  getRecord(key) {
    return this.StorageHelper.getStorageObject(key);
  }

  async removeRecord(key) {
    try {
      const syncResult = await doSyncRecords([key], SYNC_CONSTANTS.SYNC_TYPES.REMOVE_RECORDS, this.appMode);
      await this.StorageHelper.removeStorageObject(key);
      this.trackPromise(Promise.resolve(syncResult));
    } catch (error) {
      console.error("Error removing record:", error);
    }
  }

  async removeRecords(array) {
    try {
      await doSyncRecords(array, SYNC_CONSTANTS.SYNC_TYPES.REMOVE_RECORDS, this.appMode);
      const removalResult = await this.StorageHelper.removeStorageObjects(array);
      this.trackPromise(Promise.resolve(removalResult));
      return removalResult;
    } catch (error) {
      console.error("Error removing record:", error);
      throw error;
    }
  }

  removeRecordsWithoutSyncing(array) {
    return this.StorageHelper.removeStorageObjects(array);
  }

  printRecords() {
    this.StorageHelper.getStorageSuperObject().then(function (superObject) {
      console.log(superObject);
    });
  }

  async clearDB() {
    await this.StorageHelper.clearStorage();
  }

  saveConsoleLoggerState(state) {
    const consoleLoggerState = {
      [GLOBAL_CONSTANTS.CONSOLE_LOGGER_ENABLED]: state,
    };
    this.StorageHelper.saveStorageObject(consoleLoggerState);
  }
}

export default StorageServiceWrapper;
