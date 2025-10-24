import { getTeamFromOwnerId, isTeamOwner } from "backend/utils";
import DataStoreUtils from "utils/DataStoreUtils";
import { getTeamSharedListsPath, getUserSharedListsPath } from "utils/db/UserModel";

/**
 * Shared Lists are stored partially under User Node and partially
 * under Public Node (/users for individuals and /teamSync/sharedList for teams)
 * Rules, access, isEnabled, shareId are under public Node
 * listName, shareId, creationDate are under user Node
 * We do not need isEnabled flag on ShareLists screen
 * @param {number|string} ownerId - The user id | team-teamId
 */
export const fetchSharedLists = (ownerId: string) => {
  if (isTeamOwner(ownerId)) {
    const teamId = getTeamFromOwnerId(ownerId);
    const teamSharedListsPath = getTeamSharedListsPath(teamId);
    return DataStoreUtils.getValue(teamSharedListsPath);
  } else {
    // ownerId is userId
    const currentUserSharedLists = getUserSharedListsPath(ownerId);
    return DataStoreUtils.getValue(currentUserSharedLists);
  }
};
