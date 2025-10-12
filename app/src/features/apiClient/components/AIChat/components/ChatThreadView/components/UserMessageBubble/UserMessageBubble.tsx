import React from "react";
import "./userMessageBubble.scss";
import { AIChat } from "../../../../types";

interface Props {
  message: AIChat.Message;
}

export const UserMessageBubble: React.FC<Props> = ({ message }) => {
  return (
    <div className="user-chat-message chat-message">
      <div className="chat-message__bubble">
        <div className="chat-message__bubble-text">{message.text}</div>
      </div>
    </div>
  );
};
