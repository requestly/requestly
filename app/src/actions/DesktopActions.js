import { toast } from "utils/Toast.js";

export function getAppVersion() {
  return window.RQ && window.RQ.DESKTOP && window.RQ.DESKTOP.VERSION;
}

const isDesktopStorageServiceAvailable = () => {
  return window.RQ && window.RQ.DESKTOP && window.RQ.DESKTOP.SERVICES && window.RQ.DESKTOP.SERVICES.STORAGE_SERVICE;
};

export function isAppInstalled() {
  return !!getAppVersion();
}

export function getStorageSuperObject() {
  return new Promise((resolve, reject) => {
    if (isDesktopStorageServiceAvailable()) {
      resolve(window.RQ.DESKTOP.SERVICES.STORAGE_SERVICE.getStorageSuperObject());
    } else reject("Couldnt hit desktop API");
  });
}

export function getStorageObject(key) {
  return new Promise((resolve, reject) => {
    if (isDesktopStorageServiceAvailable()) {
      resolve(window.RQ.DESKTOP.SERVICES.STORAGE_SERVICE.getStorageObject(key));
    } else reject("Couldnt hit desktop API");
  });
}

export function saveStorageObject(object) {
  return new Promise((resolve, reject) => {
    if (isDesktopStorageServiceAvailable()) {
      resolve(window.RQ.DESKTOP.SERVICES.STORAGE_SERVICE.setStorageObject(object));
    } else reject("Couldnt hit desktop API");
  });
}

export function removeStorageObject(key) {
  return new Promise((resolve, reject) => {
    if (isDesktopStorageServiceAvailable()) {
      resolve(window.RQ.DESKTOP.SERVICES.STORAGE_SERVICE.deleteItem(key));
    } else reject("Couldnt hit desktop API");
  });
}

/**
 * Syntatic sugar to remove list of objects from Storage.
 * Internally calls removeStorageObject for individual object to be deleted
 */
export function removeStorageObjects(objectsToRemove) {
  if (!objectsToRemove) {
    return new Error("Empty objects to remove list");
  }

  const removeStorageObjectPromises = [];
  objectsToRemove.forEach((key) => {
    removeStorageObjectPromises.push(removeStorageObject(key));
  });
  return Promise.all(removeStorageObjectPromises).catch((err) => err);
}

export function clearStorage() {
  return new Promise((resolve, reject) => {
    if (isDesktopStorageServiceAvailable()) {
      resolve(window.RQ.DESKTOP.SERVICES.STORAGE_SERVICE.clearStorage());
    } else reject("Couldnt hit desktop API");
  });
}

export const startBackgroundProcess = async () => {
  const isBackgroundProcessActive = await window.RQ.DESKTOP.SERVICES.STATE_MANAGEMENT.getState(
    "isBackgroundProcessActive"
  );

  // If not active, activate it
  if (!isBackgroundProcessActive) {
    const status = await window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain("start-background-process");
    return status;
  }

  // If already active, return true
  return true;
};

export const saveRootCert = async () => {
  window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("save-root-cert")
    .then((res) => {
      if (res.success) {
        toast.success("Certificate saved");
      } else {
        toast.error("An error occured while saving certificate");
      }
    })
    .catch(() => {
      toast.error("An error occured while saving certificate");
    });
};

// Invoke the bacground process to send activable sources from the given list of apps asynchronously
export const invokeAppDetectionInBackground = (arrayOfApps) => {
  let arrayOfAppIds = [];
  arrayOfApps.forEach((app) => {
    if (!app.comingSoon) {
      arrayOfAppIds.push(app.id);
    }
  });
  return window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("detect-available-apps", arrayOfAppIds);
};
