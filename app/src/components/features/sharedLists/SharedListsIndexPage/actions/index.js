//Utilities
import { getUserSharedListsPath } from "../../../../../utils/db/UserModel";
import DataStoreUtils from "../../../../../utils/DataStoreUtils";

/**
 * Shared Lists are stored partially under User Node and partially under Public Node
 * Rules, access, isEnabled, shareId are under public Node
 * listName, shareId, creationDate are under user Node
 * We do not need isEnabled flag on ShareLists screen
 * @param {number|string} uid - The user id
 */
export const fetchSharedLists = (uid) => {
  const currentUserSharedLists = getUserSharedListsPath(uid);
  return DataStoreUtils.getValue(currentUserSharedLists);
};
