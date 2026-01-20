import { Dispatch } from "redux";
import { DataSnapshot, DatabaseReference } from "firebase/database";
import { onValue, get } from "firebase/database";
import { getNodeRef } from "../../actions/FirebaseActions";
import { globalActions } from "store/slices/global/slice";
import { isLocalStoragePresent } from "utils/AppUtils";
import { throttle } from "lodash";
import Logger from "lib/logger";
import {
  parseRemoteRecords,
  getRecordsSyncPath,
  syncToLocalFromFirebase,
  mergeRecords,
  getAllLocalRecords,
  checkIfNoUpdateHasBeenPerformedSinceLastSync,
  handleLocalConflicts,
  getSyncedSessionRecordingPageConfig,
  saveSessionRecordingPageConfigLocallyWithoutSync,
  getTeamUserRuleAllConfigsPath,
} from "utils/syncing/syncDataUtils";
import { trackSyncCompleted } from "modules/analytics/events/features/syncing";
import { doSyncRecords } from "utils/syncing/SyncUtils";
import { SYNC_CONSTANTS } from "utils/syncing/syncConstants";
import APP_CONSTANTS from "config/constants";
import { SyncType } from "utils/syncing/SyncUtils";
// @ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { decompressRecords } from "../../utils/Compression";
import clientSessionRecordingStorageService from "services/clientStorageService/features/session-recording";
import { clientStorageService } from "services/clientStorageService";

type NodeRef = DatabaseReference;
type Snapshot = DataSnapshot;

declare global {
  interface Window {
    syncThrottleTimerStart: any;
    isFirstSyncComplete: any;
    skipSyncListenerForNextOneTime: any;
  }
}

export const resetSyncThrottleTimerStart = () => (window.syncThrottleTimerStart = Date.now());
resetSyncThrottleTimerStart();

const waitPeriod = 5000; // allow bulk sync calls in this time

/**
 * This function sets the last sync target using sync target, user ID, and team ID.
 *
 * @param {('EXTENSION' | 'DESKTOP')} appMode Current mode of the app.
 * @param {('teamSync' | 'sync')} syncTarget The target to sync, can be either 'teamSync' or 'sync'.
 * @param {string} uid The unique ID of the user.
 * @param {string} team_id The ID of the team.
 * @returns {Promise<void>} Returns a promise which resolves when the operation is complete.
 * @throws {Error} If an error occurs during storage.
 */
const setLastSyncTarget = async (
  appMode: "EXTENSION" | "DESKTOP",
  syncTarget: "teamSync" | "sync",
  uid: string,
  team_id: string
): Promise<void> => {
  const desiredValue: string = syncTarget === "teamSync" ? team_id : uid;
  await clientStorageService.saveStorageObject({
    [APP_CONSTANTS.LAST_SYNC_TARGET]: desiredValue,
  });
};

/**
 * Merges local and Firebase records and updates Firebase with the merged data.
 *
 * @param {('EXTENSION' | 'DESKTOP')} appMode Current mode of the app.
 * @param recordsOnFirebase - The records currently stored on Firebase.
 * @returns Promise of merged records after syncing them with Firebase.
 */
export const mergeRecordsAndSaveToFirebase = async (
  appMode: "EXTENSION" | "DESKTOP",
  recordsOnFirebase: Record<string, any>[]
): Promise<Record<string, any>[]> => {
  // Fetch all local records based on the current application mode
  const localRecords: Record<string, any>[] = await getAllLocalRecords(appMode);
  // todo @nsr: remove, just tracking count for now
  console.log("[DEBUG] mergeRecordsAndSaveToFirebase - length of local", localRecords?.length ?? 0);
  console.log("[DEBUG] mergeRecordsAndSaveToFirebase - length of recordsOnFirebase", recordsOnFirebase?.length ?? 0);

  // Merge the records from Firebase with the local records
  const mergedRecords: Record<string, any>[] = mergeRecords(recordsOnFirebase, localRecords);
  console.log("[DEBUG] mergeRecordsAndSaveToFirebase - length of merged", mergedRecords?.length ?? 0);

  // Format the merged records into an object where the keys are the record IDs
  const formattedObject: Record<string, any> = mergedRecords.reduce(
    (acc: Record<string, any>, record: Record<string, any>) => {
      if (record && record.id) {
        acc[record.id] = record;
      }
      return acc;
    },
    {}
  );

  // Sync the formatted records with Firebase
  await doSyncRecords(formattedObject, SYNC_CONSTANTS.SYNC_TYPES.UPDATE_RECORDS as SyncType, appMode, {
    forceSync: true,
  });
  return mergedRecords;
};

