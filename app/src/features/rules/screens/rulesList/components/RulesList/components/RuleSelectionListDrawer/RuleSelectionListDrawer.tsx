import React from "react";
import { Drawer, DrawerProps } from "antd";
import { RuleSelectionList } from "../RuleSelectionList/RuleSelectionList";
import "./RuleSelectionListDrawer.scss";

interface Props {
  open: boolean;
  onClose: () => void;
  groupId?: string;
  children: React.ReactNode;
  analyticEventSource: string;
  placement?: DrawerProps["placement"];
}

export const RuleSelectionListDrawer: React.FC<Props> = ({
  open,
  onClose,
  groupId,
  children,
  placement = "right",
  analyticEventSource,
}) => {
  return (
    <>
      <Drawer
        title="Create new rule"
        width={360}
        open={open}
        onClose={onClose}
        placement={placement}
        className="rule-selection-list-drawer"
      >
        <RuleSelectionList
          groupId={groupId}
          source={analyticEventSource}
          premiumPopoverPlacement="topLeft"
          premiumIconSource="rule_dropdown"
        />
      </Drawer>

      {children}
    </>
  );
};
