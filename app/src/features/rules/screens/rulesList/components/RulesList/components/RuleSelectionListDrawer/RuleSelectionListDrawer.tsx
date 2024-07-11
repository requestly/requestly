import React from "react";
import { Drawer, DrawerProps } from "antd";
import { RuleSelectionList, RuleSelectionListProps } from "../RuleSelectionList/RuleSelectionList";
import "./RuleSelectionListDrawer.scss";

interface RuleSelectionListDrawerProps extends RuleSelectionListProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  drawerPlacement?: DrawerProps["placement"];
}

export const RuleSelectionListDrawer: React.FC<RuleSelectionListDrawerProps> = ({
  open,
  onClose,
  groupId,
  children,
  drawerPlacement = "right",
  source,
  premiumIconSource,
  premiumPopoverPlacement = "topLeft",
  callback = () => {},
  onRuleItemClick = () => {},
}) => {
  return (
    <>
      <Drawer
        title="Create new rule"
        width={360}
        open={open}
        onClose={onClose}
        placement={drawerPlacement}
        className="rule-selection-list-drawer"
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
