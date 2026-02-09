import firebaseApp from "firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { EnvironmentData, EnvironmentMap } from "./types";
import { CollectionVariableMap, RQAPI } from "features/apiClient/types";
import {
  trackEnvironmentCreatedInDB,
  trackEnvironmentDeletedFromDB,
  trackEnvironmentUpdatedInDB,
} from "features/apiClient/screens/environment/analytics";
import { captureException, patchMissingIdInVariables } from "backend/apiClient/utils";
import { isGlobalEnvironment } from "features/apiClient/screens/environment/utils";
import { NativeError } from "errors/NativeError";

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

export const getEnvironment = async (id: string, ownerId: string): Promise<EnvironmentData | null> => {
  const envRef = doc(db, "environments", ownerId, "environments", id);
  const envSnapshot = await getDoc(envRef);

  if (!envSnapshot.exists()) {
    return null;
  }

  return envSnapshot.data() as EnvironmentData;
};

export const updateEnvironmentInDB = async (
  ownerId: string,
  environmentId: string,
  updates: Partial<Pick<EnvironmentData, "name" | "variables" | "variablesOrder">>
) => {
  if (updates.variables) {
    // Transform variables to the required format if present
    updates.variables = Object.fromEntries(
      Object.entries(updates.variables).map(([key, value]) => [
        key,
        { syncValue: value.syncValue, type: value.type, id: value.id, isPersisted: true },
      ])
    );
  }

  await updateDoc(getDocPath(ownerId, environmentId), updates);
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
  if (!ownerId || !environmentId) {
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
  } catch (e) {
    captureException(e);
  }
};

export const duplicateEnvironmentInDB = async (
  ownerId: string,
  environmentId: string,
  allEnvironmentData: EnvironmentMap
) => {
  const environmentToDuplicate = allEnvironmentData[environmentId];
  if (!environmentToDuplicate) {
    throw new NativeError("Environment to duplicate not found").addContext({
      ownerId,
      environmentId,
    });
  }

  const newEnvironment = await createNonGlobalEnvironmentInDB(ownerId, `${environmentToDuplicate.name} Copy`);

  const updates = {
    variables: environmentToDuplicate.variables,
    ...(environmentToDuplicate.variablesOrder !== undefined && {
      variablesOrder: environmentToDuplicate.variablesOrder,
    }),
  };

  return updateEnvironmentInDB(ownerId, newEnvironment.id, updates).then(() => {
    return {
      ...newEnvironment,
      ...updates,
    };
  });
};

export const deleteEnvironmentFromDB = async (ownerId: string, environmentId: string) => {
  await deleteDoc(getDocPath(ownerId, environmentId));
  trackEnvironmentDeletedFromDB(environmentId);
};
