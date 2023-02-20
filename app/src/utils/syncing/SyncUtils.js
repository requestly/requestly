import {
  removeValueAsPromise,
  updateValueAsPromise,
} from "../../actions/FirebaseActions";
import {
  updateUserSyncRecords,
  removeUserSyncRecords,
  getSyncTimestamp,
  getAllLocalRecords,
  getAllSyncedRecords,
  syncAllRulesAndGroupsToFirebase,
  setLastSyncTimestamp,
  mergeRecords,
  syncToLocalFromFirebase,
  saveRecords,
  updateSessionRecordingPageConfig,
  syncSessionRecordingPageConfigToFirebase,
  mergeAndSyncRecordingPageSources,
  getTeamUserRuleConfigPath,
} from "./syncDataUtils";
import {
  trackSyncCompleted,
  trackSyncFailed,
  trackSyncToggled,
  trackSyncTriggered,
} from "modules/analytics/events/features/syncing";
import { SYNC_CONSTANTS } from "./syncConstants";
import { isLocalStoragePresent } from "utils/AppUtils";

/**
 * This functions triggers syncing process
 * @param {Object|Array} formattedObject - It is object when updating else its an array
 * @param {String} syncType
 * @returns void
 *
 * syncing is disabled when storage is remote
 */
export const doSyncRecords = (records, syncType, appMode) => {
  if (!window.uid) return; // If user is not logged in
  if (!window.isSyncEnabled && !window.currentlyActiveWorkspaceTeamId) return; // If personal syncing is disabled and user has no active workspace

  switch (syncType) {
    case SYNC_CONSTANTS.SYNC_TYPES.UPDATE_RECORDS:
      syncRecordUpdates(records, appMode);
      break;

    case SYNC_CONSTANTS.SYNC_TYPES.REMOVE_RECORDS:
      syncRecordsRemoval(records, appMode);
      break;

    case SYNC_CONSTANTS.SYNC_TYPES.SESSION_RECORDING_PAGE_CONFIG:
      syncSessionRecordingPageConfig(records, appMode);
      break;

    default:
      return null;
  }
};

export const setSyncState = async (uid, state) => {
  return new Promise((resolve, reject) => {
    updateValueAsPromise(["users", uid, "profile"], { isSyncEnabled: state })
      .then(() => {
        trackSyncToggled(uid, state);
        resolve(true);
      })
      .catch(() => {
        reject(false);
      });
  });
};

/**
 * Should run when records from storage are deleted and needs syncing with database. Expects an array of ruleIds
 * @param {Array} recordIds
 * @param {String} uid
 * @param {String} appMode
 */
export const syncRecordsRemoval = async (recordIds, appMode) => {
  trackSyncTriggered(
    window.uid,
    recordIds.length,
    SYNC_CONSTANTS.SYNC_REMOVE_RECORDS
  );

  try {
    await removeUserSyncRecords(window.uid, recordIds);
    // If Team Workspace - Delete user specific rule/group config
    if (window.currentlyActiveWorkspaceTeamId) {
      for (const recordId of recordIds) {
        await removeValueAsPromise(getTeamUserRuleConfigPath(recordId));
      }
    }

    setLastSyncTimestamp(window.uid, appMode);
    trackSyncCompleted(window.uid);
  } catch (e) {
    trackSyncFailed(
      window.uid,
      SYNC_CONSTANTS.SYNC_REMOVE_RECORDS,
      JSON.stringify(e)
    );
  }
};

/**
 * Should run when records are created/updated to sync with database
 * @param {Object} recordsObject
 * @param {String} uid
 * @param {String} appMode
 */
