import firebaseApp from "../../firebase";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import { getOwnerId } from "backend/utils";
import { RQAPI } from "features/apiClient/types";
import Logger from "lib/logger";

// TODO: To be used when collections tab is displayed on UI
export const getApiRecords = async (uid: string, teamId?: string): Promise<RQAPI.Record[]> => {
  if (!uid) {
    return [];
  }

  const ownerId = getOwnerId(uid, teamId);
  const records = await getApiRecordsFromFirebase(ownerId);
  return records;
};

const getApiRecordsFromFirebase = async (ownerId: string): Promise<RQAPI.Record[]> => {
  const db = getFirestore(firebaseApp);
  const rootApiRecordsRef = collection(db, "apis");

  try {
    const q = query(rootApiRecordsRef, where("ownerId", "==", ownerId), where("deleted", "in", [false]));

    const result: any = [];
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return result;
    }

    snapshot.forEach((doc) => {
      result.push({ ...doc.data(), id: doc.id });
    });

    return result;
  } catch (error) {
    Logger.error("Error fetching api records!", error);
    return [];
  }
};
