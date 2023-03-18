import { v4 as uuidv4 } from "uuid";

import firebaseApp from "../../firebase";
import { getFirestore, addDoc, collection } from "firebase/firestore";
import { COLLECTION_NAME } from "./constants";
import { createFile } from "services/firebaseStorageService";
import {
  RecordingOptions,
  SessionRecording,
} from "views/features/sessions/SessionViewer/types";

export const saveRecording = async (
  uid: string,
  payload: SessionRecording,
  events: any,
  options: RecordingOptions
): Promise<any> => {
  const db = getFirestore(firebaseApp);

  const fileName = uuidv4();
  const eventsFilePath = `users/${uid}/session-events/${fileName}`;

  // Saving is as type=application/octet-stream, because it was previously saved like this
  await createFile(
    fileName,
    "application/octet-stream",
    events,
    eventsFilePath
  );

  const data: any = {
    ...payload,
    eventsFilePath,
    author: uid,
    ownerId: uid,
    visibility: "public",
    accessEmails: [],
    accessDomains: [],
    options,
  };

  const docId = await addDoc(collection(db, COLLECTION_NAME), data)
    .then((docRef) => {
      return docRef.id;
    })
    .catch((err) => {
      return null;
    });

  if (docId) {
    return { success: true, firestoreId: docId };
  }

  return {
    success: false,
    firestoreId: null,
    message: "Please login to perform the action",
  };
};
