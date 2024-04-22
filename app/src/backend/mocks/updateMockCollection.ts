import firebaseApp from "../../firebase";
import { doc, getFirestore, Timestamp, updateDoc } from "firebase/firestore";
import { RQMockCollection } from "components/features/mocksV2/types";

export const updateMockCollection = async (
  uid: string,
  collectionId: string,
  collectionData: Partial<RQMockCollection>
): Promise<boolean> => {
  if (!uid) {
    return null;
  }

  const result = await updateMockCollectionFromFirebase(uid, collectionId, collectionData);

  return result;
};

const updateMockCollectionFromFirebase = async (
  uid: string,
  collectionId: string,
  collectionData: Partial<RQMockCollection>
): Promise<boolean> => {
  const db = getFirestore(firebaseApp);
  const docRef = doc(db, "mocks", collectionId);

  const success = await updateDoc(docRef, {
    ...collectionData,
    lastUpdatedBy: uid,
    updatedTs: Timestamp.now().toMillis(),
  })
    .then(() => true)
    .catch(() => false);

  return success;
};
