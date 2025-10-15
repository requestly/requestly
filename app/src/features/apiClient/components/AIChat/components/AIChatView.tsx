import { Spin } from "antd";
import { ChatHeader } from "./ChatHeader/ChatHeader";
import { ChatThreadView } from "./ChatThreadView/ChatThreadView";
import { useChatSessionsStore } from "features/apiClient/hooks/useChatSessionsStore.hook";
import { ChatSessionsContextProvider } from "features/apiClient/store/apiClientFeatureContext/chatSessions/chatSessionsContextProvider";
import { demoSessionsMap } from "../demo-session";
import { ChatInput } from "./ChatThreadView/components/ChatInput/ChatInput";
import { getFunctions, httpsCallable } from "firebase/functions";
import { toast } from "utils/Toast";
import "./aiChatView.scss";

const generateResponse = httpsCallable(getFunctions(), "generateAiAgentResponse", { timeout: 200_000 });

const AIChatView = () => {
  const [sessionId, isProcessing, setIsProcessing, updateSession] = useChatSessionsStore((s) => [
    s.activeSessionId,
    s.isProcessing,
    s.setIsProcessing,
    s.updateSession,
  ]);

  const handleSendMessage = async (message: string) => {
    if (message.trim().length === 0) return;
    setIsProcessing(true);
    updateSession(sessionId, {
      role: "user",
      text: message,
      createdAt: Date.now(),
    });
    setIsProcessing(false);
    try {
      const modelResult = await generateResponse({
        sessionId,
        message,
      });
      updateSession(sessionId, {
        role: "model",
        // @ts-ignore
        text: modelResult.data.text,
        // @ts-ignore
        actions: modelResult.data.actions,
        createdAt: Date.now(),
      });
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong! Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

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
  return (
    <ChatSessionsContextProvider sessions={demoSessionsMap}>
      <AIChatView />
    </ChatSessionsContextProvider>
  );
};

export default ChatViewWithProvider;
