import { Input } from "antd";
import { ChatHeader } from "./ChatHeader/ChatHeader";
import { ChatThreadView } from "./ChatThreadView/ChatThreadView";
import "./aiChatView.scss";

export const AIChatView = () => {
  return (
    <div className="ai-chat">
      <ChatHeader />
      <div className="ai-chat__body">
        <div className="ai-chat__body--messages-view">
          <ChatThreadView />
        </div>
        <div className="ai-chat__body--input">
          <Input.TextArea
            autoSize={{ minRows: 2, maxRows: 10 }}
            placeholder="Ask AI to create or explore APIs ..." //TEMPORARY
            className="ai-chat__body--input-textarea"
          />
        </div>
      </div>
    </div>
  );
};
