import { collection, doc, getFirestore } from "firebase/firestore";
import firebaseApp from "../firebase";

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
