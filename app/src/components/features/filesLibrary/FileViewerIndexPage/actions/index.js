//CONFIG
import APP_CONSTANTS from "../../../../../config/constants";
//UTILS
import DataStoreUtils from "../../../../../utils/DataStoreUtils";
import { getPublicSharedListPath, getUserSpecificFilePath } from "../../../../../utils/db/UserModel";
import { getFunctions, httpsCallable } from "firebase/functions";

//CONSTANTS
const { PATHS } = APP_CONSTANTS;

export const getFileIdFromURL = (url) => {
  /** URL Example: /dashboard/files/viewer/-MHmAB4EnjJMWv0BGSzE */
  /** URL Example: /dashboard/files/viewer/create */

  // Split by "/"
  const urlArray = url.split("/");

  // Use path varible to determine which index of this array would contain shared list id
  const numberOfSlashesInKnownPath = PATHS.FILES.VIEWER.ABSOLUTE.split("/").length;
  const requiredIndex = numberOfSlashesInKnownPath + 1 - 1; // +1 to Count the HOST part, -1 to convert arr length to arr index

  return urlArray[requiredIndex];
};

export const getFileDetailsFromDatabase = (uid, fileId) => {
  return DataStoreUtils.getValue(getUserSpecificFilePath(uid, fileId));
};

export const fetchSharedListData = (sharedListId) => {
  const publicSharedListPath = getPublicSharedListPath(sharedListId);
  return DataStoreUtils.getValue(publicSharedListPath);
};

export const getMockDetailsFromDatabase = async (mockId) => {
  const functions = getFunctions();
  const fetchMockData = httpsCallable(functions, "fetchMockData");

  return await fetchMockData(mockId).then((res) => res.data);
};
