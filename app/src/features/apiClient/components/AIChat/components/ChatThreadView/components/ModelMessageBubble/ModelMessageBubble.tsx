import React from "react";
import { ChatActionButton } from "../ChatActionButton";
import { AIChat } from "../../../../types";
import "./modelMessageBubble.scss";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface Props {
  message: AIChat.ModelMessage;
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
        <div className="chat-message__bubble-text markdown-content">
          {message.text}
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            children={message.text || ""}
            components={{
              a(props) {
                return (
                  <a
                    {...props}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    children={props.children}
                  />
                );
              },
            }}
          />
        </div>
        <div className="model-message__bubble-actions">
          {message.actions.map((action) => (
            <ChatActionButton key={action.type} action={action} />
          ))}
        </div>
      </div>
    </div>
  );
};
