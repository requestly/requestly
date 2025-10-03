import firebaseApp from "../../firebase";
import { getFirestore, Timestamp, updateDoc, addDoc, collection, doc, setDoc, writeBatch } from "firebase/firestore";
import { getOwnerId } from "backend/utils";
import Logger from "lib/logger";
import lodash from "lodash";
import { RQAPI } from "features/apiClient/types";
import { captureException } from "./utils";

export function sanitizeRecord(record: Partial<RQAPI.ApiClientRecord>) {
  const sanitizedRecord = lodash.cloneDeep(record);
  if (sanitizedRecord.type === RQAPI.RecordType.API) {
    if (sanitizedRecord.data) {
      delete sanitizedRecord.data.response;
      delete sanitizedRecord.data.testResults;
    }
  }

  if (sanitizedRecord.type === RQAPI.RecordType.COLLECTION) {
    if (sanitizedRecord.data) {
      delete sanitizedRecord.data.children;
    }
  }

  return sanitizedRecord;
}

export const upsertApiRecord = async (
  uid: string,
  record: Partial<RQAPI.ApiClientRecord>,
  teamId?: string,
  docId?: string
): Promise<{ success: boolean; data: RQAPI.ApiClientRecord | null }> => {
  let result;

  const sanitizedRecord = sanitizeRecord(record);

  if (!record.id || docId) {
    result = await createApiRecord(uid, sanitizedRecord, teamId, docId);
  } else {
    result = await updateApiRecord(uid, sanitizedRecord, teamId);
  }

  return result;
};

const createApiRecord = async (
  uid: string,
  record: Partial<RQAPI.ApiClientRecord>,
  teamId?: string,
  docId?: string
): Promise<{ success: boolean; data: RQAPI.ApiClientRecord | null }> => {
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
  } as RQAPI.ApiClientRecord;

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
    } catch (e) {
      captureException(e);
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
      captureException(err);
      Logger.error("Error while creating api record", err);
      return { success: false, data: null };
    }
  }
};

export const updateApiRecord = async (
  uid: string,
  record: Partial<RQAPI.ApiClientRecord>,
  teamId?: string
): Promise<{ success: boolean; data: RQAPI.ApiClientRecord | null }> => {
  const db = getFirestore(firebaseApp);
  const apiRecordDocRef = doc(db, "apis", record.id);

  const updatedRecord = {
    ...record,
    updatedBy: uid,
    updatedTs: Timestamp.now().toMillis(),
  } as RQAPI.ApiClientRecord;

  try {
    await updateDoc(apiRecordDocRef, { ...updatedRecord });
    Logger.log(`Api document updated`);
    return { success: true, data: updatedRecord };
  } catch (err) {
    captureException(err);
    Logger.error("Error while updating api record", err);
    return { success: false, data: null };
  }
};

export const batchUpsertApiRecords = async (
  uid: string,
  records: RQAPI.ApiClientRecord[],
  teamId?: string
): Promise<{ success: boolean; data: RQAPI.ApiClientRecord[] | null; message?: string }> => {
  if (!records.length) {
    return { success: false, data: null, message: "No records found to add or update" };
  }

  const db = getFirestore(firebaseApp);
  const batch = writeBatch(db);
  const ownerId = getOwnerId(uid, teamId);

  try {
    const updatedRecords: RQAPI.ApiClientRecord[] = [];

    records.forEach((record) => {
      const sanitizedRecord = sanitizeRecord(record);
      const updatedRecord = {
        ...sanitizedRecord,
        ownerId,
        createdBy: sanitizedRecord.createdBy ?? uid,
        updatedBy: uid,
        createdTs: sanitizedRecord.createdTs ?? Timestamp.now().toMillis(),
        updatedTs: Timestamp.now().toMillis(),
      } as RQAPI.ApiClientRecord;

      updatedRecords.push(updatedRecord);
      const recordRef = doc(db, "apis", updatedRecord.id);
      batch.set(recordRef, updatedRecord, { merge: true });
    });

    await batch.commit();
    Logger.log(`Batch upserted ${records.length} API records`);
    return { success: true, data: updatedRecords };
  } catch (error) {
    captureException(error);
    Logger.error("Error while batch upserting API records", error);
    return { success: false, data: null, message: error?.message };
  }
};
