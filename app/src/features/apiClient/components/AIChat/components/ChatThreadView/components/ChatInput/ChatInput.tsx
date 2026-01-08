import React, { useState } from "react";
import { Input } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import { MdSend } from "@react-icons/all-files/md/MdSend";
import { MdOutlineStopCircle } from "@react-icons/all-files/md/MdOutlineStopCircle";
import { useChatSessionsStore } from "features/apiClient/hooks/useChatSessionsStore.hook";
import "./chatInput.scss";

interface InputProps {
  onSendMessage: (message: string) => void;
}

export const ChatInput: React.FC<InputProps> = ({ onSendMessage }) => {
  const [isProcessing, setIsProcessing] = useChatSessionsStore((s) => [
    s.isProcessing,
    s.setIsProcessing,
    s.updateSession,
    s.getActiveSessionId,
  ]);
  const [message, setMessage] = useState("");

  const handleStopProcessing = () => {
    setIsProcessing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className="ai-chat__body--input">
      <Input.TextArea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        autoSize={{ minRows: 1, maxRows: 10 }}
        placeholder="Ask AI to create or explore APIs ..." // TODO: Update placeholder
        className="ai-chat__body--input-textarea"
        onKeyDown={handleKeyDown}
      />
      <div className="ai-chat__body--input-actions">
        <RQButton
          size="small"
          type={isProcessing ? "secondary" : "primary"}
          icon={isProcessing ? <MdOutlineStopCircle /> : <MdSend />}
          onClick={
            isProcessing
              ? handleStopProcessing
              : () => {
                  onSendMessage(message);
                  setMessage("");
                }
          }
        >
          {isProcessing ? "Stop" : "Send"}
        </RQButton>
      </div>
    </div>
  );
};
