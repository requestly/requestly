import firebaseApp from "../../firebase";
import { doc, updateDoc, getFirestore, Timestamp } from "firebase/firestore";

export const deleteCollection = async (uid: string, collectionId: string): Promise<boolean> => {
  if (!uid) {
    return false;
  }

  const result = await deleteCollectionFromFirebase(uid, collectionId);
  return result;
};

const deleteCollectionFromFirebase = async (uid: string, collectionId: string): Promise<boolean> => {
  const db = getFirestore(firebaseApp);
  const docRef = doc(db, "mocks", collectionId);

  const success = await updateDoc(docRef, {
    deleted: true,
    lastUpdatedBy: uid,
    updatedTs: Timestamp.now().toMillis(),
  })
    .then(() => true)
    .catch(() => false);

  return success;
};
