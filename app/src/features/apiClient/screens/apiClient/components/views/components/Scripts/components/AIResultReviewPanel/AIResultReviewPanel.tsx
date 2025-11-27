import React from "react";
import { RQButton } from "lib/design-system-v2/components";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { MdOutlineAutoAwesome } from "@react-icons/all-files/md/MdOutlineAutoAwesome";
import { Dropdown, MenuProps } from "antd";
import { MdOutlineKeyboardArrowDown } from "@react-icons/all-files/md/MdOutlineKeyboardArrowDown";
import "./aiResultReviewPanel.scss";

interface AIResultReviewPanelProps {
  onDiscard: () => void;
  onEditInstructions: () => void;
  onAccept: (runTests: boolean) => void;
}

export const AIResultReviewPanel: React.FC<AIResultReviewPanelProps> = ({
  onDiscard,
  onAccept,
  onEditInstructions,
}) => {
  const menuItems: MenuProps["items"] = [
    {
      key: "accept-only",
      label: "Accept tests",
      onClick: () => onAccept(false),
    },
  ];

  return (
    <div className="ai-result-review-panel-container">
      <div className="ai-result-review-panel-content">
        <RQButton size="small" icon={<MdClose />} onClick={onDiscard}>
          Discard
        </RQButton>
        <div className="ai-result-review-panel-content__right-actions">
          <RQButton size="small" icon={<MdOutlineAutoAwesome />} onClick={onEditInstructions}>
            Edit instructions
          </RQButton>
          <Dropdown.Button
            type="primary"
            size="small"
            icon={<MdOutlineKeyboardArrowDown />}
            menu={{ items: menuItems }}
            placement="top"
            onClick={() => onAccept(true)}
          >
            Accept & run tests
          </Dropdown.Button>
        </div>
      </div>
    </div>
  );
};
