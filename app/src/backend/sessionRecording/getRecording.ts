import { getFirestore, doc, getDoc } from "firebase/firestore";

import { COLLECTION_NAME } from "./constants";
import firebaseApp from "../../firebase";
import { getFile } from "services/firebaseStorageService";
import { SessionRecording } from "views/features/sessions/SessionViewer/types";
import { getOwnerId } from "backend/utils";

const isOwner = (recording: SessionRecording, uid: string) => {
  if (uid === recording.ownerId) return true;

  return false;
};

const fetchRecordingEvents = async (filePath: string) => {
  if (filePath) return await getFile(filePath);

  return null;
};

export const getRecording = async (
  sessionId: string,
  uid: string,
  workspaceId: string | null,
  email: string
): Promise<any> => {
  const db = getFirestore(firebaseApp);
  const sessionRecordingRef = doc(db, COLLECTION_NAME, sessionId);
  const snapshot = await getDoc(sessionRecordingRef);

  const ownerId = getOwnerId(uid, workspaceId);

  if (!snapshot.exists()) {
    const err = new Error("The session recording you were looking for does not exist.");
    err.name = "NotFound";
    throw err;
  }

  const data = snapshot.data() as SessionRecording;

  const response: any = {
    payload: {
      ...data,
      isRequestedByOwner: isOwner(data, ownerId),
    },
    events: null,
  };

  response.events = await fetchRecordingEvents(data?.eventsFilePath);
  return response;
};
