import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Popover } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import { AIPromptPopover } from "../AIPromptPopover/AIPromptPopover";
import { MdOutlineStopCircle } from "@react-icons/all-files/md/MdOutlineStopCircle";
import { MdOutlineAutoAwesome } from "@react-icons/all-files/md/MdOutlineAutoAwesome";
import { getHasGeneratedAITests } from "store/selectors";
import { getIsOptedforAIFeatures, getUserAuthDetails } from "store/slices/global/user/selectors";
import { AIConsentModal } from "features/ai";
import { isProfessionalPlan } from "utils/PremiumUtils";
import { trackGenerateTestBtnClicked } from "modules/analytics/events/features/apiClient";
import { useAISessionContext } from "features/ai/contexts/AISession";

interface GenerateTestsButtonProps {
  hidden: boolean;
  isLoading: boolean;
  isGenerateTestPopoverOpen: boolean;
  disabled: boolean;
  negativeFeedback: string | null;
  label: string;
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
  label,
  onCancelClick,
  onGenerateClick,
  togglePopover,
}) => {
  const user = useSelector(getUserAuthDetails);
  const isProfessionalPlanUser = isProfessionalPlan(user.details?.planDetails?.planId);
  const hasGeneratedAITests = useSelector(getHasGeneratedAITests);
  const isOptedforAIFeatures = useSelector(getIsOptedforAIFeatures);

  const [isAIConsentModalOpen, setIsAIConsentModalOpen] = useState(false);
  const [userQuery, setUserQuery] = useState("Generate test cases for this request and check status 200");

  const { createNewAISession } = useAISessionContext();

  return (
    <>
      <div className={`ai-generate-test-btn-container ${hidden ? "hidden" : ""}`}>
        <Popover
          open={isGenerateTestPopoverOpen}
          onOpenChange={(open) => {
            if (!isOptedforAIFeatures) {
              setIsAIConsentModalOpen(true);
              return;
            }
            togglePopover(open);
          }}
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
          placement="bottomLeft"
          overlayClassName={`ai-generate-test-popover ${
            !isProfessionalPlanUser ? "ai-generate-test-popover-premium-feature" : ""
          }`}
          showArrow={false}
        >
          <RQButton
            className={`ai-generate-test-btn ${!hasGeneratedAITests ? "ai-generate-test-btn__new" : ""}`}
            size="small"
            icon={<MdOutlineAutoAwesome />}
            disabled={disabled}
            loading={isLoading && !isGenerateTestPopoverOpen}
            onClick={() => {
              const sessionId = createNewAISession();
              trackGenerateTestBtnClicked(sessionId);
            }}
          >
            {label}
          </RQButton>
        </Popover>
        {isLoading && !isGenerateTestPopoverOpen && (
          <RQButton size="small" icon={<MdOutlineStopCircle />} onClick={onCancelClick}>
            Stop
          </RQButton>
        )}
      </div>
      <AIConsentModal
        isOpen={isAIConsentModalOpen}
        toggle={setIsAIConsentModalOpen}
        onEnableCallback={() => {
          togglePopover(true);
        }}
      />
    </>
  );
};
