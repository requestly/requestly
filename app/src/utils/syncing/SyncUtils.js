import {
  removeValueAsPromise,
  updateValueAsPromise,
} from "../../actions/FirebaseActions";
import {
  updateUserSyncRecords,
  removeUserSyncRecords,
  updateSessionRecordingPageConfig,
  getTeamUserRuleConfigPath,
} from "./syncDataUtils";
import {
  trackSyncCompleted,
  trackSyncFailed,
  trackSyncToggled,
  trackSyncTriggered,
} from "modules/analytics/events/features/syncing";
import { SYNC_CONSTANTS } from "./syncConstants";

/**
 * This functions triggers syncing process
 * @param {Object|Array} formattedObject - It is object when updating else its an array
 * @param {String} syncType
 * @returns void
 *
 * syncing is disabled when storage is remote
 */
export const doSyncRecords = async (records, syncType, appMode) => {
  if (!window.uid) return; // If user is not logged in
  if (!window.isSyncEnabled && !window.currentlyActiveWorkspaceTeamId) return; // If personal syncing is disabled and user has no active workspace

  switch (syncType) {
    case SYNC_CONSTANTS.SYNC_TYPES.UPDATE_RECORDS:
      await updateUserSyncRecords(window.uid, records).catch((e) =>
        console.error(e)
      );
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
    window.skipSyncListenerForNextOneTime = true; // Prevents unnecessary syncing on same browser tab
    await removeUserSyncRecords(window.uid, recordIds);
    // If Team Workspace - Delete user specific rule/group config
    if (window.currentlyActiveWorkspaceTeamId) {
      for (const recordId of recordIds) {
        await removeValueAsPromise(getTeamUserRuleConfigPath(recordId));
      }
    }

    trackSyncCompleted(window.uid);
  } catch (e) {
    trackSyncFailed(
      window.uid,
      SYNC_CONSTANTS.SYNC_REMOVE_RECORDS,
      JSON.stringify(e)
    );
  }
};

const syncSessionRecordingPageConfig = async (object, appMode) => {
  trackSyncTriggered(window.uid, 1, SYNC_CONSTANTS.SESSION_PAGE_CONFIG);
  updateSessionRecordingPageConfig(window.uid, object)
    .then(() => {
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
