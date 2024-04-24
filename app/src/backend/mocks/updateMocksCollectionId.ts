import firebaseApp from "../../firebase";
import { Timestamp, doc, getFirestore, writeBatch } from "firebase/firestore";

export const updateMocksCollectionId = async (
  uid: string,
  mockIds: string[],
  updatedCollectionId: string
): Promise<boolean> => {
  if (!uid) {
    return null;
  }

  const result = await updateMocksCollectionIdFromFirebase(uid, mockIds, updatedCollectionId);
  return result;
};

const updateMocksCollectionIdFromFirebase = async (
  uid: string,
  mockIds: string[],
  updatedCollectionId: string
): Promise<boolean> => {
  try {
    const db = getFirestore(firebaseApp);
    const mocksbatch = writeBatch(db);

    mockIds.forEach((id) => {
      const mockRef = doc(db, "mocks", id);
      mocksbatch.set(
        mockRef,
        { collectionId: updatedCollectionId, lastUpdatedBy: uid, updatedTs: Timestamp.now().toMillis() },
        { merge: true }
      );
    });

    await mocksbatch.commit();

    return true;
  } catch (error) {
    return false;
  }
};
