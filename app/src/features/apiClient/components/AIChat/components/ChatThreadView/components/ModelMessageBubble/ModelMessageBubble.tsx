import React from "react";
import { AIChat } from "../../../../types";
import "./modelMessageBubble.scss";

interface Props {
  message: AIChat.Message;
}

export const ModelMessageBubble: React.FC<Props> = ({ message }) => {
  return (
    <div className="model-chat-message chat-message">
      <div className="model-message__avatar">
        <img
          src="/assets/media/apiClient/rq_ai_avatar.svg"
          alt="AI Assistant"
          className="model-message__avatar-image"
        />
      </div>
      <div className="chat-message__bubble">
        <div className="chat-message__bubble-text">{message.text}</div>
        <div className="model-message__bubble-actions">{/* Actions will be implemented here */}</div>
      </div>
    </div>
  );
};
