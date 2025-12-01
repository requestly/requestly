import firebaseApp from "../../firebase";
import { doc, getFirestore, Timestamp, writeBatch } from "firebase/firestore";
import { RQMockCollection } from "components/features/mocksV2/types";

export const updateCollections = async (
  uid: string,
  collections: Partial<RQMockCollection>[]
): Promise<boolean | null> => {
  if (!uid) {
    return null;
  }

  const result = await updateCollectionsInFirebase(uid, collections);

  return result;
};

const updateCollectionsInFirebase = async (uid: string, collections: Partial<RQMockCollection>[]): Promise<boolean> => {
  try {
    const db = getFirestore(firebaseApp);
    const collectionsBatch = writeBatch(db);

    collections.forEach((collection) => {
      if (collection.id) {
        const collectionRef = doc(db, "mocks", collection.id);

        collectionsBatch.set(
          collectionRef,
          { ...collection, lastUpdatedBy: uid, updatedTs: Timestamp.now().toMillis() },
          { merge: true }
        );
      }
    });

    await collectionsBatch.commit();

    return true;
  } catch (error) {
    return false;
  }
};
