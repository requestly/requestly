import { teamsActions } from "store/features/teams/slice";
import { StorageService } from "init";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { isExtensionInstalled } from "./ExtensionActions";
import { actions } from "store";
import { trackWorkspaceSwitched } from "modules/analytics/events/common/teams";
import {
  mergeRecordsAndSaveToFirebase,
  resetSyncDebounceTimerStart,
} from "hooks/DbListenerInit/syncingNodeListener";
import { toast } from "utils/Toast";
import APP_CONSTANTS from "config/constants";
import Logger from "lib/logger";
import { getValueAsPromise } from "./FirebaseActions";
import {
  getRecordsSyncPath,
  parseRemoteRecords,
} from "utils/syncing/syncDataUtils";

export const showSwitchWorkspaceSuccessToast = (teamName) => {
  // Show toast
  if (teamName) toast.info("Switched to " + teamName);
  else
    toast.info(
      `Switched back to ${APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE}`
    );
};

export const switchWorkspace = async (
  newWorkspaceDetails,
  dispatch,
  currentSyncingState,
  appMode
) => {
  trackWorkspaceSwitched();
  dispatch(actions.updateIsRulesListLoading(true));

  const { teamId, teamName, teamMembersCount } = newWorkspaceDetails;

  if (teamId !== null) {
    // We are switching to a given workspace, not clearing the workspace (switching to private)
    const { isSyncEnabled, isWorkspaceMode } = currentSyncingState;
    if (!isWorkspaceMode) {
      // User is currently on private workspace
      if (!isSyncEnabled) {
        const message = "Turn on syncing?";
        if (window.confirm(message) !== true) {
          return;
        }
      }
    }
  }

  // These merge steps are optional - just to ensure consistency
  // These merge steps are  however mandated if we are switching to a given workspace from private and has syncing off
  // Unsubscribe any existing listener - To prevent race of sync node listener once merged records are set on the firebase
  if (window.unsubscribeSyncingNodeRef.current)
    window.unsubscribeSyncingNodeRef.current();
  const allRemoteRecords =
    (await getValueAsPromise(getRecordsSyncPath())) || {};
  let parsedFirebaseRules = await parseRemoteRecords(appMode, allRemoteRecords);
  await mergeRecordsAndSaveToFirebase(appMode, parsedFirebaseRules);

  let skipStorageClearing = false;
  resetSyncDebounceTimerStart();

  // Don't clear when appMode is Remote as it could clear the database!
  if (appMode === GLOBAL_CONSTANTS.APP_MODES.REMOTE) skipStorageClearing = true;
  // Don't clear when appMode is Extension but user has not installed it!
  if (
    appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION &&
    !isExtensionInstalled()
  )
    skipStorageClearing = true;

  if (!skipStorageClearing) {
    Logger.log("Clearing storage in switchWorkspace");
    await StorageService(appMode).clearDB();
  }

  // Just in case
  window.skipSyncListenerForNextOneTime = false;
  window.isFirstSyncComplete = false;

  dispatch(
    teamsActions.setCurrentlyActiveWorkspace({
      id: teamId,
      name: teamName,
      membersCount: teamMembersCount,
    })
  );

  if (teamId === null) {
    // We are switching to pvt workspace
    // Clear team members info
    dispatch(teamsActions.setCurrentlyActiveWorkspaceMembers({}));
  }

  //Refresh Rules List
  dispatch(actions.updateHardRefreshPendingStatus({ type: "rules" }));

  // Notify other tabs
  window.activeWorkspaceBroadcastChannel &&
    window.activeWorkspaceBroadcastChannel.postMessage(
      "active_workspace_changed"
    );
};

export const clearCurrentlyActiveWorkspace = async (dispatch, appMode) => {
  await switchWorkspace(
    { teamId: null, teamName: null, teamMembersCount: null },
    dispatch,
    null,
    appMode
  );
};
