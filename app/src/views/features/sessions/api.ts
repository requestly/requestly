import firebaseApp from "../../../firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  updateDoc,
} from "firebase/firestore";
import { deleteObject, getStorage, ref } from "firebase/storage";
import { toast } from "utils/Toast";
import {
  trackSessionRecordingDeleted,
  trackSessionRecordingDescriptionUpdated,
  trackSessionRecordingStartTimeOffsetUpdated,
  trackSessionRecordingVisibilityUpdated,
} from "modules/analytics/events/features/sessionRecording";
import { SessionRecording, Visibility } from "./SessionViewer/types";

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
    console.log("error", error);
    toast.error("Something went wrong!");
    throw error;
  }
};

export const updateVisibility = async (
  id: string,
  visibility: Visibility,
  accessEmails: string[] = []
) => {
  try {
    await updateSessionRecordingProperties(id, { visibility, accessEmails });
    toast.success("Permissions updated");
    trackSessionRecordingVisibilityUpdated(visibility);
  } catch (error) {
    toast.error("Something went wrong!");
    throw error;
  }
};

export const updateStartTimeOffset = async (
  id: string,
  startTimeOffset: number
) => {
  try {
    await updateSessionRecordingProperties(id, { startTimeOffset });
    toast.success("Updated default start time for the recording");
    trackSessionRecordingStartTimeOffsetUpdated();
  } catch (error) {
    toast.error("Something went wrong!");
    throw error;
  }
};

export const updateDescription = async (id: string, description: string) => {
  try {
    await updateSessionRecordingProperties(id, { description });
    toast.success("Updated description for the recording");
    trackSessionRecordingDescriptionUpdated();
  } catch (error) {
    toast.error("Something went wrong!");
    throw error;
  }
};

export const updateSessionRecordingProperties = async (
  id: string,
  properties: Partial<SessionRecording>
) => {
  const db = getFirestore(firebaseApp);
  await updateDoc(doc(collection(db, COLLECTION_NAME), id), properties);
};
