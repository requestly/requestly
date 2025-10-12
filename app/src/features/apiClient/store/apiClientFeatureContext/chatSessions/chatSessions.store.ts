import { create } from "zustand";
import { AIChat } from "features/apiClient/components/AIChat";
import { NativeError } from "errors/NativeError";

export interface ChatSessionsStore {
  sessions: AIChat.SessionsMap;
  activeSessionId: AIChat.Session["id"];
  createChatSession: (session: AIChat.Session) => void;
  updateSession: (id: AIChat.Session["id"], newMessage: AIChat.Message) => void;
  deleteSession: (id: AIChat.Session["id"]) => void;
  getSession: (id: AIChat.Session["id"]) => AIChat.Session;
  getActiveSessionId: () => AIChat.Session["id"] | undefined;
}

export function createChatSessionsStore(sessions: AIChat.SessionsMap) {
  return create<ChatSessionsStore>()((set, get) => ({
    sessions: sessions || {},
    activeSessionId: undefined,
    createChatSession(session: AIChat.Session) {
      const sessionsMap = { ...sessions, [session.id]: session };
      set({ sessions: sessionsMap });
    },
    getSession(id: AIChat.Session["id"]) {
      return get().sessions[id];
    },
    updateSession(id: AIChat.Session["id"], newMessage: AIChat.Message) {
      const session = get().sessions[id];
      if (!session) {
        throw new NativeError("Session does not exist!").addContext({ sessionId: id });
      }
      const updatedSession = { ...session, messages: [...session.messages, newMessage] };
      set({ sessions: { ...get().sessions, [id]: updatedSession } });
    },
    getActiveSessionId() {
      const { activeSessionId } = get();
      if (activeSessionId) {
        return activeSessionId;
      }
      const sessions = Object.values(get().sessions);
      if (sessions.length === 0) {
        return undefined;
      }
      return sessions[0].id;
    },
    deleteSession(id: AIChat.Session["id"]) {
      const { sessions } = get();
      delete sessions[id];
      set({ sessions });
    },
  }));
}
