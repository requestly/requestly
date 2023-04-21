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
} from "utils/syncing/syncDataUtils";
import { trackSyncCompleted } from "modules/analytics/events/features/syncing";
import { StorageService } from "init";
import { doSyncRecords } from "utils/syncing/SyncUtils";
import { SYNC_CONSTANTS } from "utils/syncing/syncConstants";
import APP_CONSTANTS from "config/constants";

export const resetSyncDebounceTimerStart = () => (window.syncDebounceTimerStart = Date.now());
resetSyncDebounceTimerStart();
const waitPeriod = 5000; // allow bulk sync calls in this time

const animateSyncIcon = () => {
  try {
    if (document.getElementById("sync-icon")) {
      document.getElementById("sync-icon").style.animation = "1s rotate infinite linear";
      setTimeout(() => {
        document.getElementById("sync-icon").style.removeProperty("animation");
      }, 2500);
    }
  } catch (_e) {
    Logger.error(_e);
  }
};

const setLastSyncTarget = async (appMode, syncTarget, uid, team_id) => {
  let desiredValue;
  if (syncTarget === "teamSync") desiredValue = team_id;
  if (syncTarget === "sync") desiredValue = uid;

  await StorageService(appMode).saveRecord({
    [APP_CONSTANTS.LAST_SYNC_TARGET]: desiredValue,
  });
};

export const mergeRecordsAndSaveToFirebase = async (appMode, recordsOnFirebase) => {
  const localRecords = await getAllLocalRecords(appMode);
  const mergedRecords = mergeRecords(recordsOnFirebase, localRecords);

  // Write to firebase
  const formattedObject = {};
  mergedRecords.forEach((object) => {
    if (object && object.id) formattedObject[object.id] = object;
  });
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
  saveSessionRecordingPageConfigLocallyWithoutSync(sessionRecordingConfigOnFirebase, appMode);

  // Refresh Session Recording Config
  dispatch(
    actions.updateRefreshPendingStatus({
      type: "sessionRecordingConfig",
    })
  );
};
export const doSyncDebounced = _.debounce(doSync, 5000);

const syncingNodeListener = (dispatch, syncTarget, uid, team_id, appMode) => {
  try {
    const syncNodeRef = getNodeRef(getRecordsSyncPath(syncTarget, uid, team_id));

    const invokeSyncingIfRequired = async (latestFirebaseRecords) => {
      if (window.skipSyncListenerForNextOneTime) {
        window.skipSyncListenerForNextOneTime = false;
        window.isFirstSyncComplete = true; // Just in case!
        dispatch(actions.updateIsRulesListLoading(false));
        return;
      }

      let updatedFirebaseRecords;
      if (latestFirebaseRecords) {
        // Means invoked for the newer time
        updatedFirebaseRecords = latestFirebaseRecords;
      } else {
        // Means invoked for the first time
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

    return onValue(syncNodeRef, async (snap) => {
      await invokeSyncingIfRequired(snap.val());
    });
  } catch (e) {
    Logger.log(e);
    return null;
  }
};

export default syncingNodeListener;
