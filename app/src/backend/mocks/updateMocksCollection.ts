import { getOwnerId } from "backend/utils";
import firebaseApp from "../../firebase";
import { Timestamp, doc, getFirestore, writeBatch } from "firebase/firestore";

export const updateMocksCollection = async (
  uid: string,
  mockIds: string[],
  updatedCollectionId: string,
  updatedCollectionPath: string = "",
  teamId?: string
): Promise<boolean | null> => {
  if (!uid) {
    return null;
  }

  const ownerId = getOwnerId(uid, teamId);
  const result = await updateMocksCollectionInFirebase(
    uid,
    ownerId,
    mockIds,
    updatedCollectionId,
    updatedCollectionPath
  );
  return result;
};

const updateMocksCollectionInFirebase = async (
  uid: string,
  ownerId: string,
  mockIds: string[],
  updatedCollectionId: string,
  updatedCollectionPath: string
): Promise<boolean> => {
  try {
    const db = getFirestore(firebaseApp);
    const mocksbatch = writeBatch(db);
    const userMocksMetadataDocRef = doc(db, "user-mocks-metadata", ownerId);

    const selectorData = {
      collectionId: updatedCollectionId,
      collectionPath: updatedCollectionPath,
    };

    mockIds.forEach((mockId) => {
      const mockRef = doc(db, "mocks", mockId);
      mocksbatch.set(
        mockRef,
        { collectionId: updatedCollectionId, lastUpdatedBy: uid, updatedTs: Timestamp.now().toMillis() },
        { merge: true }
      );

      mocksbatch.set(
        userMocksMetadataDocRef,
        {
          mockSelectors: {
            [mockId]: selectorData,
          },
        },
        { merge: true }
      );
    });

    await mocksbatch.commit();

    return true;
  } catch (error) {
    return false;
  }
};
