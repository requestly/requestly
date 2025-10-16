import { Spin } from "antd";
import { ChatHeader } from "./ChatHeader/ChatHeader";
import { ChatThreadView } from "./ChatThreadView/ChatThreadView";
import { useChatSessionsStore } from "features/apiClient/hooks/useChatSessionsStore.hook";
import { ChatSessionsContextProvider } from "features/apiClient/store/apiClientFeatureContext/chatSessions/chatSessionsContextProvider";
import { ChatInput } from "./ChatThreadView/components/ChatInput/ChatInput";
import { getFunctions, httpsCallable } from "firebase/functions";
import { toast } from "utils/Toast";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { RQButton } from "lib/design-system-v2/components";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { createSession } from "backend/apiClient";
import { useEffect, useState } from "react";
import { addMessage, getAllSessions } from "backend/apiClient";
import { AIChat } from "../types";
import "./aiChatView.scss";

const generateResponse = httpsCallable(getFunctions(), "generateAiAgentResponse", { timeout: 200_000 });

const AIChatView = () => {
  const user = useSelector(getUserAuthDetails);
  const activeWorkspace = useSelector(getActiveWorkspace);

  const [sessionId, isProcessing, setIsProcessing, updateSession, createChatSession, setActiveSessionId] =
    useChatSessionsStore((s) => [
      s.activeSessionId,
      s.isProcessing,
      s.setIsProcessing,
      s.updateSession,
      s.createChatSession,
      s.setActiveSessionId,
    ]);

  console.log("sessionId", sessionId);

  const handleSendMessage = async (message: string) => {
    if (message.trim().length === 0) return;
    setIsProcessing(true);
    const userMessage: AIChat.UserMessage = {
      role: "user",
      text: message,
      createdTs: Date.now(),
    };
    updateSession(sessionId, userMessage);
    const userMessageResult = await addMessage(
      user.details.profile.uid,
      activeWorkspace.id ?? "private",
      sessionId,
      userMessage
    );
    console.log("userMessageResult", userMessageResult);
    try {
      const modelResult = await generateResponse({
        sessionId,
        message,
      });
      const modelMessage: AIChat.ModelMessage = {
        role: "model",
        text: modelResult.data.text,
        actions: modelResult.data.actions,
        createdTs: Date.now(),
      };
      const modelMessageResult = await addMessage(
        user.details.profile.uid,
        activeWorkspace.id ?? "private",
        sessionId,
        modelMessage
      );
      console.log("modelMessageResult", modelMessageResult);
      if (modelMessageResult.success && modelMessageResult.data) {
        updateSession(sessionId, modelMessageResult.data);
      } else {
        toast.error("Failed to add model message. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong! Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user.loggedIn) {
    return null;
  }

  if (!sessionId) {
    return (
      <div className="ai-chat">
        No session found
        <RQButton
          onClick={async () => {
            const result = await createSession(user.details.profile.uid, activeWorkspace.id ?? "private");
            if (result.success && result.data) {
              setActiveSessionId(result.data.id);
              createChatSession({
                id: result.data.id,
                messages: [],
                createdTs: result.data.createdTs,
                updatedTs: result.data.updatedTs,
              });
            } else {
              toast.error("Failed to create session. Please try again.");
            }
          }}
        >
          Create
        </RQButton>
      </div>
    );
  }

  return (
    <div className="ai-chat">
      <ChatHeader />
      <div className="ai-chat__body">
        <div className="ai-chat__body--messages-view">
          <ChatThreadView sessionId={sessionId} />
        </div>
        {isProcessing && (
          <div className="ai-chat__body--thinking">
            <Spin size="small" /> Thinking...
          </div>
        )}
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

const ChatViewWithProvider = () => {
  const [sessions, setSessions] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const user = useSelector(getUserAuthDetails);
  const activeWorkspace = useSelector(getActiveWorkspace);

  useEffect(() => {
    if (!user.loggedIn) return;
    getAllSessions(user.details?.profile?.uid, activeWorkspace.id ?? "private")
      .then((result) => {
        if (result.success && result.data) {
          console.log("result.data", result.data);
          setSessions(result.data);
          setHasInitialized(true);
        } else throw new Error("Failed to get sessions. Please try again.");
      })
      .catch((error) => {
        toast.error("Failed to get sessions. Please try again.");
      });
  }, [hasInitialized, user.loggedIn, user.details?.profile?.uid, activeWorkspace.id]);

  if (!hasInitialized) {
    // TODO: fix this, split container breaks when returning null
    return <div className="ai-chat">Loading...</div>;
  }

  return (
    <ChatSessionsContextProvider sessions={sessions}>
      <AIChatView />
    </ChatSessionsContextProvider>
  );
};

export default ChatViewWithProvider;
