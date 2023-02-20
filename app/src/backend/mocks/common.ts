import { RQMockSchema } from "components/features/mocksV2/types";
import firebaseApp from "../../firebase";
import {
  collection,
  doc,
  deleteField,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { createFile } from "services/firebaseStorageService";
import { createResponseBodyFilepath } from "./utils";

export const updateUserMockSelectorsMap = async (
  uid: string,
  mockId: string,
  mockData: RQMockSchema
) => {
  const db = getFirestore(firebaseApp);

  if (!mockId || !mockData || !uid) {
    // console.error("mockId or mockData or uid not present");
  }

  const selectorData = {
    endpoint: mockData.endpoint,
    method: mockData.method,
  };

  const rootUserMocksMetadataRef = collection(db, "user-mocks-metadata");
  const rootUserDocRef = doc(rootUserMocksMetadataRef, uid);

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

export const removeUserMockSelector = async (uid: string, mockId: string) => {
  const db = getFirestore(firebaseApp);
  if (!mockId || !uid) {
    // console.error("mockId or uid not present");
  }

  const rootUserMocksMetadataRef = collection(db, "user-mocks-metadata");
  const rootUserDocRef = doc(rootUserMocksMetadataRef, uid);

  await updateDoc(rootUserDocRef, {
    [`mockSelectors.${mockId}`]: deleteField(),
  });
};

export const uploadResponseBodyFiles = async (
  responses: any[] = [],
  uid: string,
  mockId: string
) => {
  return Promise.all(
    responses.map(async (response) => {
      return createFile(
        response.id,
        response.headers["content-type"],
        response.body,
        createResponseBodyFilepath(uid, mockId, response.id)
      );
    })
  );
};
