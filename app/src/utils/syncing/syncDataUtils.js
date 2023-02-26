import {
  getValueAsPromise,
  updateValueAsPromise,
} from "../../actions/FirebaseActions";
import APP_CONSTANTS from "../../config/constants";
import { StorageService } from "../../init";
import {
  trackSyncCompleted,
  trackSyncTriggered,
} from "modules/analytics/events/features/syncing";
import { getAllRulesAndGroups, getAllRulesAndGroupsIds } from "../rules/misc";
import { SYNC_CONSTANTS } from "./syncConstants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { isEqual, uniqWith } from "lodash";
import { isEmpty } from "lodash";
import Logger from "lib/logger";
const _ = require("lodash");

export const getMetadataSyncPath = () => {
  if (window.currentlyActiveWorkspaceTeamId) {
    // This is a team workspace syncing
    return ["teamSync", window.currentlyActiveWorkspaceTeamId, "metadata"];
  } else {
    // This is personal syncing
    return ["sync", window.uid, "metadata"];
  }
};
export const getRecordsSyncPath = () => {
  if (window.currentlyActiveWorkspaceTeamId) {
    // This is a team workspace syncing
    return ["teamSync", window.currentlyActiveWorkspaceTeamId, "records"];
  } else {
    // This is personal syncing
    return ["sync", window.uid, "records"];
  }
};
export const getAllTeamUserRulesConfigPath = () => {
  return [
    "teamSync",
    window.currentlyActiveWorkspaceTeamId,
    "userConfig",
    window.uid,
    "rulesConfig",
  ];
};
export const getTeamUserRuleConfigPath = (ruleOrGroupId) => {
  return [
    "teamSync",
    window.currentlyActiveWorkspaceTeamId,
    "userConfig",
    window.uid,
    "rulesConfig",
    ruleOrGroupId,
  ];
};

export const updateUserSyncMetadata = (uid, metadata, appMode) => {
  return new Promise((resolve, reject) => {
    updateValueAsPromise(getMetadataSyncPath(uid), metadata);

    Logger.log("Writing storage in updateUserSyncMetadata");
    StorageService(appMode)
      .saveRecord(metadata)
      .then(() => resolve())
      .catch(() => reject("err update sync metadata"));
  });
};

const preventWorkspaceSyncWrite = async (
  key,
  localRecords,
  objectId,
  uid,
  remoteRecords
) => {
  if (typeof localRecords[objectId][key] !== "undefined") {
    // Save a copy of user's original value - Can be used later to restore
    await updateValueAsPromise(getTeamUserRuleConfigPath(objectId), {
      [key]: localRecords[objectId][key],
    });
    // Replace the values (if exists on Firebase)
    if (typeof remoteRecords?.[objectId]?.[key] !== "undefined")
      localRecords[objectId][key] = remoteRecords[objectId][key];
  }
  return localRecords;
};

export const updateUserSyncRecords = async (uid, records, appMode) => {
  const localRecords = _.cloneDeep(records);
  // Check if it's team syncing. We might not want to write some props like "isFavourite" to this node. Instead, we can write it to userConfig node
  if (
    appMode !== GLOBAL_CONSTANTS.APP_MODES.REMOTE &&
    window.currentlyActiveWorkspaceTeamId
  ) {
    const syncRuleStatus =
      localStorage.getItem("syncRuleStatus") === "true" || false;
    // Get current values from db and use them xD
    const allRemoteRecords =
      (await getValueAsPromise(getRecordsSyncPath())) || {};
    const remoteRecords = {};
    Object.keys(allRemoteRecords).forEach((key) => {
      if (!isEmpty(allRemoteRecords[key]?.id)) {
        remoteRecords[key] = allRemoteRecords[key];
      }
    });
    for (const objectId in localRecords) {
      try {
        // Key - "isFavourite"
        await preventWorkspaceSyncWrite(
          "isFavourite",
          localRecords,
          objectId,
          uid,
          remoteRecords
        );
        // Key - "status"
        if (!syncRuleStatus) {
          await preventWorkspaceSyncWrite(
            "status",
            localRecords,
            objectId,
            uid,
            remoteRecords
          );
        }
      } catch (error) {
        Logger.log("Remote record doesn't exist", objectId);
        Logger.log(error);
      }
    }
  }

  try {
    await updateValueAsPromise(getRecordsSyncPath(), localRecords);
  } catch (error) {
    Logger.error("err update sync records", error);
  }
};

