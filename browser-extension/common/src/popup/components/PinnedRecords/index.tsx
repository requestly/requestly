import React from "react";
import { Typography } from "antd";
import RuleItem from "../common/RuleItem";
import GroupItem from "../common/GroupItem";
import TabContentSection from "../common/TabContentSection";
import { useRecords } from "../../contexts/RecordsContext";
import RecentRecords from "../RecentRecords";
import "./pinnedRecords.css";

const PinnedRecords: React.FC = () => {
  const { pinnedRules, pinnedGroups } = useRecords();

  return !pinnedGroups.length && !pinnedRules.length ? (
    <>
      <div className="empty-pinned-rules-message">
        <div className="empty-records-title">No pinned rules found</div>
        <Typography.Text
          type="secondary"
          className="empty-pinned-rules-caption-message"
        >
          Here are some recently used rules that you may want to pin
        </Typography.Text>
      </div>
      <RecentRecords />
    </>
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
