import { ResponsePromise } from "backend/types";
import { AIChat } from "features/apiClient/components/AIChat";
import firebaseApp from "../../../firebase";
import { getFirestore, collection, getDocs, orderBy, query } from "firebase/firestore";
import { captureException } from "../utils";

export interface MessageDoc {
  id: string;
  createdTs: number;
  role: AIChat.Role;
  text: string;
  actions: AIChat.Action[];
}

export const getAllSessions = async (uid: string, workspaceId: string): ResponsePromise<AIChat.SessionsMap> => {
  try {
    const db = getFirestore(firebaseApp);

    const sessionsCollectionRef = collection(db, "chat_sessions", workspaceId, "users", uid, "sessions");

    const sessionsSnapshot = await getDocs(sessionsCollectionRef);

    if (sessionsSnapshot.empty) {
      return { success: true, data: {} };
    }

    const sessionsMap: AIChat.SessionsMap = {};

    for (const sessionDoc of sessionsSnapshot.docs) {
      const sessionData = sessionDoc.data();
      const sessionId = sessionDoc.id;
      const messagesCollectionRef = collection(
        db,
        "chat_sessions",
        workspaceId,
        "users",
        uid,
        "sessions",
        sessionId,
        "messages"
      );

      const messagesDocs = await getDocs(query(messagesCollectionRef, orderBy("createdTs", "asc")));

      const allMessages: AIChat.Message[] = [];

      messagesDocs.docs.forEach((messageDoc) => {
        const messageDocData = messageDoc.data();
        if (messageDocData) {
          allMessages.push({
            role: messageDocData.role,
            text: messageDocData.text,
            actions: messageDocData.actions,
            createdTs: messageDocData.createdTs,
          });
        }
      });

      sessionsMap[sessionId] = {
        id: sessionId,
        messages: allMessages,
        createdTs: sessionData.createdTs,
        updatedTs: sessionData.updatedTs,
      } as AIChat.Session;
    }

    return { success: true, data: sessionsMap };
  } catch (error) {
    captureException(error);
    return {
      success: false,
      data: null,
      error: {
        type: error.code || "INTERNAL_SERVER_ERROR",
        message: "Failed to get all sessions",
      },
    };
  }
};