/**
 * Removes >=1 deleted recordId from sync node
 * @param {String} uid user uid
 * @param {Array} recordIds List of deleted rule ids
 */
export const removeUserSyncRecords = (uid, recordIds) => {
  const getSyncPath = (recordId) => {
    if (window.currentlyActiveWorkspaceTeamId) {
      // This is a team workspace syncing
      return `/teamSync/${window.currentlyActiveWorkspaceTeamId}/records/${recordId}`;
    } else {
      // This is personal syncing
      return `/sync/${uid}/records/${recordId}`;
    }
  };

  const recordIdsObject = {};
  recordIds.forEach((recordId) => {
    recordIdsObject[getSyncPath(recordId)] = null;
  });
  return new Promise((resolve, reject) => {
    // null is passed to update Value as no node ref is
    // required when deleting multiple value using update function
    // reference: https://firebase.google.com/docs/database/web/read-and-write#:~:text=You%20can%20use-,this,-technique%20with%20update
    updateValueAsPromise(null, recordIdsObject)
      .then(() => resolve())
      .catch((e) => reject(JSON.stringify(e) + "err remove sync records"));
  });
};

export const getSyncTimestamp = (uid, appMode) => {
  const syncTimestamp = {};
  return new Promise((resolve) => {
    (async () => {
      try {
        const val = await getValueAsPromise(getMetadataSyncPath(uid));
        syncTimestamp["firebaseTimestamp"] =
          val[APP_CONSTANTS.LAST_SYNC_TIMESTAMP];
      } catch {
        syncTimestamp["firebaseTimestamp"] = null;
      }
      try {
        Logger.log("Reading storage in getSyncTimestamp");
        syncTimestamp["localTimestamp"] = await StorageService(
          appMode
        ).getRecord(APP_CONSTANTS.LAST_SYNC_TIMESTAMP);
      } catch {
        syncTimestamp["localTimestamp"] = null;
      }
      resolve(syncTimestamp);
    })().catch((e) => Logger.log("Caught: " + e));
  });
};

export const processRecordsObjectIntoArray = (records) => {
  const recordsArray = [];
  Object.keys(records).forEach((key) => {
    recordsArray.push(records[key]);
  });
  return recordsArray;
};

// Todo - @sagar - Move this to utils
export const processRecordsArrayIntoObject = (recordsArray) => {
  const formattedObject = {};
  recordsArray.forEach((object) => {
    if (object && object.id) formattedObject[object.id] = object;
  });
  return formattedObject;
};

export const getAllSyncedRecords = async (appMode) => {
  try {
    const allRemoteRecords =
      (await getValueAsPromise(getRecordsSyncPath())) || {};
    const remoteRecords = {};
    Object.keys(allRemoteRecords).forEach((key) => {
      if (!isEmpty(allRemoteRecords[key]?.id)) {
        remoteRecords[key] = allRemoteRecords[key];
      }
    });

    // Todo - @sagar - Fix duplicate code - src/hooks/DbListenerInit/syncingNodeListener.js
    // Check if it's team syncing. We might not want to read some props like "isFavourite" from this not. Instead we an read from userConfig node
    if (
      appMode !== GLOBAL_CONSTANTS.APP_MODES.REMOTE &&
      window.currentlyActiveWorkspaceTeamId
    ) {
      const syncRuleStatus = localStorage.getItem("syncRuleStatus") || false;
      // Get current values from local storage and use them xD
      for (const objectId in remoteRecords) {
        // Get a copy of user's own value
        try {
          const ownRuleConfig = await getValueAsPromise(
            getTeamUserRuleConfigPath(objectId)
          );

          // Key - "isFavourite"
          if (
            ownRuleConfig &&
            typeof ownRuleConfig["isFavourite"] !== "undefined"
          ) {
            remoteRecords[objectId].isFavourite = ownRuleConfig["isFavourite"];
          }
          if (!syncRuleStatus) {
            // Key - "status"
            if (
              ownRuleConfig &&
              typeof ownRuleConfig["status"] !== "undefined"
            ) {
              remoteRecords[objectId].status = ownRuleConfig["status"];
            }
          }
        } catch (error) {
          Logger.log("Local record doesn't exist", objectId);
          Logger.log(error);
        }
      }
    }

    const recordsArr = processRecordsObjectIntoArray(remoteRecords);
    return recordsArr;
  } catch (e) {
    Logger.error(e);
    return [];
  }
};

