import firebaseApp from "../../firebase";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import { RQAPI } from "features/apiClient/types";
import Logger from "lib/logger";
import { patchMissingIdInVariables } from "./utils";
import { enforceLatestRecordSchema } from "./parser";

function patchCollectionVariablesMissingId(params: { success: boolean; data: RQAPI.ApiClientRecord[] }) {
  if (!params.success) {
    return params;
  }

  params.data
    .filter((p) => p.type === RQAPI.RecordType.COLLECTION)
    .forEach((collection) => {
      let variables = collection.data.variables;
      if (variables) {
        const doesIdExist = typeof Object.values(variables)[0]?.id !== "undefined";

        if (!doesIdExist) {
          variables = patchMissingIdInVariables(variables);
        }
      }
    });
  return params;
}

export const getApiRecords = async (ownerId: string): Promise<{ success: boolean; data: RQAPI.ApiClientRecord[] }> => {
  if (!ownerId) {
    return { success: false, data: [] };
  }

  const result = await getApiRecordsFromFirebase(ownerId);
  return patchCollectionVariablesMissingId(result);
};

const getApiRecordsFromFirebase = async (
  ownerId: string
): Promise<{ success: boolean; data: RQAPI.ApiClientRecord[] }> => {
  const db = getFirestore(firebaseApp);
  const rootApiRecordsRef = collection(db, "apis");

  try {
    const q = query(rootApiRecordsRef, where("ownerId", "==", ownerId), where("deleted", "in", [false]));

    const result: RQAPI.ApiClientRecord[] = [];
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: true, data: result };
    }

    snapshot.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      const processedData = enforceLatestRecordSchema(id, data);
      result.push(processedData);
    });

    return { success: true, data: result };
  } catch (error) {
    Logger.error("Error fetching api records!", error);
    throw new Error(error.message);
  }
};
