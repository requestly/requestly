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

export const getOwnerNodePath = (ownerId) => {
  return ownerId ? [FIREBASE_NODES.USERS, ownerId] : null;
};

export const getSharedListsPath = (ownerId) => {
  var currentUserPath = getOwnerNodePath(ownerId);
  if (currentUserPath) {
    currentUserPath.push(FIREBASE_NODES.SHARED_LISTS);
  }
  return currentUserPath;
};

export const getSpecificUserSharedListPath = (userId, sharedListId) => {
  return getSharedListsPath(userId).concat(sharedListId);
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
