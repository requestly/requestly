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

export const getOwnerId = (uid: string, teamId?: string) => {
  if (teamId) {
    return `team-${teamId}`;
  }
  return uid;
};

export const updateUserMockSelectorsMap = async (
  uid: string,
  mockId: string,
  mockData: RQMockSchema,
  teamId?: string
) => {
  const db = getFirestore(firebaseApp);

  const selectorData = {
    endpoint: mockData.endpoint,
    method: mockData.method,
  };

  const ownerId = getOwnerId(uid, teamId);
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

export const removeUserMockSelector = async (
  ownerId: string,
  mockId: string
) => {
  const db = getFirestore(firebaseApp);

  const rootUserMocksMetadataRef = collection(db, "user-mocks-metadata");
  const rootUserDocRef = doc(rootUserMocksMetadataRef, ownerId);

  await updateDoc(rootUserDocRef, {
    [`mockSelectors.${mockId}`]: deleteField(),
  });
};

export const uploadResponseBodyFiles = async (
  responses: any[] = [],
  uid: string,
  mockId: string,
  teamId?: string
) => {
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
