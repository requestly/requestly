import { create } from "zustand";
import { AIChat } from "features/apiClient/components/AIChat";
import { NativeError } from "errors/NativeError";

export interface ChatSessionsStore {
  sessions: AIChat.SessionsMap;
  createChatSession: (session: AIChat.Session) => void;
  getSession: (id: AIChat.Session["id"]) => AIChat.Session;
  updateSession: (id: AIChat.Session["id"], newMessage: AIChat.Message) => void;
  deleteSession: (id: AIChat.Session["id"]) => void;
}

export function createChatSessionsStore(sessions: AIChat.SessionsMap) {
  return create<ChatSessionsStore>()((set, get) => ({
    sessions: sessions || {},
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
    deleteSession(id: AIChat.Session["id"]) {
      const { sessions } = get();
      delete sessions[id];
      set({ sessions });
    },
  }));
}
