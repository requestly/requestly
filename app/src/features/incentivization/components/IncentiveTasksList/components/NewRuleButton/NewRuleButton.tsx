import React, { useState } from "react";
import { Button } from "antd";
import { trackNewRuleButtonClicked } from "modules/analytics/events/common/rules";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { RuleSelectionListDrawer } from "../../../../../rules/screens/rulesList/components/RulesList/components/RuleSelectionListDrawer/RuleSelectionListDrawer";

export const NewRuleButton: React.FC<{ disable?: boolean; callback?: () => void }> = ({
  disable = false,
  callback = () => {},
}) => {
  const [isRulesListDrawerOpen, setIsRulesListDrawerOpen] = useState(false);

  const onRulesListDrawerClose = () => {
    setIsRulesListDrawerOpen(false);
  };

  return (
    <>
      <RuleSelectionListDrawer
        open={isRulesListDrawerOpen}
        onClose={onRulesListDrawerClose}
        source="rule_selection_dropdown"
        premiumPopoverPlacement="topLeft"
        premiumIconSource="rule_dropdown"
        callback={callback}
        onRuleItemClick={() => {
          onRulesListDrawerClose();
        }}
      >
        <Button
          disabled={disable}
          type="primary"
          icon={<MdAdd className="anticon" />}
          onClick={() => {
            setIsRulesListDrawerOpen(true);
            trackNewRuleButtonClicked("in_app");
          }}
        >
          Create new rule
        </Button>
      </RuleSelectionListDrawer>
    </>
  );
};
