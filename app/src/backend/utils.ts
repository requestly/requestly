import { collection, doc, getFirestore, writeBatch } from "firebase/firestore";
import firebaseApp from "../firebase";
import { updateRecordMetaData } from "./apiClient/utils";

export const LOGGED_OUT_STATE_UID = "local";

export const getOwnerId = (uid: string | undefined, teamId?: string | null) => {
  if (teamId) {
    return `team-${teamId}`;
  }

  if (!uid) {
    return LOGGED_OUT_STATE_UID;
  }

  return uid;
};

export const isTeamOwner = (ownerId: string) => {
  return ownerId.startsWith("team-");
};

export const getTeamFromOwnerId = (ownerId: string) => {
  if (isTeamOwner(ownerId)) {
    return ownerId.split("-")[1];
  } else return null;
};

export const generateDocumentId = (path: string) => {
  const db = getFirestore(firebaseApp);
  const newDocRef = doc(collection(db, path));
  return newDocRef.id;
};

export const batchWrite = async (batchSize: number, items: any[], writeFunction: (item: any) => Promise<any>) => {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(writeFunction));
    results.push(...batchResults);
  }
  return results;
};

// TODO: Merge this with backend/api client core functions (upsertAPIRecord)
export const firebaseBatchWrite = async (path: string, data: any[]) => {
  const db = getFirestore(firebaseApp);
  const batch = writeBatch(db);

  const updatedRecords: any[] = [];
  try {
    data.forEach((item) => {
      const updatedItem = updateRecordMetaData(item);
      updatedRecords.push(updatedItem);
      const recordRef = doc(db, path, updatedItem.id);
      batch.set(recordRef, updatedItem, { merge: true });
    });

    await batch.commit();
    return updatedRecords;
  } catch (error) {
    throw new Error(error);
  }
};
