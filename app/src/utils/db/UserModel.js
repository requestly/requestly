/**
 *
 * @param {number|string} uid - The user id
 * @returns Path of current User node in array form ["users", "uid1"] otherwise null
 */

const FIREBASE_NODES = {
  USERS: "users",
  PUBLIC: "public",
  SHARED_LISTS: "sharedLists",
  FEEDBACK: "feedback",
  FILES: "files",
};

export const getUserNodePath = (uid) => {
  return uid ? [FIREBASE_NODES.USERS, uid] : null;
};

export const getUserSharedListsPath = (uid) => {
  var currentUserPath = getUserNodePath(uid);
  if (currentUserPath) {
    currentUserPath.push(FIREBASE_NODES.SHARED_LISTS);
  }
  return currentUserPath;
};

export const getTeamSharedListsPath = (teamId) => {
  return ["teamSync", teamId, FIREBASE_NODES.SHARED_LISTS];
};

export const getSpecificUserSharedListPath = (userId, sharedListId) => {
  return getUserSharedListsPath(userId).concat(sharedListId);
};

export const getPublicSharedListPath = (sharedListId) => {
  return [FIREBASE_NODES.PUBLIC, FIREBASE_NODES.SHARED_LISTS, sharedListId];
};

export const getUserFilesPath = (uid) => {
  return [FIREBASE_NODES.USERS, uid, FIREBASE_NODES.FILES];
};

export const getUserSpecificFilePath = (uid, fileId) => {
  const userFilesPath = getUserFilesPath(uid);
  //Make it file-id specific
  userFilesPath.push(fileId);
  return userFilesPath;
};

export const getMigrationPath = (uid) => {
  return ["customProfile", uid];
};

export function getUserProfilePath(userId) {
  return "users/" + userId + "/profile";
}
