import { getValueAsPromise, updateValueAsPromise } from "../../actions/FirebaseActions";
import { StorageService } from "../../init";
import { trackSyncCompleted, trackSyncTriggered } from "modules/analytics/events/features/syncing";
import { getAllRulesAndGroups, getAllRulesAndGroupsIds } from "../rules/misc";
import { SYNC_CONSTANTS } from "./syncConstants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { isEqual, uniqWith } from "lodash";
import { isEmpty } from "lodash";
import Logger from "lib/logger";
import { rulesFlatObjectToObjectIdArray } from "utils/FormattingHelper";
import APP_CONSTANTS from "config/constants";
import { compressRecords } from "utils/Compression";
import { growthbook } from "utils/feature-flag/growthbook";
import FEATURES from "config/constants/sub/features";
import clientSessionRecordingStorageService from "services/clientStorageService/features/session-recording";
import { clientStorageService } from "services/clientStorageService";
import clientRuleStorageService from "services/clientStorageService/features/rule";
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

export const getTeamUserRuleAllConfigsPath = (
  currentlyActiveWorkspaceTeamId = window.currentlyActiveWorkspaceTeamId,
  uid = window.uid
) => {
  if (!currentlyActiveWorkspaceTeamId || !uid) return null;
  return ["teamSync", currentlyActiveWorkspaceTeamId, "userConfig", uid, "rulesConfig"];
};

export const getTeamUserRuleConfigPath = (ruleOrGroupId) => {
  const teamUserRuleAllConfigsPath = getTeamUserRuleAllConfigsPath();
  if (!teamUserRuleAllConfigsPath) return null;
  teamUserRuleAllConfigsPath.push(ruleOrGroupId);
  return teamUserRuleAllConfigsPath;
};

export const getSyncRuleStatus = () => {
  if (growthbook.isOn(FEATURES.OVERRIDE_TEAM_SYNC_STATUS)) {
    return growthbook.getFeatureValue(FEATURES.OVERRIDEN_SYNC_STATUS_VALUE, true);
  } else {
    return localStorage.getItem("syncRuleStatus") === "true" || false;
  }
};

// The intent of this function is to somehow prevent writing of user's personal rule config into teams's rule config
// It works by modifying the original param received: latestRules
const preventWorkspaceSyncWrite = async (key, latestRules, objectId, uid, remoteRecords, myLocalRecords, appMode) => {
  const localRecords = myLocalRecords || rulesFlatObjectToObjectIdArray(await getAllLocalRecords(appMode));
  // First, if user has defined a personal rule config and it's key, write it in required db node
  if (typeof latestRules?.[objectId]?.[key] !== "undefined" || key === "isFavourite") {
    //@sagarsoni7 todo handle: localRecords doesn't contain empty groups. So they won't get updated. // @nsr: not hanlded, but is an enhancement, no breaking logic I guess
    const teamUserRuleConfigPath = getTeamUserRuleConfigPath(objectId);
    if (!teamUserRuleConfigPath) return;
    updateValueAsPromise(teamUserRuleConfigPath, {
      [key]: latestRules[objectId][key],
    });
  }
  // So far, we have set data in user's rule data in his own personal node
  // Now we also need to ensure we don't change the data that is being set for a team.
  // so, replace the team rule node with it's original data (if exists)
  if (typeof remoteRecords?.[objectId]?.[key] !== "undefined") {
    // This means some data does actually exist
    // Override "latestRules" with that data
    // (Why latestRules?  - since because latestRules is what actually going to be set on firebase teams node)
    latestRules[objectId][key] = remoteRecords[objectId][key];
  } else {
    // This means this key never existed
    // so remove it before it gets written to teams node in rdb
    delete latestRules[objectId][key];
  }

  return latestRules;
};

