//CONFIG
import APP_CONSTANTS from "../../../../../config/constants";
//UTILS
import DataStoreUtils from "../../../../../utils/DataStoreUtils";
import { getPublicSharedListPath } from "../../../../../utils/db/UserModel";

//CONSTANTS
const { PATHS } = APP_CONSTANTS;

export const getSharedListIdFromString = (sharedListIdString: string) => {
  /** URL Example: /dashboard/shared-lists/viewer/1600332541841-Demo */

  // Split by "-" to distinguish id and name
  return sharedListIdString.split("-")[0];
};

export const getSharedListIdFromURL = (url: string) => {
  /** URL Example: /dashboard/shared-lists/viewer/1600332541841-Demo */

  // Split by "/"
  const urlArray = url.split("/");

  // Use path varible to determine which index of this array would contain shared list id
  const numberOfSlashesInKnownPath = PATHS.SHARED_LISTS.VIEWER.ABSOLUTE.split("/").length;
  const requiredIndex = numberOfSlashesInKnownPath + 1 - 1; // +1 to Count the HOST part, -1 to convert arr length to arr index

  // Split by "-" to distinguish id and name
  return urlArray[requiredIndex].split("-")[0];
};

export const fetchSharedListData = (sharedListId: string) => {
  const publicSharedListPath = getPublicSharedListPath(sharedListId);
  return DataStoreUtils.getValue(publicSharedListPath);
};

export const getSharedListIdFromImportURL = (url: string) => {
  try {
    const urlStringArray = url.split("/");
    return urlStringArray[urlStringArray.length - 1].split("-")[0];
  } catch (err) {
    return null;
  }
};

export const getSharedListNameFromUrl = (url: string) => {
  try {
    const urlStringArray = url.split("/");
    return urlStringArray[urlStringArray.length - 1].split("-").splice(1).join("-");
  } catch (err) {
    return null;
  }
};
