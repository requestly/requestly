import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { Input, InputRef, Tooltip } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { isProfessionalPlan } from "utils/PremiumUtils";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { MdOutlineStopCircle } from "@react-icons/all-files/md/MdOutlineStopCircle";
import { MdOutlineDiamond } from "@react-icons/all-files/md/MdOutlineDiamond";
import "./aiPromptPopover.scss";
import { redirectToUrl } from "utils/RedirectionUtils";
import LINKS from "config/constants/sub/links";

interface PromptPopoverProps {
  isLoading: boolean;
  isPopoverOpen: boolean;
  userQuery: string;
  negativeFeedback: string | null;
  onUserQueryChange: (query: string) => void;
  onGenerateClick: (query: string) => void;
  onCloseClick: () => void;
  onCancelClick: () => void;
}

export const AIPromptPopover: React.FC<PromptPopoverProps> = ({
  userQuery,
  isLoading,
  isPopoverOpen,
  negativeFeedback,
  onUserQueryChange,
  onGenerateClick,
  onCancelClick,
  onCloseClick,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    setTimeout(() => {
      if (isPopoverOpen) {
        inputRef.current?.focus();
      }
    }, 100);
  }, [isPopoverOpen]);

  if (!isProfessionalPlan(user.details?.planDetails?.planId)) {
    return (
      <div className="ai-generate-test-popover-content ai-generate-test-popover-premium-feature">
        <div className="ai-generate-test-popover-content__header">
          <MdOutlineDiamond /> Premium feature
        </div>
        <div className="ai-generate-test-popover-content__description">
          AI test generation is available on Pro and Team plans. Upgrade to Pro to use this feature without limits.
        </div>
        <div className="ai-generate-test-popover-content__actions-container">
          <RQButton onClick={onCloseClick} size="small">
            Close
          </RQButton>
          <RQButton
            type="primary"
            size="small"
            onClick={() => {
              dispatch(globalActions.toggleActiveModal({ modalName: "pricingModal", newValue: true }));
              onCloseClick();
            }}
          >
            Upgrade now
          </RQButton>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-generate-test-popover-content">
      <div className="ai-generate-test-popover-content__header">
        Write or refine test scripts with AI{" "}
        <Tooltip
          title="AI will use the request URL, method, and most recent response body to generate the tests."
          showArrow={false}
          placement="top"
          color="#000"
        >
          <MdInfoOutline />
        </Tooltip>
      </div>
      <Input.TextArea
        className="ai-generate-test-popover-content__input"
        ref={inputRef}
        value={userQuery}
        disabled={isLoading}
        onChange={(e) => onUserQueryChange(e.target.value)}
        autoSize={{ minRows: 2, maxRows: 8 }}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !isLoading) {
            onGenerateClick(userQuery);
          }
        }}
      />
      {negativeFeedback && (
        <div className="ai-generate-test-popover-content__negative-feedback">
          <MdInfoOutline />
          <span>{negativeFeedback}</span>
        </div>
      )}
      <div className="ai-generate-test-popover-content__actions-container">
        {isLoading ? (
          <RQButton size="small" icon={<MdOutlineStopCircle />} onClick={onCancelClick}>
            Stop
          </RQButton>
        ) : (
          <RQButton
            type="transparent"
            icon={<MdInfoOutline />}
            size="small"
            className="ai-generate-test-help-btn"
            onClick={() => redirectToUrl(LINKS.AI_DOC_LINK, true)}
          >
            Need help
          </RQButton>
        )}
        <div className="ai-generate-test-popover-content__actions">
          <RQButton onClick={onCloseClick} size="small">
            {isLoading ? "Continue in background" : "Close"}
          </RQButton>
          <RQButton type="primary" loading={isLoading} onClick={() => onGenerateClick(userQuery)} size="small">
            {isLoading ? "Generating..." : "Generate"}
          </RQButton>
        </div>
      </div>
    </div>
  );
};
