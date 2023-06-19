import { isExtensionInstalled } from "actions/ExtensionActions";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import APP_CONSTANTS from "config/constants";
import { toast } from "utils/Toast.js";
import { getAttrFromFirebase, submitAttrUtil } from "./AnalyticsUtils";
import { dateObjToDateString, getOldestDate } from "./DateTimeUtils";
import { trackDesktopAppInstalled } from "modules/analytics/events/misc/installation";
import { getValueAsPromise } from "actions/FirebaseActions";

const { APP_MODES } = GLOBAL_CONSTANTS;

export const generateUUID = () => {
  return Math.random().toString(36).substr(2, 5);
};

export const copyToClipBoard = (textToCopy, prompt) => {
  prompt = prompt || "Copied to clipboard!";
  navigator.clipboard.writeText(textToCopy).then(
    () => {
      toast.info(prompt);
    },
    (err) => {
      toast.error("Oops something went wrong");
    }
  );
};

export const isUserRegisteredOnInstallationDate = async (user, appMode) => {
  const installationDate = await getAndUpdateInstallationDate(appMode, false);
  const result = dateObjToDateString(new Date()) === installationDate;
  return result;
};

// doUpdate - (bool) Tells if we need to write installation date or not.
// In App.js, we set. In others, we don't!
// Else it would cause invalid date for users who First used desktop app and then later switched to Extension,
export const getAndUpdateInstallationDate = async (appMode, doUpdate, isUserLoggedIn) => {
  let attrName = APP_CONSTANTS.GA_EVENTS.ATTR.EXTENSION_INSTALL_DATE;
  if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
    attrName = APP_CONSTANTS.GA_EVENTS.ATTR.DESKTOP_INSTALL_DATE;
  } else if (!isExtensionInstalled()) {
    // IF appMode is Extension but user haven't installed it yet
    return null;
  }
  // eslint-disable-next-line
  return new Promise(async (resolve) => {
    if (isUserLoggedIn) {
      const dateFromFirebase = await getAttrFromFirebase(attrName);

      const oldestInstallationDate = getOldestDate([
        getLocalInstallationDate(attrName, doUpdate, appMode),
        dateFromFirebase,
      ]);

      if (doUpdate) {
        // Just push installation date everywhere
        submitAttrUtil(attrName, oldestInstallationDate);
        setLocalInstallationDate(attrName, oldestInstallationDate);
      }
      resolve(oldestInstallationDate);
      // return oldestInstallationDate;
    } else {
      // User is not logged in - return/set date in local storage
      const localInstallationDate = getLocalInstallationDate(attrName, doUpdate, appMode);
      submitAttrUtil(attrName, localInstallationDate);
      resolve(localInstallationDate);
    }
  });
};

// doUpdate - (bool) Tells if we need to write installation date or not.
// In App.js, we set. In others, we don't!
// Else it would cause invalid date for users who First used desktop app and then later switched to Extension,
const getLocalInstallationDate = (attrName, doUpdate, appMode) => {
  // If it doesn't exist in local storage yet!
  if (localStorage.getItem(attrName) === null) {
    // This might be the time of first install
    if (doUpdate) {
      if (appMode === APP_MODES.DESKTOP) trackDesktopAppInstalled();
    }

    if (doUpdate) return setLocalInstallationDate(attrName);
    else return dateObjToDateString(new Date());
  }
  // If some date is already in local storage
  else {
    return localStorage.getItem(attrName);
  }
};

const setLocalInstallationDate = (attrName, newValue) => {
  const currentDate = dateObjToDateString(new Date());
  const relevantDate = newValue !== undefined ? newValue : currentDate;
  localStorage.setItem(attrName, relevantDate);
  return relevantDate;
};

export const isDesktopMode = () => {
  if (window.RQ && window.RQ.MODE && window.RQ.MODE === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) return true;
  else return false;
};

export const parseGravatarImage = (urlString) => {
  const url = new URL(urlString);
  url.searchParams.set(
    "d",
    "https://yoda.hypeople.studio/yoda-admin-template/react/static/media/memoji-1.afa5922f.png"
  );
  return url.href;
};

export const fetchUserCountry = async () => {
  const defaultCountry = "US";
  const country = await fetch("https://api.country.is/")
    .then((res) => res.json())
    .then((location) => {
      if (location.country) {
        return location.country;
      } else {
        return defaultCountry;
      }
    })
    .catch(() => {
      return defaultCountry;
    });
  return country;
};

export const getUserOS = () => {
  let userAgent = window.navigator.userAgent,
    platform = window.navigator.platform,
    macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"],
    windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"],
    iosPlatforms = ["iPhone", "iPad", "iPod"],
    os = null;

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = "macOS";
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = "iOS";
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = "Windows";
  } else if (/Android/.test(userAgent)) {
    os = "Android";
  } else if (!os && /Linux/.test(platform)) {
    os = "Linux";
  }

  return os;
};

// Modifies the original object! Deep clone prior if required
export const sanitizeDataForFirebase = (myObject) => {
  // Remove undefined values, if any
  if (typeof myObject === "object" && !Array.isArray(myObject) && myObject !== null) {
    myObject = JSON.parse(JSON.stringify(myObject, (k, v) => (v === undefined ? null : v)));
  }
  return myObject;
};

export const getSignupDate = async (uid) => {
  return await getValueAsPromise(["customProfile", uid, "signup", "signup_date"]);
};

export const getConnectedAppsCount = (appsListArray) => {
  return appsListArray?.filter((app) => app.isActive).length;
};