export const syncRecordUpdates = async (recordsObject, appMode) => {
  const recordLength = Object.keys(recordsObject)?.length;
  trackSyncTriggered(
    window.uid,
    recordLength,
    SYNC_CONSTANTS.SYNC_UPDATE_RECORDS
  );
  updateUserSyncRecords(window.uid, recordsObject)
    .then(() => {
      setLastSyncTimestamp(window.uid, appMode);
      trackSyncCompleted(window.uid);
    })
    .catch((e) =>
      trackSyncFailed(
        window.uid,
        SYNC_CONSTANTS.SYNC_UPDATE_RECORDS,
        JSON.stringify(e)
      )
    );
};

const syncSessionRecordingPageConfig = async (object, appMode) => {
  trackSyncTriggered(window.uid, 1, SYNC_CONSTANTS.SESSION_PAGE_CONFIG);
  updateSessionRecordingPageConfig(window.uid, object)
    .then(() => {
      setLastSyncTimestamp(window.uid, appMode);
      trackSyncCompleted(window.uid);
    })
    .catch((e) =>
      trackSyncFailed(
        window.uid,
        SYNC_CONSTANTS.SESSION_PAGE_CONFIG,
        JSON.stringify(e)
      )
    );
};

export const checkTimestampAndSync = async (uid, appMode) => {
  if (!isLocalStoragePresent(appMode)) {
    return;
  }

  const { firebaseTimestamp, localTimestamp } = await getSyncTimestamp(
    uid,
    appMode
  );

  if (!firebaseTimestamp) {
    syncAllRulesAndGroupsToFirebase(uid, appMode);
    syncSessionRecordingPageConfigToFirebase(uid, appMode);
  } else {
    const allLocalRecords = await getAllLocalRecords(appMode, false);
    const allSyncedRecords = await getAllSyncedRecords(appMode);

    // if rules in local and in firebase and !localts----> merge and sync to firebase
    if (
      !localTimestamp &&
      allLocalRecords.length > 0 &&
      allSyncedRecords.length >= 0
    ) {
      // set current ts to both lts and fts
      const mergedRecords = mergeRecords(allSyncedRecords, allLocalRecords);
      trackSyncTriggered(
        uid,
        mergedRecords.length,
        SYNC_CONSTANTS.MERGE_AND_SYNC_TO_FIREBASE
      );
      saveRecords(mergedRecords, appMode);
      trackSyncCompleted(uid);
    }
    // else if no rules in local and !localts ---->  add to local from firebase
    else if (!localTimestamp && allLocalRecords.length === 0) {
      await syncToLocalFromFirebase(
        allSyncedRecords,
        appMode,
        firebaseTimestamp,
        uid
      );
      trackSyncCompleted(uid);
    }
    // else if localts==firebasets ---->  merge and add to local from firebase
    else if (localTimestamp === firebaseTimestamp) {
      const mergedRecords = mergeRecords(allSyncedRecords, allLocalRecords);
      trackSyncTriggered(
        uid,
        mergedRecords.length,
        SYNC_CONSTANTS.MERGE_AND_SYNC_TO_FIREBASE_LTS_EQUALS_FTS
      );
      saveRecords(mergedRecords, appMode);
      trackSyncCompleted(uid);
    }
    // else if fts>lts ---> add to local from firebase
    else if (firebaseTimestamp > localTimestamp) {
      await syncToLocalFromFirebase(
        allSyncedRecords,
        appMode,
        firebaseTimestamp,
        uid
      );
      trackSyncCompleted(uid);
    }
    // else if lts>fts ---> sync to firebase, this case is only possible when rules are not synced to firebase due to bad connection
    else if (localTimestamp > firebaseTimestamp) {
      const mergedRecords = mergeRecords(allSyncedRecords, allLocalRecords);
      trackSyncTriggered(
        uid,
        mergedRecords.length,
        SYNC_CONSTANTS.MERGE_AND_SYNC_TO_FIREBASE_LTS_EXCEEDS_FTS
      );
      saveRecords(mergedRecords, appMode);
      trackSyncCompleted(uid);
    }

    // Session Recording Syncing
    mergeAndSyncRecordingPageSources(uid, appMode);
  }
};
