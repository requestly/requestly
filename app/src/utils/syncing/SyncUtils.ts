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
  // trackSyncToggled,
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
export type SyncType = keyof typeof SYNC_CONSTANTS.SYNC_TYPES;
export type AppMode = "EXTENSION" | "DESKTOP";

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
  records: any,
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

/**
 * This function is used to set the sync state
 *
 * @param {string} uid - The unique identifier of the user
 * @param {boolean} state - The state of synchronization to be set (true or false)
 * @param {AppMode} appMode - The current mode of the application
 * @return {Promise<boolean>} - Returns a promise which resolves to a boolean. True if successful, false otherwise.
 */
export const setSyncState = async (uid: string, state: boolean, appMode: AppMode): Promise<boolean> => {
  return new Promise<boolean>((resolve, reject) => {
    // Update the sync state in user's profile
    updateValueAsPromise(["users", uid, "profile"], { isSyncEnabled: state })
      .then(async () => {
        // If state is false, remove records without syncing
        if (!state) await StorageService(appMode).removeRecordsWithoutSyncing([APP_CONSTANTS.LAST_SYNC_TARGET]);

        // Track the event of toggling synchronization
        // trackSyncToggled(uid, state);

        // Resolve the promise with true indicating success
        resolve(true);
      })
      .catch(() => {
        // Reject the promise with false indicating failure
        reject(false);
      });
  });
};

/**
 * Syncs record removal from storage with the database.
 *
 * This function is designed to be called when records are deleted from storage and
 * needs to be synchronized with the database. It expects an array of recordIds.
 *
 * @param recordIds - An array of unique identifiers for records to be removed.
 * @param {AppMode} appMode - A string representing the current mode of the application.
 */
export const syncRecordsRemoval = async (recordIds: string[], appMode: AppMode): Promise<void> => {
  // Trigger the record synchronization tracking with provided user id, record count and sync type.
  trackSyncTriggered(window.uid, recordIds.length, SYNC_CONSTANTS.SYNC_REMOVE_RECORDS);

  try {
    // Set a global flag to skip the next one-time sync listener. This prevents unnecessary syncing on the same browser tab.
    window.skipSyncListenerForNextOneTime = true;

    // Remove user-specific sync records
    await removeUserSyncRecords(window.uid, recordIds);

    // If in Team Workspace mode, delete user-specific rule/group configuration
    if (window.currentlyActiveWorkspaceTeamId) {
      for (const recordId of recordIds) {
        // Get the path for the team user rule configuration
        const teamUserRuleConfigPath = getTeamUserRuleConfigPath(recordId);
        if (!teamUserRuleConfigPath) return;

        // Remove the value at the configuration path
        await removeValueAsPromise(teamUserRuleConfigPath);
      }
    }

    // Track the completion of the synchronization process.
    trackSyncCompleted(window.uid);
  } catch (e) {
    // If any error occurs, track the sync failure with provided user id, sync type, and error details.
    trackSyncFailed(window.uid, SYNC_CONSTANTS.SYNC_REMOVE_RECORDS, JSON.stringify(e));
  }
};

/**
 * Synchronize the session recording page configuration.
 *
 * @param {object} config - The configuration object to update the session recording page with.
 * @param {AppMode} appMode - The current application mode.
 */
async function syncSessionRecordingPageConfig(config: Record<string, unknown>, appMode: AppMode): Promise<void> {
  // Track that synchronization has been triggered
  trackSyncTriggered(window.uid, 1, SYNC_CONSTANTS.SESSION_PAGE_CONFIG);

  try {
    // Update the session recording page configuration
    await updateSessionRecordingPageConfig(window.uid, config);

    // Track that synchronization has been successfully completed
    trackSyncCompleted(window.uid);
  } catch (e) {
    // If an error occurs during synchronization, track that synchronization has failed
    trackSyncFailed(window.uid, SYNC_CONSTANTS.SESSION_PAGE_CONFIG, JSON.stringify(e));
  }
}
