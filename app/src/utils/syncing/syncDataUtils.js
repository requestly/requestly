import {
  getValueAsPromise,
  updateValueAsPromise,
} from "../../actions/FirebaseActions";
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

const defaultSyncValue = "Inactive";
const defaultIsFavouriteValue = false;

export const getMetadataSyncPath = () => {
  if (window.currentlyActiveWorkspaceTeamId) {
    // This is a team workspace syncing
    return ["teamSync", window.currentlyActiveWorkspaceTeamId, "metadata"];
  } else {
    // This is personal syncing
    return ["sync", window.uid, "metadata"];
  }
};

const getTeamSyncPath = (team_id) => {
  const teamId = team_id || window.currentlyActiveWorkspaceTeamId;
  return ["teamSync", teamId, "records"];
};
const getIndividualSyncPath = (uid) => {
  const userId = uid || window.uid;
  return ["sync", userId, "records"];
};

export const getRecordsSyncPath = (syncTarget, uid, team_id) => {
  switch (syncTarget) {
    case "teamSync":
      return getTeamSyncPath(team_id);
    case "sync":
      return getIndividualSyncPath(uid);

    default:
      if (window.currentlyActiveWorkspaceTeamId) {
        return getTeamSyncPath(team_id);
      } else return getIndividualSyncPath(uid);
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
  const teamUserRuleAllConfigsPath = getTeamUserRuleAllConfigsPath();
  teamUserRuleAllConfigsPath.push(ruleOrGroupId);
  return teamUserRuleAllConfigsPath;
};
export const getTeamUserRuleAllConfigsPath = () => {
  return [
    "teamSync",
    window.currentlyActiveWorkspaceTeamId,
    "userConfig",
    window.uid,
    "rulesConfig",
  ];
};

// The intent of this function is to somehow prevent writing of user's personal rule config into teams's rule config
// It works by modifying the original param received: localRecords
const preventWorkspaceSyncWrite = async (
  key,
  localRecords,
  objectId,
  uid,
  remoteRecords
) => {
  // First, if user has defined a personal rule config and it's key, write it in required db node
  if (typeof localRecords?.[objectId]?.[key] !== "undefined") {
    await updateValueAsPromise(getTeamUserRuleConfigPath(objectId), {
      [key]: localRecords[objectId][key],
    });
  }
  // So far, we have set data in user's rule data in his own personal node
  // Now we also need to ensure we don't change the data that is being set for a team.
  // so, replace the team rule node with it's original data (if exists lol)
  if (typeof remoteRecords?.[objectId]?.[key] !== "undefined") {
    // This means some data does actually exist
    // Override "localRecords" with that data
    // (Why localRecords?  - since because localRecords is what actually going to be set on firebase teams node)
    localRecords[objectId][key] = remoteRecords[objectId][key];
  } else {
    // This means this key never existed
    // so remove it before it gets written to teams node in rdb
    delete localRecords[objectId][key];
  }

  return localRecords;
};

export const updateUserSyncRecords = async (uid, records, appMode) => {
  const localRecords = _.cloneDeep(records);
  // Check if it's team syncing. We might not want to write some props like "isFavourite" to this node. Instead, we can write it to userConfig node
  if (window.currentlyActiveWorkspaceTeamId) {
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
    window.skipSyncListenerForNextOneTime = true; // Prevents unnecessary syncing on same browser tab
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

export const parseRemoteRecords = async (appMode, allRemoteRecords = {}) => {
  try {
    const remoteRecords = {};
    Object.keys(allRemoteRecords).forEach((key) => {
      if (!isEmpty(allRemoteRecords[key]?.id)) {
        remoteRecords[key] = allRemoteRecords[key];
      }
    });

    // Todo - @sagar - Fix duplicate code - src/hooks/DbListenerInit/syncingNodeListener.js
    // Check if it's team syncing. We might not want to read some props like "isFavourite" from this not. Instead we an read from userConfig node
    if (window.currentlyActiveWorkspaceTeamId) {
      const syncRuleStatus =
        localStorage.getItem("syncRuleStatus") === "true" || false;
      // Get current values from local storage and use them xD
      const personalRuleConfigs = await getValueAsPromise(
        getTeamUserRuleAllConfigsPath()
      );
      for (const objectId in remoteRecords) {
        // Get a copy of user's own value
        try {
          const ownRuleConfig = personalRuleConfigs[objectId];

          // START - Handle key -  "isFavourite"
          // CASE: Try for user's personal level rule config
          if (ownRuleConfig) {
            // CASE So far, user's personal rule config exists
            if (typeof ownRuleConfig["isFavourite"] === "undefined") {
              // CASE:  user's personal rule config exists but its "isFavourite" key doesn't, use the default value!
              remoteRecords[objectId].isFavourite = defaultIsFavouriteValue;
            } else {
              // CASE: user's personal rule config exists and it also have a value set for "isFavourite", use it!
              remoteRecords[objectId].isFavourite =
                ownRuleConfig["isFavourite"];
            }
          } else {
            // CASE: user's personal rule config doesn't even exits, use the default value!
            remoteRecords[objectId].isFavourite = defaultIsFavouriteValue;
          }
          // END - Handle key -  "isFavourite"

          // START - Handle key - "status"
          if (!syncRuleStatus) {
            // CASE: Team status syncing is not enabled. Try for user's personal level rule config
            if (ownRuleConfig) {
              // CASE So far, user's personal rule config exists
              if (typeof ownRuleConfig["status"] === "undefined") {
                // CASE:  user's personal rule config exists but its "status" doesn't, use the default value!
                remoteRecords[objectId].status = defaultSyncValue;
              } else {
                // CASE: user's personal rule config exists and it also have a value set for "status", use it!
                remoteRecords[objectId].status = ownRuleConfig["status"];
              }
            } else {
              // CASE: user's personal rule config doesn't even exits, use the default value!
              remoteRecords[objectId].status = defaultSyncValue;
            }
          } else {
            // CASE: Team status syncing is enabled, we don't need to look into user's personal level rule config
            // Do nothing, keep using the original value we got from teams rule node
          }
          // END - Handle key - "status"
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
  if (window.currentlyActiveWorkspaceTeamId) {
    allSyncedRecords = processRecordsArrayIntoObject(allSyncedRecords);
    const syncRuleStatus =
      localStorage.getItem("syncRuleStatus") === "true" || false;
    const personalRuleConfigs = await getValueAsPromise(
      getAllTeamUserRulesConfigPath()
    );
    // Get current values from local storage and use them xD
    for (const objectId in allSyncedRecords) {
      // Get a copy of user's own value
      try {
        const ownRuleConfig = personalRuleConfigs[objectId];

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

  const firebaseSessionRecordingPageConfig = await getSyncedSessionRecordingPageConfig(
    uid
  );
  const localSessionRecordingPageConfig = await getLocalSessionRecordingPageConfig(
    appMode
  );

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
