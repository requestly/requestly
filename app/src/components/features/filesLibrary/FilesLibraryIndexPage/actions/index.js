//UTILS
import {
  getUserFilesPath,
  getMigrationPath,
} from "../../../../../utils/db/UserModel";
import DataStoreUtils from "../../../../../utils/DataStoreUtils";
// FIREBASE
import { getFunctions, httpsCallable } from "firebase/functions";
export const fetchFiles = async (uid) => {
  const pathArray = getUserFilesPath(uid);
  const filesFetched = await DataStoreUtils.getValue(pathArray);
  if (filesFetched === null) {
    return {};
  }
  return filesFetched;
};

export const fetchUserMocks = async () => {
  const functions = getFunctions();
  const fetchUserMocks = httpsCallable(functions, "fetchUserMocks");

  return await fetchUserMocks().then((res) => res.data);
};

// Checks Migration Status of Mock Files
export const checkMigrationDone = async (uid) => {
  const pathArray = getMigrationPath(uid);
  const userData = await DataStoreUtils.getValue(pathArray);
  const isMigrationDone =
    userData.migrations && userData.migrations.filesToMock;
  return !!isMigrationDone;
};

// Migrate and update status
export const migrateAndUpdate = async (uid) => {
  await migrateFilesFromDBtoFirestore(uid);
  const pathArray = getMigrationPath(uid);
  DataStoreUtils.setValue(pathArray, { migrations: { filesToMock: true } });
};

// Function to migrate mock js/css/html files from realtime DB to Firestore
const migrateFilesFromDBtoFirestore = async (uid) => {
  const functions = getFunctions();
  const mockFiles = await fetchFiles(uid);
  const addMock = httpsCallable(functions, "addMock");
  if (mockFiles) {
    Object.keys(mockFiles).forEach((fileData) => {
      // rId represents real-time database Id
      mockFiles[fileData].rId = mockFiles[fileData].id;
      addMock(mockFiles[fileData]);
    });
  }
};
