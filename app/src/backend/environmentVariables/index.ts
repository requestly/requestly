import firebaseApp from "firebase";
import { deleteField, doc, getFirestore, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { EnvironmentVariable } from "./types";

const getDocPath = (ownerId: string) => {
  const db = getFirestore(firebaseApp);
  return doc(db, "environmentVariables", ownerId);
};

export const setEnvironmentVariablesInDB = async (
  ownerId: string,
  payload: {
    newVariables: EnvironmentVariable;
    environment: string;
  }
) => {
  const newVariables = Object.fromEntries(
    Object.entries(payload.newVariables).map(([key, value]) => [key, { syncValue: value.syncValue }])
  );

  return setDoc(
    getDocPath(ownerId),
    {
      [payload.environment]: {
        ...newVariables,
      },
    },
    { merge: true }
  );
};

export const removeEnvironmentVariableFromDB = async (
  ownerId: string,
  payload: {
    environment: string;
    key: string;
  }
) => {
  return updateDoc(getDocPath(ownerId), {
    [`${payload.environment}.${payload.key}`]: deleteField(),
  });
};

export const attatchEnvironmentVariableListener = (
  ownerId: string,
  environment: string,
  callback: (newVariables: EnvironmentVariable) => void
) => {
  if (!ownerId || !environment) {
    return () => {};
  }

  const db = getFirestore(firebaseApp);

  const variableDoc = doc(db, "environmentVariables", ownerId);

  const unsubscribe = onSnapshot(variableDoc, (doc) => {
    if (doc.exists()) {
      const variables: EnvironmentVariable = doc.data()[environment] ?? {};

      callback(variables);
    } else {
      callback({});
    }
  });

  return unsubscribe;
};
