/**
 * Wrapper over Chrome Storage Service APIs.
 * Usage
 * StorageService
 *  .getInstance({ cacheRecords: true }, context})
 *  .then(() => ...);
 */

(function (window) {
  // Karma tests complain that StorageService is already defined therefore exit when StorageService already exists
  if (window.StorageService && typeof window.StorageService === "function") {
    return;
  }

  window.StorageService = class {
    /**
     *
     * @param options StorageService constructor options
     * @param context Context on which to bind e.g. getInstance({}, RQ).
     * Since initialization is async therefore context is taken as an argument
     * @returns {Promise<any>}
     */
    static getInstance(options, context) {
      return new Promise((resolve) => {
        StorageService.getStorageType().then((storageType) => {
          options.DB = storageType;
          context.StorageService = new StorageService(options);

          resolve();
        });
      });
    }

    constructor(options) {
      this.DB = options.DB ? chrome.storage[options.DB] : chrome.storage[RQ.configs.storageType];
      this.primaryKeys = options.primaryKeys || ["objectType", "ruleType"];
      this.records = [];
      this.isRecordsFetched = false;
      this.cachingEnabled = options["cacheRecords"];

      if (this.cachingEnabled) {
        chrome.storage.onChanged.addListener(this.updateRecords.bind(this));
      }

      this.saveRecordWithID = this.saveRecordWithID.bind(this);
      this.saveRecord = this.saveRecord.bind(this);
      this.getRecord = this.getRecord.bind(this);
      this.getRecords = this.getRecords.bind(this);
      this.fetchRecords = this.fetchRecords.bind(this);
    }

    static getStorageType() {
      return new Promise((resolve) => {
        StorageService.getRecordFromStorage("storageType", "sync").then((storageType) => {
          // If there is no storageType stored, fallback to default setting
          resolve(storageType || RQ.configs.storageType);
        });
      });
    }

    static setStorageType(newStorageType) {
      return StorageService.saveRecordInStorage({ storageType: newStorageType }, "sync");
    }

    fetchRecords(objectType, forceFetch) {
      const self = this;

      return new Promise((resolve, reject) => {
        /* If records have been read from storage, return the cached values */
        if (self.cachingEnabled && self.isRecordsFetched && !forceFetch) {
          resolve(self.filterRecordsByType(self.records, objectType));
          return;
        }

        // Clear the existing records
        self.records.length = 0;

        self.DB.get(null, function (superObject) {
          for (let key in superObject) {
            if (self.hasPrimaryKey(superObject[key])) {
              self.records.push(superObject[key]);
            }
          }

          self.isRecordsFetched = true;
          resolve(self.filterRecordsByType(self.records, objectType));
        });
      });
    }

    hasPrimaryKey(record) {
      for (let index = 0; index < this.primaryKeys.length; index++) {
        if (typeof record[this.primaryKeys[index]] !== "undefined") {
          return true;
        }
      }

      return false;
    }

    filterRecordsByType(records, requestedObjectType) {
      if (!requestedObjectType) {
        return records;
      }

      return records.filter((record) => {
        let objectType = record.objectType || RQ.OBJECT_TYPES.RULE;
        return objectType === requestedObjectType;
      });
    }

    saveRecord(object) {
      return new Promise((resolve, reject) => {
        this.DB.set(object, resolve);
      });
    }

    /**
     * Saves the object which contains ID so that we do not need to specify id as the key and whole object as value
     * @param object
     * @returns {Promise<any>}
     */
    saveRecordWithID(object) {
      return new Promise((resolve) => {
        this.DB.set({ [object.id]: object }, resolve);
      });
    }

    static saveRecordInStorage(object, storageType) {
      return new Promise((resolve) => chrome.storage[storageType].set(object, resolve));
    }

    static getRecordFromStorage(key, storageType) {
      return new Promise((resolve) => chrome.storage[storageType].get(key, (obj) => resolve(obj[key])));
    }

    getRecord(key) {
      const self = this;
      return new Promise((resolve) => self.DB.get(key, (obj) => resolve(obj[key])));
    }

    getRecords(keys) {
      const self = this;
      return new Promise((resolve) => self.DB.get(keys, (obj) => resolve(Object.values(obj))));
    }

    removeRecord(key) {
      const self = this;
      return new Promise((resolve) => self.DB.remove(key, resolve));
    }

    getCachedRecord(key) {
      const recordIndex = this.getCachedRecordIndex(key);
      return this.records[recordIndex];
    }

    getCachedRecordIndex(keyToFind) {
      for (let recordIndex = 0; recordIndex < this.records.length; recordIndex++) {
        const recordKey = this.records[recordIndex].id;

        if (recordKey === keyToFind) {
          return recordIndex;
        }
      }

      return -1;
    }

    /**
     * StorageService.records are updated on every add/edit/delete operation
     * So that background rules can be updated which are executed when each request URL is intercepted
     * @param changes SuperObject with key as Object key which is changed with old and new values
     * @param namespace Storage type: 'sync' or 'local'
     */
    updateRecords(changes, namespace) {
      var changedObject, changedObjectIndex, objectExists, changedObjectKey;

      // If storageType is changed then source the data in new storage
      if (namespace === "sync" && changes.hasOwnProperty("storageType") && changes["storageType"].newValue) {
        this.switchStorageType(changes["storageType"].newValue);
        return;
      }

      if (this.DB === chrome.storage[namespace]) {
        for (changedObjectKey in changes) {
          if (!changes.hasOwnProperty(changedObjectKey)) {
            continue;
          }

          changedObject = changes[changedObjectKey];
          changedObjectIndex = this.getCachedRecordIndex(changedObjectKey);
          objectExists = changedObjectIndex !== -1;

          // Add/Update Object operation
          if (typeof changedObject.newValue !== "undefined") {
            // Don't cache records when objects do not contain primaryKeys
            if (!this.hasPrimaryKey(changedObject.newValue)) {
              continue;
            }

            objectExists
              ? (this.records[changedObjectIndex] = changedObject.newValue) /* Update existing object (Edit) */
              : this.records.push(changedObject.newValue); /* Create New Object */
          }

          // Delete Rule Operation
          if (
            typeof changedObject.oldValue !== "undefined" &&
            typeof changedObject.newValue === "undefined" &&
            objectExists
          ) {
            this.records.splice(changedObjectIndex, 1);
          }
        }
      }
    }

    printRecords() {
      this.DB.get(null, function (o) {
        console.log(o);
      });
    }

    clearDB() {
      this.DB.clear();
    }

    switchStorageType(newStorageType) {
      if (chrome.storage[newStorageType] === this.DB) {
        Logger.log("Already on the same storage type. Doing nothing!");
        return;
      }

      Logger.log("Changing default storageType to", newStorageType);

      const existingStorage = this.DB;

      this.DB = chrome.storage[newStorageType];

      // Clear the existing records
      this.records.length = 0;

      const self = this;
      existingStorage.get(null, (superObject) => {
        const keysToRemove = [];
        for (let key in superObject) {
          if (superObject.hasOwnProperty(key) && self.hasPrimaryKey(superObject[key])) {
            // Save data in the new Storage
            chrome.storage[newStorageType].set({ [key]: superObject[key] });
            keysToRemove.push(key);
          }
        }

        // Remove records from existing storage
        existingStorage.remove(keysToRemove);
      });
    }
  };
})(window);
