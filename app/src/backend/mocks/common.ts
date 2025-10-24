import { RQMockCollection, RQMockSchema } from "components/features/mocksV2/types";
import firebaseApp from "../../firebase";
import { collection, doc, deleteField, getFirestore, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { createFile } from "services/firebaseStorageService";
import { createResponseBodyFilepath } from "./utils";

export const updateUserMockSelectorsMap = async (
  ownerId: string,
  mockId: string,
  mockData: RQMockSchema,
  collectionId?: string
) => {
  const db = getFirestore(firebaseApp);

  const selectorData: Record<string, string> = {
    endpoint: mockData.endpoint,
    method: mockData.method,
  };

  if (collectionId) {
    const collectionRef = doc(db, "mocks", collectionId);
    const collectionDoc = await getDoc(collectionRef);

    if (collectionDoc.exists()) {
      const collectionData = collectionDoc.data() as RQMockCollection;

      selectorData.collectionId = collectionId;
      selectorData.collectionPath = collectionData.path || "";
    }
  }

  const rootUserMocksMetadataRef = collection(db, "user-mocks-metadata");
  const rootUserDocRef = doc(rootUserMocksMetadataRef, ownerId);

  await setDoc(
    rootUserDocRef,
    {
      mockSelectors: {
        [mockId]: selectorData,
      },
    },
    { merge: true }
  );
};

export const removeUserMockSelector = async (ownerId: string, mockId: string) => {
  const db = getFirestore(firebaseApp);

  const rootUserMocksMetadataRef = collection(db, "user-mocks-metadata");
  const rootUserDocRef = doc(rootUserMocksMetadataRef, ownerId);

  await updateDoc(rootUserDocRef, {
    [`mockSelectors.${mockId}`]: deleteField(),
  });
};

export const uploadResponseBodyFiles = async (responses: any[] = [], uid: string, mockId: string, teamId?: string) => {
  return Promise.all(
    responses.map(async (response) => {
      return createFile(
        response.id,
        response.headers["content-type"],
        response.body,
        createResponseBodyFilepath(uid, mockId, response.id, teamId)
      );
    })
  );
};
