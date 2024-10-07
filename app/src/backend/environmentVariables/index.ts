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
    Object.entries(payload.newVariables).map(([key, { syncValue }]) => [key, { syncValue }])
  );

  return setDoc(
    getDocPath(ownerId),
    {
      [payload.environment]: {
        newVariables,
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
  callback: (newVariables: EnvironmentVariable | null) => void
) => {
  const db = getFirestore(firebaseApp);

  const variableDoc = doc(db, "environmentVariables", ownerId);

  const unsubscribe = onSnapshot(variableDoc, (doc) => {
    if (doc.exists()) {
      const variables: Record<string, string> = doc.data()[environment];

      if (variables) {
        const newVariables = Object.entries(variables).reduce((acc, [key, value]) => {
          acc[key] = {
            syncValue: value,
          };
          return acc;
        }, {} as EnvironmentVariable);

        callback(newVariables);
      }
    }
  });

  return unsubscribe;
};
