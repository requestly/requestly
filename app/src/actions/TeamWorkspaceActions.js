import { StorageService } from "init";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { isExtensionInstalled } from "./ExtensionActions";
import { globalActions } from "store/slices/global/slice";
import { trackWorkspaceSwitched } from "modules/analytics/events/common/teams";
import {
  mergeRecordsAndSaveToFirebase,
  resetSyncThrottle,
  resetSyncThrottleTimerStart,
} from "hooks/DbListenerInit/syncingNodeListener";
import { toast } from "utils/Toast";
import APP_CONSTANTS from "config/constants";
import Logger from "lib/logger";
import { getValueAsPromise } from "./FirebaseActions";
import { getRecordsSyncPath, parseRemoteRecords } from "utils/syncing/syncDataUtils";
import { setSyncState } from "utils/syncing/SyncUtils";
import { isArray } from "lodash";
import { workspaceActions } from "store/slices/workspaces/slice";
import { WorkspaceType } from "features/workspaces/types";
import { clientStorageService } from "services/clientStorageService";
import { getAuth } from "firebase/auth";
import firebaseApp from "../firebase";

export const showSwitchWorkspaceSuccessToast = (teamName) => {
  // Show toast
  if (teamName) toast.info("Switched to " + teamName);
  else toast.info(`Switched back to ${APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE}`);
};

export const switchWorkspace = async (
  newWorkspaceDetails,
  dispatch,
  currentSyncingState,
  appMode,
  setLoader,
  source,
  options = {}
) => {
  const { teamId } = newWorkspaceDetails;
  const { skipBroadcast = false } = options;

  let needToMergeRecords = false;
  await StorageService(appMode).waitForAllTransactions();
  if (teamId !== null) {
    // We are switching to a given workspace, not clearing the workspace (switching to private)
    const { isSyncEnabled, isWorkspaceMode } = currentSyncingState;

    // isWorkspaceMode - true implies user is working on a team workspace - local or shared
    // false implies user is working on a private workspace
    if (!isWorkspaceMode) {
      // User is currently on private workspace
      if (!isSyncEnabled) {
        const message = "Turn on syncing?";
        const confirmationResponse = window.confirm(message);
        if (confirmationResponse !== true) {
          needToMergeRecords = false;
        } else {
          needToMergeRecords = true;
          setSyncState(window.uid, true, appMode);
        }
      }
    }
  }
  trackWorkspaceSwitched(source);
  dispatch(globalActions.updateIsRulesListLoading(true));

  if (window.unsubscribeSyncingNodeRef.current && isArray(window.unsubscribeSyncingNodeRef.current)) {
    window.unsubscribeSyncingNodeRef.current.forEach((removeFirebaseListener) => {
      removeFirebaseListener && removeFirebaseListener();
    });
  }

  const mergeLocalRecords = async () => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION && !isExtensionInstalled()) return;
    // These merge steps are optional - just to ensure consistency
    // These merge steps are  however mandated if we are switching to a given workspace from private and has syncing off
    // Unsubscribe any existing listener - To prevent race of sync node listener once merged records are set on the firebase
    const allRemoteRecords = (await getValueAsPromise(getRecordsSyncPath())) || {};
    let parsedFirebaseRules = await parseRemoteRecords(appMode, allRemoteRecords);
    await mergeRecordsAndSaveToFirebase(appMode, parsedFirebaseRules);
  };
  needToMergeRecords && (await mergeLocalRecords());

  let skipStorageClearing = false;
  resetSyncThrottleTimerStart();
  resetSyncThrottle();

  // Don't clear when appMode is Extension but user has not installed it!
  /* CAN BE REPLACED WITH isLocalStoragePresent */
  if (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION && !isExtensionInstalled()) skipStorageClearing = true;

  if (!skipStorageClearing) {
    Logger.log("Clearing storage in switchWorkspace");
    await clientStorageService.clearStorage();
  }

  // Just in case
  window.skipSyncListenerForNextOneTime = false;
  window.isFirstSyncComplete = false;

  if (teamId === null) {
    // We are switching to pvt workspace
    // Clear team members info
    dispatch(workspaceActions.setActiveWorkspacesMembers({}));
  }

  dispatch(workspaceActions.setActiveWorkspaceIds(teamId ? [teamId] : []));

  //Refresh Rules List
  dispatch(globalActions.updateHardRefreshPendingStatus({ type: "rules" }));

  // Notify other tabs about workspace change
  // Only broadcast when user explicitly switches workspaces, not during initialization
  // This prevents multi-tab infinite reload loops
  if (!skipBroadcast) {
    window.activeWorkspaceBroadcastChannel &&
      window.activeWorkspaceBroadcastChannel.postMessage("active_workspace_changed");
  }

  if (teamId != null && newWorkspaceDetails.workspaceType === WorkspaceType.SHARED) {
    await getAuth(firebaseApp).currentUser?.getIdTokenResult(true);
    Logger.log("Refreshed auth token on workspace switch");
  }
};

export const clearCurrentlyActiveWorkspace = async (dispatch, appMode, options = {}) => {
  await switchWorkspace(
    { teamId: null, teamName: null, teamMembersCount: null, workspaceType: WorkspaceType.PERSONAL },
    dispatch,
    null,
    appMode,
    undefined,
    undefined,
    options
  );
};