/**
 * Resolves local conflicts and saves the records to Firebase.
 *
 * @param {('EXTENSION' | 'DESKTOP')} appMode Current mode of the app.
 * @param {Array<any>} recordsOnFirebase - The records currently on Firebase.
 * @returns {Promise<Array<any>>} The resolved records.
 */
const resolveLocalConflictsAndSaveToFirebase = async (
  appMode: "EXTENSION" | "DESKTOP",
  recordsOnFirebase: any[]
): Promise<any[]> => {
  const localRecords: any[] = await getAllLocalRecords(appMode, false);
  const resolvedRecords: any[] = handleLocalConflicts(recordsOnFirebase, localRecords);

  console.log("[DEBUG] resolveLocalConflictsAndSaveToFirebase - length of local", localRecords?.length ?? 0);
  console.log("[DEBUG] resolveLocalConflictsAndSaveToFirebase - length of resolved", resolvedRecords?.length ?? 0);

  // Write to firebase
  const formattedObject: { [key: string]: any } = {};
  resolvedRecords.forEach((object) => {
    if (object && object.id) formattedObject[object.id] = object;
  });

  await doSyncRecords(formattedObject, SYNC_CONSTANTS.SYNC_TYPES.UPDATE_RECORDS as SyncType, appMode, {
    forceSync: true,
  });
  return resolvedRecords;
};

/**
 * Performs synchronization between local and remote data.
 *
 * @param uid - User identifier.
 * @param {('EXTENSION' | 'DESKTOP')} appMode Current mode of the app.
 * @param dispatch - Redux dispatch function.
 * @param updatedFirebaseRecords - Newly updated records from Firebase.
 * @param syncTarget - Target for synchronization.
 * @param team_id - Team identifier.
 */
export const doSync = async (
  uid: string,
  appMode: "EXTENSION" | "DESKTOP",
  dispatch: Function,
  updatedFirebaseRecords: Record<string, any>,
  syncTarget: "teamSync" | "sync",
  team_id: string
): Promise<void> => {
  console.log("DEBUG", "doSync");
  if (!isLocalStoragePresent(appMode)) {
    return;
  }
  // Consistency check. Merge records if inconsistent
  const lastSyncTarget: string = await clientStorageService.getStorageObject(APP_CONSTANTS.LAST_SYNC_TARGET);

  let consistencyCheckPassed: boolean =
    (syncTarget === "teamSync" && lastSyncTarget === team_id) || (syncTarget === "sync" && lastSyncTarget === uid);

  let allSyncedRecords: Record<string, any>[] = await parseRemoteRecords(appMode, updatedFirebaseRecords);

  if (!consistencyCheckPassed) {
    // Merge records
    allSyncedRecords = await mergeRecordsAndSaveToFirebase(appMode, allSyncedRecords);
    await setLastSyncTarget(appMode, syncTarget, uid, team_id);
  } else {
    // At this stage we are sure that we want to sync with this target only, target is consistent
    // Now let's check if there are any local update that we should prioritize
    const tsResult: boolean = await checkIfNoUpdateHasBeenPerformedSinceLastSync(appMode);
    if (!tsResult) {
      // This means some updates have been performed locally and they have not been synced with firebase yet
      // Handle conflicts
      allSyncedRecords = await resolveLocalConflictsAndSaveToFirebase(appMode, allSyncedRecords);
      await setLastSyncTarget(appMode, syncTarget, uid, team_id);
    }
  }

  // Write to local
  await syncToLocalFromFirebase(allSyncedRecords, appMode, uid);
  trackSyncCompleted(uid);
  window.isFirstSyncComplete = true;

  // Refresh Rules
  dispatch(globalActions.updateRefreshPendingStatus({ type: "rules" }));
  dispatch(globalActions.updateIsRulesListLoading(false));

  // Fetch Session Recording
  if (appMode === "EXTENSION") {
    const sessionRecordingConfigOnFirebase: Record<string, any> | null = await getSyncedSessionRecordingPageConfig(uid);
    const localSessionRecordingConfig = await clientSessionRecordingStorageService.getSessionRecordingConfig();
    saveSessionRecordingPageConfigLocallyWithoutSync(
      sessionRecordingConfigOnFirebase ? sessionRecordingConfigOnFirebase : localSessionRecordingConfig,
      appMode
    );

    // Refresh Session Recording Config
    dispatch(
      globalActions.updateRefreshPendingStatus({
        type: "sessionRecordingConfig",
      })
    );
  }
};

