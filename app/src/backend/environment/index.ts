import firebaseApp from "firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { EnvironmentData, EnvironmentMap, EnvironmentVariables } from "./types";
import { CollectionVariableMap, RQAPI } from "features/apiClient/types";

const db = getFirestore(firebaseApp);

const getDocPath = (ownerId: string, environmentId: string) => {
  return doc(db, "environments", ownerId, "environments", environmentId);
};

export const upsertEnvironmentInDB = async (ownerId: string, environmentName: string) => {
  return addDoc(collection(db, "environments", ownerId, "environments"), {
    name: environmentName,
    variables: {},
  }).then((doc) => {
    return {
      id: doc.id,
      name: environmentName,
    };
  });
};

export const updateEnvironmentVariablesInDB = async (
  ownerId: string,
  environmentId: string,
  variables: EnvironmentVariables
) => {
  const newVariables = Object.fromEntries(
    Object.entries(variables).map(([key, value]) => [key, { syncValue: value.syncValue, type: value.type }])
  );

  return updateDoc(getDocPath(ownerId, environmentId), {
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

export const attachEnvironmentVariableListener = (
  ownerId: string,
  environmentId: string,
  callback: (newVariables: EnvironmentData) => void
) => {
  if (!ownerId) {
    return () => {};
  }

  const variableDoc = doc(db, "environments", ownerId, "environments", environmentId);

  const unsubscribe = onSnapshot(variableDoc, (snapshot) => {
    if (!snapshot) {
      callback({
        id: environmentId,
        name: "",
        variables: {},
      });
    } else {
      const environmentData = { id: environmentId, ...snapshot.data() } as EnvironmentData;

      callback(environmentData);
    }
  });

  return unsubscribe;
};

export const attachCollectionVariableListener = (
  ownerId: string,
  callback: (newVariables: CollectionVariableMap) => void
) => {
  if (!ownerId) {
    return () => {};
  }

  const apisRef = collection(db, "apis");
  const q = query(apisRef, where("ownerId", "==", ownerId), where("type", "==", RQAPI.RecordType.COLLECTION));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const collectionVariableDetails: CollectionVariableMap = {};
    snapshot.forEach((doc) => {
      const collectionData = { id: doc.id, ...doc.data() } as RQAPI.CollectionRecord;
      collectionVariableDetails[doc.id] = { variables: collectionData.data.variables };
    });
    callback(collectionVariableDetails);
  });

  return unsubscribe;
};

export const fetchAllEnvironmentDetails = async (ownerId: string) => {
  if (!ownerId) {
    return {};
  }

  const environmentDoc = collection(db, "environments", ownerId, "environments");

  const snapshot = await getDocs(environmentDoc);

  if (snapshot.empty) {
    return {};
  }

  const environmentDetails: EnvironmentMap = {};

  snapshot.forEach((doc) => {
    environmentDetails[doc.id] = { id: doc.id, ...doc.data() } as EnvironmentData;
  });

  return environmentDetails;
};

export const updateEnvironmentNameInDB = async (ownerId: string, environmentId: string, newName: string) => {
  return updateDoc(getDocPath(ownerId, environmentId), {
    name: newName,
  });
};

export const duplicateEnvironmentInDB = async (
  ownerId: string,
  environmentId: string,
  allEnvironmentData: EnvironmentMap
) => {
  const environmentToDuplicate = allEnvironmentData[environmentId];
  if (!environmentToDuplicate) {
    return;
  }

  const newEnvironment = await upsertEnvironmentInDB(ownerId, `${environmentToDuplicate.name} Copy`);
  return updateEnvironmentVariablesInDB(ownerId, newEnvironment.id, environmentToDuplicate.variables).then(() => {
    return { ...newEnvironment, variables: environmentToDuplicate.variables };
  });
};

export const deleteEnvironmentFromDB = async (ownerId: string, environmentId: string) => {
  return deleteDoc(getDocPath(ownerId, environmentId));
};
