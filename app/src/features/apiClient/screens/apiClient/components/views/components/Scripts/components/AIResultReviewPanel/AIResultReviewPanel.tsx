import React from "react";
import { RQButton } from "lib/design-system-v2/components";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { MdOutlineAutoAwesome } from "@react-icons/all-files/md/MdOutlineAutoAwesome";
import { MdCheck } from "@react-icons/all-files/md/MdCheck";
import "./aiResultReviewPanel.scss";
import { Tooltip } from "antd";

interface AIResultReviewPanelProps {
  onDiscard: () => void;
  onEditInstructions: () => void;
  onAccept: () => void;
}

export const AIResultReviewPanel: React.FC<AIResultReviewPanelProps> = ({
  onDiscard,
  onAccept,
  onEditInstructions,
}) => {
  return (
    <div className="ai-result-review-panel-container">
      <div className="ai-result-review-panel-content">
        <RQButton size="small" icon={<MdOutlineAutoAwesome />} onClick={onEditInstructions}>
          Edit prompt
        </RQButton>
        <div className="ai-result-review-panel-content__right-actions">
          <Tooltip title="Discard all changes" color="#000" placement="top" showArrow={false}>
            <RQButton size="small" icon={<MdClose />} onClick={onDiscard}>
              Discard
            </RQButton>
          </Tooltip>
          <Tooltip title="Accept changes" color="#000" placement="top" showArrow={false}>
            <RQButton
              className="ai-result-review-panel-content__accept-btn"
              size="small"
              icon={<MdCheck />}
              onClick={onAccept}
            >
              Accept
            </RQButton>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
