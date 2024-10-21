import firebaseApp from "../../firebase";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { RQAPI } from "features/apiClient/types";

export const getApiRecord = async (
  recordId: string
): Promise<{ success: boolean; data: RQAPI.Record; message?: string }> => {
  const result = await getApiRecordFromFirebase(recordId);
  return result;
};

const getApiRecordFromFirebase = async (
  recordId: string
): Promise<{ success: boolean; data: RQAPI.Record; message?: string }> => {
  const db = getFirestore(firebaseApp);
  const docRef = doc(db, "apis", recordId);

  const snapshot = await getDoc(docRef);

  if (snapshot.exists()) {
    const data = snapshot.data() as RQAPI.Record;

    return { success: true, data };
  }

  return { success: false, data: null, message: "Not found!" };
};
