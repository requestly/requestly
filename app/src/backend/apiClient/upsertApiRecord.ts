import firebaseApp from "../../firebase";
import { getFirestore, Timestamp, updateDoc, addDoc, collection, doc } from "firebase/firestore";
import { getOwnerId } from "backend/utils";
import Logger from "lib/logger";
import { RQAPI } from "features/apiClient/types";

export const upsertApiRecord = async (
  uid: string,
  record: Partial<RQAPI.Record>,
  teamId?: string
): Promise<{ success: boolean; data: RQAPI.Record | null }> => {
  let result;

  const sanitizedRecord = { ...record };
  if (sanitizedRecord.type === RQAPI.RecordType.API) {
    delete sanitizedRecord.data.response;
  }

  if (sanitizedRecord.type === RQAPI.RecordType.COLLECTION) {
    delete sanitizedRecord.data.children;
  }

  if (!record.id) {
    result = await createApiRecord(uid, sanitizedRecord, teamId);
  } else {
    result = await updateApiRecord(uid, sanitizedRecord, teamId);
  }

  return result;
};

const createApiRecord = async (
  uid: string,
  record: Partial<RQAPI.Record>,
  teamId?: string
): Promise<{ success: boolean; data: RQAPI.Record | null }> => {
  const db = getFirestore(firebaseApp);
  const rootApiRecordsCollectionRef = collection(db, "apis");
  const ownerId = getOwnerId(uid, teamId);

  const newRecord = {
    name: record.name || "",
    type: record.type,
    data: record.data,
    collectionId: record.collectionId || "",
    ownerId: ownerId,
    deleted: false,
    createdBy: uid,
    updatedBy: uid,
    createdTs: Timestamp.now().toMillis(),
    updatedTs: Timestamp.now().toMillis(),
  } as RQAPI.Record;

  const result = await addDoc(rootApiRecordsCollectionRef, { ...newRecord })
    .then((docRef) => {
      Logger.log(`Api document created ${docRef.id}`);
      updateDoc(docRef, {
        id: docRef.id,
      });

      return { success: true, data: { ...newRecord, id: docRef.id } };
    })
    .catch((err) => {
      Logger.error("Error while creating api record", err);
      return { success: false, data: null };
    });

  return result;
};

const updateApiRecord = async (
  uid: string,
  record: Partial<RQAPI.Record>,
  teamId?: string
): Promise<{ success: boolean; data: RQAPI.Record | null }> => {
  const db = getFirestore(firebaseApp);
  const apiRecordDocRef = doc(db, "apis", record.id);

  const updatedRecord = {
    ...record,
    updatedBy: uid,
    updatedTs: Timestamp.now().toMillis(),
  } as RQAPI.Record;

  const result = await updateDoc(apiRecordDocRef, { ...updatedRecord })
    .then(() => {
      Logger.log(`Api document updated`);
      return { success: true, data: updatedRecord };
    })
    .catch((err) => {
      Logger.error("Error while updating api record", err);
      return { success: false, data: null };
    });

  return result;
};
