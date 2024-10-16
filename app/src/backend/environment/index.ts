import firebaseApp from "firebase";
import { addDoc, collection, deleteField, doc, getFirestore, onSnapshot, updateDoc } from "firebase/firestore";
import { EnvironmentData, EnvironmentMap, EnvironmentVariables } from "./types";

const db = getFirestore(firebaseApp);

const getDocPath = (ownerId: string, environmentId: string) => {
  return doc(db, "environmentConfigs", ownerId, "environments", environmentId);
};

export const setEnvironmentInDB = async (ownerId: string, environmentName: string) => {
  return addDoc(collection(db, "environmentConfigs", ownerId, "environments"), {
    name: environmentName,
    variables: {},
  }).then((doc) => {
    return {
      id: doc.id,
      name: environmentName,
    };
  });
};

export const setEnvironmentVariablesInDB = async (
  ownerId: string,
  payload: {
    newVariables: EnvironmentVariables;
    environmentId: string;
  }
) => {
  const newVariables = Object.fromEntries(
    Object.entries(payload.newVariables).map(([key, value]) => [key, { syncValue: value.syncValue, type: value.type }])
  );

  return updateDoc(getDocPath(ownerId, payload.environmentId), {
    variables: newVariables,
  });
};

export const removeEnvironmentVariableFromDB = async (
  ownerId: string,
  payload: {
    environmentId: string;
    key: string;
  }
) => {
  return updateDoc(getDocPath(ownerId, payload.environmentId), {
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

  const variableDoc = collection(db, "environmentConfigs", ownerId, "environments");

  const unsubscribe = onSnapshot(variableDoc, (snapshot) => {
    if (!snapshot) {
      callback({});
    } else {
      const environmentDetails: EnvironmentMap = {};

      snapshot.forEach((doc) => {
        environmentDetails[doc.id] = { id: doc.id, ...doc.data() } as EnvironmentData;
      });

      callback(environmentDetails);
    }
  });

  return unsubscribe;
};
