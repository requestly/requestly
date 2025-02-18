import firebaseApp from "../../firebase";
import { getFirestore, Timestamp, updateDoc, addDoc, collection, doc, setDoc } from "firebase/firestore";
import { getOwnerId } from "backend/utils";
import Logger from "lib/logger";
import { RQAPI } from "features/apiClient/types";

export const upsertApiRecord = async (
  uid: string,
  record: Partial<RQAPI.Record>,
  teamId?: string,
  docId?: string
): Promise<{ success: boolean; data: RQAPI.Record | null }> => {
  let result;

  const sanitizedRecord = { ...record };
  if (sanitizedRecord.type === RQAPI.RecordType.API) {
    delete sanitizedRecord.data.response;
    delete sanitizedRecord.data.testResults;
  }

  if (sanitizedRecord.type === RQAPI.RecordType.COLLECTION) {
    delete sanitizedRecord.data.children;
  }

  if (!record.id || docId) {
    result = await createApiRecord(uid, sanitizedRecord, teamId, docId);
  } else {
    result = await updateApiRecord(uid, sanitizedRecord, teamId);
  }

  return result;
};

const createApiRecord = async (
  uid: string,
  record: Partial<RQAPI.Record>,
  teamId?: string,
  docId?: string
): Promise<{ success: boolean; data: RQAPI.Record | null }> => {
  const db = getFirestore(firebaseApp);
  const rootApiRecordsCollectionRef = collection(db, "apis");
  const ownerId = getOwnerId(uid, teamId);

  const newRecord = {
    name: record.name || "Untitled request",
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

  if (record.type === RQAPI.RecordType.COLLECTION) {
    newRecord.description = record.description || "";
  }

  if (docId) {
    // Creating a new record with a given id
    const docRef = doc(db, "apis", docId);
    try {
      await setDoc(docRef, { ...newRecord, id: docId });
      Logger.log(`Api document created with ID ${docId}`);
      return { success: true, data: { ...newRecord, id: docId } };
    } catch {
      Logger.error(`Error creating Api document with ID ${docId}`);
      return { success: false, data: null };
    }
  } else {
    try {
      const resultDocRef = await addDoc(rootApiRecordsCollectionRef, { ...newRecord });
      Logger.log(`Api document created ${resultDocRef.id}`);
      // TODO: Figure out why do we need this? Why update the id with its own id?
      updateDoc(resultDocRef, {
        id: resultDocRef.id,
      });

      return { success: true, data: { ...newRecord, id: resultDocRef.id } };
    } catch (err) {
      Logger.error("Error while creating api record", err);
      return { success: false, data: null };
    }
  }
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

  try {
    await updateDoc(apiRecordDocRef, { ...updatedRecord });
    Logger.log(`Api document updated`);
    return { success: true, data: updatedRecord };
  } catch (err) {
    Logger.error("Error while updating api record", err);
    return { success: false, data: null };
  }
};
