import React, { useState } from "react";
import { Input } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import { MdSend } from "@react-icons/all-files/md/MdSend";
import { MdOutlineStopCircle } from "@react-icons/all-files/md/MdOutlineStopCircle";
import { useChatSessionsStore } from "features/apiClient/hooks/useChatSessionsStore.hook";
import "./chatInput.scss";

export const ChatInput = () => {
  const [isProcessing, setIsProcessing, updateSession, getActiveSessionId] = useChatSessionsStore((s) => [
    s.isProcessing,
    s.setIsProcessing,
    s.updateSession,
    s.getActiveSessionId,
  ]);
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (!message.trim()) return;

    setIsProcessing(true);
    const sessionId = getActiveSessionId();
    if (sessionId) {
      updateSession(sessionId, {
        role: "user",
        text: message,
        createdAt: Date.now(),
      });
    }
    setMessage("");
    setIsProcessing(false);
  };

  const handleStopProcessing = () => {
    setIsProcessing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="ai-chat__body--input">
      <Input.TextArea
        disabled={isProcessing}
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
          onClick={isProcessing ? handleStopProcessing : handleSendMessage}
        >
          {isProcessing ? "Stop" : "Send"}
        </RQButton>
      </div>
    </div>
  );
};
