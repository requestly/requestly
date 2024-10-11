import firebaseApp from "firebase";
import { collection, deleteField, doc, getFirestore, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { EnvironmentData, EnvironmentMap, EnvironmentVariables } from "./types";

const getDocPath = (ownerId: string, environment: string) => {
  const db = getFirestore(firebaseApp);
  return doc(db, "environmentConfigs", ownerId, "environments", environment);
};

export const setEnvironmentInDB = async (ownerId: string, environment: string) => {
  return setDoc(
    getDocPath(ownerId, environment),
    {
      name: environment,
      variables: {},
    },
    { merge: true }
  );
};

export const setEnvironmentVariablesInDB = async (
  ownerId: string,
  payload: {
    newVariables: EnvironmentVariables;
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
  callback: (newVariables: EnvironmentMap) => void
) => {
  if (!ownerId) {
    return () => {};
  }

  const db = getFirestore(firebaseApp);
  const variableDoc = collection(db, "environmentConfigs", ownerId, "environments");

  const unsubscribe = onSnapshot(variableDoc, (snapshot) => {
    if (!snapshot) {
      callback({});
    } else {
      const environmentDetails: EnvironmentMap = {};

      snapshot.forEach((doc) => {
        environmentDetails[doc.id] = doc.data() as EnvironmentData;
      });

      callback(environmentDetails);
    }
  });

  return unsubscribe;
};
