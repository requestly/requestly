import React from "react";
import { Button, Dropdown } from "antd";
import { trackNewRuleButtonClicked } from "modules/analytics/events/common/rules";

import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { RuleSelectionList } from "../RuleSelectionList/RuleSelectionList";

/* TODO: REFACTOR THIS COMPONENT
  Currently created a separate component for create new rule button with rule types dropdown
*/

export const NewRuleButtonWithDropdown: React.FC<{ disable?: boolean; callback?: () => void }> = ({
  disable = false,
  callback = () => {},
}) => {
  return (
    <Dropdown
      disabled={disable}
      trigger={["click"]}
      overlay={
        <RuleSelectionList
          source="rule_selection_dropdown"
          premiumPopoverPlacement="topLeft"
          premiumIconSource="rule_dropdown"
          callback={callback}
        />
      }
      className="rule-selection-dropdown-btn"
    >
      <Button
        type="primary"
        icon={<MdAdd className="anticon" />}
        onClick={() => {
          trackNewRuleButtonClicked("in_app");
        }}
      >
        Create new rule
      </Button>
    </Dropdown>
  );
};