/** Trottled version of the doSync function */
export const doSyncThrottled = throttle((uid, appMode, dispatch, updatedFirebaseRecords, syncTarget, team_id) => {
  console.log("[DEBUG] doSyncThrottled in action");
  doSync(uid, appMode, dispatch, updatedFirebaseRecords, syncTarget, team_id);
}, 5000);

export const resetSyncThrottle = () => {
  try {
    doSyncThrottled?.cancel();
    console.log("[Debug] Sync Throttle Canceled");
  } catch (err) {
    Logger.log("Sync Trottle cancel failed");
  }
};

/**
 * Initiates the syncing process if conditions are met
 *
 * @param {Object} params - The parameters for the function.
 * @param {Function} params.dispatch - Dispatch function to manage the state.
 * @param {Record<string, any>} params.latestFirebaseRecords - Most recent records fetched from Firebase.
 * @param {string} params.uid - User ID.
 * @param {string} params.team_id - Team ID.
 * @param {('EXTENSION' | 'DESKTOP')}  params.appMode - Current mode of the app.
 * @param {boolean} params.isSyncEnabled - Flag to check if sync is enabled.
 *
 * @returns {Promise<void>} - Returns a Promise that resolves to void.
 */
export const invokeSyncingIfRequired = async ({
  dispatch,
  latestFirebaseRecords,
  uid,
  team_id,
  appMode,
  isSyncEnabled,
}: {
  dispatch: Function;
  latestFirebaseRecords?: Record<string, any>;
  uid?: string;
  team_id?: string;
  appMode?: "EXTENSION" | "DESKTOP";
  isSyncEnabled?: boolean;
}): Promise<void> => {
  if (!uid || (!team_id && !isSyncEnabled)) return;

  if (window.skipSyncListenerForNextOneTime) {
    window.skipSyncListenerForNextOneTime = false;
    window.isFirstSyncComplete = true; // Just in case!
    dispatch(globalActions.updateIsRulesListLoading(false));
    return;
  }

  const syncTarget = getSyncTarget(team_id);
  // If latestFirebaseRecords are given, means invoked for the newer time. If not given, means sync is invoked for the first time
  let updatedFirebaseRecords = latestFirebaseRecords
    ? latestFirebaseRecords
    : await fetchInitialFirebaseRecords(syncTarget, uid, team_id);

  if (!isLocalStoragePresent(appMode)) {
    // Just refresh the rules table in this case
    dispatch(globalActions.updateRefreshPendingStatus({ type: "rules" }));
    window.isFirstSyncComplete = true;
    dispatch(globalActions.updateIsRulesListLoading(false));
    return;
  }

  if (Date.now() - window.syncThrottleTimerStart > waitPeriod) {
    console.log("[DEBUG] invokeSyncingIfRequired - doSyncThrottled");
    doSyncThrottled(uid, appMode, dispatch, updatedFirebaseRecords, syncTarget, team_id);
  } else {
    resetSyncThrottle();
    doSync(uid, appMode, dispatch, updatedFirebaseRecords, syncTarget, team_id);
  }
};

/**
 * Fetches initial Firebase records for first time sync.
 *
 * @param {string} syncTarget - Sync target for fetching records.
 * @param {string} uid - User ID.
 * @param {string} team_id - Team ID.
 *
 * @returns {Promise<Record<string, any>>} - Returns a Promise that resolves to the fetched Firebase records.
 */