export const getAllLocalRecords = async (appMode, _sanitizeRules = true) => {
  const { rules, groups } = await getAllRulesAndGroups(appMode, _sanitizeRules);
  return [...rules, ...groups];
};

export const saveRecords = (records, appMode) => {
  Logger.log("Writing storage in saveRecords");
  return StorageService(appMode).saveMultipleRulesOrGroups(records);
};

export const syncToLocalFromFirebase = async (
  allSyncedRecords,
  appMode,
  uid
) => {
  // dump the entire firebase node in the storage
  trackSyncTriggered(
    uid,
    allSyncedRecords.length,
    SYNC_CONSTANTS.SYNC_ALL_RECORDS_TO_LOCAL
  );

  // START - Handles the case where a rule/group is delete from the cloud but still might exist locally
  const recordIdsOnFirebase = allSyncedRecords.map((object) => object.id);
  const recordIdsInStorage = await getAllRulesAndGroupsIds(appMode);
  const recordsThatShouldBeDeletedFromLocal = recordIdsInStorage.filter(
    (x) => !recordIdsOnFirebase.includes(x)
  );
  if (!isEmpty(recordsThatShouldBeDeletedFromLocal)) {
    Logger.log("Removing storage in syncToLocalFromFirebase");
    await StorageService(appMode).removeRecordsWithoutSyncing(
      recordsThatShouldBeDeletedFromLocal
    );
  }

  // END - Handles the case where a rule/group is delete from the cloud but still might exist locally

  // Todo - @sagar - Fix duplicate code - src/utils/syncing/syncDataUtils.js
  // START - Handle prevention of syncing of isFavourite and syncRuleStatus in Team Workspaces
  if (
    appMode !== GLOBAL_CONSTANTS.APP_MODES.REMOTE &&
    window.currentlyActiveWorkspaceTeamId
  ) {
    allSyncedRecords = processRecordsArrayIntoObject(allSyncedRecords);
    const syncRuleStatus =
      localStorage.getItem("syncRuleStatus") === "true" || false;

    // Get current values from local storage and use them xD
    for (const objectId in allSyncedRecords) {
      // Get a copy of user's own value
      try {
        const ownRuleConfig = await getValueAsPromise(
          getTeamUserRuleConfigPath(objectId)
        );

        // Key - "isFavourite"
        if (
          ownRuleConfig &&
          typeof ownRuleConfig["isFavourite"] !== "undefined"
        ) {
          allSyncedRecords[objectId].isFavourite = ownRuleConfig["isFavourite"];
        }
        if (!syncRuleStatus) {
          // Key - "status"
          if (ownRuleConfig && typeof ownRuleConfig["status"] !== "undefined") {
            allSyncedRecords[objectId].status = ownRuleConfig["status"];
          }
        }
      } catch (error) {
        Logger.log("Local record doesn't exist", objectId);
        Logger.log(error);
      }
    }
    allSyncedRecords = processRecordsObjectIntoArray(allSyncedRecords);
  }
  // END - Handle prevention of syncing of isFavourite and syncRuleStatus

  Logger.log("Writing storage in syncToLocalFromFirebase");
  return StorageService(appMode).saveRulesOrGroupsWithoutSyncing(
    allSyncedRecords
  );
};

/**
 * Sets current time as last-synced timestamp in firebase as well as appMode local storage
 * @param {String} uid
 * @param {String} appMode-const appmode from globalstore
 * @param {Number} timestampToUse epoce timestamp
 */
export const setLastSyncTimestamp = async (uid, appMode, timestampToUse) => {
  const timestamp = timestampToUse || getCurrentTimestamp();
  const syncTimestampObject = {
    [APP_CONSTANTS.LAST_SYNC_TIMESTAMP]: timestamp,
  };

  window.skipSyncListenerForNextOneTime = true; // Prevents syncing infinite loop
  updateUserSyncMetadata(uid, syncTimestampObject, appMode); // update in firebase db and local storage
};

/**
 * Sets firebase timestamp as last-synced timestamp in local storage
 * @param {String} appMode-const appmode from globalstore
 * @param {Number} timestampToUse epoch timestamp
 */
export const setLastSyncTimestampInLocalStorage = (
  appMode,
  timestampToUse = null
) => {
  const syncTimestampObject = {
    [APP_CONSTANTS.LAST_SYNC_TIMESTAMP]: timestampToUse,
  };

  Logger.log("Writing storage in setLastSyncTimestampInLocalStorage");
  StorageService(appMode).saveRecord(syncTimestampObject);
};