export const updateUserSyncRecords = async (uid, records, appMode, options) => {
  const targetWorkspaceId = options.workspaceId ?? window.currentlyActiveWorkspaceTeamId;
  const isSameWorkspaceOperation = targetWorkspaceId === window.currentlyActiveWorkspaceTeamId;

  const latestRules = _.cloneDeep(records); // Does not contain all rules, only contains rules that has been updated.

  // Check if it's team syncing. We might not want to write some props like "isFavourite" to this node. Instead, we can write it to userConfig node
  if (isSameWorkspaceOperation && window.currentlyActiveWorkspaceTeamId) {
    const syncRuleStatus = getSyncRuleStatus();
    // Get current values from db and use them xD // @sagar, what's so funny?
    const allRemoteRecords = (await getValueAsPromise(getRecordsSyncPath())) || {};
    const remoteRecords = {};
    Object.keys(allRemoteRecords).forEach((key) => {
      if (!isEmpty(allRemoteRecords[key]?.id)) {
        remoteRecords[key] = allRemoteRecords[key];
      }
    });
    const localRecords = rulesFlatObjectToObjectIdArray(await getAllLocalRecords(appMode));
    for (const objectId in latestRules) {
      try {
        // Key - "isFavourite"
        await preventWorkspaceSyncWrite(
          "isFavourite",
          latestRules,
          objectId,
          uid,
          remoteRecords,
          localRecords,
          appMode
        );
        // Key - "status"
        if (!syncRuleStatus) {
          await preventWorkspaceSyncWrite("status", latestRules, objectId, uid, remoteRecords, localRecords, appMode);
        }
      } catch (error) {
        Logger.log("Remote record doesn't exist", objectId);
        Logger.log(error);
      }
    }
  }

  let syncPath;
  if (isSameWorkspaceOperation) {
    window.skipSyncListenerForNextOneTime = true; // Prevents unnecessary syncing on same browser tab
    syncPath = getRecordsSyncPath();
  } else {
    if (targetWorkspaceId === null) {
      // private workspace
      syncPath = getIndividualSyncPath();
    } else {
      syncPath = getTeamSyncPath(targetWorkspaceId);
    }
  }
  let rulesToWriteToFirebase = latestRules;
  // @nsr: Updates might lead to conflicts if not 100% rolled to all the users using compressed rules
  if (growthbook.isOn(FEATURES.COMPRESS_RULE_PAIRS)) {
    rulesToWriteToFirebase = compressRecords(latestRules);
  }

  try {
    await updateValueAsPromise(syncPath, rulesToWriteToFirebase);
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
      const syncRuleStatus = getSyncRuleStatus();
      // Get current values from local storage and use them
      const teamUserRuleAllConfigsPath = getTeamUserRuleAllConfigsPath();
      if (!teamUserRuleAllConfigsPath) return [];
      const personalRuleConfigs = await getValueAsPromise(teamUserRuleAllConfigsPath);
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
              remoteRecords[objectId].isFavourite = ownRuleConfig["isFavourite"];
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
  // not being used anywhere
  Logger.log("Writing storage in saveRecords");
  return StorageService(appMode).saveMultipleRulesOrGroups(records);
};

export const syncToLocalFromFirebase = async (allSyncedRecords, appMode, uid) => {
  // dump the entire firebase node in the storage
  trackSyncTriggered(uid, allSyncedRecords.length, SYNC_CONSTANTS.SYNC_ALL_RECORDS_TO_LOCAL);

  // START - Handles the case where a rule/group is delete from the cloud but still might exist locally
  const recordIdsOnFirebase = allSyncedRecords.map((object) => object.id);
  const recordIdsInStorage = await getAllRulesAndGroupsIds(appMode);
  const recordsThatShouldBeDeletedFromLocal = recordIdsInStorage.filter((x) => !recordIdsOnFirebase.includes(x));
  if (!isEmpty(recordsThatShouldBeDeletedFromLocal)) {
    Logger.log("Removing storage in syncToLocalFromFirebase");
    await clientStorageService.removeStorageObjects(recordsThatShouldBeDeletedFromLocal);
  }

  // END - Handles the case where a rule/group is delete from the cloud but still might exist locally

  // Todo - @sagar - Fix duplicate code - src/utils/syncing/syncDataUtils.js
  // START - Handle prevention of syncing of isFavourite and syncRuleStatus in Team Workspaces
  if (window.currentlyActiveWorkspaceTeamId) {
    allSyncedRecords = processRecordsArrayIntoObject(allSyncedRecords);
    const syncRuleStatus = getSyncRuleStatus();
    const personalRuleConfigs = await getValueAsPromise(getTeamUserRuleAllConfigsPath(null, uid));
    // Get current values from local storage and use them xD
    for (const objectId in allSyncedRecords) {
      // Get a copy of user's own value
      try {
        const ownRuleConfig = personalRuleConfigs[objectId];

        // Key - "isFavourite"
        if (ownRuleConfig && typeof ownRuleConfig["isFavourite"] !== "undefined") {
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
  await clientRuleStorageService.saveMultipleRulesOrGroups(allSyncedRecords);
  return updateLastSyncedTS(appMode);
};

const updateLastSyncedTS = async (appMode) => {
  return clientStorageService.saveStorageObject({
    [APP_CONSTANTS.LAST_SYNCED_TS]: Date.now(),
  });
};

// Checks if last-synced-ts is later than last-updated-ts - the ideal case
// last updated-ts will be ahead only if updates are performed directly by extension popup
export const checkIfNoUpdateHasBeenPerformedSinceLastSync = async (appMode) => {
  const lastSyncedTS = await clientStorageService.getStorageObject(APP_CONSTANTS.LAST_SYNCED_TS);
  const lastUpdatedTS = await clientStorageService.getStorageObject(APP_CONSTANTS.LAST_UPDATED_TS);
  if (!lastSyncedTS || !lastUpdatedTS) return true; // assumption
  return lastSyncedTS > lastUpdatedTS;
};

// Merge them both
// If same id, retain the one with newer modification date, delete the other one
export const mergeRecords = (firebaseRecords, localRecords) => {
  const mergedRecords = [...localRecords];

  firebaseRecords.forEach((firebaseRecord) => {
    const duplicateLocalIndex = mergedRecords.findIndex((data) => data.id === firebaseRecord.id);
    if (duplicateLocalIndex !== -1) {
      const duplicateLocalRecord = mergedRecords[duplicateLocalIndex];
      if (!duplicateLocalRecord.modificationDate || !firebaseRecord.modificationDate) {
        return;
      }
      if (duplicateLocalRecord.modificationDate < firebaseRecord.modificationDate) {
        mergedRecords.splice(duplicateLocalIndex, 1, firebaseRecord);
      }
    } else {
      return mergedRecords.push(firebaseRecord);
    }
  });
  return mergedRecords;
};

// assumption: Only rule/group "status" and "isFavourite" can cause a conflict. Prioritize local status
export const handleLocalConflicts = (firebaseRecords, localRecords) => {
  const firebaseRecordsCopy = _.cloneDeep(firebaseRecords) || [];
  const output = firebaseRecordsCopy.map((objectItem) => {
    const localRecordIndex = localRecords.findIndex((record) => record.id === objectItem.id);
    if (localRecordIndex !== -1) {
      // record exists in local
      if (localRecords[localRecordIndex].status !== undefined)
        objectItem["status"] = localRecords[localRecordIndex].status;
      if (localRecords[localRecordIndex].isFavourite !== undefined)
        objectItem["isFavourite"] = localRecords[localRecordIndex].isFavourite;
      return objectItem;
    } else {
      // record doesn't even exist in local
      return objectItem;
    }
  });
  return output;
};

// ** SESSION RECORDING SYNC UTILS ** //

export const saveSessionRecordingPageConfigLocallyWithoutSync = async (object, appMode) => {
  Logger.log("Writing storage in saveSessionRecordingPageConfigLocallyWithoutSync");
  await clientSessionRecordingStorageService.saveSessionRecordingConfig(object);
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
    clientSessionRecordingStorageService.getSessionRecordingConfig().then((savedConfig) => resolve(savedConfig || {}));
  });
};

export const syncSessionRecordingPageConfigToFirebase = async (uid, appMode) => {
  const pageConfig = await getLocalSessionRecordingPageConfig(appMode);

  trackSyncTriggered(uid, 1, SYNC_CONSTANTS.SESSION_PAGE_CONFIG);

  updateSessionRecordingPageConfig(uid, pageConfig).then(() => {
    trackSyncCompleted(uid);
  });
};

export const updateSessionRecordingPageConfig = (uid, recordObject) => {
  return new Promise((resolve, reject) => {
    updateValueAsPromise(["sync", uid, "configs", "sessionRecordingConfig"], recordObject)
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

  const firebaseSessionRecordingPageConfig = await getSyncedSessionRecordingPageConfig(uid);
  const localSessionRecordingPageConfig = await getLocalSessionRecordingPageConfig(appMode);

  const firebasePageSources = firebaseSessionRecordingPageConfig?.pageSources || [];
  const localPageSources = localSessionRecordingPageConfig?.pageSources || [];

  if (isEqual(allPagesSourceData, firebasePageSources) || isEqual(allPagesSourceData, localPageSources)) {
    mergedPageSources = allPagesSourceData;
  } else {
    mergedPageSources = uniqWith([...firebasePageSources, ...localPageSources], isEqual);
  }

  const mergedPageSourcesConfig = {
    ...firebaseSessionRecordingPageConfig,
    pageSources: mergedPageSources,
  };

  saveSessionRecordingPageConfigLocallyWithoutSync(mergedPageSourcesConfig, appMode);
  updateSessionRecordingPageConfig(uid, mergedPageSourcesConfig);
};
