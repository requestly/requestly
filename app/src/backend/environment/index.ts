import firebaseApp from "firebase";
import { deleteField, doc, getFirestore, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { EnvironmentVariable } from "./types";

const getDocPath = (ownerId: string, environment: string) => {
  const db = getFirestore(firebaseApp);
  return doc(db, "environmentVariables", ownerId, "environments", environment);
};

export const setEnvironmentInDB = async (ownerId: string, environment: string) => {
  return setDoc(
    getDocPath(ownerId, environment),
    {
      name: environment,
    },
    { merge: true }
  );
};

export const setEnvironmentVariablesInDB = async (
  ownerId: string,
  payload: {
    newVariables: EnvironmentVariable;
    environment: string;
  }
) => {
  const newVariables = Object.fromEntries(
    Object.entries(payload.newVariables).map(([key, value]) => [key, { syncValue: value.syncValue, type: value.type }])
  );

  return setDoc(
    getDocPath(ownerId, payload.environment),
    {
      name: payload.environment,
      variables: newVariables,
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
  return updateDoc(getDocPath(ownerId, payload.environment), {
    [`variables.${payload.key}`]: deleteField(),
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

  const variableDoc = getDocPath(ownerId, environment);

  const unsubscribe = onSnapshot(variableDoc, (doc) => {
    if (doc.exists()) {
      const variables: EnvironmentVariable = doc.data()?.variables ?? {};

      callback(variables);
    } else {
      callback({});
    }
  });

  return unsubscribe;
};