const fetchInitialFirebaseRecords = async (
  syncTarget: "teamSync" | "sync",
  uid: string,
  team_id: string
): Promise<Record<string, any>> => {
  const syncNodeRef = getNodeRef(getRecordsSyncPath(syncTarget, uid, team_id));
  const syncNodeRefNode = await get(syncNodeRef);
  return decompressRecords(syncNodeRefNode.val());
};

/**
 * Calls the 'invokeSyncingIfRequired' function if it hasn't been called in the last 2 seconds.
 * The lastCalled variable is intended to be a global variable that records the last time the function was called.
 *
 * @param args The arguments to be passed to the 'invokeSyncingIfRequired' function.
 */
let lastCalled: number | null = null;
const callInvokeSyncingIfRequiredIfNotCalledRecently = async (args: any): Promise<void> => {
  const now: number = new Date().getTime();

  // Check if lastCalled is null for the first call
  const timeSinceLastCalled: number = lastCalled !== null ? now - lastCalled : Infinity;

  // 2000 milliseconds = 2 seconds
  if (timeSinceLastCalled > 2000 || lastCalled === null) {
    lastCalled = now;

    // Now, it is guaranteed that invokeSyncingIfRequired is not recently called
    await invokeSyncingIfRequired(args);
  }
};

/**
 * Function to determine the sync target based on team workspace activity.
 *
 * @param currentlyActiveWorkspaceId - The ID of the currently active team workspace.
 * @returns 'teamSync' if a workspace is currently active, otherwise returns 'sync'.
 */
export function getSyncTarget(currentlyActiveWorkspaceId?: string): "teamSync" | "sync" {
  // Check if a workspace ID was provided
  if (currentlyActiveWorkspaceId) {
    // If a workspace ID was provided, return 'teamSync'
    return "teamSync";
  }

  // If no workspace ID was provided, return 'sync'
  return "sync";
}

/**
 * Function that listens for changes in a syncing node, it reacts differently based on the sync target.
 *
 * @param {Dispatch} dispatch - Dispatch function to emit actions to the Redux store.
 * @param {string} uid - The unique user id.
 * @param {string} team_id - The unique team id.
 * @param {('EXTENSION' | 'DESKTOP')} appMode - Current mode of the app.
 * @param {boolean} isSyncEnabled - Flag indicating whether syncing is enabled.
 *
 * @returns {Function[]} An array of unsubscribe functions to call when you're done listening.
 */
const syncingNodeListener = (
  dispatch: Dispatch,
  uid: string,
  team_id: string,
  appMode: "EXTENSION" | "DESKTOP",
  isSyncEnabled: boolean
): Function[] | null => {
  // Get sync target
  const syncTarget: string = getSyncTarget(team_id);

  // Get reference to the node to be synced
  const syncNodeRef: NodeRef = getNodeRef(getRecordsSyncPath(syncTarget, uid, team_id));

  try {
    // Check for individual sync target
    if (syncTarget === "sync") {
      // Listen to only records
      return [
        onValue(syncNodeRef, async (snap: Snapshot) => {
          await invokeSyncingIfRequired({
            dispatch,
            latestFirebaseRecords: decompressRecords(snap.val()),
            uid,
            team_id,
            appMode,
            isSyncEnabled,
          });
        }),
      ];
    }
    // Check for team sync target
    else if (syncTarget === "teamSync") {
      // Listen to records node & rulesConfig node
      const listeners: Function[] = [
        onValue(syncNodeRef, async (snap: Snapshot) => {
          await callInvokeSyncingIfRequiredIfNotCalledRecently({
            dispatch,
            latestFirebaseRecords: decompressRecords(snap.val()),
            uid,
            team_id,
            appMode,
            isSyncEnabled,
          });
        }),
      ];

      const rulesConfigPath: string[] | undefined = getTeamUserRuleAllConfigsPath(team_id, uid);
      if (rulesConfigPath) {
        const rulesConfigRef: NodeRef = getNodeRef(rulesConfigPath);
        listeners.push(
          onValue(rulesConfigRef, async () => {
            await callInvokeSyncingIfRequiredIfNotCalledRecently({
              dispatch,
              uid,
              team_id,
              appMode,
              isSyncEnabled,
            });
          })
        );
      }

      return listeners;
    }
  } catch (e) {
    Logger.log(e);
    return null;
  }
};

export default syncingNodeListener;
