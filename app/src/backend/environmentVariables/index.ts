import firebaseApp from "firebase";
import { deleteField, doc, getFirestore, setDoc, updateDoc } from "firebase/firestore";

const getDocPath = (ownerId: string) => {
  const db = getFirestore(firebaseApp);
  return doc(db, "environmentVariables", ownerId);
};

export const setEnvironmentVariable = async (
  ownerId: string,
  payload: {
    newVariable: {
      key: string;
      value: string | number | boolean;
    };
    environment: string;
  }
) => {
  await setDoc(
    getDocPath(ownerId),
    {
      [payload.environment]: {
        [payload.newVariable.key]: payload.newVariable.value,
      },
    },
    { merge: true }
  );
};

export const removeEnvironmentVariable = async (
  ownerId: string,
  payload: {
    environment: string;
    key: string;
  }
) => {
  await updateDoc(getDocPath(ownerId), {
    [`${payload.environment}.${payload.key}`]: deleteField(),
  });
};
