import { Drawer } from "antd";
import Help from "components/features/rules/RuleBuilder/Help";
import { RQButton } from "lib/design-system/components";
import { useState } from "react";
import { useSelector } from "react-redux";
import { getCurrentlySelectedRuleData } from "store/selectors";
import { AiOutlineQuestionCircle } from "@react-icons/all-files/ai/AiOutlineQuestionCircle";
import { trackDocsSidebarClosed } from "modules/analytics/events/common/rules";
import "./index.scss";

export const HelpButton = () => {
  const [isHelpDrawerOpen, setIsHelpDrawerOpen] = useState(false);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);

  return (
    <>
      <Drawer
        className="rule-editor-help-drawer"
        mask={null}
        open={isHelpDrawerOpen}
        onClose={() => {
          trackDocsSidebarClosed(currentlySelectedRuleData.ruleType);
          setIsHelpDrawerOpen(false);
        }}
      >
        <Help ruleType={currentlySelectedRuleData.ruleType} />
      </Drawer>
      <RQButton
        icon={<AiOutlineQuestionCircle />}
        className="header-rule-help-btn"
        type="text"
        onClick={() => setIsHelpDrawerOpen((isOpen) => !isOpen)}
      >
        Help
      </RQButton>
    </>
  );
};
