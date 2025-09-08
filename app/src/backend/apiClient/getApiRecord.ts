import firebaseApp from "../../firebase";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { RQAPI } from "features/apiClient/types";
import { enforceLatestRecordSchema } from "./parser";

export const getApiRecord = async (
  recordId: string
): Promise<{ success: boolean; data: RQAPI.ApiClientRecord; message?: string }> => {
  const result = await getApiRecordFromFirebase(recordId);
  return result;
};

const getApiRecordFromFirebase = async (
  recordId: string
): Promise<{ success: boolean; data: RQAPI.ApiClientRecord; message?: string }> => {
  const db = getFirestore(firebaseApp);
  const docRef = doc(db, "apis", recordId);

  const snapshot = await getDoc(docRef);

  if (snapshot.exists()) {
    const data = snapshot.data();
    const id = snapshot.id;
    const processedData = enforceLatestRecordSchema(id, data);

    return { success: true, data: processedData };
  }

  return { success: false, data: null, message: "Not found!" };
};
