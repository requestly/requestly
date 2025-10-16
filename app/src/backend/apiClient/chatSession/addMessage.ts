import { ResponsePromise } from "backend/types";
import { AIChat } from "features/apiClient/components/AIChat";
import { captureException } from "../utils";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import firebaseApp from "../../../firebase";
import { v4 as uuidv4 } from "uuid";

export const addMessage = async (
  uid: string,
  workspaceId: string,
  sessionId: string,
  message: AIChat.Message
): ResponsePromise<AIChat.Message> => {
  try {
    const db = getFirestore(firebaseApp);
    const messageId = uuidv4();

    const messageDoc = {
      id: messageId,
      ...message,
    };

    const messageRef = doc(
      db,
      "chat_sessions",
      workspaceId,
      "users",
      uid,
      "sessions",
      sessionId,
      "messages",
      messageId
    );

    await setDoc(messageRef, messageDoc);

    return { success: true, data: message };
  } catch (error) {
    captureException(error);
    return {
      success: false,
      data: null,
      error: {
        type: error.code || "INTERNAL_SERVER_ERROR",
        message: "Failed to add message",
      },
    };
  }
};
