import React, { useEffect, useRef, useState } from "react";
import { Input, InputRef } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { LuBrain } from "@react-icons/all-files/lu/LuBrain";
import "./aiPromptPopover.scss";

interface PromptPopoverProps {
  isLoading: boolean;
  isPopoverOpen: boolean;
  onGenerateClick: (query: string) => void;
  onCancelClick: () => void;
}

export const AIPromptPopover: React.FC<PromptPopoverProps> = ({
  isLoading,
  isPopoverOpen,
  onGenerateClick,
  onCancelClick,
}) => {
  const inputRef = useRef<InputRef>(null);
  const [prompt, setPrompt] = useState(
    "Generate test cases for this request and check status 200, response JSON has accountId"
  );

  useEffect(() => {
    setTimeout(() => {
      if (isPopoverOpen) {
        inputRef.current?.focus();
      }
    }, 100);
  }, [isPopoverOpen]);

  return (
    <div className="ai-generate-test-popover-content">
      <div className="ai-generate-test-popover-content__header">Generate tests</div>
      <div className="ai-generate-test-popover-content__description">
        AI will use the request URL, method, and most recent response body to generate the tests.
      </div>
      <Input.TextArea
        className="ai-generate-test-popover-content__input"
        ref={inputRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        autoSize={{ minRows: 2, maxRows: 8 }}
      />
      {isLoading && (
        <span className="ai-generate-test-generating-text">
          <LuBrain /> Generating response...
        </span>
      )}
      <div className="ai-generate-test-popover-content__actions-container">
        <RQButton type="transparent" icon={<MdInfoOutline />} size="small" className="ai-generate-test-help-btn">
          Need help
        </RQButton>
        <div className="ai-generate-test-popover-content__actions">
          <RQButton onClick={onCancelClick} size="small">
            Close
          </RQButton>
          <RQButton type="primary" onClick={() => onGenerateClick(prompt)} size="small">
            Generate
          </RQButton>
        </div>
      </div>
    </div>
  );
};
