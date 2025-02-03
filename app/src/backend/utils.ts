import { collection, doc, getFirestore } from "firebase/firestore";
import firebaseApp from "../firebase";
import { isPersonalWorkspace } from "features/workspaces/utils";

export const getOwnerId = (uid: string, teamId?: string) => {
  if (teamId) {
    // For backward compatibility, we are using teamId as ownerId for team workspaces only
    // FIXME-syncing: Find a longterm fix for this. What should be the owner id of personal workspace?
    if (isPersonalWorkspace(teamId)) {
      return uid;
    }

    return `team-${teamId}`;
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
