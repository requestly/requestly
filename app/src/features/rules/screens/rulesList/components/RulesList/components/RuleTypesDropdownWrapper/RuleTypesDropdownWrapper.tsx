import React from "react";
import { DropDownProps, Dropdown } from "antd";
import { RuleSelectionList } from "../RuleSelectionList/RuleSelectionList";

interface Props {
  groupId?: string;
  children: React.ReactNode;
  analyticEventSource: string;
  placement?: DropDownProps["placement"];
}

export const RuleTypesDropdownWrapper: React.FC<Props> = ({
  groupId,
  children,
  placement = "bottom",
  analyticEventSource,
}) => {
  return (
    <Dropdown
      trigger={["click"]}
      placement={placement}
      overlay={
        <div className="rules-dropdown-items-container">
          <RuleSelectionList
            groupId={groupId}
            source={analyticEventSource}
            premiumPopoverPlacement="topLeft"
            premiumIconSource="rule_dropdown"
          />
        </div>
      }
    >
      {children}
    </Dropdown>
  );
};
