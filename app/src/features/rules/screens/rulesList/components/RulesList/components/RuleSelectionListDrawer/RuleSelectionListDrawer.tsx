import React from "react";
import { Drawer, DrawerProps } from "antd";
import { RuleSelectionList, RuleSelectionListProps } from "../RuleSelectionList/RuleSelectionList";
import { useIsRedirectFromCreateRulesRoute } from "../../hooks/useIsRedirectFromCreateRulesRoute";
import { useLocation, useNavigate } from "react-router-dom";
import "./RuleSelectionListDrawer.scss";

interface RuleSelectionListDrawerProps extends Omit<RuleSelectionListProps, "premiumIconSource"> {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  drawerPlacement?: DrawerProps["placement"];
  premiumIconSource?: RuleSelectionListProps["premiumIconSource"];
}

export const RuleSelectionListDrawer: React.FC<RuleSelectionListDrawerProps> = ({
  open,
  onClose,
  groupId,
  children,
  drawerPlacement = "right",
  source,
  premiumIconSource = "rule_drawer",
  premiumPopoverPlacement = "topLeft",
  callback = () => {},
  onRuleItemClick = () => {},
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isRedirectFromCreateRulesRoute = useIsRedirectFromCreateRulesRoute();

  return (
    <>
      <Drawer
        title="Create new rule"
        width={360}
        open={open}
        afterOpenChange={(isOpen) => {
          if (!isOpen && isRedirectFromCreateRulesRoute) {
            // Clear location.state if it was opened due to redirect
            navigate(location.pathname, {});
          }
        }}
        onClose={(e) => {
          onClose();
        }}
        placement={drawerPlacement}
        className="rule-selection-list-drawer"
        destroyOnClose
      >
        <RuleSelectionList
          groupId={groupId}
          source={source}
          premiumIconSource={premiumIconSource}
          premiumPopoverPlacement={premiumPopoverPlacement}
          onRuleItemClick={onRuleItemClick}
          callback={callback}
        />
      </Drawer>

      {children}
    </>
  );
};
