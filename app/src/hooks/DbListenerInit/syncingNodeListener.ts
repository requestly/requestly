// @ts-nocheck
import { onValue, get } from "firebase/database";
import { getNodeRef } from "../../actions/FirebaseActions";
import { actions } from "../../store";
import { isLocalStoragePresent } from "utils/AppUtils";
import _ from "lodash";
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
import { StorageService } from "init";
import { doSyncRecords } from "utils/syncing/SyncUtils";
import { SYNC_CONSTANTS } from "utils/syncing/syncConstants";
import APP_CONSTANTS from "config/constants";

export const resetSyncDebounceTimerStart = () => (window.syncDebounceTimerStart = Date.now());
resetSyncDebounceTimerStart();
const waitPeriod = 5000; // allow bulk sync calls in this time

/**
 * This function applies an animation to the "sync-icon" element in the DOM.
 * The animation is "1s rotate infinite linear", and it lasts for 2.5 seconds.
 * If the "sync-icon" element is not found in the DOM, an error will be thrown and logged.
 *
 * @returns {void}
 * @throws Will throw an error if the "sync-icon" element is not found in the DOM.
 */
const animateSyncIcon = (): void => {
  try {
    const syncIcon: HTMLElement | null = document.getElementById("sync-icon");
    if (!syncIcon) {
      throw new Error("Sync icon not found");
    }

    syncIcon.style.animation = "1s rotate infinite linear";

    setTimeout(() => {
      if (syncIcon) {
        syncIcon.style.removeProperty("animation");
      }
    }, 2500);
  } catch (e) {
    if (e instanceof Error) {
      Logger.error(e.message);
    } else {
      Logger.error("Unknown error occurred");
    }
  }
};

/**
 * This function sets the last sync target using sync target, user ID, and team ID.
 *
 * @param {('EXTENSION' | 'DESKTOP')} appMode The application mode, usually 'DESKTOP' or 'EXTENSION'.
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

  const storageService = new StorageService(appMode);
  await storageService.saveRecord({
    [APP_CONSTANTS.LAST_SYNC_TARGET]: desiredValue,
  });
};

/**
 * Merges local and Firebase records and updates Firebase with the merged data.
 *
 * @param {('EXTENSION' | 'DESKTOP')} appMode The application mode, usually 'DESKTOP' or 'EXTENSION'.
 * @param recordsOnFirebase - The records currently stored on Firebase.
 * @returns Promise of merged records after syncing them with Firebase.
 */
export const mergeRecordsAndSaveToFirebase = async (
  appMode: "EXTENSION" | "DESKTOP",
  recordsOnFirebase: Record<string, any>[]
): Promise<Record<string, any>[]> => {
  // Fetch all local records based on the current application mode
  const localRecords: Record<string, any>[] = await getAllLocalRecords(appMode);

  // Merge the records from Firebase with the local records
  const mergedRecords: Record<string, any>[] = mergeRecords(recordsOnFirebase, localRecords);

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
  await doSyncRecords(formattedObject, SYNC_CONSTANTS.SYNC_TYPES.UPDATE_RECORDS, appMode, { forceSync: true });
  return mergedRecords;
};

const resolveLocalConflictsAndSaveToFirebase = async (appMode, recordsOnFirebase) => {
  const localRecords = await getAllLocalRecords(appMode, false);
  const resolvedRecords = handleLocalConflicts(recordsOnFirebase, localRecords);

  // Write to firebase
  const formattedObject = {};
  resolvedRecords.forEach((object) => {
    if (object && object.id) formattedObject[object.id] = object;
  });
  await doSyncRecords(formattedObject, SYNC_CONSTANTS.SYNC_TYPES.UPDATE_RECORDS, appMode, { forceSync: true });
  return resolvedRecords;
};

export const doSync = async (uid, appMode, dispatch, updatedFirebaseRecords, syncTarget, team_id) => {
  if (!isLocalStoragePresent(appMode)) {
    return;
  }
  // Consistency check. Merge records if inconsistent
  const lastSyncTarget = await StorageService(appMode).getRecord(APP_CONSTANTS.LAST_SYNC_TARGET);
  let consistencyCheckPassed = false;
  if (syncTarget === "teamSync") {
    if (lastSyncTarget === team_id) consistencyCheckPassed = true;
  } else if (syncTarget === "sync") {
    if (lastSyncTarget === uid) consistencyCheckPassed = true;
  }
  let allSyncedRecords = await parseRemoteRecords(appMode, updatedFirebaseRecords);
  if (!consistencyCheckPassed) {
    // Merge records
    const recordsOnFirebaseAfterMerge = await mergeRecordsAndSaveToFirebase(appMode, allSyncedRecords);
    allSyncedRecords = recordsOnFirebaseAfterMerge;

    await setLastSyncTarget(appMode, syncTarget, uid, team_id);
  } else {
    // At this stage we are sure that we want to sync with this target only, target is consistent
    // Now let's check if there are any local update that we should prioritize
    const tsResult = await checkIfNoUpdateHasBeenPerformedSinceLastSync(appMode);
    if (tsResult === false) {
      // This means some updates have been performed locally and they have not been synced with firebase yet
      // Handle conflicts
      const recordsOnFirebaseAfterConflictResolution = await resolveLocalConflictsAndSaveToFirebase(
        appMode,
        allSyncedRecords
      );
      allSyncedRecords = recordsOnFirebaseAfterConflictResolution;

      await setLastSyncTarget(appMode, syncTarget, uid, team_id);
    }
  }

  // Write to local
  await syncToLocalFromFirebase(allSyncedRecords, appMode, uid);
  trackSyncCompleted(uid);
  window.isFirstSyncComplete = true;

  // Refresh Rules
  dispatch(actions.updateRefreshPendingStatus({ type: "rules" }));
  dispatch(actions.updateIsRulesListLoading(false));

  // Fetch Session Recording
  const sessionRecordingConfigOnFirebase = await getSyncedSessionRecordingPageConfig(uid);
  if (sessionRecordingConfigOnFirebase) {
    saveSessionRecordingPageConfigLocallyWithoutSync(sessionRecordingConfigOnFirebase, appMode);
  } else saveSessionRecordingPageConfigLocallyWithoutSync({}, appMode);

  // Refresh Session Recording Config
  dispatch(
    actions.updateRefreshPendingStatus({
      type: "sessionRecordingConfig",
    })
  );
};
export const doSyncDebounced = _.debounce(doSync, 5000);

