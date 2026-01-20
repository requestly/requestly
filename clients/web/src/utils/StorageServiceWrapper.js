//CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
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

    this.saveRecord = this.saveRecord.bind(this);

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

  async saveSessionRecordingPageConfig(config) {
    await doSyncRecords(config, SYNC_CONSTANTS.SYNC_TYPES.SESSION_RECORDING_PAGE_CONFIG, this.appMode);
    return this.saveRecord({ sessionRecordingConfig: config });
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
}

export default StorageServiceWrapper;