const getCurrentTimestamp = () => {
  return Date.now();
};

export const mergeRecords = (firebaseRecords, localRecords) => {
  const mergedRecords = [...localRecords];

  firebaseRecords.forEach((firebaseRecord) => {
    const duplicateLocalIndex = mergedRecords.findIndex(
      (data) => data.id === firebaseRecord.id
    );
    if (duplicateLocalIndex !== -1) {
      const duplicateLocalRecord = mergedRecords[duplicateLocalIndex];
      if (
        !duplicateLocalRecord.modificationDate ||
        !firebaseRecord.modificationDate
      ) {
        return;
      }
      if (
        duplicateLocalRecord.modificationDate < firebaseRecord.modificationDate
      ) {
        mergedRecords.splice(duplicateLocalIndex, 1, firebaseRecord);
      }
    } else {
      return mergedRecords.push(firebaseRecord);
    }
  });
  return mergedRecords;
};

// ** SESSION RECORDING SYNC UTILS ** //

const saveSessionRecordingPageConfigLocallyWithoutSync = async (
  object,
  appMode
) => {
  Logger.log(
    "Writing storage in saveSessionRecordingPageConfigLocallyWithoutSync"
  );
  await StorageService(appMode).saveRecord({ sessionRecordingConfig: object });
};

export const getSyncedSessionRecordingPageConfig = (uid) => {
  return new Promise((resolve) => {
    getValueAsPromise(["sync", uid, "configs", "sessionRecordingConfig"])
      .then((config) => {
        resolve(config);
      })
      .catch(() => resolve({}));
  });
};

export const getLocalSessionRecordingPageConfig = (appMode) => {
  Logger.log("Reading storage in getLocalSessionRecordingPageConfig");
  return new Promise((resolve) => {
    StorageService(appMode)
      .getRecord(GLOBAL_CONSTANTS.STORAGE_KEYS.SESSION_RECORDING_CONFIG)
      .then((savedConfig) => resolve(savedConfig || {}));
  });
};

export const syncSessionRecordingPageConfigToFirebase = async (
  uid,
  appMode,
  timestamp
) => {
  const pageConfig = await getLocalSessionRecordingPageConfig(appMode);

  trackSyncTriggered(uid, 1, SYNC_CONSTANTS.SESSION_PAGE_CONFIG);

  updateSessionRecordingPageConfig(uid, pageConfig).then(() => {
    trackSyncCompleted(uid);
  });
  setLastSyncTimestamp(uid, appMode, timestamp);
};

export const updateSessionRecordingPageConfig = (uid, recordObject) => {
  return new Promise((resolve, reject) => {
    updateValueAsPromise(
      ["sync", uid, "configs", "sessionRecordingConfig"],
      recordObject
    )
      .then(() => resolve())
      .catch(() => reject("err update sessionRecordingPageConfg"));
  });
};

export const mergeAndSyncRecordingPageSources = async (uid, appMode) => {
  const allPagesSourceData = [
    {
      key: GLOBAL_CONSTANTS.URL_COMPONENTS.URL,
      operator: GLOBAL_CONSTANTS.RULE_OPERATORS.WILDCARD_MATCHES,
      value: "*",
    },
  ];
  let mergedPageSources;

  const firebaseSessionRecordingPageConfig =
    await getSyncedSessionRecordingPageConfig(uid);
  const localSessionRecordingPageConfig =
    await getLocalSessionRecordingPageConfig(appMode);

  const firebasePageSources =
    firebaseSessionRecordingPageConfig?.pageSources || [];
  const localPageSources = localSessionRecordingPageConfig?.pageSources || [];

  if (
    isEqual(allPagesSourceData, firebasePageSources) ||
    isEqual(allPagesSourceData, localPageSources)
  ) {
    mergedPageSources = allPagesSourceData;
  } else {
    mergedPageSources = uniqWith(
      [...firebasePageSources, ...localPageSources],
      isEqual
    );
  }

  const mergedPageSourcesConfig = {
    ...firebaseSessionRecordingPageConfig,
    pageSources: mergedPageSources,
  };

  saveSessionRecordingPageConfigLocallyWithoutSync(
    mergedPageSourcesConfig,
    appMode
  );
  updateSessionRecordingPageConfig(uid, mergedPageSourcesConfig);
};
