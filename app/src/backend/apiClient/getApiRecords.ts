import firebaseApp from "../../firebase";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import { getOwnerId } from "backend/utils";
import { RQAPI } from "features/apiClient/types";
import Logger from "lib/logger";

export const getApiRecords = async (
  uid: string,
  teamId?: string
): Promise<{ success: boolean; data: RQAPI.Record[] }> => {
  if (!uid) {
    return { success: false, data: [] };
  }

  const ownerId = getOwnerId(uid, teamId);
  const result = await getApiRecordsFromFirebase(ownerId);
  return result;
};

const getApiRecordsFromFirebase = async (ownerId: string): Promise<{ success: boolean; data: RQAPI.Record[] }> => {
  const db = getFirestore(firebaseApp);
  const rootApiRecordsRef = collection(db, "apis");

  try {
    const q = query(rootApiRecordsRef, where("ownerId", "==", ownerId), where("deleted", "in", [false]));

    const result: any = [];
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: true, data: result };
    }

    snapshot.forEach((doc) => {
      result.push({ ...doc.data(), id: doc.id });
    });

    return { success: true, data: result };
  } catch (error) {
    Logger.error("Error fetching api records!", error);
    throw error;
  }
};
