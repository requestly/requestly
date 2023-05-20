import { removeValueAsPromise, updateValueAsPromise } from "../../actions/FirebaseActions";
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
import { StorageService } from "init";
import Logger from "lib/logger";
import APP_CONSTANTS from "config/constants";

declare global {
  interface Window {
    uid: string | undefined;
    isSyncEnabled: boolean | undefined;
    currentlyActiveWorkspaceTeamId: string | undefined;
  }
}
type SyncType = "update_records" | "remove_records" | "session_recording_page_config";
type AppMode = "EXTENSION" | "DESKTOP";

/**
 * This function triggers the syncing process based on syncType and records.
 *
 * @param {Array | Object} records - Records to be synced, it can be an object or array.
 * @param {String} syncType - The type of sync operation.
 * @param {AppMode} appMode Current mode of the app.
 * @param {Object} options - Additional options for syncing.
 *
 * @returns void
 *
 * Note: Syncing is disabled when storage is remote.
 */

export const doSyncRecords = async (
  records: Array<any> | object,
  syncType: SyncType,
  appMode: AppMode,
  options: { forceSync?: boolean; workspaceId?: string } = {}
): Promise<void> => {
  // If the user is not logged in, do not proceed with syncing
  if (!window.uid) return;

  // If personal syncing is disabled and user has no active workspace, do not proceed with syncing unless forceSync is true
  if (!options.forceSync && !window.isSyncEnabled && !window.currentlyActiveWorkspaceTeamId) return;

  switch (syncType) {
    case SYNC_CONSTANTS.SYNC_TYPES.UPDATE_RECORDS:
      // Update user sync records
      await updateUserSyncRecords(window.uid, records, appMode, {
        workspaceId: options.workspaceId,
      }).catch(Logger.error);
      break;

    case SYNC_CONSTANTS.SYNC_TYPES.REMOVE_RECORDS:
      // Sync records removal
      syncRecordsRemoval(records, appMode);
      break;

    case SYNC_CONSTANTS.SYNC_TYPES.SESSION_RECORDING_PAGE_CONFIG:
      // Sync session recording page configuration
      syncSessionRecordingPageConfig(records, appMode);
      break;

    default:
      // If the syncType is not recognized, do not proceed with syncing
      return null;
  }
};

export const setSyncState = async (uid, state, appMode) => {
  return new Promise((resolve, reject) => {
    updateValueAsPromise(["users", uid, "profile"], { isSyncEnabled: state })
      .then(async () => {
        if (!state) await StorageService(appMode).removeRecordsWithoutSyncing([APP_CONSTANTS.LAST_SYNC_TARGET]);
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
  trackSyncTriggered(window.uid, recordIds.length, SYNC_CONSTANTS.SYNC_REMOVE_RECORDS);

  try {
    window.skipSyncListenerForNextOneTime = true; // Prevents unnecessary syncing on same browser tab
    await removeUserSyncRecords(window.uid, recordIds);
    // If Team Workspace - Delete user specific rule/group config
    if (window.currentlyActiveWorkspaceTeamId) {
      for (const recordId of recordIds) {
        const teamUserRuleConfigPath = getTeamUserRuleConfigPath(recordId);
        if (!teamUserRuleConfigPath) return;
        await removeValueAsPromise(teamUserRuleConfigPath);
      }
    }

    trackSyncCompleted(window.uid);
  } catch (e) {
    trackSyncFailed(window.uid, SYNC_CONSTANTS.SYNC_REMOVE_RECORDS, JSON.stringify(e));
  }
};

const syncSessionRecordingPageConfig = async (object, appMode) => {
  trackSyncTriggered(window.uid, 1, SYNC_CONSTANTS.SESSION_PAGE_CONFIG);
  updateSessionRecordingPageConfig(window.uid, object)
    .then(() => {
      trackSyncCompleted(window.uid);
    })
    .catch((e) => trackSyncFailed(window.uid, SYNC_CONSTANTS.SESSION_PAGE_CONFIG, JSON.stringify(e)));
};
