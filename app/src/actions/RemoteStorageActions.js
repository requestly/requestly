import APP_CONSTANTS from "config/constants";
import Logger from "lib/logger";
import DataStoreUtils from "utils/DataStoreUtils";
import { getCurrentTimeStamp } from "utils/DateTimeUtils";
import { getUserDetail } from "utils/helpers/appDetails/UserProvider";
import { getMetadataSyncPath } from "utils/syncing/syncDataUtils";
import { updateValueAsPromise } from "./FirebaseActions";

// Notes
// In Remote appMode, storage is
// direct firebase if thing we are dealing with is a Rule or Group
// rejected if we are dealing with anything else!

const getRemoteStoragePath = (uid) => {
  if (window.currentlyActiveWorkspaceTeamId) {
    return ["teamSync", window.currentlyActiveWorkspaceTeamId, "records"];
  } else {
    return ["sync", uid, "records"];
  }
};

const emptyPromise = () => {
  return new Promise((resolve, reject) => {
    resolve({});
  });
};

export const getStorageSuperObject = () => {
  const uid = getUserDetail("id");
  if (!uid) {
    return emptyPromise();
  }

  return DataStoreUtils.getValue(getRemoteStoragePath(uid)).then((data) => {
    return data || {};
  });
};

export const getStorageObject = (key) => {
  return getStorageSuperObject().then((obj) => obj[key]);
};

export const saveStorageObject = async (object) => {
  const uid = getUserDetail("id");
  if (!uid) {
    Logger.log("Couldn't save", object);
    return emptyPromise();
  }
  const timestamp = getCurrentTimeStamp();
  const syncTimestampObject = {
    [APP_CONSTANTS.LAST_SYNC_TIMESTAMP]: timestamp,
  };

  await DataStoreUtils.updateValueAsPromise(getRemoteStoragePath(uid), object);
  window.skipSyncListenerForNextOneTime = true; // Prevents syncing infinite loop
  return updateValueAsPromise(getMetadataSyncPath(uid), syncTimestampObject);
};

export const removeStorageObject = async (recordIds, updateTS = true) => {
  const uid = getUserDetail("id");
  if (!uid) {
    Logger.log("Couldn't remove", recordIds);
    return emptyPromise();
  }

  return getStorageSuperObject().then(async (records) => {
    const newRecords = { ...records };
    recordIds.forEach((recordId) => {
      delete newRecords[recordId];
    });

    if (updateTS) {
      await DataStoreUtils.setValue(getRemoteStoragePath(uid), newRecords);
      const timestamp = getCurrentTimeStamp();
      window.skipSyncListenerForNextOneTime = true; // Prevents syncing infinite loop
      const syncTimestampObject = {
        [APP_CONSTANTS.LAST_SYNC_TIMESTAMP]: timestamp,
      };
      return updateValueAsPromise(
        getMetadataSyncPath(uid),
        syncTimestampObject
      );
    } else {
      return await DataStoreUtils.setValue(
        getRemoteStoragePath(uid),
        newRecords
      );
    }
  });
};

export function removeStorageObjects(recordIds) {
  if (recordIds?.length === 0) {
    Logger.error("Empty array to remove list");
    return emptyPromise();
  }

  return removeStorageObject(recordIds, false)
    .then(() => {
      const uid = getUserDetail("id");
      if (!uid) {
        console.log("Couldn't remove", recordIds);
        return emptyPromise();
      }
      const timestamp = getCurrentTimeStamp();
      window.skipSyncListenerForNextOneTime = true; // Prevents syncing infinite loop
      const syncTimestampObject = {
        [APP_CONSTANTS.LAST_SYNC_TIMESTAMP]: timestamp,
      };
      return updateValueAsPromise(
        getMetadataSyncPath(uid),
        syncTimestampObject
      );
    })
    .catch((err) => Logger.log(err));
}

export const clearStorage = () => {
  const uid = getUserDetail("id");
  if (!uid) {
    Logger.log("Couldn't clear Storage");
    return emptyPromise();
  }
  return saveStorageObject({});
};
