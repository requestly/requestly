import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getHasGeneratedAITests } from "store/selectors";
import { Popover } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import { AIPromptPopover } from "../AIPromptPopover/AIPromptPopover";
import { MdOutlineStopCircle } from "@react-icons/all-files/md/MdOutlineStopCircle";
import { MdOutlineAutoAwesome } from "@react-icons/all-files/md/MdOutlineAutoAwesome";

interface GenerateTestsButtonProps {
  hidden: boolean;
  isLoading: boolean;
  isGenerateTestPopoverOpen: boolean;
  disabled: boolean;
  negativeFeedback: string | null;
  togglePopover: (open: boolean) => void;
  onGenerateClick: (query: string) => void;
  onCancelClick: () => void;
}

export const GenerateTestsButton: React.FC<GenerateTestsButtonProps> = ({
  hidden,
  isLoading,
  isGenerateTestPopoverOpen,
  disabled,
  negativeFeedback,
  onCancelClick,
  onGenerateClick,
  togglePopover,
}) => {
  const hasGeneratedAITests = useSelector(getHasGeneratedAITests);

  const [userQuery, setUserQuery] = useState("Generate test cases for this request and check status 200");

  return (
    <div className={`ai-generate-test-btn-container ${hidden ? "hidden" : ""}`}>
      <Popover
        open={isGenerateTestPopoverOpen}
        onOpenChange={togglePopover}
        trigger="click"
        content={
          <AIPromptPopover
            userQuery={userQuery}
            onUserQueryChange={setUserQuery}
            isLoading={isLoading}
            isPopoverOpen={isGenerateTestPopoverOpen}
            onCloseClick={() => togglePopover(false)}
            onGenerateClick={onGenerateClick}
            onCancelClick={onCancelClick}
            negativeFeedback={negativeFeedback}
          />
        }
        placement="bottomRight"
        overlayClassName="ai-generate-test-popover"
        showArrow={false}
      >
        <RQButton
          className={`ai-generate-test-btn ${!hasGeneratedAITests ? "ai-generate-test-btn__new" : ""}`}
          size="small"
          icon={<MdOutlineAutoAwesome />}
          disabled={disabled}
          loading={isLoading && !isGenerateTestPopoverOpen}
        >
          Generate tests
        </RQButton>
      </Popover>
      {isLoading && !isGenerateTestPopoverOpen && (
        <RQButton size="small" icon={<MdOutlineStopCircle />} onClick={onCancelClick}>
          Stop
        </RQButton>
      )}
    </div>
  );
};
