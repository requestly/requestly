import React, { useRef, useEffect } from "react";
import { useChatSessionsStore } from "features/apiClient/hooks/useChatSessionsStore.hook";
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
      return <ModelMessageBubble key={index} message={message as AIChat.ModelMessage} />;
    case "user":
      return <UserMessageBubble key={index} message={message} />;
    default:
      return null;
  }
};

export const ChatThreadView: React.FC<Props> = ({ sessionId }) => {
  const [session] = useChatSessionsStore((s) => [s.getSession(sessionId)]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages]);

  return (
    <div className="chat-thread-view">
      <div className="chat-thread-view__messages">
        {session.messages.map((message, index) => (
          <div key={index} className="chat-thread-view__message">
            {renderMessage(message, index)}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
