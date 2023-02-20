import React from "react";
import { RQButton } from "lib/design-system/components";
import { Tooltip } from "antd";
import { trackRuleEditorHeaderClicked } from "modules/analytics/events/common/rules";
import { getModeData } from "../../../actions";

const ShareRuleButton = ({ handleShareRuleClick, ruleType }) => {
  const { MODE } = getModeData(window.location);
  return (
    <Tooltip title="Share rule" placement="bottom">
      <RQButton
        type="primary"
        icon={
          <img
            width="13.4px"
            height="10px"
            alt="down arrow"
            src="/assets/icons/share.svg"
            className="rule-header-share-btn-icon"
          />
        }
        onClick={() => {
          trackRuleEditorHeaderClicked("share_button", ruleType, MODE);
          handleShareRuleClick();
        }}
      />
    </Tooltip>
  );
};

export default ShareRuleButton;
