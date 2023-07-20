import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import DataStoreUtils from "./DataStoreUtils";
import { getDateString } from "./DateTimeUtils";
import { getAppDetails } from "./AppUtils";
import { trackAttr } from "modules/analytics";
import { isDesktopMode } from "./Misc";

export const submitAttrUtil = (attr, value) => {
  trackAttr(attr, value);
};

export const submitAppDetailAttributes = () => {
  const { app_mode, app_version, ext_id } = getAppDetails();

  trackAttr("app_mode", app_mode);

  if (app_mode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION) {
    trackAttr("extension_version", app_version);
    trackAttr("extension_id", ext_id);
  } else if (app_mode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
    trackAttr("desktop_app_version", app_version);
  }
};

export const trackRQLastActivity = (activity) => {
  trackAttr("rq_last_activity_ts", getDateString(new Date()));
  trackAttr("rq_last_activity", activity);
};

export const trackRQDesktopLastActivity = (activity) => {
  if (isDesktopMode()) {
    trackAttr("rq_last_desktop_activity_ts", getDateString(new Date()));
    trackAttr("rq_last_desktop_activity", activity);
  }
};

export const getAttrFromFirebase = async (attrName) => {
  return new Promise((resolve, reject) => {
    DataStoreUtils.isUserAuthenticated(async (userData) => {
      if (userData && userData.uid) {
        const currentDateInDB = await DataStoreUtils.getValue(["customProfile", userData.uid, "attributes", attrName]);
        resolve(currentDateInDB);
        return currentDateInDB;
      } else {
        reject(null);
        return null;
      }
    });
  });
};
