import firebaseApp from "../../firebase";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import { RQAPI } from "features/apiClient/types";
import Logger from "lib/logger";
import { enforceLatestRecordSchema } from "./parser";
import { APIS_NODE, EXAMPLES_REQUESTS_NODE } from "./constants";

const getApiRecordExamples = async (
  ownerId: string,
  parentRequestId: string
): Promise<{ success: boolean; data: RQAPI.ExampleApiRecord[] }> => {
  if (!parentRequestId) {
    return { success: false, data: [] };
  }

  const db = getFirestore(firebaseApp);
  const examplesRef = collection(db, APIS_NODE, parentRequestId, EXAMPLES_REQUESTS_NODE);

  try {
    const q = query(examplesRef, where("ownerId", "==", ownerId), where("deleted", "in", [false]));
    const result: RQAPI.ExampleApiRecord[] = [];
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: true, data: result };
    }

    snapshot.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      const processedData = enforceLatestRecordSchema(id, data) as RQAPI.ExampleApiRecord;
      result.push(processedData);
    });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, data: [] };
  }
};

export const getExamplesForApiRecords = async (
  ownerId: string,
  apiRecordIds: string[]
): Promise<{ success: boolean; data: RQAPI.ExampleApiRecord[] }> => {
  if (!apiRecordIds.length) {
    return { success: true, data: [] };
  }

  try {
    const examplePromises = apiRecordIds.map((recordId) => getApiRecordExamples(ownerId, recordId));
    const results = await Promise.all(examplePromises);

    const allExamples: RQAPI.ExampleApiRecord[] = [];
    results.forEach((result) => {
      if (result.success) {
        allExamples.push(...result.data);
      }
    });

    return { success: true, data: allExamples };
  } catch (error) {
    Logger.error("Error fetching examples for multiple API records:", error);
    return { success: false, data: [] };
  }
};
