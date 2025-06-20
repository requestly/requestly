import { RQAPI } from "features/apiClient/types";
import firebaseApp from "firebase";
import { collection, doc, getFirestore, Timestamp, writeBatch } from "firebase/firestore";
import { captureException } from "./utils";
import { getOwnerId } from "backend/utils";

export const batchCreateApiRecords = async (
  uid: string,
  teamId: string,
  records: RQAPI.Record[]
): Promise<RQAPI.RecordsPromise> => {
  if (!uid) {
    return { success: false, data: null };
  }

  const ownerId = getOwnerId(uid, teamId);
  const result = await batchCreateApiRecordsInFirebase(uid, ownerId, records);
  return result;
};

const batchCreateApiRecordsInFirebase = async (
  uid: string,
  ownerId: string,
  records: RQAPI.Record[]
): Promise<RQAPI.RecordsPromise> => {
  try {
    const db = getFirestore(firebaseApp);
    const batch = writeBatch(db);
    const updatedRecords: RQAPI.Record[] = [];

    records.forEach((record) => {
      const recordRef = doc(collection(db, "apis"));

      const updatedRecord: RQAPI.Record = {
        ...record,
        id: recordRef.id, //  TODO: check in db is same id as path
        deleted: false,
        ownerId: ownerId,
        createdBy: uid,
        updatedBy: uid,
        createdTs: Timestamp.now().toMillis(),
        updatedTs: Timestamp.now().toMillis(),
      };

      batch.set(recordRef, updatedRecord);
      updatedRecords.push(updatedRecord);
    });

    await batch.commit();
    return { success: true, data: { records: updatedRecords, erroredRecords: [] } };
  } catch (error) {
    captureException(error);
    return { success: false, data: null };
  }
};
