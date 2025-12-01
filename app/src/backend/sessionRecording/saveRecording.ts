import { v4 as uuidv4 } from "uuid";

import firebaseApp from "../../firebase";
import { getFirestore, addDoc, collection } from "firebase/firestore";
import { COLLECTION_NAME } from "./constants";
import { createFile } from "services/firebaseStorageService";
import { RecordingOptions, SessionRecordingMetadata, Visibility } from "views/features/sessions/SessionViewer/types";
import { getOwnerId } from "backend/utils";
import { getAppFlavour } from "utils/AppUtils";
import { RuleType } from "@requestly/shared/types/entities/rules";

export const saveRecording = async (
  uid: string | null,
  workspaceId: string | null,
  payload: SessionRecordingMetadata,
  events: any,
  options: RecordingOptions,
  source: string,
  testThisRuleMetadata: {
    appliedStatus: boolean;
    ruleType: RuleType;
  }
): Promise<any> => {
  if (!uid) {
    return {
      success: false,
      firestoreId: null,
      message: "Please login to perform the action",
    };
  }

  const db = getFirestore(firebaseApp);
  const ownerId = getOwnerId(uid, workspaceId);
  const fileName = uuidv4();
  const eventsFilePath = workspaceId
    ? `teams/${workspaceId}/session-events/${fileName}`
    : `users/${uid}/session-events/${fileName}`;

  // Saving is as type=application/octet-stream, because it was previously saved like this
  await createFile(fileName, "application/octet-stream", events, eventsFilePath);

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
    source,
    testThisRuleMetadata,
    appFlavour: getAppFlavour(),
  };

  const docId = await addDoc(collection(db, COLLECTION_NAME), data)
    .then((docRef) => {
      return docRef.id;
    })
    .catch((err): null => {
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
