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
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { EnvironmentData, EnvironmentMap, EnvironmentVariables } from "./types";
import { CollectionVariableMap, RQAPI } from "features/apiClient/types";
import {
  trackEnvironmentCreatedInDB,
  trackEnvironmentDeletedFromDB,
  trackEnvironmentsFetchedFromDB,
  trackEnvironmentUpdatedInDB,
} from "features/apiClient/screens/environment/analytics";
import { fetchLock } from "./fetch-lock";
import { patchMissingIdInVariables } from "backend/apiClient/utils";
import { isGlobalEnvironment } from "features/apiClient/screens/environment/utils";

const db = getFirestore(firebaseApp);

const getDocPath = (ownerId: string, environmentId: string) => {
  return doc(db, "environments", ownerId, "environments", environmentId);
};

export const createNonGlobalEnvironmentInDB = async (
  ownerId: string,
  environmentName: string
): Promise<EnvironmentData> => {
  const variables = {};
  return addDoc(collection(db, "environments", ownerId, "environments"), {
    name: environmentName,
    variables,
  }).then((doc) => {
    trackEnvironmentCreatedInDB(doc.id, "non_global");
    return {
      id: doc.id,
      name: environmentName,
      variables,
    };
  });
};

export const updateEnvironmentVariablesInDB = async (
  ownerId: string,
  environmentId: string,
  variables: EnvironmentVariables
) => {
  const newVariables = Object.fromEntries(
    Object.entries(variables).map(([key, value]) => [
      key,
      { syncValue: value.syncValue, type: value.type, id: value.id },
    ])
  );

  await updateDoc(getDocPath(ownerId, environmentId), {
    variables: newVariables,
  });

  trackEnvironmentUpdatedInDB(environmentId, isGlobalEnvironment(environmentId) ? "global" : "non_global");
};

export const removeEnvironmentVariableFromDB = async (
  ownerId: string,
  payload: {
    environmentId: string;
    key: string;
  }
) => {
  await updateDoc(getDocPath(ownerId, payload.environmentId), {
    [`variables.${payload.key}`]: deleteField(),
  });

  trackEnvironmentUpdatedInDB(
    payload.environmentId,
    isGlobalEnvironment(payload.environmentId) ? "global" : "non_global"
  );
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
    if (snapshot.exists()) {
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

const createGlobalEnvironmentInDB = async (ownerId: string) => {
  const docRef = doc(db, "environments", ownerId, "environments", "global");
  const globalEnvironment: EnvironmentData = { name: "Global variables", variables: {}, id: "global" };
  await setDoc(docRef, globalEnvironment);
  trackEnvironmentCreatedInDB("global", "global");
  return globalEnvironment;
};

export const fetchAllEnvironmentDetails = async (ownerId: string) => {
  const releaseLock = await fetchLock.acquire();
  try {
    if (!ownerId) {
      return {};
    }

    const environmentDoc = collection(db, "environments", ownerId, "environments");

    const snapshot = await getDocs(environmentDoc);

    const environmentDetails: EnvironmentMap = {};

    snapshot.forEach((doc) => {
      const environmentData = doc.data() as Omit<EnvironmentData, "id">;
      const doesIdExist = typeof Object.values(environmentData.variables)[0]?.id !== "undefined";

      if (!doesIdExist) {
        environmentData.variables = patchMissingIdInVariables(environmentData.variables);
      }

      environmentDetails[doc.id] = { id: doc.id, ...environmentData } as EnvironmentData;
    });

    if (!environmentDetails["global"]) {
      environmentDetails["global"] = await createGlobalEnvironmentInDB(ownerId);
    }

    return environmentDetails;
  } finally {
    releaseLock();
    trackEnvironmentsFetchedFromDB();
  }
};

export const updateEnvironmentNameInDB = async (ownerId: string, environmentId: string, newName: string) => {
  await updateDoc(getDocPath(ownerId, environmentId), {
    name: newName,
  });

  trackEnvironmentUpdatedInDB(environmentId, isGlobalEnvironment(environmentId) ? "global" : "non_global");
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

  const newEnvironment = await createNonGlobalEnvironmentInDB(ownerId, `${environmentToDuplicate.name} Copy`);
  return updateEnvironmentVariablesInDB(ownerId, newEnvironment.id, environmentToDuplicate.variables).then(() => {
    return { ...newEnvironment, variables: environmentToDuplicate.variables };
  });
};

export const deleteEnvironmentFromDB = async (ownerId: string, environmentId: string) => {
  await deleteDoc(getDocPath(ownerId, environmentId));
  trackEnvironmentDeletedFromDB(environmentId);
};
