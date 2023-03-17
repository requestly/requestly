// //Utilities
// import { getSharedListsPath } from "../../../../../utils/db/UserModel";
// import DataStoreUtils from "../../../../../utils/DataStoreUtils";
import { getOwnerId } from "backend/mocks/common";
import { getFunctions, httpsCallable } from "firebase/functions";

/**
 * Shared Lists are stored partially under User Node and partially under Public Node
 * Rules, access, isEnabled, shareId are under public Node
 * listName, shareId, creationDate are under user Node
 * We do not need isEnabled flag on ShareLists screen
 */
export const fetchSharedLists = async (uid?: string, teamId?: string) => {
  const ownerId = getOwnerId(uid, teamId);
  // const currentUserSharedListsPath = getSharedListsPath(ownerId);
  // return DataStoreUtils.getValue(currentUserSharedListsPath);

  const getSharedLists = httpsCallable(
    getFunctions(),
    "sharedLists-getUserSharedLists"
  );

  return getSharedLists({ ownerId });
};
