import { toast } from "utils/Toast.js";
import { traceIPC } from "utils/TracingIPC";

export function getAppVersion() {
  return window.RQ && window.RQ.DESKTOP && window.RQ.DESKTOP.VERSION;
}

export const isDesktopStorageServiceAvailable = () => {
  return window.RQ && window.RQ.DESKTOP && window.RQ.DESKTOP.SERVICES && window.RQ.DESKTOP.SERVICES.STORAGE_SERVICE;
};

export function isAppInstalled() {
  return !!getAppVersion();
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

export const getAPIResponse = (apiRequest) => {
  return traceIPC.invokeEventInMain("get-api-response", { apiRequest });
};
