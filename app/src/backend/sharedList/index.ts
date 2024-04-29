import { getFunctions, httpsCallable } from "firebase/functions";
import DataStoreUtils from "utils/DataStoreUtils";
import { getUserSharedListsPath } from "utils/db/UserModel";

export const deleteSharedList = (sharedListId: string) => {
  const functions = getFunctions();
  const removeSharedList = httpsCallable(functions, "sharedLists-delete");
  return removeSharedList({ sharedListId });
};

/**
 * Shared Lists are stored partially under User Node and partially under Public Node
 * Rules, access, isEnabled, shareId are under public Node
 * listName, shareId, creationDate are under user Node
 * We do not need isEnabled flag on ShareLists screen
 * @param {number|string} uid - The user id
 */
export const fetchSharedLists = (uid: string) => {
  const currentUserSharedLists = getUserSharedListsPath(uid);
  return DataStoreUtils.getValue(currentUserSharedLists);
};
