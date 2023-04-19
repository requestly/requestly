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

const hasRecordingAccess = (
  recording: SessionRecording,
  uid: string, // usrId or ownerId
  email: string
): boolean => {
  if (recording.visibility === "public") return true;

  if (!uid) return false;

  if (recording.visibility === "only-me" && uid === recording.ownerId) return true;

  // TODO: We should ideally keep uids here instead of keeping emails.
  if (recording.accessEmails.includes(email)) return true;

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

  let events: any = null;

  if (hasRecordingAccess(data, ownerId, email)) {
    events = await fetchRecordingEvents(data?.eventsFilePath);
  } else {
    const err = new Error("You do not have permission to access this recording");
    err.name = "PermissionDenied";
    throw err;
  }

  response.events = events;
  return response;
};
