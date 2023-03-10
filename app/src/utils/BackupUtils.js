//EXTERNALS
import { StorageService } from "../init";
//CONSTANTS
import APP_CONSTANTS from "../config/constants";
import firebaseApp from "../firebase";
import { getDatabase, ref, update } from "firebase/database";
import { getFirestore, collection, doc, getDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAllRulesAndGroups } from "./rules/misc";
//UTILS
import { getTimeDifferenceFromTimestamps } from "./DateTimeUtils";
import { toast } from "./Toast";
import { trackBackupCreated } from "modules/analytics/events/features/syncing/backup";
import Logger from "lib/logger";

let isBackupInProcess = false;

export const setIsBackupEnabled = async (uid, state) => {
  try {
    const database = getDatabase();
    const userProfileRef = ref(database, `users/${uid}/profile`);
    await update(userProfileRef, { isBackupEnabled: state });
    toast.info(`Backups are now ${state ? "enabled" : "disabled"}.`);
    return true;
  } catch (error) {
    toast.error(`Sorry, we are experiencing issues updating the backup state.`);
    return false;
  }
};

export const getLastBackupTimestamp = (appMode) => {
  Logger.log("Reading storage in getLastBackupTimestamp");
  return StorageService(appMode).getRecord(APP_CONSTANTS.LAST_BACKUP_TIMESTAMP);
};

export const isNewBackupRequired = (backupTimestamp) => {
  const backupPeriod = 7; // days
  let isExpired = false;

  if (backupTimestamp) {
    let timeDifference = getTimeDifferenceFromTimestamps(
      Date.now(),
      backupTimestamp
    );
    let daysDifference = Math.floor(timeDifference / 1000 / 60 / 60 / 24);

    if (daysDifference > backupPeriod) {
      isExpired = true;
    }
  }
  return Boolean(!backupTimestamp && isExpired); // backuptimestamp is returned to cover case when no backup is present
};

export const updateLastBackupTimeStamp = async (appMode, newTimestamp) => {
  let timestamp = newTimestamp || Date.now();
  Logger.log("Writing storage in updateLastBackupTimeStamp");
  await StorageService(appMode).saveRecord({
    [APP_CONSTANTS.LAST_BACKUP_TIMESTAMP]: timestamp,
  });
  return { success: true, time: timestamp };
};

export const createNewBackup = async (appMode) => {
  const currentTimestamp = Date.now();
  const backupData = await getAllRulesAndGroups(appMode);
  const functions = getFunctions(firebaseApp);
  const updateRulesBackup = httpsCallable(functions, "updateRulesBackup");
  await updateRulesBackup({
    records: backupData,
    timestamp: currentTimestamp,
  });
  trackBackupCreated();
  isBackupInProcess = false;
  return await updateLastBackupTimeStamp(appMode);
};

export const createBackupIfRequired = async (appMode) => {
  const timestamp = await getLastBackupTimestamp(appMode);
  let lastBackupTimestamp, timeDifference;
  const currentTimestamp = Date.now();
  if (timestamp) {
    lastBackupTimestamp = timestamp;
    timeDifference = getTimeDifferenceFromTimestamps(
      currentTimestamp,
      lastBackupTimestamp
    );
  }
  const hoursDifference = Math.floor(timeDifference / 1000 / 60 / 60);
  // Only send backups after at-least 6 hours
  if ((!timestamp || hoursDifference > 6) && !isBackupInProcess) {
    isBackupInProcess = true;
    return createNewBackup(appMode);
  } else {
    return { success: false, time: timeDifference };
  }
};

export const getBackupFromFirestore = (uid) => {
  return new Promise(async (resolve) => {
    const database = getFirestore();
    const ref = doc(collection(database, "backup"), uid);
    const docSnap = await getDoc(ref);

    if (docSnap.exists()) {
      const backupData = docSnap.data();
      resolve({ data: backupData });
    } else {
      // doc.data() will be undefined in this case
      resolve({ data: null });
    }
  });
};

export const updateRecordWithBackup = (appMode, backupData) => {
  const backup = backupData.data;
  // const timestamp = backupData.timestamp;
  const backupArray = [...backup.groups, ...backup.rules]; // To also include groups that are empty

  Logger.log("Writing storage in updateRecordWithBackup");
  return StorageService(appMode).saveMultipleRulesOrGroups(backupArray);
};
