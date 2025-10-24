import firebaseApp from "../../../../../../firebase";
import { COLLECTION_NAME } from "backend/sessionRecording/constants";
import { SessionRecordingMetadata } from "features/sessionBook/types";
import { collection, doc, getFirestore, updateDoc } from "firebase/firestore";
import {
  trackSessionRecordingDescriptionUpdated,
  trackSessionRecordingNameUpdated,
} from "features/sessionBook/analytics";
import { toast } from "utils/Toast";

export const updateSessionDescription = async (userId: string, id: string, description: string) => {
  try {
    await updateSessionRecordingProperties(userId, id, { description });
    toast.success("Updated description for the recording");
    trackSessionRecordingDescriptionUpdated();
  } catch (error) {
    toast.error("Something went wrong!");
    throw error;
  }
};
export const updateSessionName = async (userId: string, id: string, name: string) => {
  try {
    await updateSessionRecordingProperties(userId, id, { name });
    toast.success("Session name updated successfully");
    trackSessionRecordingNameUpdated();
  } catch (error) {
    toast.error("Something went wrong!");
    throw error;
  }
};

export const updateSessionRecordingProperties = async (
  userId: string, // updater id
  id: string,
  partialUpdateObject: Partial<SessionRecordingMetadata>
) => {
  const db = getFirestore(firebaseApp);
  partialUpdateObject.updatedTs = Date.now();
  partialUpdateObject.lastUpdatedBy = userId;
  await updateDoc(doc(collection(db, COLLECTION_NAME), id), partialUpdateObject);
};
