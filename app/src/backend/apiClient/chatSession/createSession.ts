import firebaseApp from "../../../firebase";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { ResponsePromise } from "backend/types";
import { captureException } from "backend/apiClient/utils";
import { v4 as uuidv4 } from "uuid";
import { AIChat } from "features/apiClient/components/AIChat";

export interface ChatSessionResult {
  id: string;
  messages: AIChat.Message[];
  createdTs: number;
  updatedTs: number;
}

export const createSession = async (uid: string, workspaceId: string): ResponsePromise<ChatSessionResult> => {
  try {
    const db = getFirestore(firebaseApp);

    const sessionId = uuidv4();

    const sessionData = {
      id: sessionId,
      createdTs: Date.now(),
      updatedTs: Date.now(),
    };

    const sessionDocRef = doc(db, "chat_sessions", workspaceId, "users", uid, "sessions", sessionId);

    await setDoc(sessionDocRef, sessionData);

    return { success: true, data: { ...sessionData, messages: [] } };
  } catch (error) {
    console.error("DB write error", error);
    captureException(error);
    return {
      success: false,
      data: null,
      error: {
        type: error.code,
        message: "Failed to create chat session",
      },
    };
  }
};
