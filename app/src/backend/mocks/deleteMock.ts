import firebaseApp from "../../firebase";
import { doc, updateDoc, getFirestore, Timestamp } from "firebase/firestore";
import { removeUserMockSelector } from "./common";

export const deleteMock = async (
  ownerId: string,
  mockId: string
): Promise<boolean> => {
  if (!ownerId) {
    return false;
  }

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
