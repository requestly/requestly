import { RQAPI } from "features/apiClient/types";
import firebaseApp from "firebase";
import { collection, doc, getFirestore, runTransaction, Timestamp } from "firebase/firestore";
import { captureException } from "./utils";
import { getOwnerId } from "backend/utils";

export const batchCreateApiRecordsWithExistingId = async (
  uid: string,
  teamId: string,
  records: RQAPI.ApiClientRecord[]
): Promise<RQAPI.RecordsPromise> => {
  if (!uid) {
    return {
      success: false,
      data: {
        records: [],
        erroredRecords: [],
      },
    };
  }

  const ownerId = getOwnerId(uid, teamId);
  const result = await batchCreateApiRecordsWithExistingIdInFirebase(uid, ownerId, records);
  return result;
};

const batchCreateApiRecordsWithExistingIdInFirebase = async (
  uid: string,
  ownerId: string,
  records: RQAPI.ApiClientRecord[]
): Promise<RQAPI.RecordsPromise> => {
  try {
    const db = getFirestore(firebaseApp);
    const updatedRecords: RQAPI.ApiClientRecord[] = [];

    await runTransaction(db, async (transaction) => {
      records.forEach((record) => {
        const updatedRecord: RQAPI.ApiClientRecord = {
          ...record,
          id: record.id,
          deleted: false,
          ownerId: ownerId,
          createdBy: uid,
          updatedBy: uid,
          createdTs: Timestamp.now().toMillis(),
          updatedTs: Timestamp.now().toMillis(),
        };

        const recordRef = doc(collection(db, "apis"), `${record.id}`);
        transaction.set(recordRef, updatedRecord);
        updatedRecords.push(updatedRecord);
      });
    });

    return { success: true, data: { records: updatedRecords, erroredRecords: [] } };
  } catch (error) {
    captureException(error);
    return {
      success: false,
      data: {
        records: [],
        erroredRecords: [],
      },
      message: error?.message,
    };
  }
};
