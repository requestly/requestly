import firebaseApp from "../../firebase";
import { doc, updateDoc, getFirestore, Timestamp } from "firebase/firestore";
import { removeUserMockSelector } from "./common";
import { getOwnerId } from "backend/utils";
export const deleteMock = async (uid: string, mockId: string, teamId?: string): Promise<boolean> => {
  if (!uid) {
    return false;
  }
  const ownerId = getOwnerId(uid, teamId);

  const success = await deleteMockFromFirebase(mockId);
  if (success) {
    await removeUserMockSelector(ownerId, mockId);
    return true;
  }
  return false;
};

const deleteMockFromFirebase = async (mockId: string): Promise<boolean> => {
  const db = getFirestore(firebaseApp);
  const docRef = doc(db, "mocks", mockId);

  const success = await updateDoc(docRef, {
    deleted: true,
    collectionId: "",
    updatedTs: Timestamp.now().toMillis(),
  })
    .then(() => {
      return true;
    })
    .catch(() => {
      return false;
    });

  return success;
};
