import React from "react";
import RuleItem from "../common/RuleItem";
import GroupItem from "../common/GroupItem";
import TabContentSection from "../common/TabContentSection";
import { useRecords } from "../../contexts/RecordsContext";
import { EmptyPopupTab } from "../PopupTabs/EmptyPopupTab";
import { PrimaryActionButton } from "../common/PrimaryActionButton";
import "./pinnedRecords.css";

const PinnedRecords: React.FC = () => {
  const { pinnedRules, pinnedGroups } = useRecords();

  return !pinnedGroups.length && !pinnedRules.length ? (
    <EmptyPopupTab
      title="You haven't pinned any rules yet!"
      description=" Feel free to pin your recently used rules for quick access."
      actionButton={<PrimaryActionButton size="small">See recently used rules</PrimaryActionButton>}
    />
  ) : (
    <TabContentSection>
      <ul className="record-list">
        {pinnedGroups.map((group) => (
          <GroupItem key={group.id} group={group} />
        ))}
        {pinnedRules.map((rule) => (
          <RuleItem key={rule.id} rule={rule} isParentPinnedRecords={true} />
        ))}
      </ul>
    </TabContentSection>
  );
};

export default PinnedRecords;
