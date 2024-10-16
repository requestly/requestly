import firebaseApp from "../../firebase";
import { doc, getFirestore, Timestamp, writeBatch } from "firebase/firestore";
import { getOwnerId } from "backend/utils";
import Logger from "lib/logger";

export const deleteApiRecords = async (
  uid: string,
  recordIds: string[],
  teamId?: string
): Promise<{ success: boolean; data: unknown }> => {
  if (!uid) {
    return { success: false, data: null };
  }

  const ownerId = getOwnerId(uid, teamId);
  const result = await deleteApiRecordsFromFirebase(uid, ownerId, recordIds);
  return result;
};

const deleteApiRecordsFromFirebase = async (
  uid: string,
  ownerId: string,
  recordIds: string[]
): Promise<{ success: boolean; data: unknown }> => {
  try {
    const db = getFirestore(firebaseApp);
    const apisRecordsbatch = writeBatch(db);

    recordIds.forEach((record) => {
      const recordRef = doc(db, "apis", record);

      apisRecordsbatch.set(
        recordRef,
        {
          deleted: true,
          collectionId: "",
          updatedBy: uid,
          updatedTs: Timestamp.now().toMillis(),
        },
        { merge: true }
      );
    });

    await apisRecordsbatch.commit();

    return { success: true, data: null };
  } catch (error) {
    Logger.error("Error while deleting api records!", error);
    return { success: false, data: null };
  }
};