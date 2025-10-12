import React from "react";
import "./chatThreadView.scss";
// import { useChatSessionsStore } from "features/apiClient/hooks/useChatSessionsStore.hook";
import { demoSession } from "../../demo-session";
import { UserMessageBubble } from "./components/UserMessageBubble/UserMessageBubble";
import { ModelMessageBubble } from "./components/ModelMessageBubble/ModelMessageBubble";
import { AIChat } from "../../types";
import "./chatThreadView.scss";

interface Props {
  sessionId: string;
}

const renderMessage = (message: AIChat.Message, index: number) => {
  switch (message.role) {
    case "system":
    case "model":
      return <ModelMessageBubble key={index} message={message} />;
    case "user":
      return <UserMessageBubble key={index} message={message} />;
    default:
      return null;
  }
};

export const ChatThreadView: React.FC<Props> = ({ sessionId }) => {
  // USE DEMO SESSION FOR NOW
  // const session = useChatSessionsStore((s) => s.getSession(sessionId));
  const session = demoSession;

  return (
    <div className="chat-thread-view">
      <div className="chat-thread-view__messages">
        {session.messages.map((message, index) => (
          <div key={index} className="chat-thread-view__message">
            {renderMessage(message, index)}
          </div>
        ))}
      </div>
    </div>
  );
};
