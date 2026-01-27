import firebaseApp from "../../firebase";
import { getFirestore, Timestamp, updateDoc, addDoc, collection, doc, setDoc, writeBatch } from "firebase/firestore";
import { getOwnerId } from "backend/utils";
import Logger from "lib/logger";
import lodash from "lodash";
import { RQAPI } from "features/apiClient/types";
import { captureException } from "./utils";
import { wrapWithCustomSpan } from "utils/sentry";

export function sanitizeRecord(record: Partial<RQAPI.ApiClientRecord>) {
  const sanitizedRecord = lodash.cloneDeep(record);
  if (sanitizedRecord.type === RQAPI.RecordType.API) {
    if (sanitizedRecord.data) {
      sanitizedRecord.data.response = null;
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

const _upsertApiRecord = async (
  uid: string,
  record: Partial<RQAPI.ApiClientRecord>,
  teamId?: string,
  docId?: string
): RQAPI.ApiClientRecordPromise => {
  let result;

  const sanitizedRecord = sanitizeRecord(record);

  if (!record.id || docId) {
    result = await createApiRecord(uid, sanitizedRecord, teamId, docId);
  } else {
    result = await updateApiRecord(uid, sanitizedRecord, teamId);
  }

  return result;
};
export const upsertApiRecord = wrapWithCustomSpan(
  {
    name: "api_client.cloud.backend.upsertApiRecord",
    op: "backend.upsert",
  },
  _upsertApiRecord
);

const _createApiRecord = async (
  uid: string,
  record: Partial<RQAPI.ApiClientRecord>,
  teamId?: string,
  docId?: string
): RQAPI.ApiClientRecordPromise => {
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
    await setDoc(docRef, { ...newRecord, id: docId });
    Logger.log(`Api document created with ID ${docId}`);
    return { success: true, data: { ...newRecord, id: docId } };
  } else {
    const resultDocRef = await addDoc(rootApiRecordsCollectionRef, { ...newRecord });
    Logger.log(`Api document created ${resultDocRef.id}`);
    updateDoc(resultDocRef, {
      id: resultDocRef.id,
    });
    return { success: true, data: { ...newRecord, id: resultDocRef.id } };
  }
};

export const createApiRecord = wrapWithCustomSpan(
  {
    name: "api_client.cloud.backend.createApiRecord",
    op: "backend.create",
  },
  _createApiRecord
);

const _updateApiRecord = async (
  uid: string,
  record: Partial<RQAPI.ApiClientRecord>,
  teamId?: string
): RQAPI.ApiClientRecordPromise => {
  if (!record.id) {
    throw new Error("Record id is required for updating an api record");
  }

  const db = getFirestore(firebaseApp);
  const apiRecordDocRef = doc(db, "apis", record.id);

  const updatedRecord = {
    ...record,
    updatedBy: uid,
    updatedTs: Timestamp.now().toMillis(),
  } as RQAPI.ApiClientRecord;

  await updateDoc(apiRecordDocRef, { ...updatedRecord });
  Logger.log(`Api document updated`);
  return { success: true, data: updatedRecord };
};
export const updateApiRecord = wrapWithCustomSpan(
  {
    name: "api_client.cloud.backend.updateApiRecord",
    op: "backend.update",
  },
  _updateApiRecord
);

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
