import React from "react";
import "./userMessageBubble.scss";
import { AIChat } from "../../../../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface Props {
  message: AIChat.UserMessage;
}

export const UserMessageBubble: React.FC<Props> = ({ message }) => {
  return (
    <div className="user-chat-message chat-message">
      <div className="chat-message__bubble">
        <div className="chat-message__bubble-text markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} children={message.text || ""} />
        </div>
      </div>
    </div>
  );
};
