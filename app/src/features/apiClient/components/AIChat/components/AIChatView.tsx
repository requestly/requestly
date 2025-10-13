import { Spin } from "antd";
import { ChatHeader } from "./ChatHeader/ChatHeader";
import { ChatThreadView } from "./ChatThreadView/ChatThreadView";
import { useChatSessionsStore } from "features/apiClient/hooks/useChatSessionsStore.hook";
import { ChatSessionsContextProvider } from "features/apiClient/store/apiClientFeatureContext/chatSessions/chatSessionsContextProvider";
import { demoSessionsMap } from "../demo-session";
import { ChatInput } from "./ChatThreadView/components/ChatInput/ChatInput";
import "./aiChatView.scss";

const AIChatView = () => {
  const [sessionId, isProcessing] = useChatSessionsStore((s) => [s.activeSessionId, s.isProcessing]);

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
        <ChatInput />
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
