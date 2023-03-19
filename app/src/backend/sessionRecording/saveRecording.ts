import { v4 as uuidv4 } from "uuid";

import firebaseApp from "../../firebase";
import { getFirestore, addDoc, collection } from "firebase/firestore";
import { COLLECTION_NAME } from "./constants";
import { createFile } from "services/firebaseStorageService";
import {
  RecordingOptions,
  SessionRecording,
  Visibility,
} from "views/features/sessions/SessionViewer/types";
import { getOwnerId } from "backend/mocks/common";

export const saveRecording = async (
  uid: string,
  workspaceId: string | null,
  payload: SessionRecording,
  events: any,
  options: RecordingOptions
): Promise<any> => {
  const db = getFirestore(firebaseApp);
  const ownerId = getOwnerId(uid, workspaceId);
  const fileName = uuidv4();
  const eventsFilePath = workspaceId
    ? `teams/${workspaceId}/session-events/${fileName}`
    : `users/${uid}/session-events/${fileName}`;

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
    createdBy: uid,
    ownerId,
    visibility: Visibility.PUBLIC,
    accessEmails: [],
    accessDomains: [],
    options,
    lastUpdatedBy: uid,
    updatedTs: Date.now(),
    createdTs: Date.now(),
  };

  const docId = await addDoc(collection(db, COLLECTION_NAME), data)
    .then((docRef) => {
      return docRef.id;
    })
    .catch((err) => {
      console.log("could not properly save recording", err);
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
