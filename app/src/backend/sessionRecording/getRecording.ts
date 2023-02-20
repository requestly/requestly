import { getFirestore, doc, getDoc } from "firebase/firestore";

import { COLLECTION_NAME } from "./constants";
import firebaseApp from "../../firebase";
import { getFile } from "services/firebaseStorageService";
import { SessionRecording } from "views/features/sessions/SessionViewer/types";

const isAuthor = (recording: SessionRecording, uid: string) => {
  if (uid === recording.author) return true;

  return false;
};

const hasRecordingAccess = (
  recording: SessionRecording,
  uid: string,
  email: string
): boolean => {
  if (!uid) return false;

  if (uid === recording.author) return true;

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
  email: string
): Promise<any> => {
  const db = getFirestore(firebaseApp);

  const sessionRecordingRef = doc(db, COLLECTION_NAME, sessionId);

  const snapshot = await getDoc(sessionRecordingRef);

  if (!snapshot.exists()) {
    const err = new Error(
      "The session recording you were looking for does not exist."
    );
    err.name = "NotFound";
    throw err;
  }

  const data = snapshot.data() as SessionRecording;

  const visibility = data.visibility;

  const response: any = {
    payload: {
      ...data,
      isRequestedByAuthor: isAuthor(data, uid),
    },
    events: null,
  };

  let events: any = null;

  switch (visibility) {
    case "only-me":
    case "custom":
      if (hasRecordingAccess(data, uid, email)) {
        events = await fetchRecordingEvents(data?.eventsFilePath);
      } else {
        const err = new Error(
          "You do not have permission to access this recording"
        );
        err.name = "PermissionDenied";
        throw err;
      }
      break;

    case "public":
    default:
      events = await fetchRecordingEvents(data?.eventsFilePath);
  }

  response.events = events;
  return response;
};
