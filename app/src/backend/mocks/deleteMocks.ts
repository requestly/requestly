import firebaseApp from "../../firebase";
import { doc, getFirestore, Timestamp, writeBatch, collection, deleteField } from "firebase/firestore";
import { getOwnerId } from "backend/utils";

export const deleteMocks = async (uid: string, mockIds: string[], teamId?: string): Promise<boolean> => {
  if (!uid) {
    return false;
  }

  const ownerId = getOwnerId(uid, teamId);
  const result = await deleteMocksFromFirebase(uid, ownerId, mockIds);
  return result;
};

const deleteMocksFromFirebase = async (uid: string, ownerId: string, mockIds: string[]): Promise<boolean> => {
  try {
    const db = getFirestore(firebaseApp);
    const mocksbatch = writeBatch(db);
    const userMocksMetadataRef = collection(db, "user-mocks-metadata");
    const userDocRef = doc(userMocksMetadataRef, ownerId);

    mockIds.forEach((mockId) => {
      const mockRef = doc(db, "mocks", mockId);

      mocksbatch.set(
        mockRef,
        {
          deleted: true,
          collectionId: "",
          lastUpdatedBy: uid,
          updatedTs: Timestamp.now().toMillis(),
        },
        { merge: true }
      );

      mocksbatch.update(userDocRef, {
        [`mockSelectors.${mockId}`]: deleteField(),
      });
    });

    await mocksbatch.commit();

    return true;
  } catch (error) {
    return false;
  }
};
