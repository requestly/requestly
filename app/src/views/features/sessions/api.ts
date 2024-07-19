import firebaseApp from "../../../firebase";
import { collection, deleteDoc, doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { deleteObject, getStorage, ref } from "firebase/storage";
import { toast } from "utils/Toast";
import {
  trackSessionRecordingDescriptionUpdated,
  trackSessionRecordingNameUpdated,
  trackSessionRecordingStartTimeOffsetUpdated,
} from "modules/analytics/events/features/sessionRecording";
import { trackSessionRecordingDeleted, trackSessionRecordingVisibilityUpdated } from "features/sessionBook/analytics";
import { SessionRecordingMetadata, Visibility } from "./SessionViewer/types";
import Logger from "lib/logger";

const COLLECTION_NAME = "session-recordings";

export const fetchCurrentEmails = async (id: string) => {
  const db = getFirestore(firebaseApp);
  const docSnap = await getDoc(doc(collection(db, COLLECTION_NAME), id));
  if (docSnap.exists()) {
    return docSnap.data().accessEmails;
  } else {
    // doc.data() will be undefined in this case
    toast.error("Something went wrong!");
    return [];
  }
};

export const deleteRecording = async (id: string, eventsFilePath: string) => {
  const db = getFirestore(firebaseApp);
  const storage = getStorage(firebaseApp);
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    let resourcePath = eventsFilePath;
    if (resourcePath.startsWith("/")) resourcePath = resourcePath.slice(1);
    await deleteObject(ref(storage, resourcePath));
    toast.success("Deleted the recording");
    trackSessionRecordingDeleted();
  } catch (error) {
    Logger.log("error", error);
    toast.error("Something went wrong!");
    throw error;
  }
};

export const updateVisibility = async (
  userId: string,
  id: string,
  visibility: Visibility,
  accessEmails: string[] = []
) => {
  try {
    await updateSessionRecordingProperties(userId, id, {
      visibility,
      accessEmails,
    });
    toast.success("Permissions updated");
    trackSessionRecordingVisibilityUpdated(visibility);
  } catch (error) {
    toast.error("Something went wrong!");
    throw error;
  }
};

export const updateStartTimeOffset = async (userId: string, id: string, startTimeOffset: number) => {
  try {
    await updateSessionRecordingProperties(userId, id, { startTimeOffset });
    toast.success("Updated default start time for the recording");
    trackSessionRecordingStartTimeOffsetUpdated();
  } catch (error) {
    toast.error("Something went wrong!");
    throw error;
  }
};

export const updateDescription = async (userId: string, id: string, description: string) => {
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