export const invokeSyncingIfRequired = async ({
  dispatch,
  latestFirebaseRecords,
  uid,
  team_id,
  appMode,
  isSyncEnabled,
}) => {
  if (!uid) return;
  if (!team_id & !isSyncEnabled) return;

  if (window.skipSyncListenerForNextOneTime) {
    window.skipSyncListenerForNextOneTime = false;
    window.isFirstSyncComplete = true; // Just in case!
    dispatch(actions.updateIsRulesListLoading(false));
    return;
  }

  const syncTarget = getSyncTarget(team_id);
  let updatedFirebaseRecords;
  if (latestFirebaseRecords) {
    // Means invoked for the newer time
    updatedFirebaseRecords = latestFirebaseRecords;
  } else {
    // Means invoked for the first time
    const syncNodeRef = getNodeRef(getRecordsSyncPath(syncTarget, uid, team_id));
    const syncNodeRefNode = await get(syncNodeRef);
    updatedFirebaseRecords = syncNodeRefNode.val();
  }

  animateSyncIcon();

  if (!isLocalStoragePresent(appMode)) {
    // Just refresh the rules table in this case
    dispatch(actions.updateRefreshPendingStatus({ type: "rules" }));
    window.isFirstSyncComplete = true;
    dispatch(actions.updateIsRulesListLoading(false));
    return;
  }
  if (Date.now() - window.syncDebounceTimerStart > waitPeriod) {
    doSyncDebounced(uid, appMode, dispatch, updatedFirebaseRecords, syncTarget, team_id);
  } else {
    doSync(uid, appMode, dispatch, updatedFirebaseRecords, syncTarget, team_id);
  }
};

let lastCalled = null;
const callInvokeSyncingIfRequiredIfNotCalledRecently = async (args) => {
  const now = new Date().getTime();
  const timeSinceLastCalled = now - (lastCalled || 0);

  if (timeSinceLastCalled > 2000 || !lastCalled) {
    lastCalled = now;
    await invokeSyncingIfRequired(args);
  }
};

export const getSyncTarget = (currentlyActiveWorkspaceId) => {
  if (currentlyActiveWorkspaceId) return "teamSync";
  return "sync";
};

const syncingNodeListener = (dispatch, uid, team_id, appMode, isSyncEnabled) => {
  const syncTarget = getSyncTarget(team_id);
  const syncNodeRef = getNodeRef(getRecordsSyncPath(syncTarget, uid, team_id));
  try {
    if (syncTarget === "sync") {
      // This is individual sync
      // Listen to only records only
      return [
        onValue(syncNodeRef, async (snap) => {
          await invokeSyncingIfRequired({
            dispatch,
            latestFirebaseRecords: snap.val(),
            uid,
            team_id,
            appMode,
            isSyncEnabled,
          });
        }),
      ];
    } else if (syncTarget === "teamSync") {
      // This is team sync
      // Listen to records node & rulesConfig node

      return [
        onValue(syncNodeRef, async (snap) => {
          await callInvokeSyncingIfRequiredIfNotCalledRecently({
            dispatch,
            latestFirebaseRecords: snap.val(),
            uid,
            team_id,
            appMode,
            isSyncEnabled,
          });
        }),
        (() => {
          const rulesConfigPath = getTeamUserRuleAllConfigsPath(team_id, uid);
          if (!rulesConfigPath) return;
          const rulesConfigRef = getNodeRef(rulesConfigPath);
          return onValue(rulesConfigRef, async () => {
            await callInvokeSyncingIfRequiredIfNotCalledRecently({
              dispatch,
              uid,
              team_id,
              appMode,
              isSyncEnabled,
            });
          });
        })(),
      ];
    }
  } catch (e) {
    Logger.log(e);
    return null;
  }
};

export default syncingNodeListener;
